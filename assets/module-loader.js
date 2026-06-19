/* Cargador de módulos JSON de Verbo — esquema v2 */
const VerboModules = (() => {
  const cache = new Map();
  async function getJSON(url) {
    if (cache.has(url)) return cache.get(url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo cargar ${url} (${response.status})`);
    const json = await response.json(); cache.set(url, json); return json;
  }
  function resolveFromManifest(manifestPath, relativePath) {
    return manifestPath.slice(0, manifestPath.lastIndexOf('/') + 1) + relativePath;
  }
  async function getCatalog() {
    const registry = await getJSON('modules/registry.json');
    const bibles = await Promise.all(registry.bibles.map(async path => ({ path:`modules/${path}`, manifest:await getJSON(`modules/${path}`) })));
    const primary = bibles.find(x => x.manifest.id === registry.defaultBible) || bibles[0];
    const commentaries = await Promise.all((registry.commentaries || []).map(async path => ({ path:`modules/${path}`, manifest:await getJSON(`modules/${path}`) })));
    return { registry, bibles, commentaries, primary, books: primary.manifest.books };
  }
  async function getBookInfo(bookId) {
    const catalog = await getCatalog();
    const info = catalog.primary.manifest.books.find(b => b.id === bookId);
    if (!info) throw new Error(`Libro no encontrado: ${bookId}`);
    const data = await getJSON(resolveFromManifest(catalog.primary.path, info.file));
    return { info, chapterCount:Object.keys(data.chapters).length };
  }
  async function loadBible(manifestPath, bookId, chapter) {
    const manifest = await getJSON(manifestPath);
    const bookInfo = manifest.books.find(book => book.id === bookId);
    if (!bookInfo) return null;
    const bookData = await getJSON(resolveFromManifest(manifestPath, bookInfo.file));
    const verses = bookData.chapters[String(chapter)];
    return verses ? { manifest, bookInfo, verses } : null;
  }
  async function loadCommentary(manifestPath, bookId, chapter) {
    const manifest = await getJSON(manifestPath);
    const bookInfo = manifest.books.find(book => book.id === bookId);
    if (!bookInfo) return { manifest, entries:[] };
    const bookData = await getJSON(resolveFromManifest(manifestPath, bookInfo.file));
    return { manifest, entries:(bookData.entries || []).filter(entry => {
      const start=entry.reference.chapterStart, end=entry.reference.chapterEnd ?? start;
      return chapter >= start && chapter <= end;
    }) };
  }
  async function getDictionaryEntry(code) {
    const registry = await getJSON('modules/registry.json');
    const normalized = String(code || '').toUpperCase();
    const prefix = /^[GH]/.test(normalized) ? normalized[0] : 'OTHER';
    for (const path of registry.dictionaries) {
      const manifestPath=`modules/${path}`, manifest=await getJSON(manifestPath);
      if (manifest.entryFiles) {
        const file=manifest.entryFiles[prefix] || manifest.entryFiles.OTHER;
        if (!file) continue;
        const data=await getJSON(resolveFromManifest(manifestPath,file));
        if (data.entries?.[normalized]) return { manifest, code:normalized, entry:data.entries[normalized] };
      } else if (manifest.entriesFile) {
        const data=await getJSON(resolveFromManifest(manifestPath,manifest.entriesFile));
        if (data.entries?.[normalized]) return { manifest, code:normalized, entry:data.entries[normalized] };
      }
    }
    return null;
  }
  async function searchBible(manifestPath, query, { testament='all', onProgress=null }={}) {
    const manifest = await getJSON(manifestPath);
    const needle = String(query || '').trim().toLocaleLowerCase('es');
    if (needle.length < 2) return [];

    const matthewIndex = manifest.books.findIndex(book => book.id === 'MAT');
    const books = manifest.books.filter((book, index) => {
      if (testament === 'ot') return matthewIndex < 0 ? index < 39 : index < matthewIndex;
      if (testament === 'nt') return matthewIndex < 0 ? index >= 39 : index >= matthewIndex;
      return true;
    });

    const results = [];
    for (let i=0; i<books.length; i++) {
      const bookInfo = books[i];
      const bookData = await getJSON(resolveFromManifest(manifestPath, bookInfo.file));
      const chapters = Object.entries(bookData.chapters || {}).sort((a,b) => Number(a[0]) - Number(b[0]));
      for (const [chapter, verses] of chapters) {
        const orderedVerses = Object.entries(verses || {}).sort((a,b) => Number(a[0]) - Number(b[0]));
        for (const [verse, raw] of orderedVerses) {
          const text = typeof raw === 'string' ? raw : (raw.text || '');
          const plain = String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (plain.toLocaleLowerCase('es').includes(needle)) {
            results.push({ bookId:bookInfo.id, book:bookInfo.name, chapter:Number(chapter), verse:Number(verse), text:plain });
          }
        }
      }
      if (onProgress) onProgress({ current:i+1, total:books.length, book:bookInfo.name });
    }
    return results;
  }
  async function buildChapterData({ bookId='ROM', chapter=7, commentaryId=null }={}) {
    const registry = await getJSON('modules/registry.json');
    const bibleResults=(await Promise.all(registry.bibles.map(path=>loadBible(`modules/${path}`,bookId,chapter)))).filter(Boolean);
    if (!bibleResults.length) throw new Error(`No hay Biblias disponibles para ${bookId} ${chapter}`);
    const commentaryPaths=(registry.commentaries || []);
    const selectedPaths=commentaryId
      ? commentaryPaths.filter(path => path.includes(`/` + commentaryId + `/`) || path.endsWith(`/` + commentaryId + `/manifest.json`))
      : commentaryPaths.slice(0,1);
    const commentaryResults=await Promise.all(selectedPaths.map(path=>loadCommentary(`modules/${path}`,bookId,chapter)));
    const versions={};
    bibleResults.forEach(({manifest:m})=>versions[m.id]={label:m.abbreviation,full:m.name,year:m.year,hasStrongs:Boolean(m.hasStrongs)});
    const allVerseNumbers=[...new Set(bibleResults.flatMap(b=>Object.keys(b.verses).map(Number)))].sort((a,b)=>a-b);
    const notes={}, notesByVerse=new Map();
    commentaryResults.forEach(c=>c.entries.forEach(entry=>{
      const ref=entry.reference, start=ref.verseStart, end=ref.verseEnd ?? start;
      if(!Number.isInteger(start)) return;
      const id=entry.id||`${c.manifest.id}-${bookId}-${chapter}-${start}`;
      notes[id]={title:entry.title||`${c.manifest.name}: ${start}`,author:entry.author||c.manifest.name,body:entry.content||''};
      for(let v=start;v<=end;v++){ if(!notesByVerse.has(v)) notesByVerse.set(v,[]); notesByVerse.get(v).push(id); }
    }));
    const verses=allVerseNumbers.map(n=>{
      const text={}, segments={};
      bibleResults.forEach(b=>{ const v=b.verses[String(n)]; if(!v)return; text[b.manifest.id]=typeof v==='string'?v:v.text; if(v.segments) segments[b.manifest.id]=v.segments; });
      const noteIds=notesByVerse.get(n)||[];
      return {n,text,segments,hasNote:noteIds.length>0,noteIds};
    });
    const first=bibleResults.find(b=>b.manifest.id===registry.defaultBible)||bibleResults[0];
    return {meta:{book:first.bookInfo.name,bookId,chapter,version:first.manifest.id,versionFull:first.manifest.name},versions,verses,notes};
  }
  return { getCatalog,getBookInfo,buildChapterData,loadBible,loadCommentary,getDictionaryEntry,searchBible };
})();
