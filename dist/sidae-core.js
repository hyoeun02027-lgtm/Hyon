(function(root){'use strict';
const weights={values:.4,interests:.3,symbolic:.3};
const birthYears=Object.freeze({min:1900,max:Math.min(2100,new Date(Date.now()+9*60*60*1000).getUTCFullYear())});
const questions=[
 {id:'risk',title:'새로운 일을 앞두었을 때',options:['검증된 방식으로 안정을 지킨다','실패 가능성이 있어도 도전한다']},
 {id:'community',title:'오래 남기고 싶은 것은',options:['내 이름으로 완성한 한 작품','여럿이 함께 이어가는 성과']},
 {id:'lead',title:'팀에서 편안한 역할은',options:['방향을 정하고 책임지는 역할','곁에서 조율하고 함께 만드는 역할']},
 {id:'activity',title:'하루를 쓸 수 있다면',options:['손으로 만들고 고치는 작업','자료를 읽고 원리를 찾는 연구']},
 {id:'interest',title:'더 마음이 가는 활동은',options:['새로운 사람과 만나고 교류하기','혼자 관찰하고 기록하기']}
];
// Curated editorial affinities, not measured historical personalities. Each axis 0..1.
const catalog=[
 {id:'craft',era:'조선 후기 · 1792',person:'각방의 장인 유형',job:'목활자 각자장',domain:'craft',v:[.35,.8,.7],i:[0,.7],e:'금',fact:'1792년 생생자는 황양목으로 만든 목활자다. 제작은 관청의 출판 사업과 연결되어 있었다.',context:'관청의 제작 일정과 여러 장인의 협업이 만나는 환경. 게임 속 개인의 계약·납기와 인물 관계는 창작이다.',source:'https://encykorea.aks.ac.kr/Article/E0027516',play:true},
 {id:'engineer',era:'조선 전기 · 15세기',person:'장영실',job:'천문·시간 관측 기구 제작',domain:'engineering',v:[.9,.6,.2],i:[0,.55],e:'금',fact:'장영실은 세종 때 자격루 등 과학 기구 제작에 참여했다.',context:'왕실의 지원 아래 기술을 발휘했지만 신분과 국가 사업의 요구가 활동 조건을 정했다.',source:'https://encykorea.aks.ac.kr/Article/E0048697'},
 {id:'map',era:'조선 후기 · 19세기',person:'김정호',job:'지도 제작·지리 연구',domain:'research',v:[.65,.5,.65],i:[1,1],e:'수',fact:'김정호는 1861년 대동여지도를 간행했다. 지리 정보를 모으고 목판 지도로 제작했다.',context:'자료 수집과 판각, 보급을 함께 고려하는 작업이었다. 알려지지 않은 생애를 추측해 단정하지 않는다.',source:'https://encykorea.aks.ac.kr/Article/E0010423'},
 {id:'medicine',era:'조선 중기 · 16~17세기',person:'허준',job:'의관·의학서 편찬',domain:'care',v:[.2,1,.8],i:[1,.6],e:'토',fact:'허준은 동의보감 편찬을 이끌었다. 책은 1610년 완성되어 1613년 간행되었다.',context:'왕실 의료와 의학 지식의 정리라는 제도적 과제가 함께 있었다.',source:'https://encykorea.aks.ac.kr/Article/E0063152'},
 {id:'trade',era:'통일신라 · 9세기',person:'장보고',job:'해상 교역·조직 운영',domain:'trade',v:[1,.65,0],i:[.35,0],e:'화',fact:'장보고는 828년 청해진을 설치하고 당·신라·일본을 잇는 교역을 이끌었다.',context:'항로의 안전과 국제 교류, 정치적 이해관계가 얽힌 환경이었다.',source:'https://encykorea.aks.ac.kr/Article/E0048474'},
 {id:'poet',era:'조선 중기 · 16세기',person:'허난설헌',job:'시 창작',domain:'arts',v:[.65,.15,.7],i:[.6,1],e:'목',fact:'허난설헌은 가족과 삶의 감정, 사회의 모습을 한시로 표현했다. 작품은 사후에도 전해졌다.',context:'여성의 사회 활동이 제한된 시대였다. 오늘의 자유로운 직업 선택과 같지 않았다.',source:'https://encykorea.aks.ac.kr/Article/E0063034'}
];
const symbolism={목:{word:'성장',strength:'새로운 시도를 키우기',care:'속도를 앞세워 마무리를 놓치기',environment:'배우고 실험할 여지가 있는 곳'},화:{word:'표현',strength:'생각을 드러내고 나누기',care:'열의가 앞서 쉬는 시간을 놓치기',environment:'사람들과 반응을 주고받는 곳'},토:{word:'돌봄',strength:'일을 꾸준히 받쳐주기',care:'책임을 혼자 너무 많이 떠맡기',environment:'신뢰와 지속성이 중요한 곳'},금:{word:'정돈',strength:'기준을 세우고 정밀하게 다듬기',care:'높은 기준을 타인에게 강요하기',environment:'기술과 품질을 차분히 쌓는 곳'},수:{word:'탐구',strength:'관찰하고 여러 가능성을 살피기',care:'생각이 길어져 결정을 미루기',environment:'자료와 경험을 깊이 탐색하는 곳'}};
const endings={AAA:['남겨진 한 획','#b5a17a'],AAB:['말 없는 교본','#91a8b4'],ABA:['다시 세운 각방','#c3a479'],ABB:['함께 여는 문','#9ab59a'],BAA:['칼끝에 남은 그늘','#9c91b2'],BAB:['다음 손의 온기','#cd9a87'],BBA:['제 손에 맞는 칼','#94adbd'],BBB:['모두의 눈금','#a8bd84']};
const choiceValues={A:['완결','개인'],B:['위임','공동체'],AA:['완결','책임'],AB:['협력','전환'],BA:['안정','책임'],BB:['학습','협력'],AAA:['완결','개인'],AAB:['전수','공동체'],ABA:['기준','개인'],ABB:['공동체','전수'],BAA:['완결','안정'],BAB:['전수','돌봄'],BBA:['독립','학습'],BBB:['공동체','전수']};
function calculate(input,m){
 const {year,month,day,unknown=false,boundary='midnight'}=input;
 if(!Number.isInteger(year)||year<birthYears.min||year>birthYears.max)throw Error('출생 연도는 '+birthYears.min+'년부터 '+birthYears.max+'년까지 입력할 수 있습니다.');
 if(!['midnight','jasi','splitJasi'].includes(boundary))throw Error('날짜 경계 기준을 확인해 주세요.');
 if(input.leap&&!input.lunar)throw Error('윤달은 음력에서만 선택할 수 있습니다.');
 const solar=input.lunar?m.lunarToSolar(year,month,day,!!input.leap):{year,month,day};
 if(!m.isValidSolarDate(solar.year,solar.month,solar.day))throw Error('존재하지 않는 날짜입니다.');
 const today=new Date(Date.now()+9*60*60*1000);if(Date.UTC(solar.year,solar.month-1,solar.day)>Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()))throw Error('미래의 출생일은 입력할 수 없습니다.');
 const make=(hour,minute)=>m.calculateFourPillars({...solar,hour,minute,dayBoundary:boundary});
 const samples=unknown?Array.from({length:1440},(_,n)=>make(Math.floor(n/60),n%60)):[make(input.hour,input.minute)];
 const pillars={},elements={목:0,화:0,토:0,금:0,수:0};
 for(const key of ['year','month','day','hour']){
  if(key==='hour'&&unknown){pillars[key]={unknown:true,candidates:[]};continue;}
  const candidates=[...new Set(samples.map(s=>s[key+'String']))];const stable=candidates.length===1,r=samples[0];
  pillars[key]={candidates,stable,hanja:stable?r[key+'Hanja']:null,stem:stable?r[key].heavenlyStem:null,branch:stable?r[key].earthlyBranch:null,ten:stable&&new Set(samples.map(s=>s.dayString)).size===1?r.tenGods[key]:null};
  if(stable){elements[r[key+'Element'].stem]++;elements[r[key+'Element'].branch]++;}
 }
 const sorted=Object.keys(elements).sort((a,b)=>elements[b]-elements[a]);
 return {pillars,elements,sorted,unknown,boundary,ambiguous:Object.values(pillars).some(p=>p.candidates.length>1),lunar:m.solarToLunar(solar.year,solar.month,solar.day),solar,dayElement:pillars.day.stable?samples[0].dayElement.stem:null};
}
function recommend(answers,chart){
 const a=questions.map(q=>Number(answers[q.id]));if(a.some(x=>![0,1].includes(x)))throw Error('다섯 질문에 모두 답해주세요.');
 const total=Object.values(chart.elements).reduce((a,b)=>a+b,0)||1;
 const ranked=catalog.map(c=>{const values=1-c.v.reduce((s,v,n)=>s+Math.abs(v-a[n]),0)/3;const interests=1-c.i.reduce((s,v,n)=>s+Math.abs(v-a[n+3]),0)/2;const symbolic=chart.elements[c.e]/total;const axis=[...c.v,...c.i].map((v,n)=>({n,fit:1-Math.abs(v-a[n])})).sort((x,y)=>y.fit-x.fit||x.n-y.n);const reasons=axis.slice(0,2).map(x=>questions[x.n].options[a[x.n]]);return {...c,reasons,parts:{values,interests,symbolic},score:weights.values*values+weights.interests*interests+weights.symbolic*symbolic};}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 // Each recommendation has a different occupational domain; no fabricated alternate experience.
 return ranked.filter((c,n,all)=>all.findIndex(x=>x.domain===c.domain)===n).slice(0,3);
}
const choiceImpacts={"A": "황양목을 홀로 파다 손목이 굳고, 방각본 납기가 지연됩니다.", "B": "일감을 나누어 방각본 납기를 지키지만, 윤서가 판 다섯 글자에서 결함이 드러납니다.", "AA": "제자와 동료가 떠난 뒤 손목을 묶고 홀로 작업을 이어갑니다.", "AB": "떠나려는 윤서를 붙잡고 기준틀로 공정을 나눠 남은 일을 수습합니다.", "BA": "결함을 직접 보수해 납품을 지키는 대신 손목이 크게 상합니다.", "BB": "기준틀과 공동 교정으로 윤서가 자기 손으로 결함을 고칩니다.", "AAA": "완성한 활자가 남지만 칼끝은 이지러지고 곁의 사람들은 떠납니다.", "AAB": "제자에게 직접 전하지 못한 기술을 주자소의 교본과 칼에 남깁니다.", "ABA": "분업을 지키되 스승의 어미 본판과 권위가 공방의 중심에 남습니다.", "ABB": "공용 칼과 세 사람의 분담으로 공동 도가를 엽니다.", "BAA": "흠 없는 납품과 생계는 지키지만 윤서는 이듬해 칼판을 떠납니다.", "BAB": "손에 맞춘 칼을 받은 윤서는 후계자가 되지만 스승에 대한 마음의 빚을 짊어집니다.", "BBA": "윤서는 스승의 칼 대신 자기 손에 맞는 칼을 벼려 독립된 기준을 세웁니다.", "BBB": "낮춘 날과 눈금틀이 후학들도 쓰는 공방의 기준으로 남습니다."};
function record(records,path,title,now=new Date().toISOString()){
 if(!/^[AB]{1,3}$/.test(path))throw Error('Invalid path');return [...records.filter(r=>r.path.length<path.length&&path.startsWith(r.path)),{path,title,at:now,values:choiceValues[path],impact:choiceImpacts[path]}];
}
function compare(answers,path){if(!answers)return {same:[],different:[]};const same=[],different=[];
 const tests=[{label:answers.community?'공동체의 성과':'개인의 완성',same:answers.community?path[0]==='B':path[0]==='A',text:'첫 선택에서 '+(path[0]==='B'?'일감을 윤서에게 맡겼습니다.':'일감을 직접 완성하려 했습니다.')},{label:answers.lead?'함께 만드는 역할':'직접 책임지는 역할',same:answers.lead?path[1]==='B':path[1]==='A',text:'위기 앞에서 '+(path[1]==='B'?'기준틀로 작업을 나누었습니다.':'스스로 작업을 감당했습니다.')}];
 for(const t of tests)(t.same?same:different).push(t);return {same,different};}
const api={birthYears,weights,questions,catalog,symbolism,endings,choiceValues,choiceImpacts,calculate,recommend,record,compare};root.SidaeCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
