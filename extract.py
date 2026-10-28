import re,json,shutil
from pathlib import Path
import pymupdf
base=Path(__file__).resolve().parent; doc_source=base/'dist/manuscript.pdf'; t='\n'.join(p.get_text() for p in pymupdf.open(doc_source)); s=re.sub(r'\s+',' ',t)
def between(a,b,start=0):
 i=s.index(a,start)+len(a); return s[i:s.index(b,i)].strip()
def choices(a,b):
 x=between(a,b)
 return [{'title':m[0],'text':m[1].strip()} for m in re.findall(r'\[선택지 [123][AB] — ([^\]]+)\]([^\[]+)',x)]
data={'nodes':{},'choices':{}}
n=data['nodes'];c=data['choices']
n['']={'title':'뒤틀린 황양목','text':between('[공통 도입] 시월 초닷새 밤, 뒤틀린 황양목','[첫 번째 갈림길:')}
c['']=choices('[첫 번째 갈림길: 누구 또는 무엇을 우선할 것인가?]','[경로 1 시연:')
n['A']={'title':'닫힌 작업대와 새벽의 경련','text':between('(1A 선택 직후)','[두 번째 갈림길:')}
c['A']=choices('[두 번째 갈림길: 앞선 선택에서 생긴 대가를 어떻게 감당할 것인가?]','2막: 무명천')
n['AA']={'title':'무명천으로 묶은 손목','text':between('을 선택한 뒤 이어지는 이야기입니다.당신은 보따리를','[세 번째 갈림길:')}
n['AA']['text']='당신은 보따리를 '+n['AA']['text']
c['AA']=choices('[세 번째 갈림길: 마지막으로 무엇을 남길 것인가?]','3막과 결말: 부러진')
n['AAA']={'title':'부러진 날 끝과 천 번의 인출','text':between('을 선택한 뒤 이어지는 결말입니다.','[경로 2 시연:')}
n['B']={'title':'건네준 서른 자와 아침의 불호령','text':between('(1B 선택 직후)','[두 번째 갈림길:')}
i=s.index('(1B 선택 직후)'); x=s[i:];c['B']=[{'title':a,'text':b.strip()} for a,b in re.findall(r'\[선택지 2[AB] — ([^\]]+)\]([^\[]+?)(?=\[선택지|2막:)',x)]
n['BB']={'title':'배나무 눈금틀과 세 사람의 먹솔','text':between('을 선택한 뒤 이어지는 이야기입니다.당신은 고개를','[세 번째 갈림길:')}
n['BB']['text']='당신은 고개를 '+n['BB']['text']
i=s.index('(2B 선택 직후)');x=s[i:];c['BB']=[{'title':a,'text':b.strip()} for a,b in re.findall(r'\[선택지 3[AB] — ([^\]]+)\]([^\[]+?)(?=\[선택지|3막과 결말:)',x)]
i=s.index('3막과 결말: 숫돌'); n['BBB']={'title':'숫돌 위의 쇳가루와 끊이지 않는 망치 소리','text':between('을 선택한 뒤 이어지는 결말입니다.','D. 기질에 따른',i)}
# Extract every original table cell by its printed column, preserving source wording.
doc=pymupdf.open(doc_source)
rows=[[] for _ in range(8)]; markers=[(3,115.7),(3,515.5),(4,227.7),(4,627.5),(5,339.6),(6,134.4),(6,496.9),(7,265.0)]
for ri,(pg,y) in enumerate(markers):
 end=markers[ri+1] if ri<7 else (8,0)
 cols=[[] for _ in range(5)]
 for pi in range(pg,end[0]+1):
  if pi>=8:continue
  for w in sorted(doc[pi].get_text('words'),key=lambda w:(round(w[1],1),w[0])):
   if pi==pg and w[1]<y-1:continue
   if pi==end[0] and w[1]>=end[1]-1:continue
   if w[0]<195:continue
   col=min(4,max(0,int((w[0]-195)/62.3)))
   cols[col].append(w[4])
 rows[ri]=[' '.join(v).replace('**','').strip() for v in cols]
data['outcomes']={k:dict(zip(['event','relations','tool','legacy','cost'],rows[i])) for i,k in enumerate(['AAA','AAB','ABA','ABB','BAA','BAB','BBA','BBB'])}
for k in ['AB','BA']:
 ev=data['outcomes'][k+'A']['event']; parts=re.split(r'→\s*3A',ev)
 n[k]={'title':'공정과 책임을 나누다' if k=='AB' else '책임을 다시 거두다','text':parts[0].strip(),'table':True}
 c[k]=[{'title':'마지막 본판을 직접 완성한다','text':'창칼을 한 번 더 가파르게 벼려 마지막 대표 어미자(또는 표준 본판)를 직접 완성하고 칼을 거둔다.'},{'title':'칼을 다음 손에 넘긴다','text':'창칼의 가파른 날을 숫돌에 갈아 낮추어 제자·공방의 손에 넘긴다.'}]
for k,o in data['outcomes'].items():
 if k not in n:n[k]={'title':o['legacy'].split(']')[-1].strip(),'text':o['event'],'table':True}
data['reflection']={}
for k,a,b in [('AAA','1. 경로 1 (1A → 2A → 3A: 외날의 정점) 체험 결과','2. 경로 2 (1B → 2B → 3B:'),('BBB','2. 경로 2 (1B → 2B → 3B: 낮춘 칼날과 눈금판) 체험 결과','F. 고증 메모')]:
 txt=between(a,b);data['reflection'][k]={'text':between('이번 삶에서 한 선택의 회고','남긴 유산과 대가',s.index(a)), 'quote':re.search(r'공유 카드 한 문장"([^"]+)"',txt).group(1)}
data['characters']=[{'name':'이윤서','role':'21세 · 6년 차 수제자','text':between('이윤서 (21세, 6년 차 수제자·조역 각수):','박춘삼 (45세,')},{'name':'박춘삼','role':'45세 · 동료 평칼장','text':between('박춘삼 (45세, 동료 평칼장 겸 공방 살림꾼):','최도윤 (38세,')},{'name':'최도윤','role':'38세 · 교서관 서리','text':between('최도윤 (38세, 교서관 서리 겸 내각 활자 감관 보조):','상징적인 도구와')}]
data['notes']=between('F. 고증 메모와 냉정한 자기비평','2. 냉정한 자기비평')
data['openingQuote']='칼끝이 나무 속결에 걸려 딱, 하고 멈추었다.'
(base/'dist/story.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))

print('nodes',[(k,len(v['text'])) for k,v in n.items()]);print('choices',[(k,len(v)) for k,v in c.items()]);print('outcomes',json.dumps(data['outcomes'],ensure_ascii=False))
