'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/sidae-core.js'),ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('dist/vendor/manseryeok.js','utf8'),ctx);const m=ctx.Manseryeok;
assert.equal(C.birthYears.min,1900);
assert.equal(C.birthYears.max,Math.min(2100,new Date(Date.now()+9*60*60*1000).getUTCFullYear()));
for(let year=1900;year<=C.birthYears.max;year++){
 const input={year,month:6,day:15,hour:5,minute:30};
 const result=C.calculate(input,m),native=m.calculateFourPillars(input);
 for(const k of ['year','month','day','hour'])assert.equal(result.pillars[k].candidates[0],native[k+'String']);
 const lunar=m.solarToLunar(year,6,15);
 const back=C.calculate({year:lunar.year,month:lunar.month,day:lunar.day,lunar:true,leap:lunar.isLeapMonth,hour:5,minute:30},m);
 assert.deepEqual(back.pillars,result.pillars);
}
for(const year of [1950,1960,1970,1980,1989]){
 const c=C.calculate({year,month:6,day:15,unknown:true},m);
 assert.equal(c.pillars.hour.unknown,true);assert.equal(c.pillars.hour.candidates.length,0);
}
assert.ok(C.calculate({year:1900,month:1,day:1,hour:12,minute:0},m));
assert.ok(C.calculate({year:2000,month:2,day:29,hour:12,minute:0},m));
for(const input of [{year:1899,month:6,day:15},{year:1900,month:2,day:29},{year:C.birthYears.max+1,month:1,day:1},{year:1950,month:2,day:30},{year:NaN,month:1,day:1},{year:1960.5,month:1,day:1}])assert.throws(()=>C.calculate({...input,hour:12,minute:0},m));
const future=new Date(Date.now()+9*3600000+86400000);
assert.throws(()=>C.calculate({year:future.getUTCFullYear(),month:future.getUTCMonth()+1,day:future.getUTCDate(),hour:12,minute:0},m));
console.log('PASS birth years 1900–'+C.birthYears.max+': every year solar fixture and lunar roundtrip; 1950–1989 unknown-time samples; lower/upper bounds, leap dates and future dates. Engine comparison uses unchanged fixed UTC+9 policy.');
