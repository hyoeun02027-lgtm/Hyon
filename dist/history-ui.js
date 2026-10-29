'use strict';
(()=>{
 const key='sidae.profile.v1',h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const originalForm=Sidae.form,originalBegin=Sidae.begin;
 let timer=null,generation=0;
 Sidae.historyRemember=!!Sidae.profile;
 const portraits=[
 ['問','질문에서 시작하는 탐구자','어떻게 움직일까, 왜 이렇게 되었을까? 하늘의 변화부터 생활 속 지식까지, 답을 찾아간 사람들을 만나보세요.'],
 ['記','경험을 이어 주는 기록자','흘러가는 순간을 누군가 다시 찾아볼 수 있는 기록으로. 글과 지도에 남은 이야기를 만나보세요.'],
 ['繪','새로운 장면을 여는 창작자','익숙한 풍경도 다른 눈으로 보면 새로운 이야기가 됩니다. 그림과 시에 담긴 표현을 살펴보세요.'],
 ['作','손끝으로 완성하는 장인','구상을 실제로 작동하는 무언가로. 구조와 재료를 다루며 결과물을 완성한 세계를 만나보세요.'],
 ['助','필요한 순간을 살피는 돌봄자','도움이 필요한 자리에 지식과 자원을 연결한다면? 진료와 배움, 구호에 담긴 방법을 살펴보세요.'],
 ['通','서로의 세계를 잇는 조율자','다른 말과 다른 지식이 만나는 자리. 이해가 이어지도록 도운 사람들을 만나보세요.'],
 ['續','일상을 지속시키는 운영자','필요한 것을 준비하고 일이 이어지게 만드는 힘. 계산과 공급이 생활을 움직이는 장면을 살펴보세요.']
 ];
 function cancel(){clearTimeout(timer);timer=null;generation++;}
 function selected(){try{return {primary:HistoryRecommend.validate(Sidae.profile?.historySelection).primary,secondary:null};}catch{return {primary:'0',secondary:null};}}
 function persist(){if(!Sidae.historyRemember)return;try{localStorage.setItem(key,JSON.stringify(Sidae.profile));}catch{toast('기기 저장은 사용할 수 없습니다. 현재 화면에서만 이어갑니다.');}}
 Sidae.form=function(){cancel();originalForm.call(this);};
 function reveal(){
  cancel();
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){Sidae.analysis();return;}
  const token=generation,profile=Sidae.profile;state.view='history-reveal';
  Sidae.shell('가능성의 문이 열립니다',`<div class="history-reveal"><div class="history-orbit" aria-hidden="true"><span>木</span><span>火</span><span>土</span><span>金</span><span>水</span><i>${Kuong.sprite("excited")}</i></div><p class="sd-kicker">나의 사주 계산 완료</p><p class="sd-lead" role="status">역사 속 새로운 세계를 펼치는 중이에요.</p><button class="secondary" data-history-reveal>바로 보기 →</button></div>`);
  function finish(){if(token!==generation||state.view!=='history-reveal'||Sidae.profile!==profile)return;cancel();Sidae.analysis();const title=app.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});}
  app.querySelector('[data-history-reveal]').addEventListener('click',finish,{once:true});timer=setTimeout(finish,1350);
 }
 Sidae.submit=function(form){
  try{
   const f=new FormData(form),answers={};
   for(const q of SidaeCore.questions){const v=f.get(q.id);if(v!=='0'&&v!=='1')throw Error('다섯 질문에 모두 답해주세요.');answers[q.id]=Number(v);}
   for(const name of ['year','month','day'])if(!String(f.get(name)||'').trim())throw Error('출생 연도와 월, 일을 입력해주세요.');
   if(!f.has('unknown')&&!/^\d{2}:\d{2}$/.test(String(f.get('time'))))throw Error('출생 시각을 입력해주세요.');
   const [hour,minute]=String(f.get('time')||'12:00').split(':').map(Number);
   const c=SidaeCore.calculate({year:+f.get('year'),month:+f.get('month'),day:+f.get('day'),lunar:f.get('calendar')==='lunar',leap:f.has('leap'),unknown:f.has('unknown'),hour,minute,boundary:f.get('boundary')},Manseryeok);
   const chart=Object.fromEntries(['pillars','elements','sorted','unknown','boundary','ambiguous','dayElement'].map(k=>[k,c[k]]));
   this.profile={version:1,answers,chart,historySelection:{primary:'0',secondary:null},historyVersion:1};
   this.historyRemember=f.has('remember');if(this.historyRemember)persist();else try{localStorage.removeItem(key);}catch{toast('이전 저장을 삭제하지 못했습니다. 현재 결과는 저장하지 않습니다.');}
   reveal();
  }catch(e){document.getElementById('sd-error').textContent=e.message;}
 };

 const jobSprites={J01:'scholar',J02:'interpreter',J03:'painter',J04:'physician',J05:'scholar',J07:'scholar',J08:'modern',J09:'scholar',J10:'artisan',J11:'artisan',J12:'artisan',J13:'merchant'};
 const jobImages={J06:{src:'assets/kuong/accountant.png',alt:'산원 쿠옹이: 문서와 주판을 든 모습'},J14:{src:'assets/kuong/farmer.png',alt:'농민 쿠옹이: 논밭에서 낫과 벼 이삭을 든 모습'}};
 function jobArt(c){
  const custom=jobImages[c.id];
  if(custom)return '<div class="history-job-image"><img src="'+custom.src+'" alt="'+custom.alt+'" loading="lazy"></div>';
  const name=jobSprites[c.id]||'modern',frame=Kuong.frames[name],fit=Math.min(100,frame[2]/frame[3]/.75*100);
  return '<div class="history-job-image" style="--job-fit-width:'+fit+'%">'+Kuong.sprite(name,'ku-job')+'</div>';
 }
 function mascotFor(c){
  if(!c.id.startsWith('J'))return '';
  return '<figure class="ku-job-art">'+jobArt(c)+'<figcaption>쿠옹이와 둘러보는 역사 속 역할</figcaption></figure>';
 }
 function card(r){const c=r.candidate;
  return `<article class="sd-rec" data-history-id="${c.id}"><p class="sd-kicker">${r.label==='중심 관심으로 보기'?'이 유형의 대표 사례':r.label==='다른 분야에서 보기'?'다른 분야로 넓혀 보기':'함께 둘러볼 사례'}</p><h3>${h(c.name)}</h3>${mascotFor(c)}<p>${h(c.context)}</p><p><b>역사에 남은 일</b><br>${h(c.fact)}</p><p><b>이 유형으로 살펴볼 지점</b><br>${h(r.reason)}</p><details><summary>배경 이야기와 출처</summary><p>${h(c.constraints)}</p><p>${h(c.caution)}</p>${c.sources.map(s=>`<a target="_blank" rel="noopener noreferrer" href="${h(s.url)}">${h(s.label)} ↗</a>`).join('<br>')}</details></article>`;
 }

 const sajuNotes={
  목:{glyph:'木',name:'가능성을 키우는 개척가',line:'작은 시작을, 나만의 방향으로 키워 가는 힘.',color:'#49694c',tags:['성장','시작','배움'],description:'나무가 가지를 뻗듯, 새로운 시도를 조금씩 키워 가는 모습을 떠올려 보세요. 아직 완성되지 않은 가능성을 발견하고 자기만의 방향을 만들어 가는 이야기입니다.',question:'새로운 일을 시작하는 만큼, 이미 시작한 일에도 시간을 주고 있나요?'},
  화:{glyph:'火',name:'생각을 밝히는 표현가',line:'마음속 생각이 세상과 만나는 순간을 만드는 힘.',color:'#a65b3e',tags:['표현','열의','교감'],description:'불빛이 주변을 밝히듯, 생각을 꺼내고 반응을 주고받는 모습을 떠올려 보세요. 혼자 품었던 이야기를 누군가에게 전하며 새로운 장면을 여는 이야기입니다.',question:'열심히 빛낸 하루 끝에, 나를 위한 쉼도 남겨 두었나요?'},
  토:{glyph:'土',name:'일상을 받쳐 주는 조력가',line:'눈에 잘 띄지 않아도, 오래 이어지게 하는 힘.',color:'#98753d',tags:['꾸준함','신뢰','돌봄'],description:'땅이 삶의 바탕이 되듯, 한결같이 자리를 지키고 일을 받쳐 주는 모습을 떠올려 보세요. 빠른 변화보다 오래 쌓이는 신뢰와 생활의 리듬을 돌아보는 이야기입니다.',question:'다른 사람의 몫까지, 나 혼자 책임지고 있지는 않나요?'},
  금:{glyph:'金',name:'본질을 다듬는 완성가',line:'불필요한 것을 덜어 내고, 중요한 것을 선명하게.',color:'#646d85',tags:['기준','정돈','완성'],description:'금속을 정밀하게 다듬듯, 기준을 세우고 하나씩 완성해 가는 모습을 떠올려 보세요. 작은 차이를 살피며 내가 중요하게 여기는 것의 윤곽을 선명하게 만드는 이야기입니다.',question:'잘하고 싶은 마음이, 나와 다른 사람에게 너무 높은 기준이 되지는 않았나요?'},
  수:{glyph:'水',name:'가능성을 읽는 사색가',line:'조용히 살핀 장면에서, 새로운 길을 발견하는 힘.',color:'#426878',tags:['관찰','탐구','가능성'],description:'물이 여러 길을 따라 흐르듯, 한 가지 답에 서두르지 않고 다양한 가능성을 살피는 모습을 떠올려 보세요. 쌓아 온 관찰과 경험에서 나만의 질문을 발견하는 이야기입니다.',question:'충분히 생각한 지금, 작은 선택 하나를 실행해 볼 수 있을까요?'}
 };
 function sajuNote(c){
  const e=c?.dayElement,day=c?.pillars?.day;
  if(!day?.stable||!sajuNotes[e])return {glyph:'因',name:'여러 가능성으로 열린 나의 이야기',line:'하나의 이름보다, 지금 확인할 수 있는 것부터.',color:'#716957',tags:['열린 해석','다시 살피기'],description:'일간이 하나로 확정되지 않아 오행별 별칭을 정하지 않았어요. 계산 상세에서 후보와 날짜 경계를 살펴보세요.',question:'어떤 정보가 확실하고, 어떤 가능성을 열어 두어야 할까요?',basis:'일간 미확정',stable:false};
  return {...sajuNotes[e],element:e,stable:true,basis:day.stem+e,day:day.candidates[0],strength:SidaeCore.symbolism[e].strength,environment:SidaeCore.symbolism[e].environment};
 }
 function cardMatch(a,c){const m=HistoryRecommend.recommendType(a,c);if(!m)return null;const r=HistoryRecommend.recommend({primary:m.typeId,secondary:null});return {...m,job:r.jobs[0].candidate,person:r.people[0].candidate,mascot:['scholar','scholar','painter','artisan','physician','interpreter','merchant'][+m.typeId]};}
 function sajuProfile(c,a){
  const n=sajuNote(c),match=cardMatch(a,c);
  return `<section class="saju-note" data-saju-note style="--saju-accent:${n.color}" aria-labelledby="saju-note-title"><div class="saju-note-top"><p class="sd-kicker">MY SAJU NOTE · 나를 읽는 상징 카드</p><span class="saju-note-code">${h(n.basis)}${n.day?' · '+h(n.day)+'일주':''}</span></div><div class="saju-note-hero"><span class="saju-note-glyph" aria-hidden="true">${n.glyph}</span><div><p class="saju-note-eyebrow">${n.stable?'일간의 오행으로 펼쳐 보는 나':'확정하지 않고 남겨 둔 가능성'}</p><h2 id="saju-note-title">${n.name}</h2><p class="saju-note-line">${n.line}</p></div></div><div class="saju-note-tags">${n.tags.map(t=>`<span>${t}</span>`).join('')}</div><p class="saju-note-description">${n.description}</p>${n.stable?`<div class="saju-note-points"><div><h3>이런 힘을 떠올려 보세요</h3><p>${h(n.strength)}</p></div><div><h3>이런 환경을 상상해 보세요</h3><p>${h(n.environment)}</p></div></div>`:''}${match?`<div class="saju-note-points" data-saju-match><div><p class="sd-kicker">역사 속에서의 내 직업은?</p>${jobArt(match.job)}<p><b>대표 직업</b> · ${h(match.job.name)}<br><b>함께 만날 인물</b> · ${h(match.person.name)}</p><button class="secondary" type="button" data-show-recommended="${match.typeId}">직업과 인물 더 살펴보기 →</button></div></div>`:''}<div class="saju-note-question"><small>나에게 던지는 한 가지 질문</small><p>${n.question}</p></div><div class="saju-note-bottom"><button type="button" class="secondary" data-saju-save>내 사주 카드 저장 ↓</button><button type="button" class="secondary" data-saju-share>카드 공유 ↗</button><details><summary>이 별칭은 어떻게 정했나요?</summary><p>실제 계산된 일간의 오행에 전통의 상징을 연결한 서비스의 별칭입니다. 사주 전체를 해석하거나 성격을 확정한 진단은 아닙니다. 추천 유형은 일간의 오행 상징과 다섯 답변을 연결한 서비스의 탐색 제안입니다. 둘러보는 유형을 바꾸어도 저장될 추천은 바뀌지 않아요.${c.unknown?' 출생 시각을 몰라 시주 정보는 사용하지 않았어요.':''}</p></details></div></section>`;
 }

 Sidae.sajuCard=async function(share=false){
  if(!this.profile?.chart)return;
  const n=sajuNote(this.profile.chart),match=cardMatch(this.profile.answers,this.profile.chart);
  try{
   if(document.fonts)await document.fonts.load('24px "Sidae Korean"');
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
   const c=canvas.getContext('2d');c.fillStyle='#f3efe3';c.fillRect(0,0,1080,1440);
   c.strokeStyle=n.color;c.lineWidth=3;c.strokeRect(48,48,984,1344);
   c.fillStyle=n.color;c.font='23px "Sidae Korean", sans-serif';c.fillText('時代因材 / 나의 역사 속 또 다른 나',90,125);
   c.font='23px "Sidae Korean", sans-serif';c.fillText(n.basis+(n.day?' · '+n.day+'일주':''),90,175);
   let y=255;
   function lines(text,width,lineHeight){for(const line of wrap(c,text,width)){c.fillText(line,90,y);y+=lineHeight;}}

   c.font='24px "Sidae Korean", sans-serif';lines(n.stable?'일간의 오행으로 펼쳐 보는 나':'열어 둔 가능성',880,40);
   y=345;c.font='56px "Sidae Korean", sans-serif';lines(n.name,880,74);
   y+=12;c.font='28px "Sidae Korean", sans-serif';lines(n.line,880,43);
   y+=26;c.font='24px "Sidae Korean", sans-serif';lines(n.tags.map(t=>'#'+t).join('   '),880,38);
   y+=35;c.fillStyle='#303c33';c.font='28px "Sidae Korean", sans-serif';lines(n.description,880,47);
   const panelY=Math.max(780,y+35);
   c.fillStyle='#e7e4d8';c.fillRect(90,panelY,900,350);

   const mascot=new Image(),custom=match&&jobImages[match.job.id];
   mascot.src=custom?custom.src:Kuong.sheet;await mascot.decode();
   const frame=custom?[0,0,mascot.naturalWidth||mascot.width||mascot.image?.width,mascot.naturalHeight||mascot.height||mascot.image?.height]:Kuong.frames[match?(jobSprites[match.job.id]||match.mascot):'modern'];
   const [mx,my,mw,mh]=frame,scale=Math.min(190/mw,(190*4/3)/mh),dw=mw*scale,dh=mh*scale;
   c.drawImage(mascot,mx,my,mw,mh,755+(190-dw)/2,panelY+42+(190*4/3-dh)/2,dw,dh);
   c.fillStyle=n.color;c.font='23px "Sidae Korean", sans-serif';c.fillText('역사 속에서의 내 직업은?',120,panelY+60);
   c.fillStyle='#303c33';c.font='33px "Sidae Korean", sans-serif';
   let rowY=panelY+120;for(const line of wrap(c,match?match.job.name:'다양한 역할을 탐색해 보세요',590)){c.fillText(line,120,rowY);rowY+=44;}
   c.fillStyle=n.color;c.font='23px "Sidae Korean", sans-serif';c.fillText('함께 만나 볼 역사 인물',120,panelY+235);
   c.fillStyle='#303c33';c.font='36px "Sidae Korean", sans-serif';c.fillText(match?match.person.name:'열린 탐색',120,panelY+295);
   c.fillStyle='#6d705f';c.font='20px "Sidae Korean", sans-serif';
   c.fillText('사주 상징과 질문의 답을 연결한 탐색 제안 · 성격 진단이 아닙니다.',90,1285);
   c.fillText('다른 시대에 태어났다면, 당신은 어떤 사람이었을까요?',90,1340);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');
   const filename='시대인재_'+n.name+'_사주카드.png';
   if(share){const file=new File([blob],filename,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({title:'나의 사주 카드 · '+n.name,files:[file]});return;}}
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast(share?'이미지를 저장했어요. 원하는 곳에 직접 공유해 주세요.':'나의 사주 카드를 저장했습니다.');
  }catch(e){if(e.name!=='AbortError')toast('카드 이미지를 저장하지 못했습니다. 다시 시도해 주세요.');}
 };

 Sidae.analysis=function(){
  cancel();if(!this.profile){this.form();return;}
  state.view='analysis';const c=this.profile.chart,a=this.profile.answers,value=selected(),result=HistoryRecommend.recommend(value),p=portraits[+value.primary];
  this.shell('나의 사주, 역사를 만나다',`<div class="history-region history-arrive">${Kuong.guide("sparkle","나의 사주 카드를 만나볼까요?","일간의 상징을 읽고, 다른 시대의 여러 역할도 함께 둘러봐요.")}${sajuProfile(c,a)}<section class="sd-panel history-chart-peek"><p class="sd-kicker">나의 사주 계산 결과</p><div class="history-pillars">${['year','month','day','hour'].map((k,i)=>`<div><small>${['년주','월주','일주','시주'][i]}</small><strong>${h(c.pillars[k].unknown?'미산출':c.pillars[k].candidates.join(' / '))}</strong></div>`).join('')}</div>${c.unknown?'<p>출생 시각을 몰라 시주는 산출하지 않았어요.</p>':''}${c.ambiguous?'<p>경계에 걸친 기둥은 여러 후보로 표시했어요.</p>':''}</section><section class="history-explore"><p class="sd-kicker">나와 어울리는 다른 직업도 둘러볼까요?</p><div class="history-type-tabs" role="group" aria-label="역사 유형 둘러보기">${HistoryData.types.map(t=>`<button type="button" data-history-type="${t.id}" aria-pressed="${t.id===value.primary}">${h(t.name)}</button>`).join('')}</div><article class="history-portrait"><span class="history-seal" aria-hidden="true">${p[0]}</span><div><p class="sd-kicker">${value.primary==='0'?'첫 탐색 · 탐구자의 세계':'지금 둘러보는 세계'}</p><h2>${p[1]}</h2><p>${p[2]}</p></div></article><p class="sd-fine">탐구자부터 시작하는 역사 탐색입니다. 위 유형을 눌러 자유롭게 둘러보세요. 유형은 사주로 판정한 결과가 아닙니다.</p></section><h2>이 시대에 이런 일을 했다면?</h2><div class="history-cards">${result.jobs.map(card).join('')}</div><h2>이 사람의 이야기가 궁금하다면</h2><div class="history-cards">${result.people.map(card).join('')}</div><section class="sd-panel">${calculation(c)}</section><details class="sd-panel"><summary>내가 답한 다섯 가지 질문</summary>${SidaeCore.questions.map(q=>`<p>${h(q.title)} · ${h(q.options[a[q.id]])}</p>`).join('')}</details><div class="sd-panel sd-bridge"><div class="ku-bridge-character">${Kuong.sprite("artisan","ku-job")}</div><p class="sd-kicker">읽는 역사에서, 선택하는 역사로</p><h2>이제, 당신의 이야기를 시작해요</h2><p>1792년 한양의 작업장. 세 번의 선택 끝에 당신은 어떤 삶을 남기게 될까요?</p><p>${h(this.intro(a))}</p><button class="primary" data-action="setup">「마지막 도구」 이야기 시작 →</button><button class="secondary" data-sd="form">다시 알아보기</button></div></div>`);
  app.querySelector('[data-saju-save]').addEventListener('click',()=>this.sajuCard());
  app.querySelector('[data-saju-share]').addEventListener('click',()=>this.sajuCard(true));
  app.querySelector('[data-show-recommended]')?.addEventListener('click',e=>{this.profile.historySelection={primary:e.currentTarget.dataset.showRecommended,secondary:null};persist();this.analysis();app.querySelector('.history-explore').scrollIntoView({behavior:'smooth',block:'start'});});
  for(const button of app.querySelectorAll('[data-history-type]'))button.addEventListener('click',()=>{
   const primary=button.dataset.historyType;if(primary===value.primary)return;this.profile.historySelection={primary,secondary:null};this.profile.historyVersion=1;persist();this.analysis();app.querySelector(`[data-history-type="${primary}"]`).focus({preventScroll:true});
  });
 };
 Sidae.begin=function(){originalBegin.call(this);if(state.sidae.answers)state.sidae.answers={...state.sidae.answers};};
 function calculation(c){const total=Object.values(c.elements).reduce((a,b)=>a+b,0);return `<details><summary>실제 계산값 · 오행과 십신 보기</summary><p>${c.unknown?'시각 미상: 하루 1,440분을 계산해 일치하는 기둥만 확정합니다. 시주는 산출하지 않습니다.':'한국 표준시(UTC+9) · 경도/진태양시 보정 없음'} / 날짜 경계: ${esc(c.boundary)}</p>${c.ambiguous?'<p class="notice">절기 또는 날짜 경계를 포함해 기둥이 달라집니다. 아래 후보를 하나의 확정값으로 해석하지 마세요. 오행에는 확정 기둥만 집계합니다.</p>':''}<div class="sd-pillars">${['year','month','day','hour'].map((k,i)=>{const p=c.pillars[k];return `<article><small>${['년주','월주','일주','시주'][i]}</small><strong>${p.unknown?'미산출':esc(p.candidates.join(' / '))}</strong><span>${esc(p.hanja||'')}</span><p>${p.stem?'천간 '+p.stem+' · 지지 '+p.branch:''}</p><small>${p.ten?'천간 '+p.ten.stem+' / 지지 본기 '+p.ten.branch:'십신 확정 불가'}</small></article>`;}).join('')}</div>${Object.entries(c.elements).map(([e,n])=>`<div class="sd-bar"><b>${e}</b><meter min="0" max="${total||1}" value="${n}" aria-label="${e} ${n}개"></meter><span>${n}개</span></div>`).join('')}<p>천간·지지의 대표 오행을 같은 비중으로 센 단순 분포입니다. 지장간 전체나 월령 가중치, 강약·격국·용신·조후 판정을 한 값이 아닙니다. 십신은 일간 기준이며 지지는 본기를 사용합니다.</p><button class="secondary" data-sd="method">자료와 계산 범위 보기</button></details>`;}
 Sidae.method=function(){openModal(`<h2>계산과 추천의 기준</h2><p>계산: manseryeok 2.0.0, MIT 라이선스. 고정한 소스의 계산 엔진을 브라우저에서 실행합니다. AI가 간지를 생성하지 않습니다.</p><p>이 화면의 입력 지원 범위: 1900~${SidaeCore.birthYears.max}년, UTC+9. 역사적 서머타임, 해외 현지시각, 진태양시 보정은 미지원입니다. 년주·월주는 입춘·절입, 일주는 선택한 날짜 경계를 적용합니다. 절입 계산은 분 단위 자료를 사용하므로 경계의 초 단위 확정은 지원하지 않습니다.</p><p>엔진에 포함된 한국 음양력 변환 자료를 사용합니다. KASI OpenAPI 응답 구조는 확인했지만 인증키가 없어 실시간 API 대조는 하지 않았습니다. 음력 월건을 절기 기준 사주 월주와 동일시하지 않습니다.</p><p>역사 추천: 탐구자는 사주로 판정한 결과가 아닌 기본 탐색 화면입니다. 결과 페이지에서 다른 유형을 자유롭게 둘러볼 수 있습니다. 직업과 인물을 각각 세 후보로 소개하며 점수·성격 진단은 제공하지 않습니다. 카드의 추천 유형 하나는 일간의 오행 상징과 다섯 답변을 연결한 서비스의 규칙으로 정합니다. 목은 연구/제작 답에 따라 탐구자/창작자, 화는 교류/관찰 답에 따라 조율자/창작자, 토는 책임/조율 답에 따라 운영자/돌봄자, 금은 제작/연구 답에 따라 장인/기록자, 수는 관찰과 안정 답을 함께 골랐으면 기록자, 그 외에는 탐구자를 제안합니다. 일간이 불확정이면 질문의 답만 사용합니다. 사주 전체의 전문 해석이나 적성 검증을 거친 진단은 아닙니다.</p><p>역사 콘텐츠는 제공된 자료집과 공공기관 해설을 옮긴 초안입니다. 원사료 전체 대조나 전문가 검증을 마친 결과가 아닙니다. 역사적 사실, 서비스의 연결 해석, 당시의 제약을 구별해 표시합니다.</p><p><a target="_blank" rel="noopener" href="https://github.com/yhj1024/manseryeok">계산 엔진 ↗</a> · <a target="_blank" rel="noopener" href="https://www.data.go.kr/data/15012679/openapi.do">한국천문연구원 API ↗</a> · <a href="vendor/manseryeok.LICENSE">MIT 라이선스</a></p>`);};
})();
