-- Run once in a NEW Supabase project. Never run over a database with existing data.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 username text unique not null check(username ~ '^[a-z0-9_]{3,24}$'),
 name text not null check(length(name) between 1 and 60),
 bio text not null default '' check(length(bio)<=300),
 color text not null default '#61122B' check(color in ('#333700','#B46A6A','#61122B','#537A65','#355C7D')),
 visibility text not null default 'private' check(visibility in ('private','public')),
 share_visited boolean not null default false,share_wishlist boolean not null default false,
 tags text[] not null default '{}' check(cardinality(tags)<=6),
 ask_about text[] not null default '{}' check(cardinality(ask_about)<=5),
 avatar_path text check(avatar_path is null or avatar_path like id::text || '/%')
);
create table public.preferences(user_id uuid primary key references auth.users on delete cascade,hours_enabled boolean not null default false);
create table public.countries(code text primary key check(code ~ '^[A-Z]{3}$'),name text not null);
create table public.country_states(user_id uuid references public.profiles on delete cascade,country_code text references public.countries,visited boolean not null default false,wishlist boolean not null default false,primary key(user_id,country_code));
create table public.places(id uuid primary key default gen_random_uuid(),creator_id uuid not null references public.profiles on delete cascade,name text not null check(length(name) between 1 and 100),city text not null default '' check(length(city)<=80),country_code text not null references public.countries);
create table public.place_states(user_id uuid references public.profiles on delete cascade,place_id uuid references public.places on delete cascade,visited boolean not null default false,wishlist boolean not null default false,primary key(user_id,place_id));
create table public.recommendations(id uuid primary key default gen_random_uuid(),author_id uuid not null references public.profiles on delete cascade,place_id uuid not null references public.places on delete cascade,category text not null check(category in ('Food','Stay','Culture','Nature','Nightlife','History','Hidden gem','Experience','Other')),verdict text not null check(verdict in ('recommend','skip')),tip text not null check(length(tip) between 1 and 1500),image_path text check(image_path is null or image_path like author_id::text || '/%'));
create table public.comments(id uuid primary key default gen_random_uuid(),author_id uuid not null references public.profiles on delete cascade,recommendation_id uuid not null references public.recommendations on delete cascade,body text not null check(length(body) between 1 and 700));
create table public.follows(follower_id uuid references public.profiles on delete cascade,following_id uuid references public.profiles on delete cascade,primary key(follower_id,following_id),check(follower_id<>following_id));
create table public.blocks(blocker_id uuid references public.profiles on delete cascade,blocked_id uuid references public.profiles on delete cascade,primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create table public.messages(id uuid primary key default gen_random_uuid(),sender_id uuid not null references public.profiles on delete cascade,recipient_id uuid not null references public.profiles on delete cascade,body text not null check(length(body) between 1 and 2000),sequence bigint generated always as identity,check(sender_id<>recipient_id));
create table public.collections(id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles on delete cascade,name text not null check(length(name) between 1 and 60));
create table public.collection_items(id uuid primary key default gen_random_uuid(),collection_id uuid not null references public.collections on delete cascade,target_type text not null check(target_type in ('place','recommendation','profile','comment','media')),target_id uuid not null,created_at timestamptz not null default now(),unique(collection_id,target_type,target_id));
create table public.helpful_votes(user_id uuid references public.profiles on delete cascade,recommendation_id uuid references public.recommendations on delete cascade,created_at timestamptz not null default now(),primary key(user_id,recommendation_id));
create table public.private_durations(id uuid primary key,user_id uuid not null references public.profiles on delete cascade,minutes integer not null check(minutes between 1 and 60000),mode text not null check(mode in ('flight','train','road','boat','other')),method text not null default 'manual' check(method='manual'));
create table public.reports(id uuid primary key default gen_random_uuid(),reporter_id uuid not null references public.profiles on delete cascade,target_type text not null check(target_type in ('profile','recommendation','comment')),target_id uuid not null,reason text not null check(length(reason) between 1 and 500));
create table private.rate_buckets(user_id uuid primary key references auth.users on delete cascade,window_start timestamptz not null,hits integer not null);

create function public.is_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a))$$;
create function public.is_cotraveler(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$select a<>b and not public.is_blocked(a,b) and exists(select 1 from public.follows where follower_id=a and following_id=b) and exists(select 1 from public.follows where follower_id=b and following_id=a)$$;
create function public.can_see_profile(target uuid) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and exists(select 1 from public.profiles p where p.id=target and (p.id=auth.uid() or (not public.is_blocked(auth.uid(),p.id) and (p.visibility='public' or public.is_cotraveler(auth.uid(),p.id)))))$$;
create function public.can_see_recommendation(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.recommendations r where r.id=target and public.can_see_profile(r.author_id))$$;
create function public.can_see_place(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.places p where p.id=target and public.can_see_profile(p.creator_id))$$;
create function public.can_see_state(target uuid,state_visited boolean,state_wishlist boolean) returns boolean language sql stable security definer set search_path='' as $$select auth.uid()=target or exists(select 1 from public.profiles p where p.id=target and public.can_see_profile(target) and ((state_visited and p.share_visited) or (state_wishlist and p.share_wishlist)))$$;
-- Separate flags are required to prevent leaking wishlist on a visited row.
-- Other-user state reads go through masked RPC; table SELECT is owner-only.
create function public.shared_states(target uuid) returns table(country_code text,visited boolean,wishlist boolean) language sql stable security definer set search_path='' as $$select s.country_code,s.visited and p.share_visited,s.wishlist and p.share_wishlist from public.country_states s join public.profiles p on p.id=s.user_id where s.user_id=target and public.can_see_profile(target) and ((s.visited and p.share_visited) or (s.wishlist and p.share_wishlist))$$;
create function public.shared_place_states(target uuid) returns table(place_id uuid,visited boolean,wishlist boolean) language sql stable security definer set search_path='' as $$select s.place_id,s.visited and p.share_visited,s.wishlist and p.share_wishlist from public.place_states s join public.profiles p on p.id=s.user_id where s.user_id=target and public.can_see_profile(target) and ((s.visited and p.share_visited) or (s.wishlist and p.share_wishlist)) and public.can_see_place(s.place_id)$$;
create function public.can_see_media(path text) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and (split_part(path,'/',1)=auth.uid()::text or exists(select 1 from public.recommendations r where r.image_path=path and public.can_see_profile(r.author_id)) or exists(select 1 from public.profiles p where p.avatar_path=path and public.can_see_profile(p.id)))$$;
create function public.valid_saved_target(kind text,target uuid) returns boolean language sql stable security definer set search_path='' as $$select case kind when 'profile' then public.can_see_profile(target) when 'place' then public.can_see_place(target) when 'recommendation' then public.can_see_recommendation(target) when 'media' then exists(select 1 from public.recommendations r where r.id=target and r.image_path is not null and public.can_see_recommendation(target)) when 'comment' then exists(select 1 from public.comments c where c.id=target and public.can_see_recommendation(c.recommendation_id) and public.can_see_profile(c.author_id)) else false end$$;
create function public.reputation(days integer default 30) returns table(recommendation_id uuid,helpful bigint,saves bigint) language sql stable security definer set search_path='' as $$select r.id,(select count(*) from public.helpful_votes v where v.recommendation_id=r.id and v.user_id<>r.author_id and v.created_at>=now()-make_interval(days=>least(greatest(days,1),30))),(select count(distinct c.owner_id) from public.collection_items i join public.collections c on c.id=i.collection_id where i.target_type='recommendation' and i.target_id=r.id and c.owner_id<>r.author_id and i.created_at>=now()-make_interval(days=>least(greatest(days,1),30))) from public.recommendations r where public.can_see_recommendation(r.id)$$;

create function private.throttle_write() returns trigger language plpgsql security definer set search_path='' as $$declare who uuid:=auth.uid(); count_hits integer;begin
 if who is null then return case when TG_OP='DELETE' then OLD else NEW end; end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text,0));
 insert into private.rate_buckets values(who,now(),1) on conflict(user_id) do update set window_start=case when private.rate_buckets.window_start<now()-interval '1 minute' then now() else private.rate_buckets.window_start end,hits=case when private.rate_buckets.window_start<now()-interval '1 minute' then 1 else private.rate_buckets.hits+1 end returning hits into count_hits;
 if count_hits>120 then raise exception 'RATE_LIMIT' using errcode='P0001';end if;
 return case when TG_OP='DELETE' then OLD else NEW end;
