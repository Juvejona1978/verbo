'use strict';

const BOOKS = [
['GEN','Génesis'],['EXO','Éxodo'],['LEV','Levítico'],['NUM','Números'],['DEU','Deuteronomio'],['JOS','Josué'],['JDG','Jueces'],['RUT','Rut'],['1SA','1 Samuel'],['2SA','2 Samuel'],['1KI','1 Reyes'],['2KI','2 Reyes'],['1CH','1 Crónicas'],['2CH','2 Crónicas'],['EZR','Esdras'],['NEH','Nehemías'],['EST','Ester'],['JOB','Job'],['PSA','Salmos'],['PRO','Proverbios'],['ECC','Eclesiastés'],['SNG','Cantares'],['ISA','Isaías'],['JER','Jeremías'],['LAM','Lamentaciones'],['EZK','Ezequiel'],['DAN','Daniel'],['HOS','Oseas'],['JOL','Joel'],['AMO','Amós'],['OBA','Abdías'],['JON','Jonás'],['MIC','Miqueas'],['NAM','Nahúm'],['HAB','Habacuc'],['ZEP','Sofonías'],['HAG','Hageo'],['ZEC','Zacarías'],['MAL','Malaquías'],['MAT','Mateo'],['MRK','Marcos'],['LUK','Lucas'],['JHN','Juan'],['ACT','Hechos'],['ROM','Romanos'],['1CO','1 Corintios'],['2CO','2 Corintios'],['GAL','Gálatas'],['EPH','Efesios'],['PHP','Filipenses'],['COL','Colosenses'],['1TH','1 Tesalonicenses'],['2TH','2 Tesalonicenses'],['1TI','1 Timoteo'],['2TI','2 Timoteo'],['TIT','Tito'],['PHM','Filemón'],['HEB','Hebreos'],['JAS','Santiago'],['1PE','1 Pedro'],['2PE','2 Pedro'],['1JN','1 Juan'],['2JN','2 Juan'],['3JN','3 Juan'],['JUD','Judas'],['REV','Apocalipsis']
].map((x,i)=>({id:x[0],name:x[1],number:i+1}));

const $ = s => document.querySelector(s);
const state = { file:null, db:null, type:null, tables:[], details:{}, stats:{}, registry:null, registryFile:null };
const els = {
 drop:$('#dropZone'), choose:$('#chooseBtn'), input:$('#fileInput'), info:$('#fileInfo'), workspace:$('#workspace'),
 badge:$('#typeBadge'), name:$('#nameInput'), abbr:$('#abbrInput'), id:$('#idInput'), lang:$('#langInput'), author:$('#authorInput'), desc:$('#descInput'),
 stats:$('#stats'), preview:$('#preview'), inspect:$('#inspectBtn'), convert:$('#convertBtn'), pretty:$('#prettyJson'), report:$('#includeReport'),
 progressWrap:$('#progressWrap'), progress:$('#progressBar'), progressText:$('#progressText'), message:$('#message'),
 registryBtn:$('#registryBtn'), registryInput:$('#registryInput'), registryInfo:$('#registryInfo'), includeRegistry:$('#includeRegistry')
};

els.choose.onclick=()=>els.input.click();
els.registryBtn.onclick=()=>els.registryInput.click();
els.registryInput.onchange=e=>e.target.files[0]&&loadRegistry(e.target.files[0]);
els.input.onchange=e=>e.target.files[0]&&loadFile(e.target.files[0]);
els.drop.ondragover=e=>{e.preventDefault();els.drop.classList.add('drag')};
els.drop.ondragleave=()=>els.drop.classList.remove('drag');
els.drop.ondrop=e=>{e.preventDefault();els.drop.classList.remove('drag');e.dataTransfer.files[0]&&loadFile(e.dataTransfer.files[0])};
els.drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();els.input.click()}};
els.inspect.onclick=showPreview;
els.convert.onclick=convertAndDownload;
els.name.oninput=()=>{ if(!els.id.dataset.touched) els.id.value=slug(els.name.value); };
els.id.oninput=()=>els.id.dataset.touched='1';

