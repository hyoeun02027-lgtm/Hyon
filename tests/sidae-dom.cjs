// Real DOM implementation, no browser layout/paint. Do not report as device QA.
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');GlobalFonts.registerFromPath(process.env.QA_FONT||'dist/fonts/reading.woff','Sidae Korean');
const root=process.cwd(),out=process.env.QA_CARD_DIR||'qa-cards';fs.mkdirSync(out,{recursive:true});
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://test.local/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;let downloads=0,buffer,drawnText=[];
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false});w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.URL.createObjectURL=()=> 'blob:card';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads++;};
w.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'dist',url),'utf8'))});
w.Image=class{set src(v){this.promise=loadImage(path.join(root,'dist',v)).then(img=>this.image=img);}decode(){return this.promise;}};
w.HTMLCanvasElement.prototype.getContext=function(){this.backend=createCanvas(this.width,this.height);const ctx=this.backend.getContext('2d'),draw=ctx.drawImage.bind(ctx),text=ctx.fillText.bind(ctx);ctx.drawImage=(img,...args)=>draw(img.image||img,...args);ctx.fillText=(str,...args)=>{drawnText.push(str);text(str,...args);};return ctx;};
w.HTMLCanvasElement.prototype.toBlob=function(cb){buffer=this.backend.toBuffer('image/png');cb(new w.Blob([buffer],{type:'image/png'}));};
for(const f of ['vn-core.js','vn.js','vendor/manseryeok.js','sidae-core.js','kuong.js','sidae.js','history-data.js','history-recommend.js','history-ui.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),dom.getInternalVMContext());
const tick=()=>new Promise(r=>setImmediate(r)),run=s=>vm.runInContext(s,dom.getInternalVMContext()),click=sel=>{const el=w.document.querySelector(sel);assert.ok(el,sel);el.click();};
(async()=>{
 await tick();assert.equal(w.document.querySelector('.ku-cover img').getAttribute('src'),'assets/kuong/cover.png');assert.match(w.document.querySelector('h1').textContent,/시대인재/);click('[data-sd="form"]');let f=w.document.getElementById('sd-form');f.elements.year.value=1992;f.elements.month.value=10;f.elements.day.value=24;f.elements.time.value='05:30';for(const q of run('SidaeCore.questions'))f.querySelector(`[name=${q.id}][value="1"]`).checked=true;f.elements.remember.checked=true;assert.equal(f.checkValidity(),true);f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(w.document.querySelector('[data-history-reveal]'));click('[data-history-reveal]');assert.equal(w.document.querySelectorAll('.sd-rec').length,6);assert.match(w.document.body.textContent,/임신/);const stored=JSON.parse(w.localStorage.getItem('sidae.profile.v1'));assert.ok(stored.answers);assert.equal(stored.chart.solar,undefined);assert.equal(stored.chart.lunar,undefined);assert.equal(stored.chart.hour,undefined);assert.ok(!w.localStorage.getItem('sidae.profile.v1').includes('1992'));


 assert.match(w.document.querySelector('[data-saju-note]').textContent,/가능성을 읽는 사색가/);
 assert.match(w.document.querySelector('[data-saju-note]').textContent,/계수/);
 const fullChart=JSON.stringify(run('Sidae.profile.chart'));
 const noteTitles=['가능성을 키우는 개척가','생각을 밝히는 표현가','일상을 받쳐 주는 조력가','본질을 다듬는 완성가','가능성을 읽는 사색가'];
 for(const [i,element]of ['목','화','토','금','수'].entries()){
  run('Sidae.profile.chart.dayElement='+JSON.stringify(element)+';Sidae.analysis()');
  assert.match(w.document.querySelector('[data-saju-note]').textContent,new RegExp(noteTitles[i]));
  assert.equal(w.document.querySelectorAll('[data-saju-note]').length,1);
 }
 run('Sidae.profile.chart='+fullChart+';Sidae.profile.chart.dayElement=null;Sidae.profile.chart.pillars.day.stable=false;Sidae.profile.chart.pillars.day.stem=null;Sidae.analysis()');
 assert.match(w.document.querySelector('[data-saju-note]').textContent,/일간 미확정/);
 assert.ok(!w.document.querySelector('[data-saju-note]').textContent.includes('사색가'));
 run('Sidae.profile.chart='+fullChart+';Sidae.analysis()');
 assert.match(w.document.querySelector('[data-saju-match]').textContent,/역사 속에서의 내 직업은\?/);
 assert.equal(w.document.querySelector('[data-history-id="J14"] .history-job-image img').getAttribute('src'),'assets/kuong/farmer.png');
 const savedMatch=run('HistoryRecommend.recommendType(Sidae.profile.answers,Sidae.profile.chart)');
 assert.equal(savedMatch.typeId,'0');assert.ok(!/탐구자|창작자|를 고른 답/.test(w.document.querySelector('[data-saju-match]').textContent));
 const sajuBefore=w.document.querySelector('[data-saju-note]').textContent;
 click('[data-history-type="4"]');assert.equal(w.document.querySelector('[data-saju-note]').textContent,sajuBefore);
 drawnText=[];await run('Sidae.sajuCard()');assert.ok(buffer.length>10000);assert.equal(downloads,1);
 assert.ok(drawnText.some(t=>t.includes('가능성을 읽는 사색가')));
 assert.ok(!drawnText.some(t=>t.includes('탐구자')));assert.ok(drawnText.join('').includes('물이 여러 길을 따라 흐르듯'));
 assert.ok(!drawnText.some(t=>t.includes('돌봄자')));
 assert.ok(drawnText.some(t=>t.includes('관상감 천문학 관원')));assert.ok(drawnText.includes('이순지'));
 assert.match(w.document.querySelector('[data-saju-match]').textContent,/관상감 천문학 관원/);assert.match(w.document.querySelector('[data-saju-match]').textContent,/이순지/);
 assert.equal(w.document.querySelector('[data-saju-match] [data-kuong]').dataset.kuong,'scholar');
 assert.ok(!drawnText.some(t=>/1992|05:30|출생/.test(t)));
 fs.writeFileSync(path.join(out,'saju-note.png'),buffer);
 run("Sidae.profile.chart=SidaeCore.calculate({year:1992,month:10,day:27,hour:12,minute:0,lunar:false,leap:false,unknown:false,boundary:'midnight'},Manseryeok);Sidae.analysis()");
 drawnText=[];await run('Sidae.sajuCard()');
 assert.ok(drawnText.join('').includes('불빛이 주변을 밝히듯'));
 assert.ok(drawnText.join('').includes('생각을 밝히는 표현가'));
 assert.ok(!drawnText.some(t=>/창작자|고른 답을 연결/.test(t)));
 fs.writeFileSync(path.join(out,'saju-fire.png'),buffer);downloads--;
 run('Sidae.profile.chart='+fullChart+';Sidae.analysis()');

 run("Sidae.profile.chart=SidaeCore.calculate({year:1992,month:10,day:30,hour:12,minute:0,lunar:false,leap:false,unknown:false,boundary:'midnight'},Manseryeok);Sidae.profile.answers.lead=0;Sidae.analysis()");
 assert.equal(w.document.querySelector('[data-saju-match] .history-job-image img').getAttribute('src'),'assets/kuong/accountant.png');
 drawnText=[];await run('Sidae.sajuCard()');assert.ok(drawnText.some(t=>t.includes('산원')));assert.ok(buffer.length>10000);
 fs.writeFileSync(path.join(out,'saju-accountant.png'),buffer);downloads--;
 run('Sidae.profile.chart='+fullChart+';Sidae.profile.answers.lead=1;Sidae.analysis()');
 // Real calendar fixtures exercise all ten stems, nine job labels and matching saved PNGs.
 const stemCards=[[5,'관상감 천문학 관원','scholar'],[6,'역관','interpreter'],[7,'화원','painter'],[8,'의녀','physician'],[9,'농민','farmer.png'],[10,'산원','accountant.png'],[1,'사관','scholar'],[2,'장인','artisan'],[3,'상인','merchant'],[4,'관상감 천문학 관원','scholar']];
 for(const [day,job,art]of stemCards){
  run('Sidae.profile.chart=SidaeCore.calculate({year:1992,month:10,day:'+day+',hour:12,minute:0,unknown:false,boundary:"midnight"},Manseryeok);Sidae.analysis()');
  const box=w.document.querySelector('[data-saju-match]');assert.ok(box.textContent.includes('대표 직업 · '+job));
  if(art.endsWith('.png'))assert.ok(box.querySelector('img').getAttribute('src').endsWith(art));
  else assert.equal(box.querySelector('[data-kuong]').dataset.kuong,art);
  drawnText=[];await run('Sidae.sajuCard()');assert.ok(drawnText.includes(job));assert.ok(buffer.length>10000);
  fs.writeFileSync(path.join(out,'stem-'+day+'.png'),buffer);downloads--;
 }
 run('Sidae.profile.chart.pillars.day.stable=false;Sidae.analysis()');assert.equal(w.document.querySelector('[data-saju-match]'),null);assert.ok(w.document.querySelector('[data-saju-match-unresolved]'));
 run('Sidae.profile.chart='+fullChart+';Sidae.analysis()');
 console.log('PASS all 9 representative jobs in screen and PNG, all ten actual day stems, matching Kuong art, unresolved day explanation');
 let sharedCard;w.navigator.canShare=()=>true;w.navigator.share=async value=>{sharedCard=value;};
 await run('Sidae.sajuCard(true)');assert.equal(sharedCard.files.length,1);assert.match(sharedCard.files[0].name,/사색가/);assert.equal(sharedCard.files[0].type,'image/png');assert.equal(downloads,1);
 w.navigator.canShare=()=>false;
 console.log('PASS share card: matching type, representative job/person, Kuong sprite and native-sharing PNG payload');

 console.log('PASS saju note: real day-element basis, 5 editorial names, unresolved-day fallback, independent history browsing, one card only, real PNG rendering and raw-birth exclusion');


 assert.ok(w.document.querySelector('#sd-form')===null);
 assert.equal(w.document.querySelectorAll('.history-cards [data-history-id^="J"] .ku-job-art').length,3);
 assert.equal(w.document.querySelectorAll('.history-cards [data-history-id^="P"] .ku-job-art').length,0);
 assert.ok(w.document.querySelector('.sd-bridge [data-kuong="artisan"]'));
 assert.ok(w.document.querySelector('.ku-guide [data-kuong="sparkle"]'));
 assert.equal(stored.historySelection.primary,'0');assert.equal(stored.historySelection.secondary,null);
 assert.equal(w.document.querySelectorAll('[name="historyPrimary"], [name="historySecondary"]').length,0);
 assert.equal(w.document.querySelectorAll('[data-history-type]').length,7);
 assert.match(w.document.body.textContent,/유형은 사주로 판정한 결과가 아닙니다/);
 assert.ok(!w.document.body.textContent.includes('목판을 새기는 각수와'));
 run('SidaeCore.recommend=()=>{throw Error("legacy recommendation called")}');
 for(const id of ['0','1','2','3','4','5','6']){click('[data-history-type="'+id+'"]');assert.equal(w.document.querySelectorAll('.sd-rec').length,6);assert.equal(w.document.querySelector('[data-history-type="'+id+'"]').getAttribute('aria-pressed'),'true');assert.equal(run('Sidae.profile.historySelection.secondary'),null);}
 const snapshot=JSON.stringify(run('Sidae.profile.chart'));run('Sidae.profile.historySelection={primary:"bad",secondary:"bad"};Sidae.analysis()');assert.equal(w.document.querySelector('[data-history-type="0"]').getAttribute('aria-pressed'),'true');assert.equal(JSON.stringify(run('Sidae.profile.chart')),snapshot);
 function fill(remember){run('Sidae.form()');const f=w.document.getElementById('sd-form');assert.equal(f.querySelectorAll('[name^="history"]').length,0);for(const [n,v]of Object.entries({year:'1992',month:'10',day:'24',time:'05:30'}))f.elements[n].value=v;for(const q of run('SidaeCore.questions'))f.querySelector('[name="'+q.id+'"][value="1"]').checked=true;f.elements.remember.checked=remember;return f;}
 function submit(f){f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
 let nf=fill(false);nf.querySelector('[name="risk"][value="1"]').checked=false;submit(nf);assert.match(w.document.getElementById('sd-error').textContent,/다섯 질문/);assert.equal(w.document.querySelector('[data-history-reveal]'),null);
 nf=fill(false);nf.elements.day.value='31';nf.elements.month.value='2';submit(nf);assert.ok(w.document.getElementById('sd-error').textContent);assert.equal(w.document.querySelector('[data-history-reveal]'),null);
 nf=fill(false);submit(nf);assert.equal(run('state.view'),'history-reveal');run('Sidae.form()');await new Promise(r=>setTimeout(r,1450));assert.ok(w.document.getElementById('sd-form'));
 w.matchMedia=()=>({matches:true});nf=fill(false);submit(nf);assert.equal(w.document.querySelector('[data-history-reveal]'),null);assert.equal(w.document.querySelectorAll('.sd-rec').length,6);w.matchMedia=()=>({matches:false});
 nf=fill(false);submit(nf);assert.ok(w.document.querySelector('[data-history-reveal]'));await new Promise(r=>setTimeout(r,1450));assert.equal(w.document.querySelectorAll('.sd-rec').length,6);
 const originalSet=w.Storage.prototype.setItem,originalRemove=w.Storage.prototype.removeItem;let writes=0;
 w.localStorage.setItem('sidae.profile.v1',JSON.stringify(stored));w.Storage.prototype.setItem=function(...args){writes++;return originalSet.apply(this,args)};w.Storage.prototype.removeItem=function(){throw Error('blocked remove')};
 nf=fill(false);submit(nf);click('[data-history-reveal]');click('[data-history-type="4"]');assert.equal(writes,0);
 w.Storage.prototype.setItem=function(){throw Error('blocked set')};nf=fill(true);submit(nf);click('[data-history-reveal]');click('[data-history-type="3"]');assert.equal(run('Sidae.profile.historySelection.primary'),'3');
 w.Storage.prototype.setItem=originalSet;w.Storage.prototype.removeItem=originalRemove;
 nf=fill(false);nf.elements.unknown.checked=true;nf.elements.unknown.dispatchEvent(new w.Event('change',{bubbles:true}));submit(nf);click('[data-history-reveal]');assert.equal(run('Sidae.profile.chart.pillars.hour.unknown'),true);assert.match(w.document.body.textContent,/시주는 산출하지 않았어요/);
 nf=fill(true);submit(nf);click('[data-history-reveal]');click('[data-history-type="1"]');run('Sidae.profile=null;Sidae.load();Sidae.analysis()');assert.equal(w.document.querySelector('[data-history-type="1"]').getAttribute('aria-pressed'),'true');
 run('Sidae.begin();Sidae.profile.answers.community=0');assert.equal(run('state.sidae.answers.community'),1);run('Sidae.profile.answers.community=1');

 w.matchMedia=()=>({matches:true});
 for(const year of [1900,1930,1950,1960,1970,1980,1989]){
  const form=fill(false);assert.equal(form.elements.year.min,'1900');assert.equal(form.elements.year.max,String(run('SidaeCore.birthYears.max')));
  form.elements.year.value=String(year);form.elements.month.value='6';form.elements.day.value='15';
  assert.equal(form.checkValidity(),true);submit(form);assert.ok(w.document.querySelector('[data-saju-note]'));assert.equal(w.document.querySelectorAll('.sd-rec').length,6);
 }
 w.matchMedia=()=>({matches:false});nf=fill(true);submit(nf);click('[data-history-reveal]');
 console.log('PASS birth-year UI: 1900, 1930 and 1950/1960/1970/1980/1989 through form, actual calculation, saju card and history results');

 console.log('PASS v2: no upfront/secondary controls; explorer default; 7 types; real chart unchanged; reveal skip/automatic/cancel/reduced-motion; validation, storage consent/failures/reload, unknown hour and run snapshot');

 click('[data-action="setup"]');assert.ok(w.document.querySelector('.notice .ku-guide'));assert.match(w.document.querySelector('.notice').textContent,/여럿이/);click('[data-action="start"]');assert.equal(run('state.sidae.answers.community'),1);assert.equal(run('state.path'),'');assert.equal(w.document.getElementById('actor-yun').getAttribute('aria-hidden'),'false');
 // E2E boundaries use the actual UI action to choose; every intervening beat is covered by novel-ui/core.
 for(const letter of ['B','A','B']){run("VN.engine.beat=VN.engine.node.beats.length-1;VN.engine.phase='choice';VN.engine.lockUntil=0;VN.show()");click(`[data-vn="choose"][data-letter="${letter}"]`);}
 assert.equal(run('state.sidae.choices.length'),3);assert.ok(run('state.sidae.choices.every(c=>c.at&&c.values.length&&c.impact)'));run("VN.engine.beat=VN.engine.node.beats.length-1;VN.engine.phase='end';VN.show()");click('[data-vn="result"]');assert.match(w.document.querySelector('h1').textContent,/나의 또 다른 삶/);assert.equal(w.document.querySelectorAll('.sd-choice').length,3);assert.ok(w.document.querySelector('.ku-guide [data-kuong="moved"]'));assert.match(w.document.body.textContent,/달라진 선택/);assert.ok(!/[123][AB]\b|얻은 것:|잃은 것:|시연 경로/.test(w.document.querySelector('main').textContent));
 const saved=JSON.parse(w.localStorage.getItem('last-tool.v1'));assert.equal(saved.sidae.ending,'BAB');assert.equal(saved.sidae.choices.length,3);
 for(const p of Object.keys(run('SidaeCore.endings'))){run(`state.path='${p}'`);drawnText=[];await run('Sidae.card()');assert.ok(buffer.length>10000);fs.writeFileSync(path.join(out,p+'.png'),buffer);assert.ok(drawnText.includes('조선 · 1792년 · 각자장'));assert.ok(!drawnText.some(t=>/1992|05:30|출생/.test(t)));}assert.equal(downloads,9);
 click('[data-action="replay"]');assert.equal(run('state.sidae.choices.length'),0);assert.equal(run('state.path'),'');run("go('home')");click('[data-sd="form"]');f=w.document.getElementById('sd-form');f.elements.calendar.value='lunar';f.elements.calendar.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(f.elements.leap.disabled,false);f.elements.unknown.checked=true;f.elements.unknown.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(f.elements.time.disabled,true);f.elements.calendar.value='solar';f.elements.calendar.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(f.elements.leap.disabled,true);assert.equal(f.elements.leap.checked,false);
 click('[data-action="privacy"]');click('[data-action="clear"]');assert.equal(w.localStorage.getItem('last-tool.v1'),null);assert.equal(w.localStorage.getItem('sidae.profile.v1'),null);
 console.log('PASS DOM integrated form → pillars → explorer default + 3 jobs/3 people → personalized intro → 3 tracked choices → comparison → 8 real PNG cards; restart, input toggles, delete, birth privacy.');console.log('PNG cards:',out);dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});