end$$;
create function private.new_user() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.profiles(id,username,name) values(NEW.id,'u_'||left(md5(NEW.id::text),20), 'Viajero');
 insert into public.preferences(user_id) values(NEW.id);return NEW;end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.new_user();

alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using(public.can_see_profile(id));
create policy profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
alter table public.preferences enable row level security;
create policy preferences_owner on public.preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
alter table public.countries enable row level security;
create policy country_read on public.countries for select to authenticated using(true);
alter table public.country_states enable row level security;
create policy states_owner on public.country_states for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
alter table public.place_states enable row level security;
create policy places_states_owner on public.place_states for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and public.can_see_place(place_id));
alter table public.places enable row level security;
create policy place_read on public.places for select to authenticated using(public.can_see_profile(creator_id));
create policy place_insert on public.places for insert to authenticated with check(creator_id=auth.uid());
alter table public.recommendations enable row level security;
create policy rec_read on public.recommendations for select to authenticated using(public.can_see_profile(author_id));
create policy rec_insert on public.recommendations for insert to authenticated with check(author_id=auth.uid() and public.can_see_place(place_id));
create policy rec_delete on public.recommendations for delete to authenticated using(author_id=auth.uid());
alter table public.comments enable row level security;
create policy comment_read on public.comments for select to authenticated using(public.can_see_profile(author_id) and public.can_see_recommendation(recommendation_id));
create policy comment_insert on public.comments for insert to authenticated with check(author_id=auth.uid() and public.can_see_recommendation(recommendation_id));
create policy comment_delete on public.comments for delete to authenticated using(author_id=auth.uid());
alter table public.follows enable row level security;
create policy follow_read on public.follows for select to authenticated using(follower_id=auth.uid() or following_id=auth.uid());
create policy follow_insert on public.follows for insert to authenticated with check(follower_id=auth.uid() and public.can_see_profile(following_id) and not public.is_blocked(follower_id,following_id));
create policy follow_delete on public.follows for delete to authenticated using(follower_id=auth.uid());
alter table public.blocks enable row level security;
create policy blocks_owner on public.blocks for all to authenticated using(blocker_id=auth.uid()) with check(blocker_id=auth.uid());
alter table public.messages enable row level security;
create policy message_read on public.messages for select to authenticated using((sender_id=auth.uid() or recipient_id=auth.uid()) and public.is_cotraveler(sender_id,recipient_id));
create policy message_insert on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.is_cotraveler(sender_id,recipient_id));
alter table public.collections enable row level security;
create policy collection_owner on public.collections for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
alter table public.collection_items enable row level security;
create policy saved_read on public.collection_items for select to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=auth.uid()));
create policy saved_insert on public.collection_items for insert to authenticated with check(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=auth.uid()) and public.valid_saved_target(target_type,target_id));
create policy saved_delete on public.collection_items for delete to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=auth.uid()));
alter table public.helpful_votes enable row level security;
create policy votes_read on public.helpful_votes for select to authenticated using(user_id=auth.uid());
create policy votes_insert on public.helpful_votes for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.recommendations r where r.id=recommendation_id and r.author_id<>auth.uid() and public.can_see_recommendation(r.id)));
create policy votes_delete on public.helpful_votes for delete to authenticated using(user_id=auth.uid());
alter table public.private_durations enable row level security;
create policy duration_owner on public.private_durations for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.preferences p where p.user_id=auth.uid() and p.hours_enabled));
alter table public.reports enable row level security;
create policy report_insert on public.reports for insert to authenticated with check(reporter_id=auth.uid() and public.valid_saved_target(target_type,target_id));
create policy report_read on public.reports for select to authenticated using(reporter_id=auth.uid());