async function loadRegistry(file){
 try{
  const text=await file.text();
  const registry=JSON.parse(text);
  validateRegistry(registry);
  state.registry=registry;state.registryFile=file;
  const counts=`${registry.bibles.length} Biblia(s), ${registry.commentaries.length} comentario(s), ${registry.dictionaries.length} diccionario(s)`;
  els.registryInfo.className='registry-info ok';
  els.registryInfo.textContent=`Registro cargado: ${file.name} · ${counts}`;
 }catch(err){
  state.registry=null;state.registryFile=null;
  els.registryInfo.className='registry-info error';
  els.registryInfo.textContent='No se pudo cargar el registro: '+(err.message||err);
 }
}
function validateRegistry(r){
 if(!r||typeof r!=='object')throw new Error('El JSON no contiene un objeto válido.');
 for(const k of ['bibles','commentaries','dictionaries']){if(!Array.isArray(r[k]))throw new Error(`Falta la lista "${k}".`)}
}
function registryCategory(type){return type==='bible'?'bibles':type==='commentary'?'commentaries':'dictionaries'}
function registryManifestPath(type,id){return `${registryCategory(type)}/${id}/manifest.json`}
function buildUpdatedRegistry(){
 const base=state.registry?structuredClone(state.registry):{schemaVersion:2,defaultBible:'',bibles:[],commentaries:[],dictionaries:[]};
 validateRegistry(base);
 const id=slug(els.id.value);const category=registryCategory(state.type);const path=registryManifestPath(state.type,id);
 // Elimina duplicados por ruta o por la misma carpeta/ID antes de añadir.
 base[category]=base[category].filter(item=>{
  const value=typeof item==='string'?item:String(item?.path||item?.manifest||'');
  return value!==path&&!value.includes(`/${id}/`);
 });
 base[category].push(path);
 if(state.type==='bible'&&!base.defaultBible)base.defaultBible=id;
 return base;
}

async function initSql(){
 if(window.__sql) return window.__sql;
 if(typeof initSqlJs!=='function') throw new Error('No se pudo cargar sql.js. Comprueba tu conexión a Internet.');
 window.__sql=await initSqlJs({locateFile:f=>`https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${f}`});
 return window.__sql;
}

async function loadFile(file){
 clearMessage(); setProgress(5,'Leyendo archivo…'); els.progressWrap.classList.remove('hidden');
 try{
  const SQL=await initSql();
  const bytes=new Uint8Array(await file.arrayBuffer());
  const db=new SQL.Database(bytes);
  state.file=file;state.db=db;
  state.tables=query(db,"SELECT name FROM sqlite_master WHERE type='table'").map(r=>String(r.name).toLowerCase());
  state.type=detectType(state.tables);
  if(!state.type) throw new Error('No se reconoció como Biblia, comentario o diccionario MySword.');
  state.details=readDetails(db);
  state.stats=readStats(db,state.type);
  fillMetadata();renderStats();showPreview();
  els.info.innerHTML=`<strong>${escapeHtml(file.name)}</strong> · ${formatBytes(file.size)} · SQLite válido`;
  els.info.classList.remove('hidden');els.workspace.classList.remove('hidden');
  setProgress(100,'Módulo listo para convertir');setTimeout(()=>els.progressWrap.classList.add('hidden'),700);
 }catch(err){showError(err);els.progressWrap.classList.add('hidden')}
}

