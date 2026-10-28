// Optional LIVE conversion verification. No service key is shipped to the browser.
// KASI_SERVICE_KEY must be the decoded service key. Never log request URLs.
import fs from 'node:fs';
import vm from 'node:vm';
const key=process.env.KASI_SERVICE_KEY;
if(!key){console.error('NOT RUN: KASI_SERVICE_KEY is required for live verification.');process.exit(2);}
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../dist/vendor/manseryeok.js',import.meta.url),'utf8'),ctx);
const fixtures=[[1992,10,24],[2020,5,23],[2023,3,22],[2024,2,10],[2024,2,4],[2024,12,31]];
const tag=(xml,name)=>xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1];
let failure=false;
for(const [y,m,d] of fixtures){
 const url=new URL('https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo');url.search=new URLSearchParams({serviceKey:key,solYear:String(y),solMonth:String(m).padStart(2,'0'),solDay:String(d).padStart(2,'0')});
 try{const res=await fetch(url,{signal:AbortSignal.timeout(15000)});const xml=await res.text();if(!res.ok||tag(xml,'resultCode')!=='00')throw Error('API did not return success');
 const official={year:Number(tag(xml,'lunYear')),month:Number(tag(xml,'lunMonth')),day:Number(tag(xml,'lunDay')),isLeapMonth:tag(xml,'lunLeapmonth')==='윤'};
 if(!official.year||!official.month||!official.day||!['윤','평'].includes(tag(xml,'lunLeapmonth')))throw Error('Unexpected API schema');
 const actual=ctx.Manseryeok.solarToLunar(y,m,d);const ok=JSON.stringify(actual)===JSON.stringify(official);console.log(ok?'PASS':'FAIL',`${y}-${m}-${d}`,JSON.stringify(official));if(!ok)failure=true;
 }catch{console.error('FAIL',`${y}-${m}-${d}`,'API/network/schema verification failed; key and response omitted.');failure=true;}
}
console.log('This checks lunar conversion only, not solar-term saju month/year pillars.');process.exitCode=failure?1:0;
