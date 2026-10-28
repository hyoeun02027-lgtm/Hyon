const assert=require('node:assert/strict'),fs=require('node:fs');
const {Engine}=require('../dist/vn-core.js');
const book=JSON.parse(fs.readFileSync('dist/novel.json')),story=JSON.parse(fs.readFileSync('dist/story.json'));
const norm=t=>t.replace(/[\s"]/g,'');
for(const [path,node] of Object.entries(book.nodes)){
 if(node.basis!=='expanded')assert.equal(norm(node.beats.filter(x=>x.source.section==='본문').map(x=>x.source.text).join('')),norm(story.nodes[path].text),`ALL source prose present, ordered: ${path}`);
 for(const b of node.beats){assert.ok(b.text.length<=250);assert.ok(b.kind==='narration'||['master','yun','chun','choi','jo','junior1','junior2'].includes(b.speaker));}
}
for(const route of Object.keys(story.outcomes)){
 const e=new Engine(book);let now=1000,read=0;
 for(let stage=0;stage<4;stage++){
  assert.equal(e.path,route.slice(0,stage));
  while(e.phase==='text'){
   const n=e.beat;assert.equal(e.advance(now),'reveal');assert.equal(e.beat,n);assert.equal(e.advance(now+1),'blocked');
   now+=500;const r=e.advance(now);read++;
   assert.ok(['next','choice','end'].includes(r));now+=500;
  }
  if(stage<3){assert.equal(e.phase,'choice');for(let i=0;i<3;i++){assert.equal(e.advance(now),'blocked');now+=500;}assert.equal(e.choose(route[stage],now),true);assert.equal(e.choose(route[stage],now),false);assert.equal(e.advance(now+1),'blocked');now+=500;}
 }
 assert.equal(e.phase,'end');const restored=new Engine(book,JSON.parse(JSON.stringify(e.snapshot())));assert.equal(restored.path,route);assert.equal(restored.phase,'end');console.log(`PASS ${route}: ${read} complete text units, reveal/advance, choice locks, resume`);
}
// Reading a narration or changing the speaker cannot remove Yunseo.
for(const path of ['', 'B','BB','BBB'])assert.ok(book.nodes[path].beats.every(x=>x.stage.cast.yun),`Yunseo stays throughout ${path}`);
const a=book.nodes.A.beats;const exit=a.findIndex(x=>x.text.includes('문밖으로 나가버렸다'));const back=a.findIndex(x=>x.text.includes('행장을 꾸린 윤서'));assert.ok(exit>=0&&back>exit);assert.ok(a.slice(0,exit).every(x=>x.stage.cast.yun));assert.ok(a.slice(exit,back).every(x=>!x.stage.cast.yun));assert.ok(a.slice(back).every(x=>x.stage.cast.yun));
const aa=book.nodes.AA.beats;const finalExit=aa.findIndex(x=>x.text.includes('마당을 걸어 나갔다'));assert.ok(aa.slice(0,finalExit).every(x=>x.stage.cast.yun));assert.ok(aa.slice(finalExit).every(x=>!x.stage.cast.yun));assert.ok(book.nodes.AAA.beats.every(x=>!x.stage.cast.yun));const aab=book.nodes.AAB.beats;const reunion=aab.findIndex(x=>x.text.includes('그때 납품할'));assert.ok(reunion>0);assert.ok(aab.slice(0,reunion).every(x=>!x.stage.cast.yun));assert.ok(aab[reunion].stage.cast.yun);assert.ok(!aab.at(-1).stage.cast.yun);
// The original causal landmarks must be in the default playable stream.
for(const [path,phrase] of [['','북풍'],['','쌀 두 가마니'],['','육 년'],['A','발끝으로 창칼'],['A','한 가마니는 위약금'],['AA','무명천'],['B','가로획 뿌리'],['BB','깊이 턱받침'],['BB','칼맛은 다 죽지'],['AAA','반 푼'],['BBB','남모르는 허기']])assert.ok(book.nodes[path].beats.some(b=>b.text.includes(phrase)),phrase);
console.log('PASS entire source coverage, narrative order, causal landmarks, scheduled entrances/exits and all 8 routes');
