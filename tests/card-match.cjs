const assert=require('node:assert/strict'),R=require('../dist/history-recommend.js');
const keys=['risk','community','lead','activity','interest'],seen=new Set();
for(const e of ['목','화','토','금','수',null])for(let n=0;n<32;n++){
 const a=Object.fromEntries(keys.map((k,i)=>[k,(n>>i)&1])),chart={dayElement:e,pillars:{day:{stable:!!e}}};
 const r=R.recommendType(a,chart);assert.ok(r);assert.match(r.typeId,/^[0-6]$/);seen.add(r.typeId);
 assert.deepEqual(r,R.recommendType(a,chart));assert.equal(r.usesSaju,!!e);assert.ok(r.reason.length>15);
 if(!e)assert.match(r.reason,/질문의 답만/);
 if(e==='목')assert.equal(r.typeId,a.activity?'0':'2');
 if(e==='화')assert.equal(r.typeId,a.interest?'2':'5');
 if(e==='토')assert.equal(r.typeId,a.lead?'4':'6');
 if(e==='금')assert.equal(r.typeId,a.activity?'1':'3');
 if(e==='수')assert.equal(r.typeId,a.interest&&!a.risk?'1':'0');
}
assert.equal(seen.size,7);assert.equal(R.recommendType({},{}),null);
for(const bad of [null,undefined,'1',2,-1])assert.equal(R.recommendType({risk:bad,community:0,lead:0,activity:0,interest:0},{}),null);
console.log('PASS: 192 combinations, all seven types, deterministic rules and invalid answers');
