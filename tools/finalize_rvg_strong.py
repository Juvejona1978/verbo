#!/usr/bin/env python3
from __future__ import annotations
import json, re, unicodedata
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
BIBLE=ROOT/'modules/bibles/rvg-2004-strong'
KJV=Path('/mnt/data/kjv-strong-map/books')
WORD=re.compile(r'[\wÁÉÍÓÚÜÑáéíóúüñ]+',re.UNICODE)

def load(p): return json.load(open(p,encoding='utf-8'))
def dump(p,d,pretty=False):
 p.parent.mkdir(parents=True,exist_ok=True)
 json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2 if pretty else None,separators=None if pretty else (',',':'))
def canon(s):
 m=re.fullmatch(r'([GH])0*(\d+)',s or '',re.I)
 return f'{m.group(1).upper()}{int(m.group(2))}' if m else s
def norm(s):
 s=''.join(c for c in unicodedata.normalize('NFD',s.casefold()) if unicodedata.category(c)!='Mn')
 return ''.join(WORD.findall(s))
def codes(seg):
 out=[]
 if seg.get('strong'): out.append(canon(seg['strong']))
 out += [canon(x) for x in seg.get('strongs',[]) if x]
 return list(dict.fromkeys(out))
def eligible(seg): return bool(norm(seg.get('text','')))

def nearest_token(segments, pos, used):
 candidates=[i for i,s in enumerate(segments) if eligible(s)]
 if not candidates:return 0
 # Prefer an unused content token, then allow sharing.
 fresh=[i for i in candidates if i not in used]
 pool=fresh or candidates
 return min(pool,key=lambda i:(abs(i-pos),i))

def interpolate(group_i, anchors, n_groups, n_tokens):
 left=[a for a in anchors if a[0]<group_i]
 right=[a for a in anchors if a[0]>group_i]
 if left and right:
  gl,tl=max(left); gr,tr=min(right)
  return tl+(group_i-gl)*(tr-tl)/(gr-gl)
 if left:
  gl,tl=max(left); return tl+(group_i-gl)*max(1,(n_tokens-1-tl)/max(1,n_groups-1-gl))
 if right:
  gr,tr=min(right); return max(0,tr-(gr-group_i)*max(1,tr/max(1,gr)))
 return group_i*(n_tokens-1)/max(1,n_groups-1)

def finalize_verse(verse, groups):
 segs=verse.get('segments') or [{'text':x} for x in verse.get('text','').split()]
 # Remove legacy tags; reapply only canonical KJV codes.
 legacy=[codes(s) for s in segs]
 for s in segs:
  s.pop('strong',None); s.pop('strongs',None)
 # Canonical groups with normalized codes.
 gs=[]
 for g in groups:
  cc=[canon(x) for x in g.get('strongs',[]) if x]
  if cc: gs.append({'text':g.get('text',''),'codes':cc,'morph':g.get('morph',[])})
 # Build sequential anchors from prior Spanish alignment.
 anchors=[]; last_t=-1
 for gi,g in enumerate(gs):
  best=None
  for ti in range(last_t+1,len(segs)):
   if any(c in legacy[ti] for c in g['codes']): best=ti; break
  if best is None:
   for ti in range(len(segs)):
    if any(c in legacy[ti] for c in g['codes']): best=ti; break
  if best is not None:
   anchors.append((gi,best)); last_t=best
 used=set(); assigned=[]
 for gi,g in enumerate(gs):
  anchored=[t for q,t in anchors if q==gi]
  if anchored: ti=anchored[0]
  else:
   pos=interpolate(gi,anchors,len(gs),len(segs))
   ti=nearest_token(segs,pos,used)
  used.add(ti)
  existing=segs[ti].setdefault('strongs',[])
  for c in g['codes']:
   if c not in existing: existing.append(c)
  if g.get('morph'):
   segs[ti].setdefault('morphs',[])
   for m in g['morph']:
    if m not in segs[ti]['morphs']: segs[ti]['morphs'].append(m)
  assigned.extend(g['codes'])
 # compact single values for compatibility; preserve arrays for multiple.
 for s in segs:
  if len(s.get('strongs',[]))==1:
   s['strong']=s['strongs'][0]; s.pop('strongs',None)
  if len(s.get('morphs',[]))==1:
   s['morph']=s['morphs'][0]; s.pop('morphs',None)
 verse['segments']=segs
 verse['strongs']=sorted(set(assigned),key=lambda x:(x[0],int(x[1:])))
 return len(gs),len(assigned),len(anchors)

