"""Add only formerly table-based nodes; keep original seven prose nodes intact.
Edited scene source lines are linked to uploaded image-PDF page ranges.
"""
import json,copy,pathlib,hashlib,shutil
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'dist/novel.json';book=json.loads(p.read_text());story=json.loads((root/'dist/story.json').read_text())
sections={};current=None
for line in (root/'content/expanded-scenes.txt').read_text().splitlines():
 if line.startswith('# '):
  path,title,ref=[x.strip() for x in line[2:].split('|')];current={'title':title,'ref':ref,'lines':[]};sections[path]=current
 elif line.strip():current['lines'].append(line)
for path in sorted(sections,key=lambda x:(len(x),x)):
 sec=sections[path];st=copy.deepcopy(book['nodes'][path[:-1]]['beats'][-1]['stage']);st['work']=False;st['camera']='wide';st['action']='idle';beats=[];display=[]
 for line in sec['lines']:
  who,text=line.split('|',1)
  if who=='@':
   st['time'],st['light'],st['place']=text.split('|');st['cast']['choi']=not st['time'].startswith('179');st['work']=False
   if path=='AAB':st['cast'].update(yun=False,chun=False,choi=False,junior1=False,junior2=False)
   if path=='BAB' and st['time'].startswith('1796'):st['cast']['chun']=False
   if path=='BBA' and st['time'].startswith('1796'):st['cast'].update(junior1=True,junior2=True)
   continue
  if who in ['+','-']:st['cast'][text]=who=='+';continue
  effect='time' if beats and beats[-1]['stage']['time']!=st['time'] else ''
  st['action']='handoff' if any(w in text for w in ['쥐여주','칼을 받','칼을 넘','두 손으로','손자국']) else 'carve' if any(w in text for w in ['파냈','파내','깎았','새겼','도려','숫돌']) else 'injury' if any(w in text for w in ['부은 손','경련','손목의 통증']) else 'idle'
  st['work']=st['action']=='carve'
  if '윤서' in text and any(w in text for w in ['두려움','겁에','떨렸']):st['moods']['yun']='afraid'
  if '윤서' in text and any(w in text for w in ['눈물','아쉬움','체념','고개가 꺾']):st['moods']['yun']='sad'
  if '윤서' in text and any(w in text for w in ['웃','완성','스스로']):st['moods']['yun']='neutral'
  if '침묵' in text:effect='silence'
  if '경련' in text:effect='shock';st['camera']='close'
  if '날이 완만' in text:st['camera']='wide'
  if path=='BA' and '최 서리가' in text:st['cast']['choi']=True
  if path=='AB' and '진척을' in text:st['cast']['choi']=True
  if path=='AAB' and '신참 각수 둘' in text:st['cast'].update(junior1=True,junior2=True)
  if path=='AAB' and '그때 납품할' in text:st['cast'].update(junior1=False,junior2=False)
  # Physical departure is explicit; a letter is narration, not a reappearing actor.
  speaker='narrator' if who=='n' or (path=='BAA' and who=='yun') else who
  assert len(text)<=250,(path,len(text))
  beats.append({'id':f'{path}-expanded-{len(beats)}','kind':'narration' if speaker=='narrator' else 'dialogue','speaker':speaker,'text':text,'source':{'section':'補完原稿','text':text,'pdfPages':sec['ref'],'editorial':'중복을 정리한 대사·서술 편집. 원본 사건과 순서 보존.'},'stage':copy.deepcopy(st),'effect':effect,'pause':500 if effect=='silence' else 0});display.append(text)
 book['nodes'][path]={'title':sec['title'],'basis':'expanded','beats':beats,'sourceText':'\n\n'.join(display),'sourcePages':sec['ref']}
book['version']=4
p.write_text(json.dumps(book,ensure_ascii=False,indent=2))
print('Expanded:',{k:len(book['nodes'][k]['beats']) for k in sections})
