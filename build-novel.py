"""Build lossless source spans and explicit stage states from the supplied PDF extraction."""
import json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=json.loads((root/'dist/story.json').read_text())
speakers={'':['yun','chun','chun','yun','yun','chun','chun','yun','yun'],'A':['master','master','chun','master','jo','chun','jo','choi','choi','yun','yun','chun'],'B':['master','chun','master','master','chun','choi','choi','yun','choi','yun'],'AA':['master','master','chun','choi'],'BB':['master','master','master','chun','master','chun','choi','choi','choi'],'AAA':['master','master'],'BBB':['master','master','yun','yun','master','master']}
full=set(speakers)
def split_spans(text,start,end,limit=190):
 # Sentence boundaries, never delete source characters. Prefer clauses for long sentences.
 bounds=[start]
 for m in re.finditer(r'[.!?](?:\s*|(?=[가-힣]))',text[start:end]):
  pos=start+m.end()
  if pos>bounds[-1]:bounds.append(pos)
 if bounds[-1]!=end:bounds.append(end)
 out=[];a=bounds[0]
 for b in bounds[1:]:
  if b-a>limit:
   # Pack by punctuation/space only when a single sentence cannot fit.
   while b-a>limit:
    cut=text.rfind(', ',a,a+limit)
    if cut<a+50:cut=text.rfind(' ',a,a+limit)
    if cut<=a:cut=a+limit
    else:cut+=1
    out.append((a,cut));a=cut
  if b-a>=90:out.append((a,b));a=b
 if a<end:out.append((a,end))
 return out

def initial(path):
 cast={k:False for k in ['master','yun','chun','choi','junior1','junior2']};cast['master']=True
 if path not in ['AAA','AAB']:cast.update(yun=True,chun=True)
 if path in ['AAA','BBB','BBA']:cast['choi']=True
 return {'cast':cast,'moods':{k:'neutral' for k in cast},'light':'night' if len(path)<2 else 'dawn' if path=='AAA' else 'day','time':{'':'시월 초닷새 밤','A':'시월 초닷새 밤','B':'시월 초닷새 밤','AA':'이튿날 낮','AB':'이튿날 아침','BA':'검수가 끝난 아침','BB':'검수가 끝난 아침','AAA':'시월 초여드레 새벽','BBB':'최종 검수의 아침'}.get(path,'마지막 유산'),'place':'한양 · 교서관 뒷골목 각방','camera':'wide','work':False}

def update(st,path,text):
 c=st['cast'];m=st['moods'];effect='';pause=0
 if '스승에게 물려받아' in text:effect='memory'
 if any(x in text for x in ['동이 텄다','날이 밝자마자','진시(辰時)','이튿날 아침']):st['light']='day';st['time']='이튿날 아침'
 if any(x in text for x in ['삼경(三更)','그날 밤','밤새도록']):st['light']='night';st['work']=True
 if '시월 초여드레' in text or '첫닭이 울' in text:st['time']='시월 초여드레 새벽';st['light']='dawn'
 if '그로부터 사 년' in text:st['light']='autumn' if path=='BBB' else 'spring';st['time']='1796년 가을' if path=='BBB' else '1796년 봄';effect='time';c['choi']=False;st['work']=False
 if path=='A':
  if '문밖으로 나가버렸다' in text:c['yun']=False
  if '최도윤이 푸른' in text:c['choi']=True
  if '최 서리가 돌아간 뒤' in text:c['choi']=False
  if '행장을 꾸린 윤서' in text:c['yun']=True;m['yun']='sad'
 if path=='AA':
  if '마당을 걸어 나갔다' in text:c['yun']=False
  if '춘삼마저' in text:c['chun']=False
  if '저녁 무렵 방 안을 기웃' in text:c['choi']=True
  if '뒷걸음질 쳐 돌아갔다' in text:c['choi']=('저녁 무렵 방 안을 기웃' in text)
  if '최 서리가 조심스럽게' in text:c['choi']=True
 if path=='B':
  if '서리 최도윤이' in text:c['choi']=True
  if '최 서리가 마당을 나가자' in text:c['choi']=False
 if path=='BB' and '다시 찾아온 최 서리는' in text:c['choi']=True
 if path=='AAA' and '그로부터 사 년' in text:c['yun']=False;c['chun']=False;c['choi']=False
 if path=='BBB' and '견습공 둘' in text:c['junior1']=True;c['junior2']=True
 if path=='BAA' and '이듬해 봄 떠남' in text:c['yun']=False
 if any(x in text for x in ['핏기가 싹','고개를 떨','죄인처럼','눈시울이 붉','허공에서 멈추']):m['yun']='sad'
 if any(x in text for x in ['놀라 일어','얼굴이 새하얗게','손끝이 부들부들']):m['yun']='afraid'
 if '기겁' in text:m['chun']='surprised'
 if '주먹 쥔' in text:m['yun']='angry'
 if '쐐기틀을 받아' in text or '정식 각자장' in text:m['yun']='neutral'
 if '미간을 찌푸' in text or '차갑게 장부' in text:m['choi']='angry'
 if any(x in text for x in ['경련','무명천','통증']):m['master']='sad';st['camera']='close'
 if any(x in text for x in ['찌르르','틱—!','대문이 쾅']):effect='shock';st['camera']='close'
 if '무거운 침묵' in text or '순식간에 각방에 정적' in text:effect='silence';pause=650;st['work']=False
 if '세 사람의 손이 한 몸' in text:st['work']=True;st['camera']='wide';m['master']='neutral'
 if path not in full:st['work']=False
 return effect,pause

