import test from 'node:test';import assert from 'node:assert/strict';import {mutation,durationTotals} from '../lib/schema';
test('No acepta ruta, fecha o campos de estado inválidos como una duración',()=>{
 assert.equal(mutation.safeParse({action:'duration',id:'00000000-0000-4000-8000-000000000001',minutes:0,mode:'flight'}).success,false);
 assert.equal(mutation.safeParse({action:'duration',id:'00000000-0000-4000-8000-000000000001',minutes:3.5,mode:'flight'}).success,false);
 const result=mutation.parse({action:'duration',id:'00000000-0000-4000-8000-000000000001',minutes:120,mode:'flight',origin:'Tokyo',destination:'Beijing'});
 assert.equal('origin' in result,false);assert.equal('destination' in result,false);
});
test('Flight es subconjunto de trip, no se suma dos veces',()=>{assert.deepEqual(durationTotals([{mode:'flight',minutes:120},{mode:'road',minutes:30}]),{trip:150,flight:120});});
test('Usuario y contenidos tienen límites',()=>{assert.equal(mutation.safeParse({action:'message',recipient_id:'00000000-0000-4000-8000-000000000001',body:'a'.repeat(2001)}).success,false);assert.equal(mutation.safeParse({action:'place',country_code:'../../',name:'Lugar',city:''}).success,false);});