function detectType(t){if(t.includes('bible'))return'bible';if(t.includes('commentary'))return'commentary';if(t.includes('dictionary'))return'dictionary';return null}
function query(db,sql,params=[]){const stmt=db.prepare(sql);stmt.bind(params);const out=[];while(stmt.step())out.push(stmt.getAsObject());stmt.free();return out}
function columns(db,table){return query(db,`PRAGMA table_info("${table}")`).map(x=>String(x.name).toLowerCase())}
function readDetails(db){
 const table=state.tables.find(t=>t==='details');if(!table)return{};
 try{const rows=query(db,'SELECT * FROM details LIMIT 1');if(!rows[0])return{};const obj={};for(const[k,v]of Object.entries(rows[0]))obj[k.toLowerCase()]=v??'';return obj}catch{return{}}
}
function readStats(db,type){
 if(type==='bible'){const r=query(db,'SELECT COUNT(*) total, COUNT(DISTINCT Book) books, COUNT(DISTINCT Book || ":" || Chapter) chapters FROM Bible')[0];return{entries:+r.total,books:+r.books,chapters:+r.chapters}}
 if(type==='commentary'){const r=query(db,'SELECT COUNT(*) total, COUNT(DISTINCT book) books FROM commentary')[0];return{entries:+r.total,books:+r.books}}
 const r=query(db,'SELECT COUNT(*) total FROM dictionary')[0];return{entries:+r.total}
}
function pick(...keys){for(const k of keys){const v=state.details[k.toLowerCase()];if(v!==undefined&&String(v).trim())return String(v).trim()}return''}
function cleanName(s){return String(s||'').replace(/\.(bbl|cmt|dct)(\.mybible)?$/i,'').replace(/\.mybible$/i,'').trim()}
function fillMetadata(){
 const d=state.details;const filename=cleanName(state.file.name);
 const name=cleanName(pick('description','title')||filename);
 const abbr=cleanName(pick('abbreviation','abbrev')||filename).slice(0,50);
 els.name.value=name;els.abbr.value=abbr;els.id.value=slug(abbr||name);els.id.dataset.touched='';els.lang.value='es';els.author.value=pick('author');els.desc.value=stripHtml(pick('comments','description'));
 els.badge.textContent=state.type==='bible'?'BIBLIA':state.type==='commentary'?'COMENTARIO':'DICCIONARIO';
}
function renderStats(){
 const s=state.stats;const items=[];
 if(s.books)items.push(['Libros',s.books]);if(s.chapters)items.push(['Capítulos',s.chapters]);items.push([state.type==='dictionary'?'Entradas':state.type==='commentary'?'Comentarios':'Versículos',s.entries]);
 if(state.type==='bible')items.push(['Strong',detectStrong()?'Sí':'No']);
 els.stats.innerHTML=items.map(([l,v])=>`<div class="stat"><b>${escapeHtml(String(v))}</b><span>${l}</span></div>`).join('');
}
function detectStrong(){
 const v=pick('strong');if(String(v)==='1'||/^true$/i.test(v))return true;
 try{const r=query(state.db,"SELECT Scripture FROM Bible WHERE Scripture LIKE '%G[0-9]%' OR Scripture LIKE '%H[0-9]%' LIMIT 1");return !!r.length}catch{return false}
}
function showPreview(){
 if(!state.db)return;
 let obj;
 if(state.type==='bible')obj=query(state.db,'SELECT Book, Chapter, Verse, Scripture FROM Bible ORDER BY Book,Chapter,Verse LIMIT 3');
 else if(state.type==='commentary')obj=query(state.db,'SELECT book,chapter,fromverse,toverse,data FROM commentary ORDER BY book,chapter,fromverse LIMIT 2').map(r=>({...r,data:stripHtml(r.data).slice(0,700)}));
 else obj=query(state.db,'SELECT word,data FROM dictionary ORDER BY word LIMIT 2').map(r=>({...r,data:stripHtml(r.data).slice(0,700)}));
 els.preview.textContent=JSON.stringify(obj,null,2);
}
function slug(s){return String(s||'modulo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'modulo'}
function stripHtml(s){const d=document.createElement('div');d.innerHTML=String(s||'');return(d.textContent||'').replace(/\\'[a-f0-9]{2}/gi,'').replace(/\s+/g,' ').trim()}
function normalizeHtml(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*(["']).*?\1/gi,'').replace(/javascript:/gi,'').trim()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatBytes(n){return n>1048576?(n/1048576).toFixed(1)+' MB':(n/1024).toFixed(1)+' KB'}
function stringify(obj){return JSON.stringify(obj,null,els.pretty.checked?2:0)}
function setProgress(p,t){els.progressWrap.classList.remove('hidden');els.progress.style.width=`${p}%`;els.progressText.textContent=t;}
function clearMessage(){els.message.className='message hidden';els.message.textContent=''}
function showError(err){els.message.className='message error';els.message.textContent='Error: '+(err.message||err);els.message.classList.remove('hidden')}
function showOk(t){els.message.className='message ok';els.message.textContent=t;els.message.classList.remove('hidden')}
function yieldUI(){return new Promise(r=>setTimeout(r,0))}

async function convertAndDownload(){
 clearMessage();if(!state.db)return;
 if(!els.name.value.trim()||!els.id.value.trim()){showError(new Error('Completa el nombre y el identificador.'));return}
 els.convert.disabled=true;setProgress(2,'Preparando conversión…');
 try{
  const zip=new JSZip();const root=zip.folder(slug(els.id.value));let report;
  if(state.type==='bible')report=await convertBible(root);
  else if(state.type==='commentary')report=await convertCommentary(root);
  else report=await convertDictionary(root);
  if(els.report.checked)root.file('conversion-report.json',stringify(report));
  root.file('README.txt',readmeText(report));
  if(els.includeRegistry.checked){
   const updatedRegistry=buildUpdatedRegistry();
   zip.file('registry.json',stringify(updatedRegistry));
   zip.file('COPIAR-REGISTRY.txt','Copia registry.json en la carpeta modules/ de Verbo, reemplazando el archivo anterior.\nEl módulo debe copiarse en la carpeta indicada por su tipo.\n');
   report.registryUpdated=true;
  }
  setProgress(94,'Comprimiendo ZIP…');
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}},m=>setProgress(94+Math.round(m.percent*.06),'Comprimiendo ZIP…'));
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${slug(els.id.value)}-verbo.zip`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  setProgress(100,'Conversión terminada');showOk(`Módulo convertido correctamente: ${report.outputFiles} archivos generados.${els.includeRegistry.checked?' El ZIP incluye registry.json actualizado.':''}`);
 }catch(err){showError(err)}finally{els.convert.disabled=false}
}
function baseManifest(){return{schemaVersion:2,id:slug(els.id.value),type:state.type,name:els.name.value.trim(),abbreviation:els.abbr.value.trim(),language:els.lang.value.trim()||'es',author:els.author.value.trim(),description:els.desc.value.trim(),sourceFormat:'MySword SQLite',sourceFile:state.file.name,convertedAt:new Date().toISOString()}}

async function convertBible(root){
 const rows=query(state.db,'SELECT Book,Chapter,Verse,Scripture FROM Bible ORDER BY Book,Chapter,Verse');const byBook=new Map();const hasStrongs=detectStrong();
 rows.forEach(r=>{const n=+r.Book;if(!byBook.has(n))byBook.set(n,{});const ch=byBook.get(n);ch[r.Chapter]??={};const raw=String(r.Scripture||'');ch[r.Chapter][r.Verse]=hasStrongs?{text:raw,segments:parseStrongSegments(raw)}:{text:raw}});
 const booksFolder=root.folder('books');const manifest={...baseManifest(),hasStrongs,books:[]};let done=0;
 for(const [num,chapters] of byBook){const b=BOOKS[num-1]||{id:`B${num}`,name:`Libro ${num}`,number:num};booksFolder.file(`${b.id}.json`,stringify({schemaVersion:2,book:b.id,name:b.name,chapters}));manifest.books.push({...b,file:`books/${b.id}.json`});done++;setProgress(8+Math.round(done/byBook.size*78),`Convirtiendo ${b.name}…`);await yieldUI()}
 root.file('manifest.json',stringify(manifest));return{type:'bible',inputEntries:rows.length,books:manifest.books.length,hasStrongs,outputFiles:manifest.books.length+2,warnings:manifest.books.length<66?['El módulo contiene menos de 66 libros.']:[]}
}
function parseStrongSegments(raw){
 const tokens=String(raw).trim().split(/\s+/);const out=[];const isStrong=t=>/^[GH]\d+[a-z]?$/i.test(t);const isMorph=t=>/^[A-Z][A-Za-z0-9+_.-]{1,15}$/.test(t)&&!isStrong(t);
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];if(isStrong(t)){if(out.length){out[out.length-1].strong=t.toUpperCase();if(tokens[i+1]&&isMorph(tokens[i+1]))out[out.length-1].morph=tokens[++i]}else out.push({text:t,strong:t.toUpperCase()});}
  else out.push({text:t});
 }
 return out;
}

function inferCommentaryVerseRange(content, chapter, from, to){
 // Algunos comentarios MySword guardan todo el capítulo en una sola fila
 // marcada como versículo 1, pero dentro del texto traen referencias como
 // 1.1, 1.1-17, 1.18-25. Esta función amplía el rango para que Verbo
 // no esconda esos comentarios en los versículos siguientes.
 const plain=stripHtml(content||'');
 const ch=Number(chapter), start=Number(from)||1;
 let end=Number(to)||start;
 const esc=String(ch).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp(`(^|[^\\d])${esc}\\.(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?(?:\\s*,\\s*(\\d{1,3}))?(ss)?`, 'g');
 let m;
 while((m=re.exec(plain))){
  const v1=Number(m[2]), v2=m[3]?Number(m[3]):v1, v3=m[4]?Number(m[4]):null;
  if(Number.isInteger(v1)&&v1>=start&&v1<=176) end=Math.max(end,v1);
  if(Number.isInteger(v2)&&v2>=v1&&v2<=176) end=Math.max(end,v2);
  if(Number.isInteger(v3)&&v3>=v1&&v3<=176) end=Math.max(end,v3);
 }
 return Math.max(start,end);
}

async function convertCommentary(root){
 const rows=query(state.db,'SELECT * FROM commentary ORDER BY book,chapter,fromverse');const grouped=new Map();let i=0;let expanded=0;
 for(const r of rows){
  const n=+r.book;const b=BOOKS[n-1]||{id:`B${n}`,name:`Libro ${n}`,number:n};if(!grouped.has(n))grouped.set(n,[]);
  let from=Number(r.fromverse);
  let to=Number(r.toverse);
  const isIntro=!Number.isInteger(from)||from<=0;
  if(isIntro) from=1;
  if(!Number.isInteger(to)||to<=0) to=from;
  const inferredTo=inferCommentaryVerseRange(r.data,+r.chapter,from,to);
  if(inferredTo>to){to=inferredTo;expanded++}
  const title=isIntro?`${b.name} ${r.chapter} — Introducción`:`${b.name} ${r.chapter}:${from}${to!==from?'–'+to:''}`;
  grouped.get(n).push({id:`${slug(els.id.value)}-${r.id??i+1}`,title,author:els.author.value.trim()||pick('author'),reference:{book:b.id,chapterStart:+r.chapter,verseStart:from,chapterEnd:+r.chapter,verseEnd:to},content:normalizeHtml(r.data)});i++
 }
 const folder=root.folder('books');const manifest={...baseManifest(),books:[]};let done=0;
 for(const [n,entries]of grouped){const b=BOOKS[n-1]||{id:`B${n}`,name:`Libro ${n}`,number:n};folder.file(`${b.id}.json`,stringify({schemaVersion:2,book:b.id,name:b.name,entries}));manifest.books.push({...b,file:`books/${b.id}.json`});done++;setProgress(8+Math.round(done/grouped.size*78),`Convirtiendo ${b.name}…`);await yieldUI()}
 const warnings=[];if(manifest.books.length<66)warnings.push('El módulo contiene menos de 66 libros.');if(expanded)warnings.push(`${expanded} comentario(s) ampliados por referencias internas detectadas en el texto.`);
 root.file('manifest.json',stringify(manifest));return{type:'commentary',inputEntries:rows.length,books:manifest.books.length,expandedRanges:expanded,outputFiles:manifest.books.length+2,warnings}
}

async function convertDictionary(root){
 const rows=query(state.db,'SELECT word,data FROM dictionary ORDER BY word');const groups={G:{},H:{},OTHER:{}};let i=0;
 for(const r of rows){const key=String(r.word||'').trim();const g=/^G\d+/i.test(key)?'G':/^H\d+/i.test(key)?'H':'OTHER';groups[g][key.toUpperCase()]=normalizeHtml(r.data);i++;if(i%500===0){setProgress(8+Math.round(i/rows.length*78),`Convirtiendo entrada ${i.toLocaleString()} de ${rows.length.toLocaleString()}…`);await yieldUI()}}
 const entryFiles={};for(const g of ['G','H','OTHER']){if(Object.keys(groups[g]).length){const f=`entries-${g}.json`;root.file(f,stringify(groups[g]));entryFiles[g]=f}}
 const manifest={...baseManifest(),strong:!!(entryFiles.G||entryFiles.H),entryFiles};root.file('manifest.json',stringify(manifest));return{type:'dictionary',inputEntries:rows.length,groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,Object.keys(v).length])),outputFiles:Object.keys(entryFiles).length+2,warnings:[]}
}
function readmeText(r){return`VERBO MODULE STUDIO\n\nMódulo: ${els.name.value}\nTipo: ${r.type}\nID: ${slug(els.id.value)}\nEntradas procesadas: ${r.inputEntries}\nFecha: ${new Date().toLocaleString('es')}\n\nCopia la carpeta del módulo dentro de modules/bibles, modules/commentaries o modules/dictionaries. Si cargaste registry.json en Module Studio, el ZIP incluye una versión actualizada lista para reemplazar modules/registry.json.\n`}