nodes={};stats={}
for path,node in s['nodes'].items():
 text=node['text'];st=initial(path); beats=[];q=0
 # Table-only endings include every original table field, rather than invented dialogue.
 texts=[('본문',text)]
 if node.get('table') and len(path)==3:
  o=s['outcomes'][path];texts += [(name,o[key]) for name,key in [('관계','relations'),('도구','tool'),('유산','legacy'),('대가','cost')]]
 for section,txt in texts:
  parts=list(re.finditer(r'"[^"]*"|[^\"]+',txt))
  for part in parts:
   raw=part.group();dialogue=raw.startswith('"') and path in full
   speaker=speakers[path][q] if dialogue else 'narrator'
   if dialogue:q+=1
   a,b=part.span();inner_a=a+1 if dialogue else a;inner_b=b-1 if dialogue else b
   for x,y in split_spans(txt,inner_a,inner_b):
    rawtext=txt[x:y];display=rawtext.strip()
    if not display:continue
    # Punctuation/spacing repairs only; source ranges retained for independent audit.
    display=display.replace('길게 찢었다 떨리는','길게 찢었다. 떨리는').replace('보수·판각 물량을 이 공방에 고정으로 맡기려 하오 어떠시오?', '보수·판각 물량을 이 공방에 고정으로 맡기려 하오. 어떠시오?').replace('내려온『','내려온 『')
    display=re.sub(r'([.!?])(?=[가-힣])',r'\1 ',display)
    edits={"남은 황양목 원자 예순 자 중에 서른 자는 오늘 밤 저에게 맡겨 주십시오.":"남은 황양목 원자 예순 자 가운데, 오늘 밤 서른 자는 제게 맡겨주십시오.","제가 스승님 옆에서 바탕면 평칼질만 한 지가 올가을로 꼭 육 년째입니다.":"스승님 곁에서 바탕만 평칼로 다듬은 지, 올가을로 꼭 육 년입니다.","아니, 형님. 새벽까지 황양목 파고 언제 또 『소학』 판목 다섯 장을 다 본단 말이오?":"아니, 형님. 새벽까지 황양목을 파고, 『소학』 판목 다섯 장은 또 언제 다 보겠소?","스승님, 제 손이 미련해서 일을 그르쳤습니다.":"스승님, 제 손이 미숙해서 일을 그르쳤습니다."}
    for old,new in edits.items():display=display.replace(old,new)
    effect,pause=update(st,path,display)
    beats.append({'id':f'{path or "root"}-{len(beats)}','kind':'dialogue' if dialogue else 'narration','speaker':speaker,'text':display,'source':{'section':section,'start':x,'end':y,'text':rawtext},'stage':json.loads(json.dumps(st)),'effect':effect,'pause':pause})
    if path=='AA' and '뒷걸음질 쳐 돌아갔다' in display:st['cast']['choi']=False
 if path in full:assert q==len(speakers[path]),(path,q)
 nodes[path]={'title':node['title'],'basis':'manuscript' if path in full else 'table','beats':beats,'sourceText':text}
 stats[path]={'beats':len(beats),'sourceCharacters':len(text),'dialogue':sum(x['kind']=='dialogue' for x in beats)}
result={'version':3,'nodes':nodes,'sourcePdfSha256':hashlib.sha256((root/'dist/manuscript.pdf').read_bytes()).hexdigest(),'stats':stats}
(root/'dist/novel.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(stats,ensure_ascii=False));print('Total beats',sum(x['beats'] for x in stats.values()))
