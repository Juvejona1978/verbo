#!/usr/bin/env python3
"""Convierte módulos bíblicos MySword (.bbl.mybible / SQLite) al esquema JSON v1 de Verbo."""
from __future__ import annotations
import argparse, html, json, re, sqlite3
from pathlib import Path

BOOKS = [
('GEN','Génesis'),('EXO','Éxodo'),('LEV','Levítico'),('NUM','Números'),('DEU','Deuteronomio'),
('JOS','Josué'),('JDG','Jueces'),('RUT','Rut'),('1SA','1 Samuel'),('2SA','2 Samuel'),
('1KI','1 Reyes'),('2KI','2 Reyes'),('1CH','1 Crónicas'),('2CH','2 Crónicas'),('EZR','Esdras'),
('NEH','Nehemías'),('EST','Ester'),('JOB','Job'),('PSA','Salmos'),('PRO','Proverbios'),
('ECC','Eclesiastés'),('SNG','Cantares'),('ISA','Isaías'),('JER','Jeremías'),('LAM','Lamentaciones'),
('EZK','Ezequiel'),('DAN','Daniel'),('HOS','Oseas'),('JOL','Joel'),('AMO','Amós'),('OBA','Abdías'),
('JON','Jonás'),('MIC','Miqueas'),('NAM','Nahúm'),('HAB','Habacuc'),('ZEP','Sofonías'),
('HAG','Hageo'),('ZEC','Zacarías'),('MAL','Malaquías'),('MAT','Mateo'),('MRK','Marcos'),
('LUK','Lucas'),('JHN','Juan'),('ACT','Hechos'),('ROM','Romanos'),('1CO','1 Corintios'),
('2CO','2 Corintios'),('GAL','Gálatas'),('EPH','Efesios'),('PHP','Filipenses'),('COL','Colosenses'),
('1TH','1 Tesalonicenses'),('2TH','2 Tesalonicenses'),('1TI','1 Timoteo'),('2TI','2 Timoteo'),
('TIT','Tito'),('PHM','Filemón'),('HEB','Hebreos'),('JAS','Santiago'),('1PE','1 Pedro'),
('2PE','2 Pedro'),('1JN','1 Juan'),('2JN','2 Juan'),('3JN','3 Juan'),('JUD','Judas'),('REV','Apocalipsis')
]
TAG_RE = re.compile(r'<[^>]+>')
SPACE_RE = re.compile(r'[ \t\r\f\v]+')

def clean_scripture(value: str) -> str:
    value = value or ''
    value = value.replace('<CM>', ' ').replace('<cm>', ' ')
    value = re.sub(r'<br\s*/?>', ' ', value, flags=re.I)
    value = TAG_RE.sub('', value)
    value = html.unescape(value)
    value = SPACE_RE.sub(' ', value)
    value = re.sub(r'\s*\n\s*', ' ', value)
    return value.strip()

def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-') or 'bible-module'

def read_details(cur):
    row = cur.execute('SELECT * FROM Details LIMIT 1').fetchone()
    cols = [r[1] for r in cur.execute('PRAGMA table_info(Details)').fetchall()]
    return dict(zip(cols, row)) if row else {}

def convert(src: Path, output_root: Path, module_id: str | None, license_status: str, usage: str):
    con = sqlite3.connect(src)
    cur = con.cursor()
    tables = {r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if 'Bible' not in tables:
        raise ValueError('El archivo no contiene una tabla Bible compatible.')
    details = read_details(cur) if 'Details' in tables else {}
    name = details.get('Description') or src.stem
    abbreviation = details.get('Abbreviation') or name
    module_id = module_id or slugify(abbreviation)
    out = output_root / module_id
    books_dir = out / 'books'
    books_dir.mkdir(parents=True, exist_ok=True)

    rows = cur.execute('SELECT Book, Chapter, Verse, Scripture FROM Bible ORDER BY Book, Chapter, Verse')
    grouped: dict[int, dict[str, dict[str, dict]]] = {}
    verse_count = 0
    for book, chapter, verse, scripture in rows:
        if not 1 <= int(book) <= len(BOOKS):
            continue
        grouped.setdefault(int(book), {}).setdefault(str(chapter), {})[str(verse)] = {
            'text': clean_scripture(scripture), 'strongs': []
        }
        verse_count += 1
    con.close()

    manifest_books = []
    for number, chapters in grouped.items():
        code, book_name = BOOKS[number - 1]
        filename = f'books/{code}.json'
        payload = {
            'schemaVersion': 1, 'type': 'bible-book', 'moduleId': module_id,
            'book': {'id': code, 'name': book_name, 'number': number}, 'chapters': chapters
        }
        (out / filename).write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        manifest_books.append({'id': code, 'name': book_name, 'number': number, 'file': filename})

    manifest = {
        'schemaVersion': 1, 'type': 'bible', 'id': module_id, 'name': name,
        'abbreviation': abbreviation, 'language': 'es',
        'sourceFormat': 'MySword SQLite', 'sourceFile': src.name,
        'license': license_status, 'usage': usage,
        'licenseNote': details.get('Comments') or '',
        'moduleVersion': details.get('Version') or '', 'versionDate': details.get('VersionDate'),
        'rightToLeft': bool(details.get('RightToLeft', 0)), 'hasStrong': bool(details.get('Strong', 0)),
        'verseCount': verse_count, 'bookCount': len(manifest_books), 'books': manifest_books
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifest

def main():
    p = argparse.ArgumentParser()
    p.add_argument('source', type=Path)
    p.add_argument('--output', type=Path, default=Path('modules/bibles'))
    p.add_argument('--id')
    p.add_argument('--license', default='license-review-required')
    p.add_argument('--usage', default='testing-only')
    args = p.parse_args()
    manifest = convert(args.source, args.output, args.id, args.license, args.usage)
    print(json.dumps({'id':manifest['id'],'books':manifest['bookCount'],'verses':manifest['verseCount']}, ensure_ascii=False))

if __name__ == '__main__': main()
