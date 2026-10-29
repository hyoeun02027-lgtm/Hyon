'use strict';
const HistoryRecommend=(()=>{
 const data=typeof HistoryData!=='undefined'?HistoryData:require('./history-data.js');
 function validate(value){
  if(!value||typeof value!=='object'||!data.types.some(t=>t.id===value.primary))throw Error('역사에서 먼저 살펴볼 관심을 골라주세요.');
  if(![null,'default','alternate'].includes(value.secondary))throw Error('보조 관심을 다시 골라주세요.');
  return {primary:value.primary,secondary:value.secondary};
 }
 const changes={
  '0':{jobs:{id:'J02',reason:'다른 지식과 대화하고 싶다는 선택을 언어와 대외 접촉을 통한 배움에 연결했어요.'},people:{id:'P01',reason:'청의 학자들과 만남과 서신 교류를 이어 간 행적을 다른 지식과 대화하기에 연결했어요.'}},
  '1':{people:{id:'P15',reason:'농민의 경험을 수집한 공동 편찬에서 현장의 방법을 기록으로 모으는 작업을 살펴보세요.'}},
  '2':{people:{id:'P11',reason:'표현의 기준과 도구를 다듬는 관심을 음정을 위한 율관의 시험 제작에 연결했어요.'}},
  '3':{jobs:{id:'J12',reason:'기록을 오래 전하고 싶다는 선택을 인쇄용 책판의 정확한 제작에 연결했어요.'}},
  '4':{people:{id:'P14',reason:'생산 지식으로 생활을 돕는 관심을 구황을 위한 재배 지식의 보급에 연결했어요.'}},
  '6':{jobs:{id:'J08',reason:'행정과 기록을 이어가는 관심을 지방 관아의 문서와 자원 관리 실무에 연결했어요.'},people:{id:'P20',reason:'행정과 기록을 이어가는 관심을 관직 업무와 일상을 함께 남긴 일기에 연결했어요.'}}
 };
 function recommend(value){
  const selection=validate(value),t=data.types.find(t=>t.id===selection.primary);
  const out={selection,type:t,jobs:t.jobs.map(x=>({...x})),people:t.people.map(x=>({...x}))};
  for(const kind of ['jobs','people']){
   let linked=selection.secondary==='default';
   if(selection.secondary==='alternate'){
    if(t.id==='5'&&kind==='jobs'){
     [out.jobs[1],out.jobs[2]]=[out.jobs[2],out.jobs[1]];
     out.jobs[1].reason='여러 기술을 함께 완성하는 관심을 목조건축의 공정 간 협업에 연결했어요.';
     out.jobs[2].reason='이번에는 기술 협업에서 글과 지식을 전하는 교육의 역할로 탐색을 넓혀 보세요.';
     linked=true;
    }else if(changes[t.id]?.[kind]){
     out[kind][1]={...changes[t.id][kind]};linked=true;
    }
   }
   if(!linked)out[kind][1].reason=t.neutral[kind];
   out[kind]=out[kind].map((r,i)=>({...r,candidate:data.catalog[r.id],
    label:i===0?'중심 관심으로 보기':i===2?'다른 분야에서 보기':linked?'함께 고른 관심으로 보기':'추가 탐색 제안'}));
  }
  return out;
 }

 // Editorial associations for this experience; not a traditional vocational diagnosis.
 const dayStemJobs={
  갑:{element:'목',typeId:'0',jobId:'J05',jobName:'관상감 천문학 관원',personId:'P09'},
  을:{element:'목',typeId:'5',jobId:'J02',jobName:'역관',personId:'P18'},
  병:{element:'화',typeId:'2',jobId:'J03',jobName:'화원',personId:'P03'},
  정:{element:'화',typeId:'4',jobId:'J04',jobName:'의녀',personId:'P07'},
  무:{element:'토',typeId:'0',jobId:'J14',jobName:'농민',personId:'P14'},
  기:{element:'토',typeId:'6',jobId:'J06',jobName:'산원',personId:'P06'},
  경:{element:'금',typeId:'1',jobId:'J01',jobName:'사관',personId:'P12'},
  신:{element:'금',typeId:'3',jobId:'J10',jobName:'장인',personId:'P08'},
  임:{element:'수',typeId:'6',jobId:'J13',jobName:'상인',personId:'P04'},
  계:{element:'수',typeId:'0',jobId:'J05',jobName:'관상감 천문학 관원',personId:'P09'}
 };
 function recommendType(answers,chart){
  const day=chart?.pillars?.day,rule=day?.stable&&dayStemJobs[day.stem];
  if(!rule||rule.element!==chart.dayElement)return null;
  return {...rule,type:data.types.find(t=>t.id===rule.typeId),basis:day.stem+rule.element,usesSaju:true,
   reason:day.stem+rule.element+'의 상징에 '+rule.jobName+'을 연결한 서비스의 체험용 추천입니다.'};
 }

 return {validate,recommend,recommendType};
})();
if(typeof module!=='undefined')module.exports=HistoryRecommend;
