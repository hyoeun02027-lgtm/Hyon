'use strict';
const assert=require('node:assert/strict'),data=require('../dist/history-data.js'),rec=require('../dist/history-recommend.js');
assert.equal(Object.keys(data.catalog).filter(k=>k.startsWith('J')).length,14);
assert.equal(Object.keys(data.catalog).filter(k=>k.startsWith('P')).length,20);
for(const c of Object.values(data.catalog)){
 assert.ok(c.name&&c.fact&&c.context&&c.caution&&c.sources.length,c.id);
 for(const s of c.sources){const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.ok(['encykorea.aks.ac.kr','contents.history.go.kr','www.museum.go.kr'].includes(u.hostname));}
}
const expected=[['J05,J07,J14','P09,P12,P16'],['J01,J12,J09','P20,P02,P10'],['J03,J11,J12','P03,P19,P17'],['J10,J11,J05','P08,P11,P10'],['J04,J09,J02','P04,P07,P18'],['J02,J09,J10','P18,P01,P09'],['J06,J13,J14','P06,P13,P14']];
const alternate=[['J05,J02,J14','P09,P01,P16'],['J01,J12,J09','P20,P15,P10'],['J03,J11,J12','P03,P11,P17'],['J10,J12,J05','P08,P11,P10'],['J04,J09,J02','P04,P14,P18'],['J02,J10,J09','P18,P01,P09'],['J06,J08,J14','P06,P20,P14']];
for(const t of data.types)for(const secondary of [null,'default','alternate']){
 const selection={primary:t.id,secondary},r=rec.recommend(selection);
 assert.deepEqual(r,rec.recommend(selection));assert.deepEqual(r.selection,selection);
 for(const [i,kind] of ['jobs','people'].entries()){
  assert.equal(r[kind].length,3);assert.equal(new Set(r[kind].map(c=>c.id)).size,3);
  assert.equal(r[kind].map(c=>c.id).join(','),(secondary==='alternate'?alternate:expected)[+t.id][i]);
  assert.equal(r[kind][0].label,'중심 관심으로 보기');assert.equal(r[kind][2].label,'다른 분야에서 보기');
  assert.ok(r[kind].every(c=>c.reason&&c.candidate===data.catalog[c.id]));
  if(!secondary){assert.equal(r[kind][1].label,'추가 탐색 제안');assert.equal(r[kind][1].reason,t.neutral[kind]);}
 }
}
for(const x of [null,{}, {primary:'bad',secondary:null},{primary:'0',secondary:'bad'},{primary:0,secondary:null},{primary:'0'},{primary:'__proto__',secondary:null}])assert.throws(()=>rec.recommend(x));
assert.equal(rec.recommend({primary:'0',secondary:'alternate'}).jobs[1].id,'J02');
assert.equal(rec.recommend({primary:'1',secondary:'alternate'}).jobs[1].label,'추가 탐색 제안');
assert.equal(data.types[1].jobs[1].id,'J12'); // Alternate selection must not mutate source tables.
console.log('PASS 14 jobs/20 people, source URL structure, all 21 combinations, exact tables and 7 alternate rules, independent 3+3, no duplicates, deterministic reasons, unselected-secondary semantics, invalid selections');
