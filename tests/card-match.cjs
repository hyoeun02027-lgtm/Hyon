const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../dist/history-recommend.js'),D=require('../dist/history-data.js'),C=require('../dist/sidae-core.js');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('dist/vendor/manseryeok.js','utf8'),ctx);
const expected=[['갑','목',5,'J05','관상감 천문학 관원'],['을','목',6,'J02','역관'],['병','화',7,'J03','화원'],['정','화',8,'J04','의녀'],['무','토',9,'J14','농민'],['기','토',10,'J06','산원'],['경','금',1,'J01','사관'],['신','금',2,'J10','장인'],['임','수',3,'J13','상인'],['계','수',4,'J05','관상감 천문학 관원']];
const keys=['risk','community','lead','activity','interest'],jobs=new Set();
for(const [stem,element,day,jobId,jobName]of expected){
 const chart=C.calculate({year:1992,month:10,day,hour:12,minute:0,unknown:false,boundary:'midnight'},ctx.Manseryeok);
 assert.equal(chart.pillars.day.stem,stem);assert.equal(chart.dayElement,element);
 const match=R.recommendType(null,chart);assert.equal(match.jobId,jobId);assert.equal(match.jobName,jobName);assert.equal(match.basis,stem+element);
 assert.ok(D.catalog[match.jobId]);assert.ok(D.catalog[match.personId]);assert.ok(match.usesSaju);jobs.add(match.jobId);
 for(let n=0;n<32;n++){const answers=Object.fromEntries(keys.map((k,i)=>[k,(n>>i)&1]));assert.deepEqual(R.recommendType(answers,chart),match);}
 assert.equal(R.recommendType({}, {...chart,pillars:{day:{...chart.pillars.day,stable:false}}}),null);
 assert.equal(R.recommendType({}, {...chart,dayElement:'invalid'}),null);
}
assert.equal(jobs.size,9);
for(const chart of [null,{}, {dayElement:'금',pillars:{day:{stable:true,stem:'invalid'}}}])assert.equal(R.recommendType({},chart),null);
console.log('PASS 10 actual calendar fixtures × 32 answers: all 9 jobs reachable; Shin→artisan; Eul→interpreter; questions do not change jobs; unresolved/invalid day has no recommendation');
