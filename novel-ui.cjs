// DOM contract harness, not a real browser or visual test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const book=JSON.parse(fs.readFileSync('dist/novel.json')),story=JSON.parse(fs.readFileSync('dist/story.json'));
const elements=new Map(),controls=[],events={},storage=new Map(),timers=new Map();let tick=1000,tid=1;
class El{
 constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.dataset={};for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;this.id=attrs.id;this.type=attrs.type;this.textContent='';this.hidden=false;this.style={setProperty(){}};this.classes=new Set((attrs.class||'').split(' '));this.classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),toggle:(x,b)=>{if(b===undefined)b=!this.classes.has(x);b?this.classes.add(x):this.classes.delete(x);},contains:x=>this.classes.has(x)};this.children=new Map();this.handlers={};}
 set innerHTML(v){this.html=v;for(const m of v.matchAll(/<([\w-]+)\b([^>]*)>/g)){const attrs={};for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];if(attrs.id||Object.keys(attrs).some(k=>k.startsWith('data-'))){const el=new El(m[1],attrs);if(attrs.id)elements.set(attrs.id,el);controls.push(el);}}}
 get innerHTML(){return this.html||'';}
 querySelector(sel){if(!this.children.has(sel))this.children.set(sel,new El());return this.children.get(sel);}
 setAttribute(k,v){this.attrs[k]=v;}
 getAttribute(k){return this.attrs[k];}
 scrollIntoView(){}
 addEventListener(n,f){(this.handlers[n]??=[]).push(f);}
 showModal(){this.open=true;}
 close(){this.open=false;(this.handlers.close||[]).forEach(f=>f());}
 closest(sel){for(const part of sel.split(',')){if(part==='[data-vn]'&&this.dataset.vn)return this;if(part==='[data-action]'&&this.dataset.action)return this;if(part==='[data-choice]'&&this.dataset.choice)return this;if(part.toUpperCase()===this.tagName)return this;}return null;}
}
for(const id of ['app','modal','modalBody','resumeNav','toast'])elements.set(id,new El('div',{id}));
const doc={body:new El('body'),hidden:false,getElementById:id=>elements.get(id),addEventListener:(n,f)=>(events[n]??=[]).push(f),querySelector:sel=>controls.findLast(x=>sel===`[data-vn="${x.dataset.vn}"]`),querySelectorAll:sel=>controls.filter(x=>sel==='[data-setting]'&&x.dataset.setting)};
const ctx=vm.createContext({document:doc,window:{addEventListener(){},matchMedia:()=>({matches:false}),scrollTo(){},getSelection:()=>({toString:()=>''})},VNCore:require('../dist/vn-core.js'),SidaeCore:require('../dist/sidae-core.js'),performance:{now:()=>tick},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:(f,ms)=>{const id=tid++;timers.set(id,{f,ms});return id;},setInterval:(f,ms)=>{const id=tid++;timers.set(id,{f,ms});return id;},clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),fetch:async url=>({ok:true,json:async()=>url==='novel.json'?book:story}),console});
for(const f of ['dist/vn.js','dist/sidae.js','dist/app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
function click(el){const e={target:el,stopPropagation(){},defaultPrevented:false};for(const f of events.click||[])f(e);}
(async()=>{await new Promise(r=>setImmediate(r));assert.match(elements.get('app').innerHTML,/역사 속 나를 발견하기/);
for(const route of Object.keys(story.outcomes)){
 run("state={path:'',beat:0,page:0,phase:'text',view:'read',started:true};go('read')");
 const actor=elements.get('actor-yun'),stage=elements.get('vn-stage');
 for(let i=0;i<4;i++){
  while(run('VN.engine.phase')==='text'){
   const before=run('VN.engine.beat');tick+=1000;click(stage);assert.equal(run('VN.engine.beat'),before);assert.equal(run('VN.engine.typing'),false);assert.equal(elements.get('vn-text').textContent,run('VN.engine.current.text'));
   // Fast duplicate click must not change dialogue.
   click(stage);assert.equal(run('VN.engine.beat'),before);
   tick+=1000;click(actor);assert.equal(elements.get('actor-yun'),actor,'Actor DOM identity survives every text update');
  }
  assert.equal(elements.get('vn-stage'),stage);
  if(i<3){tick+=1000;click(new El('button',{'data-vn':'choose','data-letter':route[i]}));assert.equal(run('VN.engine.path'),route.slice(0,i+1));}
 }
 assert.equal(run('VN.engine.phase'),'end');click(new El('button',{'data-vn':'result'}));assert.match(elements.get('app').innerHTML,/나의 또 다른 삶/);assert.equal(JSON.parse(storage.get('last-tool.v1')).path,route);
 assert.equal(run('state.sidae.choices.length'),3);assert.equal(run('state.sidae.ending'),route);console.log('PASS rendered flow, screen click, persistent actor nodes, results: '+route);
}
run("state={path:'B',beat:4,page:0,phase:'text',view:'read',started:true};go('read')");let before=run('VN.engine.beat');click(new El('button',{'data-vn':'menu'}));assert.equal(run('VN.modalPaused'),true);tick+=1000;click(elements.get('vn-stage'));assert.equal(run('VN.engine.beat'),before);elements.get('modal').close();assert.equal(run('VN.modalPaused'),false);
click(new El('button',{'data-vn':'save'}));assert.equal(run('VN.engine.beat'),before);assert.equal(JSON.parse(storage.get('last-tool.v1')).beat,4);
run("VN.stop();saved=null;load();state={...saved};go('read')");assert.equal(run('VN.engine.beat'),4);assert.equal(run('VN.engine.path'),'B');
const keyboard=e=>(events.keydown||[]).forEach(f=>f(e));tick+=1000;keyboard({key:' ',repeat:false,target:new El('div'),preventDefault(){}});assert.equal(run('VN.engine.typing'),false);tick+=1000;keyboard({key:'Enter',repeat:false,target:new El('div'),preventDefault(){}});assert.equal(run('VN.engine.beat'),5);tick+=1000;keyboard({key:'Enter',repeat:true,target:new El('div'),preventDefault(){}});assert.equal(run('VN.engine.beat'),5);
run('VN.modalPaused=true;VN.stop();VN.mount()');assert.equal(run('VN.modalPaused'),false);
run('VN.auto=true;VN.engine.beat=VN.engine.node.beats.length-1;VN.engine.typing=false;VN.show()');
const auto=timers.get(run('VN.autoTimer'));assert.ok(auto);tick+=20000;auto.f();assert.equal(run('VN.engine.phase'),'choice');assert.equal(timers.has(run('VN.autoTimer')),false);
console.log('PASS menu isolation, typing pause/resume, explicit save, reload, keyboard repeat guard, new-session pause reset and auto stop at choices');
})();
