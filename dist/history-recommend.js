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

 function recommendType(answers,chart){
  if(!answers||!['risk','community','lead','activity','interest'].every(k=>[0,1].includes(answers[k])))return null;
  const a=answers,e=chart?.pillars?.day?.stable?chart.dayElement:null;
  let id,reason;
  if(e==='목'){id=a.activity===1?'0':'2';reason='성장의 상징에 '+(a.activity===1?'자료를 읽고 원리를 찾는 연구':'손으로 만들고 고치는 작업')+'를 고른 답을 연결했어요.';}
  else if(e==='화'){id=a.interest===0?'5':'2';reason='표현의 상징에 '+(a.interest===0?'새로운 사람과 만나고 교류하기':'혼자 관찰하고 기록하기')+'를 고른 답을 연결했어요.';}
  else if(e==='토'){id=a.lead===0?'6':'4';reason='돌봄의 상징에 '+(a.lead===0?'방향을 정하고 책임지는 역할':'곁에서 조율하고 함께 만드는 역할')+'을 고른 답을 연결했어요.';}
  else if(e==='금'){id=a.activity===0?'3':'1';reason='정돈의 상징에 '+(a.activity===0?'손으로 만들고 고치는 작업':'자료를 읽고 원리를 찾는 연구')+'를 고른 답을 연결했어요.';}
  else if(e==='수'){id=a.interest===1&&a.risk===0?'1':'0';reason=id==='1'?'탐구의 상징에 관찰·기록과 안정을 고른 답을 연결했어요.':a.risk===1?'탐구의 상징에 도전을 고른 답을 연결했어요.':'탐구의 상징에 새로운 사람과의 교류를 고른 답을 연결했어요.';}
  else{
   id=a.activity===1?(a.interest===1?'1':'0'):a.community===1?(a.lead===1?'4':'6'):a.interest===0&&a.lead===1?'5':a.risk===1?'2':'3';
   reason='일간이 확정되지 않아 사주 상징은 사용하지 않고, 다섯 질문의 답만으로 고른 탐색 제안이에요.';
  }
  return {typeId:id,type:data.types.find(t=>t.id===id),reason,usesSaju:['목','화','토','금','수'].includes(e)};
 }

 return {validate,recommend,recommendType};
})();
if(typeof module!=='undefined')module.exports=HistoryRecommend;
