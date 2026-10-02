// Developer utility. Review political/catalog changes before committing output.
const fs=require('node:fs');const countries=require('world-countries');const atlas=require('world-atlas/countries-110m.json');
const catalog=countries.filter(c=>c.cca3!=='ATA').map(c=>({code:c.cca3,iso2:c.cca2,numeric:c.ccn3,name:c.translations.spa?.common||c.name.common,region:c.region})).sort((a,b)=>a.name.localeCompare(b.name,'es'));
fs.mkdirSync('public/data',{recursive:true});fs.mkdirSync('lib/data',{recursive:true});
fs.writeFileSync('public/data/world.json',JSON.stringify(atlas));fs.writeFileSync('lib/data/countries.json',JSON.stringify(catalog));
fs.writeFileSync('supabase/migrations/002_countries.sql','insert into public.countries(code,name) values\n'+catalog.map(c=>"('"+c.code+"','"+c.name.replaceAll("'","''")+"')").join(',\n')+' on conflict(code) do nothing;\n');
console.log(`${catalog.length} countries/territories. Review before committing.`);
