document.addEventListener('DOMContentLoaded', async () => {
  const els = {
    body: document.body,
    book: document.getElementById('bookSelect'),
    chapter: document.getElementById('chapterSelect'),
    prev: document.getElementById('prevChapter'),
    next: document.getElementById('nextChapter'),
    version: document.getElementById('mainVersionSelect'),
    list: document.getElementById('verseList'),
    eyebrow: document.querySelector('.chapter-eyebrow'),
    title: document.querySelector('.chapter-title'),
    side: document.getElementById('sidePanel'),
    panelTitle: document.getElementById('panelTitle'),
    panelToolbar: document.getElementById('panelToolbar'),
    panelBody: document.getElementById('panelBody'),
    close: document.getElementById('panelClose'),
    search: document.getElementById('searchTrigger'),
    tabs: [...document.querySelectorAll('.tab-rail__btn')]
  };

  let catalog, data, activeTab = null, currentVersion = null, compareVersion = null;
  let currentCommentary = localStorage.getItem('verbo:lastCommentary') || null;
  let currentBook = localStorage.getItem('verbo:lastBook') || 'ROM';
  let currentChapter = Number(localStorage.getItem('verbo:lastChapter')) || 7;
  const themes = [
    { id:'paper', label:'Papel cálido', sample:'#F6F0E4' },
    { id:'cream', label:'Crema claro', sample:'#FBF7EC' },
    { id:'sage', label:'Verde salvia', sample:'#F1F6EF' },
    { id:'mist', label:'Azul niebla', sample:'#F1F6F8' },
    { id:'pearl', label:'Gris perla', sample:'#F5F4F1' },
    { id:'sand', label:'Rosa arena', sample:'#F8F1EE' }
  ];

  const emptyState = (icon, text) => `<div class="panel-empty"><div class="panel-empty__icon">${icon}</div><div class="panel-empty__text">${text}</div></div>`;
  const activeVerse = () => Number(document.querySelector('.verse--active')?.dataset.verseN) || null;
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));
  const bibleCatalog = () => catalog.bibles.map(item => ({ id:item.manifest.id, label:item.manifest.abbreviation || item.manifest.name, full:item.manifest.name, path:item.path }));
  const commentaryCatalog = () => (catalog.commentaries || []).map(item => ({ id:item.manifest.id, label:item.manifest.abbreviation || item.manifest.name, full:item.manifest.name, path:item.path }));

  applyTheme(localStorage.getItem('verbo:theme') || 'paper');

  try {
    catalog = await VerboModules.getCatalog();
    populateBooks();
    if (!commentaryCatalog().some(c => c.id === currentCommentary)) currentCommentary = commentaryCatalog()[0]?.id || null;
    if (!catalog.books.some(b => b.id === currentBook)) currentBook = catalog.books[0].id;
    els.book.value = currentBook;
    await refreshChapters();
    await loadPassage();
  } catch (error) {
    console.error(error);
    showFatal(error);
    return;
  }

  function populateBooks() {
    els.book.innerHTML = catalog.books.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  }

  async function refreshChapters() {
    const info = await VerboModules.getBookInfo(currentBook);
    currentChapter = Math.max(1, Math.min(currentChapter, info.chapterCount));
    els.chapter.innerHTML = Array.from({length: info.chapterCount}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('');
    els.chapter.value = String(currentChapter);
    updateNavButtons();
  }

  async function loadPassage({preserveVersion=true}={}) {
    setLoading(true);
    try {
      const previous = preserveVersion ? currentVersion : null;
      data = await VerboModules.buildChapterData({bookId: currentBook, chapter: currentChapter, commentaryId: currentCommentary});
      currentVersion = previous && data.versions[previous] ? previous : data.meta.version;
      const availableCompare = bibleCatalog();
      const preferredCompare = availableCompare.find(v => v.id !== currentVersion)?.id || currentVersion;
      compareVersion = compareVersion && availableCompare.some(v => v.id === compareVersion)
        ? compareVersion : preferredCompare;
      populateVersions();
      renderChapter();
      localStorage.setItem('verbo:lastBook', currentBook);
      localStorage.setItem('verbo:lastChapter', String(currentChapter));
      if (activeTab) renderPanel(activeTab);
      window.scrollTo({top:0, behavior:'smooth'});
    } catch (error) {
      console.error(error);
      els.list.innerHTML = emptyState('⚠️', 'No se pudo cargar este pasaje.');
    } finally { setLoading(false); }
  }

  function populateVersions() {
    els.version.innerHTML = Object.entries(data.versions).map(([id,v]) => `<option value="${id}">${v.label}</option>`).join('');
    els.version.value = currentVersion;
  }

  function renderChapter(restoreVerse=null) {
    els.eyebrow.textContent = data.versions[currentVersion]?.full || data.meta.versionFull;
    els.title.textContent = `${data.meta.book} ${data.meta.chapter}`;
    els.list.innerHTML = '';
    data.verses.forEach(v => {
      const row = document.createElement('div'); row.className='verse'; row.dataset.verseN=v.n;
      if (v.n === restoreVerse) row.classList.add('verse--active');
      const num=document.createElement('span'); num.className='verse__num'; num.textContent=v.n;
      const text=document.createElement('span'); text.className='verse__text'+(v.hasNote?' verse__text--has-note':''); text.tabIndex=0;
      const verseSegments=v.segments?.[currentVersion];
      if(verseSegments?.length){
        verseSegments.forEach((seg,index)=>{
          const word=document.createElement('span'); word.className='word-segment'; word.textContent=(index?' ':'')+(seg.text||'');
          text.appendChild(word);
          if(seg.strong){ const tag=document.createElement('button'); tag.type='button'; tag.className='strongs-tag'; tag.textContent=seg.strong; tag.dataset.strongCode=seg.strong; tag.title=seg.morph?`Morfología: ${seg.morph}`:'Abrir diccionario'; text.appendChild(tag); }
        });
      } else text.textContent=v.text[currentVersion] || Object.values(v.text)[0] || '';
      const margin=document.createElement('span'); margin.className='marginalia';
      row.append(num,text,margin); els.list.appendChild(row);
      text.addEventListener('click',()=>selectVerse(row,v));
      text.querySelectorAll('.strongs-tag').forEach(tag=>tag.addEventListener('click',e=>{e.stopPropagation(); openDictionary(tag.dataset.strongCode);}));
    });
  }

  function selectVerse(row, verse) {
    document.querySelectorAll('.verse--active').forEach(x=>x.classList.remove('verse--active'));
    row.classList.add('verse--active');
    const firstNote=verse.noteIds?.[0]||null;
    // No abrir comentarios automáticamente al tocar un versículo.
    // En móvil el panel invade la lectura; el usuario lo abre manualmente desde el botón lateral.
    if (activeTab === 'comentario') renderPanel('comentario', firstNote);
    if (activeTab === 'comparar') renderCompare(verse.n);
  }

  function openPanel(tab, focus=null) {
    activeTab=tab; els.side.classList.add('side-panel--open');
    els.tabs.forEach(b=>b.classList.toggle('tab-rail__btn--active', b.dataset.tab===tab));
    renderPanel(tab,focus);
  }
  function closePanel(){ activeTab=null; els.side.classList.remove('side-panel--open'); els.tabs.forEach(b=>b.classList.remove('tab-rail__btn--active')); }

  function renderPanel(tab, focus=null) {
    els.panelToolbar.innerHTML='';
    if(tab==='comentario'){
      // Si el usuario seleccionó un versículo con el panel cerrado, al abrir Comentario
      // usamos ese versículo activo para ubicar el comentario correspondiente.
      if(!focus){
        const selectedVerseNumber = activeVerse();
        const selectedVerse = data?.verses?.find(v => v.n === selectedVerseNumber);
        focus = selectedVerse?.noteIds?.[0] || null;
      }
      els.panelTitle.textContent='Comentario';
      const installed=commentaryCatalog();
      if(installed.length){
        const options=installed.map(c=>`<option value="${c.id}" ${c.id===currentCommentary?'selected':''}>${escapeHTML(c.label)}</option>`).join('');
        els.panelToolbar.innerHTML=`<div class="compare-toolbar"><span class="compare-toolbar__label">Comentario</span><select class="compare-toolbar__select" id="commentarySelect">${options}</select></div>`;
        document.getElementById('commentarySelect')?.addEventListener('change', async e=>{
          currentCommentary=e.target.value;
          localStorage.setItem('verbo:lastCommentary', currentCommentary);
          await loadPassage();
          renderPanel('comentario', activeVerse());
        });
      }
      const entries=Object.entries(data.notes);
      els.panelBody.innerHTML=entries.length?entries.map(([id,n])=>`<div class="note-card" data-note-id="${id}"><div class="note-card__ref">${data.meta.book} ${data.meta.chapter}</div><div class="note-card__title">${n.title}</div><div class="note-card__author">${n.author}</div><div class="note-card__body">${n.body}</div></div>`).join(''):emptyState('📖','Este capítulo todavía no tiene comentarios cargados.');
      if(focus) els.panelBody.querySelector(`[data-note-id="${focus}"]`)?.scrollIntoView({block:'start'});
    }
    if(tab==='comparar'){ els.panelTitle.textContent='Comparar versiones'; renderCompare(focus||activeVerse()); }
    if(tab==='diccionario'){ els.panelTitle.textContent='Diccionario'; els.panelBody.innerHTML=emptyState('🔤','Pulsa un código Strong en una Biblia compatible para consultar su definición.'); }
    if(tab==='notas') renderNotes();
    if(tab==='tema') renderTheme();
    if(tab==='buscar') renderSearch();
  }

  async function renderCompare(focus) {
    const installed=bibleCatalog();
    if(!installed.length){ els.panelToolbar.innerHTML=''; els.panelBody.innerHTML=emptyState('📚','No hay otra Biblia instalada para comparar.'); return; }
    if(!installed.some(v=>v.id===compareVersion)) compareVersion=installed[0].id;
    const options=installed.map(v=>`<option value="${v.id}" ${v.id===compareVersion?'selected':''}>${escapeHTML(v.label)}${v.id===currentVersion?' (actual)':''}</option>`).join('');
    els.panelToolbar.innerHTML=`<div class="compare-toolbar"><span class="compare-toolbar__label">Biblia alterna</span><select class="compare-toolbar__select" id="compareVersionSelect">${options}</select></div>`;
    let verses=data.verses;
    if(!data.versions[compareVersion]){
      els.panelBody.innerHTML=emptyState('⌛','Cargando versión para comparar…');
      const selected=installed.find(v=>v.id===compareVersion);
      const loaded=selected ? await VerboModules.loadBible(selected.path,currentBook,currentChapter) : null;
      if(!loaded){ els.panelBody.innerHTML=emptyState('⚠️','Esta versión no contiene el pasaje seleccionado.'); return; }
      verses=data.verses.map(v=>({ ...v, text:{...v.text,[compareVersion]:(typeof loaded.verses[String(v.n)]==='string'?loaded.verses[String(v.n)]:loaded.verses[String(v.n)]?.text)||''} }));
    }
    els.panelBody.innerHTML=verses.map(v=>`<div class="compare-verse${v.n===focus?' compare-verse--active':''}" data-verse-n="${v.n}"><span class="compare-verse__num">${v.n}</span><span class="compare-verse__text">${escapeHTML(v.text[compareVersion]||'')}</span></div>`).join('');
    document.getElementById('compareVersionSelect')?.addEventListener('change',async e=>{compareVersion=e.target.value;await renderCompare(activeVerse());});
    if(focus) els.panelBody.querySelector(`[data-verse-n="${focus}"]`)?.scrollIntoView({block:'center'});
  }

  function renderSearch(){
    els.panelTitle.textContent='Buscar en la Biblia';
    const options=bibleCatalog().map(v=>`<option value="${v.id}" ${v.id===currentVersion?'selected':''}>${escapeHTML(v.label)}</option>`).join('');
    els.panelToolbar.innerHTML=`<form class="search-panel-form" id="searchForm">
      <input id="searchInput" class="search-panel-input" type="search" minlength="2" placeholder="Palabra o frase…" autocomplete="off">
      <select id="searchVersion" class="search-panel-select" aria-label="Versión bíblica">${options}</select>
      <select id="searchScope" class="search-panel-scope" aria-label="Ámbito de búsqueda">
        <option value="nt">NT</option>
        <option value="ot">AT</option>
        <option value="all">Biblia</option>
      </select>
      <button class="search-panel-button" type="submit">Buscar</button>
    </form>`;
    els.panelBody.innerHTML=emptyState('⌕','Escribe al menos dos caracteres. Los resultados aparecerán en orden bíblico, 100 por página.');
    const form=document.getElementById('searchForm'), input=document.getElementById('searchInput');
    setTimeout(()=>input?.focus(),0);

    form?.addEventListener('submit',async e=>{
      e.preventDefault();
      const query=input.value.trim();
      const versionId=document.getElementById('searchVersion').value;
      const testament=document.getElementById('searchScope').value;
      if(query.length<2){ els.panelBody.innerHTML=emptyState('⌕','Escribe al menos dos caracteres.'); return; }
      const selected=bibleCatalog().find(v=>v.id===versionId);
      els.panelBody.innerHTML=emptyState('⌛','Buscando…');
      try{
        const results=await VerboModules.searchBible(selected.path,query,{
          testament,
          onProgress:p=>{els.panelBody.innerHTML=emptyState('⌛',`Buscando en ${escapeHTML(p.book)} · ${p.current}/${p.total}`);}
        });
        if(!results.length){ els.panelBody.innerHTML=emptyState('🔎',`No se encontraron resultados para “${escapeHTML(query)}”.`); return; }

        const pageSize=100;
        let page=0;
        const totalPages=Math.ceil(results.length/pageSize);
        const scopeLabel={nt:'NT',ot:'AT',all:'Biblia'}[testament];

        const openResult=async r=>{
          currentBook=r.bookId; currentChapter=r.chapter; currentVersion=versionId;
          els.book.value=currentBook; await refreshChapters(); els.chapter.value=String(currentChapter); await loadPassage();
          const row=document.querySelector(`[data-verse-n="${r.verse}"]`);
          if(row){ row.classList.add('verse--active'); row.scrollIntoView({behavior:'smooth',block:'center'}); }
        };

        const renderResultsPage=()=>{
          const start=page*pageSize;
          const end=Math.min(start+pageSize,results.length);
          const visible=results.slice(start,end);
          els.panelBody.innerHTML=`
            <div class="search-summary">
              <strong>${results.length} resultados</strong>
              <span>${escapeHTML(scopeLabel)} · mostrando ${start+1}–${end}</span>
            </div>
            <div class="search-results-list">
              ${visible.map((r,i)=>`<button class="search-result" type="button" data-result="${start+i}"><span class="search-result__ref">${escapeHTML(r.book)} ${r.chapter}:${r.verse}</span><span class="search-result__text">${escapeHTML(r.text)}</span></button>`).join('')}
            </div>
            <nav class="search-pagination" aria-label="Páginas de resultados">
              <button class="search-page-button" id="searchPrevPage" type="button" ${page===0?'disabled':''}>‹ Anterior</button>
              <span class="search-page-status">Página ${page+1} de ${totalPages}</span>
              <button class="search-page-button" id="searchNextPage" type="button" ${page>=totalPages-1?'disabled':''}>Siguiente ›</button>
            </nav>`;
          els.panelBody.querySelectorAll('.search-result').forEach(btn=>btn.addEventListener('click',()=>openResult(results[Number(btn.dataset.result)])));
          document.getElementById('searchPrevPage')?.addEventListener('click',()=>{ if(page>0){page--;renderResultsPage();els.panelBody.scrollTop=0;} });
          document.getElementById('searchNextPage')?.addEventListener('click',()=>{ if(page<totalPages-1){page++;renderResultsPage();els.panelBody.scrollTop=0;} });
        };
        renderResultsPage();
      }catch(error){ console.error(error); els.panelBody.innerHTML=emptyState('⚠️','No se pudo completar la búsqueda.'); }
    });
  }

  function applyTheme(themeId){
    const safeTheme = themes.some(t => t.id === themeId) ? themeId : 'paper';
    document.body.dataset.theme = safeTheme;
    localStorage.setItem('verbo:theme', safeTheme);
  }

  function renderTheme(){
    els.panelTitle.textContent='Tema';
    els.panelToolbar.innerHTML='';
    const currentTheme = document.body.dataset.theme || 'paper';
    els.panelBody.innerHTML=`
      <section class="theme-panel">
        <div class="theme-panel__intro">Elige un tono claro para descansar mejor la vista. Se guardará solo en este dispositivo.</div>
        <div class="theme-options">
          ${themes.map(t=>`<button class="theme-option${t.id===currentTheme?' theme-option--active':''}" type="button" data-theme="${t.id}">
            <span class="theme-option__sample" style="background:${t.sample}"></span>
            <span class="theme-option__label">${escapeHTML(t.label)}</span>
          </button>`).join('')}
        </div>
      </section>`;
    els.panelBody.querySelectorAll('.theme-option').forEach(btn=>btn.addEventListener('click',()=>{
      applyTheme(btn.dataset.theme);
      renderTheme();
    }));
  }

  function renderNotes(){
    els.panelTitle.textContent='Mis notas';
    const key=`nota:${data.meta.bookId}-${data.meta.chapter}`, saved=localStorage.getItem(key)||'';
    els.panelBody.innerHTML=`<label class="personal-note-form__label">Nota sobre ${data.meta.book} ${data.meta.chapter}</label><textarea id="personalNoteArea" class="personal-note-form__area" placeholder="Escribe aquí tu observación...">${saved}</textarea><div class="personal-note-form__status" id="noteSaveStatus">${saved?'Guardado':''}</div>`;
    const area=document.getElementById('personalNoteArea'), status=document.getElementById('noteSaveStatus'); let timer;
    area.addEventListener('input',()=>{status.textContent='Escribiendo…';clearTimeout(timer);timer=setTimeout(()=>{localStorage.setItem(key,area.value);status.textContent='Guardado';},400);});
  }

  async function openDictionary(code){
    openPanel('diccionario');
    els.panelTitle.textContent=`Diccionario · ${code}`;
    els.panelBody.innerHTML=emptyState('⌛','Buscando entrada…');
    try{
      const result=await VerboModules.getDictionaryEntry(code);
      if(!result){ els.panelBody.innerHTML=emptyState('🔎',`No se encontró una entrada para ${code}.`); return; }
      const html=result.entry.html||result.entry.definition||'';
      els.panelBody.innerHTML=`<article class="dict-entry"><div class="dict-entry__term">${result.code}</div><div class="dict-entry__source">${result.manifest.name}</div><div class="dict-entry__def">${html}</div></article>`;
      els.panelBody.querySelectorAll('a.strong').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const m=(a.getAttribute('href')||'').match(/[GH]\d+/i);if(m)openDictionary(m[0].toUpperCase());}));
    }catch(error){console.error(error);els.panelBody.innerHTML=emptyState('⚠️','No se pudo abrir esta entrada del diccionario.');}
  }
  function updateNavButtons(){ const idx=catalog.books.findIndex(b=>b.id===currentBook); els.prev.disabled=idx===0&&currentChapter===1; els.next.disabled=idx===catalog.books.length-1&&currentChapter===els.chapter.options.length; }
  async function moveChapter(delta){
    const idx=catalog.books.findIndex(b=>b.id===currentBook), count=els.chapter.options.length;
    if(delta<0&&currentChapter>1) currentChapter--; else if(delta>0&&currentChapter<count) currentChapter++; else {
      const nextIdx=idx+delta; if(nextIdx<0||nextIdx>=catalog.books.length)return;
      currentBook=catalog.books[nextIdx].id; els.book.value=currentBook; currentChapter=delta>0?1:(await VerboModules.getBookInfo(currentBook)).chapterCount; await refreshChapters();
    }
    els.chapter.value=String(currentChapter); updateNavButtons(); await loadPassage();
  }
  function setLoading(on){ els.body.classList.toggle('app-loading',on); }
  function showFatal(error){ els.list.innerHTML=emptyState('⚠️',`No se pudieron cargar los módulos JSON. Ejecuta la app desde un servidor local. ${error.message}`); }

  els.book.addEventListener('change',async()=>{currentBook=els.book.value;currentChapter=1;await refreshChapters();await loadPassage();});
  els.chapter.addEventListener('change',async()=>{currentChapter=Number(els.chapter.value);updateNavButtons();await loadPassage();});
  els.version.addEventListener('change',()=>{const v=activeVerse();currentVersion=els.version.value;if(compareVersion===currentVersion)compareVersion=Object.keys(data.versions).find(x=>x!==currentVersion)||currentVersion;renderChapter(v);if(activeTab==='comparar')renderCompare(v);});
  els.prev.addEventListener('click',()=>moveChapter(-1)); els.next.addEventListener('click',()=>moveChapter(1));
  els.tabs.forEach(b=>b.addEventListener('click',()=>activeTab===b.dataset.tab?closePanel():openPanel(b.dataset.tab)));
  els.search.addEventListener('click',()=>openPanel('buscar'));
  els.close.addEventListener('click',closePanel);
});
