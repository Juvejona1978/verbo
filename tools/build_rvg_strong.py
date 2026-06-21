#!/usr/bin/env python3
"""Construye RVG 2004 + Strong transfiriendo etiquetas desde RV1960+.

La transferencia es conservadora: solo etiqueta coincidencias textuales seguras entre
ambas traducciones españolas. Los casos no alineados permanecen sin etiqueta y se
registran en un informe para revisión posterior o alineación mediante KJV/idiomas originales.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

WORD_RE = re.compile(r"[^\s]+", re.UNICODE)
PUNCT_RE = re.compile(r"^[^\wáéíóúüñÁÉÍÓÚÜÑ]+|[^\wáéíóúüñÁÉÍÓÚÜÑ]+$", re.UNICODE)


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def dump_json(path: Path, data: Any, *, pretty: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2 if pretty else None, separators=None if pretty else (",", ":"))


def normalize(token: str) -> str:
    token = PUNCT_RE.sub("", token).casefold()
    token = "".join(c for c in unicodedata.normalize("NFD", token) if unicodedata.category(c) != "Mn")
    return token


def target_segments(text: str) -> list[dict[str, str]]:
    return [{"text": token} for token in WORD_RE.findall(text)]


def source_segments(verse: Any) -> list[dict[str, str]]:
    if isinstance(verse, dict) and verse.get("segments"):
        return [dict(seg) for seg in verse["segments"] if seg.get("text") != "•"]
    text = verse.get("text", "") if isinstance(verse, dict) else str(verse or "")
    return target_segments(text)


def similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    return SequenceMatcher(None, a, b, autojunk=False).ratio()


def align_verse(target_text: str, source_verse: Any) -> tuple[list[dict[str, str]], dict[str, Any]]:
    target = target_segments(target_text)
    source = source_segments(source_verse)
    tnorm = [normalize(x["text"]) for x in target]
    snorm = [normalize(x["text"]) for x in source]
    matcher = SequenceMatcher(None, snorm, tnorm, autojunk=False)

    assignments: dict[int, int] = {}
    method: dict[int, str] = {}

    # 1) Bloques exactamente iguales: máxima confianza.
    for block in matcher.get_matching_blocks():
        for offset in range(block.size):
            si, ti = block.a + offset, block.b + offset
            if snorm[si]:
                assignments[ti] = si
                method[ti] = "exact"

    # 2) Dentro de reemplazos, emparejar términos iguales únicos y en orden.
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        remaining_s = [i for i in range(i1, i2) if i not in assignments.values() and snorm[i]]
        remaining_t = [j for j in range(j1, j2) if j not in assignments and tnorm[j]]
        for tj in list(remaining_t):
            hits = [si for si in remaining_s if snorm[si] == tnorm[tj]]
            if len(hits) == 1:
                si = hits[0]
                assignments[tj] = si
                method[tj] = "exact-local"
                remaining_s.remove(si)

        # 3) Fuzzy muy conservador para variaciones morfológicas/ortográficas leves.
        candidates: list[tuple[float, int, int]] = []
        for tj in remaining_t:
            if tj in assignments:
                continue
            for si in remaining_s:
                score = similarity(snorm[si], tnorm[tj])
                if score >= 0.88 and min(len(snorm[si]), len(tnorm[tj])) >= 4:
                    candidates.append((score, si, tj))
        used_s: set[int] = set()
        used_t: set[int] = set()
        for score, si, tj in sorted(candidates, reverse=True):
            if si in used_s or tj in used_t or tj in assignments:
                continue
            assignments[tj] = si
            method[tj] = "fuzzy"
            used_s.add(si)
            used_t.add(tj)

    strong_source_total = 0
    strong_assigned = 0
    fuzzy_assigned = 0
    for si, seg in enumerate(source):
        if seg.get("strong"):
            strong_source_total += 1
    for ti, si in assignments.items():
        src = source[si]
        if src.get("strong"):
            target[ti]["strong"] = src["strong"]
            if src.get("morph"):
                target[ti]["morph"] = src["morph"]
            strong_assigned += 1
            if method.get(ti) == "fuzzy":
                fuzzy_assigned += 1

    unresolved = []
    assigned_source = set(assignments.values())
    for si, seg in enumerate(source):
        if seg.get("strong") and si not in assigned_source:
            unresolved.append({"source": seg.get("text", ""), "strong": seg.get("strong"), "morph": seg.get("morph")})

    stats = {
        "sourceStrong": strong_source_total,
        "assignedStrong": strong_assigned,
        "fuzzyAssigned": fuzzy_assigned,
        "unresolved": unresolved,
    }
    return target, stats


def build(root: Path, out_id: str = "rvg-2004-strong") -> dict[str, Any]:
    rvg_dir = root / "modules/bibles/rvg-2004"
    src_dir = root / "modules/bibles/rv1960-strong"
    out_dir = root / f"modules/bibles/{out_id}"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    (out_dir / "books").mkdir(parents=True)

    rvg_manifest = load_json(rvg_dir / "manifest.json")
    source_manifest = load_json(src_dir / "manifest.json")

    report: dict[str, Any] = {
        "project": "RVG 2004 + Strong para Verbo",
        "method": "Transferencia conservadora RV1960+ → RVG 2004 por versículo",
        "books": {},
        "totals": {"verses": 0, "sourceStrong": 0, "assignedStrong": 0, "fuzzyAssigned": 0, "versesWithUnresolved": 0},
        "limitations": [
            "Una etiqueta no transferida queda sin publicar; nunca se inventa.",
            "Los casos restantes deben revisarse con KJV Strong y, preferiblemente, textos hebreo/griego etiquetados.",
            "La morfología transferida procede del módulo RV1960+ existente y debe auditarse antes de considerarse definitiva."
        ]
    }

    for book in rvg_manifest["books"]:
        book_id = book["id"]
        rvg_book = load_json(rvg_dir / book["file"])
        source_book = load_json(src_dir / book["file"])
        output = {"schemaVersion": 2, "book": book_id, "chapters": {}}
        book_stats = {"verses": 0, "sourceStrong": 0, "assignedStrong": 0, "fuzzyAssigned": 0, "versesWithUnresolved": 0, "review": []}

        for chapter, verses in rvg_book.get("chapters", {}).items():
            output["chapters"][chapter] = {}
            src_chapter = source_book.get("chapters", {}).get(chapter, {})
            for verse_no, rvg_verse in verses.items():
                text = rvg_verse.get("text", "") if isinstance(rvg_verse, dict) else str(rvg_verse)
                src_verse = src_chapter.get(verse_no, {})
                segments, stats = align_verse(text, src_verse)
                output["chapters"][chapter][verse_no] = {
                    "text": text,
                    "segments": segments,
                    "strongs": sorted({seg["strong"] for seg in segments if seg.get("strong")}),
                }
                book_stats["verses"] += 1
                for key in ("sourceStrong", "assignedStrong", "fuzzyAssigned"):
                    book_stats[key] += stats[key]
                if stats["unresolved"]:
                    book_stats["versesWithUnresolved"] += 1
                    if len(book_stats["review"]) < 200:
                        book_stats["review"].append({"reference": f"{book_id}.{chapter}.{verse_no}", "text": text, "unresolved": stats["unresolved"]})

        dump_json(out_dir / book["file"], output)
        report["books"][book_id] = book_stats
        for key in report["totals"]:
            report["totals"][key] += book_stats[key]

    totals = report["totals"]
    totals["coveragePercent"] = round(100 * totals["assignedStrong"] / totals["sourceStrong"], 2) if totals["sourceStrong"] else 0
    totals["exactOrLocalAssigned"] = totals["assignedStrong"] - totals["fuzzyAssigned"]

    manifest = dict(rvg_manifest)
    manifest.update({
        "id": out_id,
        "name": "Reina-Valera Gómez 2004 con Strong (beta)",
        "abbreviation": "RVG+ β",
        "hasStrongs": True,
        "status": "beta",
        "alignmentSource": source_manifest.get("name", "RV1960 con Strong"),
        "alignmentMethod": "Conservadora por coincidencia textual española; sin inferencias forzadas",
        "description": "Primera alineación Strong de Verbo. Las palabras no verificadas permanecen sin etiqueta.",
    })
    dump_json(out_dir / "manifest.json", manifest, pretty=True)
    dump_json(out_dir / "alignment-report.json", report, pretty=True)
    (out_dir / "README.md").write_text(
        "# RVG 2004 + Strong (beta)\n\n"
        "Generada por `tools/build_rvg_strong.py`. La RVG se conserva literalmente; las etiquetas se almacenan en `segments`.\n\n"
        f"Cobertura inicial: **{totals['coveragePercent']}%** de las etiquetas Strong presentes en la RV1960+ de referencia.\n\n"
        "Los casos no seguros no se etiquetan y aparecen en `alignment-report.json`.\n",
        encoding="utf-8",
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--out-id", default="rvg-2004-strong")
    args = parser.parse_args()
    report = build(args.root, args.out_id)
    print(json.dumps(report["totals"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