def main():
 manifest=load(BIBLE/'manifest.json')
 book_files=manifest['books']
 kjv_files=sorted(KJV.glob('*.json'))
 kjv_by_num={int(p.name.split('-')[0]):p for p in kjv_files}
 src_manifest=load(ROOT/'modules/bibles/rv1960-strong/manifest.json')
 totals=Counter(); books={}
 for idx,bm in enumerate(book_files,1):
  bp=BIBLE/bm['file']; bd=load(bp)
  if idx in kjv_by_num:
   kd=load(kjv_by_num[idx])
   kchap={str(c['chapter']):{str(v['verse']):v.get('groups',[]) for v in c['verses']} for c in kd['chapters']}
  else:
   src=load(ROOT/'modules/bibles/rv1960-strong'/bm['file'])
   kchap={}
   for ch,verses in src.get('chapters',{}).items():
    kchap[str(ch)]={}
    for vn,v in verses.items():
     gs=[]
     for seg in v.get('segments',[]):
      cc=codes(seg)
      if cc: gs.append({'text':seg.get('text',''),'strongs':cc,'morph':[seg.get('morph')] if seg.get('morph') else []})
     kchap[str(ch)][str(vn)]=gs
  st=Counter()
  for ch,verses in bd['chapters'].items():
   for vn,verse in verses.items():
    g=kchap.get(str(ch),{}).get(str(vn),[])
    ng,nc,na=finalize_verse(verse,g)
    st['verses']+=1; st['groups']+=ng; st['codeOccurrences']+=nc; st['anchoredGroups']+=na
    if ng: st['versesWithStrong']+=1
  dump(bp,bd)
  books[bm['id']]=dict(st); totals.update(st)
 manifest.update({
  'name':'Reina-Valera Gómez 2004 + Strong Verbo',
  'abbreviation':'RVG+ Verbo',
  'hasStrongs':True,
  'status':'release',
  'publisher':'Verbo',
  'strongIntegration':'Verbo',
  'alignmentSource':'KJV Strong de CrossWire, con anclas españolas RV1960/RVG',
  'alignmentMethod':'Alineación canónica por versículo, secuencial y multietiqueta',
  'description':'RVG 2004 integrada por Verbo con códigos Strong hebreos y griegos. El texto bíblico se conserva intacto.'
 })
 dump(BIBLE/'manifest.json',manifest,True)
 report={'project':'RVG 2004 + Strong Verbo','status':'release','totals':dict(totals),'books':books,
 'verification':{'all66Books':len(books)==66,'allVersesProcessed':totals['verses']==31102,'canonicalStrongGroupsMapped':True},
 'note':'La integración es computacional y completa por grupos Strong de la fuente canónica; no equivale a revisión filológica manual de cada enlace.'}
 dump(BIBLE/'alignment-report-final.json',report,True)
 (BIBLE/'README.md').write_text('# Reina-Valera Gómez 2004 + Strong Verbo\n\nIntegración completa por versículo desarrollada para Verbo. Conserva literalmente el texto RVG y añade una capa separada de códigos Strong hebreos y griegos.\n\nLa alineación usa la KJV Strong de CrossWire como inventario canónico por versículo y anclas españolas para ubicar los códigos.\n',encoding='utf-8')
 print(json.dumps(report['totals'],indent=2,ensure_ascii=False))
if __name__=='__main__':main()
