#!/usr/bin/env python3
"""Convierte el Strong hebreo público al módulo de diccionario de Verbo."""
from __future__ import annotations
import argparse, html, json
from pathlib import Path


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    ap.add_argument('--source',type=Path,required=True)
    args=ap.parse_args()
    data=json.load(args.source.open(encoding='utf-8'))
    out=args.root/'modules/dictionaries/strong-verbo'
    out.mkdir(parents=True,exist_ok=True)
    entries={}; index={}
    for e in data['entries']:
        code=f"H{int(e['number'])}"
        term=e.get('transliteration') or code
        pron=e.get('pronunciation') or ''
        definition=e.get('definition_en') or ''
        refs=' '.join(f"<a class='strong' href='#sH{int(r[1:])}'>H{int(r[1:])}</a>" for r in e.get('references',[]) if r.startswith('H'))
        body=(f"<p><strong>{html.escape(term)}</strong>"
              +(f" <small>({html.escape(pron)})</small>" if pron else '')+"</p>"
              +f"<p>{html.escape(definition)}</p>"
              +(f"<p><strong>Referencias:</strong> {refs}</p>" if refs else '')
              +"<p><small>James Strong, 1890 · Dominio público. Definición original en inglés.</small></p>")
        entries[code]={'term':term,'html':body,'language':'en','source':'Strong 1890'}
        index[code]=term
    manifest={
      'schemaVersion':2,'id':'strong-verbo','type':'dictionary','name':'Strong Hebreo de Verbo',
      'abbreviation':'Strong Hebreo','language':'en','strong':True,
      'description':'Diccionario hebreo original de James Strong (1890), dominio público. Primera etapa legal de Verbo.',
      'license':'Public Domain','source':'James Strong, 1890','entryFiles':{'H':'entries-H.json'},'indexFile':'index.json'
    }
    for name,obj in [('manifest.json',manifest),('entries-H.json',{'entries':entries}),('index.json',{'entries':index})]:
        json.dump(obj,(out/name).open('w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print(json.dumps({'entries':len(entries),'output':str(out)},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