-- Delete account via narrowly scoped function; no service-role in the web app.
create function public.delete_my_account() returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED';end if;
 if exists(select 1 from storage.objects where bucket_id='media' and split_part(name,'/',1)=auth.uid()::text) then raise exception 'DELETE_MEDIA_FIRST';end if;
 delete from auth.users where id=auth.uid();end$$;

revoke all on all tables in schema public from anon,authenticated;
grant select on public.countries to authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.preferences,public.country_states,public.place_states,public.collections,public.private_durations to authenticated;
grant select,insert on public.places,public.messages,public.reports to authenticated;
grant select,insert,delete on public.recommendations,public.comments,public.follows,public.blocks,public.collection_items,public.helpful_votes to authenticated;
grant usage,select on all sequences in schema public to authenticated;
revoke all on all functions in schema public from public,anon;
grant execute on function public.can_see_profile(uuid), public.can_see_recommendation(uuid),public.can_see_place(uuid),public.can_see_state(uuid,boolean,boolean),public.can_see_media(text),public.valid_saved_target(text,uuid),public.shared_states(uuid),public.shared_place_states(uuid),public.reputation(integer),public.delete_my_account() to authenticated;
-- Do NOT grant helpers accepting arbitrary pairs: they would reveal hidden relationships.
-- Policies call these through wrappers except own follows/message checks below.
-- Pair functions must constrain callers to a participant.
create or replace function public.is_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a))$$;
-- Kept private to authenticated RPC calls; policies need execution privilege. Wrappers below.
create function public.my_cotraveler(target uuid) returns boolean language sql stable security definer set search_path='' as $$select public.is_cotraveler(auth.uid(),target)$$;
create function public.my_not_blocked(target uuid) returns boolean language sql stable security definer set search_path='' as $$select not public.is_blocked(auth.uid(),target)$$;
grant execute on function public.my_cotraveler(uuid),public.my_not_blocked(uuid) to authenticated;
drop policy follow_insert on public.follows;
create policy follow_insert on public.follows for insert to authenticated with check(follower_id=auth.uid() and public.can_see_profile(following_id) and public.my_not_blocked(following_id));
drop policy message_read on public.messages;
create policy message_read on public.messages for select to authenticated using((sender_id=auth.uid() or recipient_id=auth.uid()) and public.my_cotraveler(case when sender_id=auth.uid() then recipient_id else sender_id end));
drop policy message_insert on public.messages;
create policy message_insert on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.my_cotraveler(recipient_id));

