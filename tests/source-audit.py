"""Independent comparison with the actual attached PDF, excluding editor headings."""
import re,json,hashlib
from pathlib import Path
import pymupdf
root=Path(__file__).resolve().parents[1]
raw=re.sub(r'\s+',' ', '\n'.join(p.get_text() for p in pymupdf.open(root/'dist/manuscript.pdf')))
book=json.loads((root/'dist/novel.json').read_text()); norm=lambda x:re.sub(r'\s+','',x)
bounds={
'':('[공통 도입] 시월 초닷새 밤, 뒤틀린 황양목','[첫 번째 갈림길:'),
'A':('(1A 선택 직후)','[두 번째 갈림길:'),
'B':('(1B 선택 직후)','[두 번째 갈림길:'),
'AA':('을 선택한 뒤 이어지는 이야기입니다.당신은 보따리를','[세 번째 갈림길:'),
'BB':('을 선택한 뒤 이어지는 이야기입니다.당신은 고개를','[세 번째 갈림길:'),
'AAA':('을 선택한 뒤 이어지는 결말입니다.','[경로 2 시연:'),
'BBB':('을 선택한 뒤 이어지는 결말입니다.','D. 기질에 따른')}
for k,(a,b) in bounds.items():
 pos=raw.index('3막과 결말: 숫돌') if k=='BBB' else 0
 x=raw.index(a,pos)+len(a);y=raw.index(b,x);expected=raw[x:y].strip()
 if k=='AA':expected='당신은 보따리를 '+expected
 if k=='BB':expected='당신은 고개를 '+expected
 assert norm(expected)==norm(book['nodes'][k]['sourceText']),k
 restored=''.join(v['source']['text'] for v in book['nodes'][k]['beats'])
 assert norm(restored.replace('"',''))==norm(expected.replace('"','')),k
 print(f'PASS PDF → complete playable source: {k or "root"}, {len(expected)} characters')
assert book['sourcePdfSha256']==hashlib.sha256((root/'dist/manuscript.pdf').read_bytes()).hexdigest()
print('PASS exact source PDF fingerprint and seven complete manuscript sections')