do $$declare t text;begin foreach t in array ARRAY['profiles','preferences','country_states','place_states','places','recommendations','comments','follows','blocks','messages','collections','collection_items','helpful_votes','private_durations','reports'] loop execute format('create trigger throttle before insert or update or delete on public.%I for each row execute function private.throttle_write()',t);end loop;end$$;
create index rec_place on public.recommendations(place_id);
create index rec_author on public.recommendations(author_id);
create index follow_incoming on public.follows(following_id);
create index block_incoming on public.blocks(blocked_id);
create index message_recipient on public.messages(recipient_id,sequence);
create index saved_collection on public.collection_items(collection_id);
create index comments_rec on public.comments(recommendation_id);
create index durations_owner on public.private_durations(user_id);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',false,5242880,ARRAY['image/webp']);
create policy media_read on storage.objects for select to authenticated using(bucket_id='media' and public.can_see_media(name));
-- Only the server, after image re-encoding, uploads using its secret storage client.
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='media' and split_part(name,'/',1)=auth.uid()::text);
-- Array checks also apply to callers of the Data API.
alter table public.profiles add constraint allowed_tags check(tags <@ ARRAY['Food lover','Nature','Architecture','Museums','Slow travel','History','Hiking','Music','Books','Photography']::text[]);
alter table public.profiles add constraint ask_length check(length(array_to_string(ask_about,','))<=400);
create function private.stamp_vote() returns trigger language plpgsql set search_path='' as $$begin NEW.created_at=now();return NEW;end$$;
create trigger stamp_vote before insert on public.helpful_votes for each row execute function private.stamp_vote();
create function public.save_my_profile(p jsonb,enabled boolean) returns void language plpgsql security invoker set search_path='' as $$begin
 update public.profiles set name=p->>'name',username=p->>'username',bio=p->>'bio',color=p->>'color',visibility=p->>'visibility',share_visited=(p->>'share_visited')::boolean,share_wishlist=(p->>'share_wishlist')::boolean,tags=ARRAY(select jsonb_array_elements_text(p->'tags')),ask_about=ARRAY(select jsonb_array_elements_text(p->'ask_about')),avatar_path=coalesce(p->>'avatar_path',avatar_path) where id=auth.uid();
 update public.preferences set hours_enabled=enabled where user_id=auth.uid();
end$$;
revoke all on all functions in schema public from public,anon;
grant execute on function public.save_my_profile(jsonb,boolean) to authenticated;
create trigger stamp_save before insert on public.collection_items for each row execute function private.stamp_vote();
commit;
