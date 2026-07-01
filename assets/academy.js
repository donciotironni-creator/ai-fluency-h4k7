/* ============ AI Academy — app shell (vanilla JS, no build) ============ */
(function(){
  "use strict";

  var ICONS = {
    clock: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--faint)" stroke-width="1.6"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2" stroke-linecap="round"/></svg>',
    level: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--faint)" stroke-width="1.6"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="2.5"/></svg>',
    save: function(filled){ return '<svg width="15" height="15" viewBox="0 0 20 20" stroke="var(--accent)" stroke-width="1.6" fill="'+(filled?'var(--accent)':'none')+'"><path d="M5 3h10v14l-5-3.5L5 17z" stroke-linejoin="round"/></svg>'; },
    check: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10.5L8 14.5L16 5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    diamond: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6.5" y="6.5" width="7" height="7" transform="rotate(45 10 10)"/></svg>',
    bars: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="5" y1="15" x2="5" y2="11"/><line x1="10" y1="15" x2="10" y2="7"/><line x1="15" y1="15" x2="15" y2="4"/></svg>',
    pencil: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 16l1-3.5L13 4.5l2.5 2.5L7.5 15z"/></svg>',
    checkCircle: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7.5"/><path d="M6.5 10l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round" width="17" height="17"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3.5 6l6.5 4.5L16.5 6"/></svg>',
    glossary: '<span style="width:16px;height:14px;border:1.6px solid var(--faint);border-radius:2px;flex:none;display:block"></span>',
    map: '<span style="width:16px;height:16px;flex:none;position:relative;display:block"><span style="position:absolute;left:0;top:2px;width:5px;height:5px;border-radius:50%;background:var(--faint)"></span><span style="position:absolute;right:0;top:2px;width:5px;height:5px;border-radius:50%;background:var(--faint)"></span><span style="position:absolute;left:5px;bottom:1px;width:5px;height:5px;border-radius:50%;background:var(--faint)"></span></span>',
    circle: '<span style="width:15px;height:15px;border:1.6px solid var(--faint);border-radius:50%;flex:none;display:block"></span>'
  };

  function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function hl(text, q){
    if(!q) return text;
    try{ return text.replace(new RegExp('('+esc(q)+')','ig'), '<mark>$1</mark>'); }
    catch(e){ return text; }
  }
  function findLesson(id){
    for(var i=0;i<MODULES.length;i++){
      var m = MODULES[i];
      for(var j=0;j<(m.lessons||[]).length;j++){
        if(m.lessons[j].id === id) return {module:m, lesson:m.lessons[j], index:j};
      }
    }
    var m0 = MODULES[0];
    return {module:m0, lesson:m0.lessons[0], index:0};
  }

  var TOC_SECTIONS = [
    {id:'sec-obiective', label:'Obiective'},
    {id:'sec-concept', label:'Concept cheie'},
    {id:'sec-exemplu', label:'Exemplu practic'},
    {id:'sec-exercitiu', label:'Exercițiu scurt'},
    {id:'sec-recap', label:'Recapitulare'}
  ];

  var state = {
    route: 'lesson',
    theme: 'light',
    expandedModule: 1,
    activeLesson: '1.1',
    q: '',
    cat: 'toate',
    glossaryCatFilter: 'toate',
    saved: {},
    exerciseOpen: {},
    exerciseDraft: {},
    activeToc: 'sec-obiective'
  };

  function setState(patch){
    for(var k in patch){ if(Object.prototype.hasOwnProperty.call(patch,k)) state[k]=patch[k]; }
    render();
  }

  /* ---------- persistence ---------- */
  function loadPrefs(){
    try{
      var t = localStorage.getItem('academy_theme');
      if(t==='light'||t==='dark') state.theme = t;
      else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) state.theme = 'dark';
      var visited = localStorage.getItem('academy_visited');
      if(!visited){ state.route = 'onboarding'; localStorage.setItem('academy_visited','1'); }
    }catch(e){}
  }

  /* ---------- render: header ---------- */
  function renderHeader(){
    var cur = findLesson(state.activeLesson);
    document.getElementById('crumb-module').textContent = 'Modul ' + cur.module.id + ': ' + cur.module.title;
    document.getElementById('crumb-lesson').textContent = 'Lecția ' + cur.lesson.id;
    document.documentElement.dataset.theme = state.theme;
    document.getElementById('theme-btn').textContent = state.theme==='dark' ? '☀' : '◐';
  }

  /* ---------- render: sidebar ---------- */
  function renderSidebar(){
    var html = MODULES.map(function(m){
      var expanded = state.expandedModule === m.id && m.available;
      var chevron = expanded ? '▾' : '▸';
      var row = '<div style="margin-bottom:4px">'
        + '<button class="modtoggle" data-action="toggle-module" data-mod="'+m.id+'">'
        + '<div style="flex:1;min-width:0">'
        + '<div class="mod-id">Modul '+m.id+'</div>'
        + '<div class="mod-title'+(m.available?'':' soon')+'">'+m.title+'</div>'
        + '</div>'
        + (m.available ? '<span class="mod-chevron">'+chevron+'</span>' : '<span class="mod-badge">CURÂND</span>')
        + '</button>';
      if(expanded){
        row += '<div class="lesson-list">' + m.lessons.map(function(l){
          var active = state.route==='lesson' && state.activeLesson===l.id;
          return '<button class="lesson-row'+(active?' active':'')+'" data-action="goto-lesson" data-lesson="'+l.id+'">'
            + '<span class="lesson-dot"></span><span class="lesson-num">'+l.id+'</span><span class="lesson-title">'+l.title+'</span></button>';
        }).join('') + '</div>';
      }
      row += '</div>';
      return row;
    }).join('');

    document.getElementById('module-list').innerHTML = html;

    document.querySelectorAll('.sidebar-link[data-route]').forEach(function(btn){
      btn.classList.toggle('active-link', state.route === btn.dataset.route);
    });
  }

  /* ---------- render: TOC ---------- */
  function renderToc(){
    var el = document.getElementById('toc-list');
    if(!el) return;
    el.innerHTML = TOC_SECTIONS.map(function(t){
      var on = state.activeToc === t.id;
      return '<button class="tocitem'+(on?' active':'')+'" data-action="scroll-toc" data-target="'+t.id+'">'
        + '<span class="toc-dot"></span>'+t.label+'</button>';
    }).join('');
  }

  /* ---------- render: lesson view ---------- */
  function renderLesson(){
    var cur = findLesson(state.activeLesson);
    var m = cur.module, l = cur.lesson, idx = cur.index;
    var saved = !!state.saved[l.id];
    var exOpen = !!state.exerciseOpen[l.id];

    var html = ''
      + '<div id="v2-top"></div>'
      + '<div class="lesson-hero">'
      + '<div class="lesson-hero-text">'
      + '<div class="mod-eyebrow">MODUL '+m.id+'</div>'
      + '<h1 class="lesson-h1">'+m.title+'</h1>'
      + '<div class="lesson-eyebrow">LECȚIA '+l.id+'</div>'
      + '<h2 class="lesson-h2">'+l.title+'</h2>'
      + '<p class="lesson-intro">'+l.intro+'</p>'
      + '</div>'
      + '<div class="lesson-graphic"><svg viewBox="0 0 200 200" style="width:100%;height:100%">'
      + '<g stroke="var(--accent)" stroke-width="1" opacity=".45" fill="none">'
      + '<line x1="60" y1="70" x2="100" y2="55"/><line x1="100" y1="55" x2="140" y2="80"/><line x1="60" y1="70" x2="80" y2="115"/><line x1="80" y1="115" x2="130" y2="120"/><line x1="140" y1="80" x2="130" y2="120"/><line x1="100" y1="55" x2="80" y2="115"/><line x1="130" y1="120" x2="110" y2="160"/>'
      + '</g><g fill="var(--accent)"><circle cx="60" cy="70" r="4"/><circle cx="100" cy="55" r="5"/><circle cx="140" cy="80" r="4"/><circle cx="80" cy="115" r="4"/><circle cx="130" cy="120" r="5"/><circle cx="110" cy="160" r="3.5"/></g></svg></div>'
      + '</div>'

      + '<div class="meta-row">'
      + '<div class="meta-item"><span class="meta-icon">'+ICONS.clock+'</span><div><div class="meta-val">'+l.time+'</div><div class="meta-label">Timp estimat</div></div></div>'
      + '<div class="meta-item"><span class="meta-icon">'+ICONS.level+'</span><div><div class="meta-val">'+l.level+'</div><div class="meta-label">Nivel</div></div></div>'
      + '<button class="meta-save" data-action="toggle-save" data-lesson="'+l.id+'"><span class="meta-icon">'+ICONS.save(saved)+'</span><div><div class="meta-val">'+(saved?'Salvat':'Salvează')+'</div><div class="meta-label">Lecția</div></div></button>'
      + '<div class="meta-pos">'
      + '<div class="meta-pos-text"><div class="meta-val">Lecția '+(idx+1)+' din '+m.lessons.length+'</div><div class="meta-label">în acest modul</div></div>'
      + '<div class="pos-nav">'
      + '<button class="pos-btn" data-action="prev-lesson" aria-label="Lecția anterioară">‹</button>'
      + '<button class="pos-btn next lift" data-action="next-lesson" aria-label="Lecția următoare">→</button>'
      + '</div></div></div>'

      + '<div id="sec-obiective" class="lesson-section">'
      + '<span class="sec-icon">'+ICONS.check+'</span>'
      + '<div class="sec-body"><h3>Obiective</h3><p>La finalul acestei lecții vei putea:</p>'
      + '<ul>'+l.obiective.map(function(o){return '<li>'+o+'</li>';}).join('')+'</ul></div></div>'

      + '<div id="sec-concept" class="lesson-section">'
      + '<span class="sec-icon">'+ICONS.diamond+'</span>'
      + '<div class="sec-body"><h3>Concept cheie</h3><div class="concept-box">'+l.concept+'</div></div></div>'

      + '<div id="sec-exemplu" class="lesson-section">'
      + '<span class="sec-icon">'+ICONS.bars+'</span>'
      + '<div class="sec-body"><h3>Exemplu practic</h3><div style="font:400 16px/1.6 \'Public Sans\',sans-serif;color:var(--muted)">'+l.exemplu+'</div></div></div>'

      + '<div id="sec-exercitiu" class="lesson-section">'
      + '<span class="sec-icon">'+ICONS.pencil+'</span>'
      + '<div class="sec-body">'
      + '<div class="exercise-hd"><div><h3>'+(l.exercitiuTitle||'Exercițiu scurt')+'</h3><p>'+l.exercitiuText+'</p></div>'
      + '<button class="exercise-btn" data-action="toggle-exercise" data-lesson="'+l.id+'">'+(exOpen?'Ascunde':'Notează răspunsul tău')+'</button></div>'
      + (exOpen ? '<textarea class="exercise-area" data-lesson="'+l.id+'"></textarea>' : '')
      + '</div></div>'

      + '<div id="sec-recap" class="lesson-section">'
      + '<span class="sec-icon">'+ICONS.checkCircle+'</span>'
      + '<div class="sec-body"><h3>Recapitulare</h3>'
      + '<ul>'+l.recap.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ul></div></div>'

      + '<div class="lesson-footer">'
      + '<button class="footer-btn" data-action="prev-lesson"'+(idx===0?' disabled style="opacity:.4;cursor:default"':'')+'>‹ Lecția anterioară</button>'
      + '<button class="footer-btn next lift" data-action="next-lesson"'+(idx===m.lessons.length-1?' disabled style="opacity:.4;cursor:default"':'')+'>Lecția următoare →</button>'
      + '</div>';

    document.getElementById('view-lesson').innerHTML = html;

    var ta = document.querySelector('.exercise-area[data-lesson="'+l.id+'"]');
    if(ta){
      ta.placeholder = l.exercitiuPlaceholder || '';
      ta.value = state.exerciseDraft[l.id] || '';
      ta.addEventListener('input', function(){ state.exerciseDraft[l.id] = ta.value; });
    }
  }

  /* ---------- render: glossary view ---------- */
  function renderGlossary(){
    var q = state.q.trim().toLowerCase();
    var cat = state.glossaryCatFilter;
    var list = GLOSSARY.filter(function(t){
      if(cat !== 'toate' && t.c !== cat) return false;
      if(!q) return true;
      return t.t.toLowerCase().indexOf(q)>-1 || t.d.toLowerCase().indexOf(q)>-1 || (t.n && t.n.toLowerCase().indexOf(q)>-1);
    });

    var chips = ['<button class="chip'+(cat==='toate'?' active':'')+'" data-action="filter-cat" data-cat="toate">Toate</button>']
      .concat(CATS.map(function(c){
        var short = c.label.split(' · ')[0].split(' & ')[0];
        return '<button class="chip'+(cat===c.id?' active':'')+'" data-action="filter-cat" data-cat="'+c.id+'" title="'+c.label+'">'+short+'</button>';
      })).join('');

    var rows = list.map(function(t){
      var catLabel = CATS.filter(function(c){return c.id===t.c;})[0];
      var short = catLabel ? catLabel.label.split(' · ')[0].split(' & ')[0] : t.c;
      return '<div class="gloss-row"><div class="gloss-term">'+hl(t.t,state.q.trim())+'</div>'
        + '<p class="gloss-def">'+hl(t.d,state.q.trim())+(t.n?('<span class="gloss-note">'+hl(t.n,state.q.trim())+'</span>'):'')+'</p>'
        + '<span class="gloss-cat">'+short.toUpperCase()+'</span></div>';
    }).join('');

    var body = list.length
      ? '<div>'+rows+'</div>'
      : '<div class="gloss-empty"><div class="gloss-empty-title">Niciun termen găsit</div><p style="margin:0;color:var(--muted)">Încearcă alt cuvânt sau golește filtrul.</p></div>';

    document.getElementById('view-glossary').innerHTML =
      '<div class="eyebrow">REFERINȚĂ PERSISTENTĂ</div>'
      + '<h1 class="page-title">Glosar de termeni</h1>'
      + '<p class="page-lede">O terminologie comună pentru tot programul. Caută un termen sau filtrează pe categorii.</p>'
      + '<div class="gloss-search">'+ICONS.search+'<input id="gloss-input" placeholder="Caută un termen…" autocomplete="off" spellcheck="false"></div>'
      + '<div class="chiprow">'+chips+'</div>'
      + '<div class="gloss-count">'+list.length+' / '+GLOSSARY.length+' termeni</div>'
      + body;

    var input = document.getElementById('gloss-input');
    input.value = state.q;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener('input', function(){ setState({q: input.value}); });
    input.addEventListener('keydown', function(e){ if(e.key==='Escape'){ setState({q:''}); } });
  }

  /* ---------- render: map view ---------- */
  function renderMap(){
    var lines = MAP_LINES.map(function(l){
      return '<line x1="'+l[0]+'" y1="'+l[1]+'" x2="'+l[2]+'" y2="'+l[3]+'"/>';
    }).join('');
    var nodes = MAP_NODES.map(function(n){
      return '<button class="map-node'+(n.center?' center lift':' lift')+'" style="left:'+n.x+'%;top:'+n.y+'%" data-action="map-node" data-node="'+n.id+'">'+n.label+'</button>';
    }).join('');

    document.getElementById('view-map').innerHTML =
      '<div class="eyebrow">BUSOLA PROGRAMULUI</div>'
      + '<h1 class="page-title">Harta conceptelor</h1>'
      + '<p class="page-lede">Cum se leagă temele curriculumului între ele. Apasă un nod pentru a merge la modul sau la termenii relevanți din glosar.</p>'
      + '<div class="map-canvas">'
      + '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">'
      + '<g stroke="var(--accent)" stroke-width=".35" opacity=".4" fill="none">'+lines+'</g></svg>'
      + nodes
      + '</div>';
  }

  /* ---------- render: onboarding view ---------- */
  function renderOnboarding(){
    document.getElementById('view-onboarding').innerHTML =
      '<div class="eyebrow">START RAPID</div>'
      + '<h1 class="page-title">Ce faci acum</h1>'
      + '<p class="page-lede">Trei pași concreți. În sub 2 minute ești în prima lecție.</p>'
      + '<div class="qs-list">'
      + '<div class="qs-step primary">'
      + '<div class="qs-row"><span class="qs-num primary">1</span><div class="qs-title">Deschide Lecția 1.1</div></div>'
      + '<p>Lecția care așază baza pentru tot restul programului.</p>'
      + '<div class="qs-cta"><button class="lift" data-action="goto-lesson" data-lesson="1.1" style="border:none;background:var(--accent);color:#fff;font:600 15px \'Public Sans\',sans-serif;padding:12px 22px;border-radius:10px;cursor:pointer">Începe lecția →</button></div>'
      + '</div>'
      + '<div class="qs-step">'
      + '<div class="qs-row"><span class="qs-num">2</span><div><div class="qs-title" style="margin-bottom:4px">Salvează <button class="tlink" data-action="goto-route" data-route="glosar" style="text-decoration:underline;font:inherit;padding:0">glosarul</button></div>'
      + '<p style="margin:0">Referința pe care o deschizi când întâlnești un termen nou.</p></div></div>'
      + '</div>'
      + '<div class="qs-step">'
      + '<div class="qs-row"><span class="qs-num">3</span><div><div class="qs-title" style="margin-bottom:4px">Explorează <button class="tlink" data-action="goto-route" data-route="map" style="text-decoration:underline;font:inherit;padding:0">harta conceptuală</button></div>'
      + '<p style="margin:0">Vezi cum se leagă temele — util mai ales dacă nu înveți liniar.</p></div></div>'
      + '</div>'
      + '</div>';
  }

  /* ---------- render: resurse view ---------- */
  function renderResurse(){
    var cards = RESOURCES.map(function(r){
      return '<div class="res-card"><h4>'+r.title+'</h4><div style="font:600 12px \'IBM Plex Mono\',monospace;color:var(--faint);margin:-4px 0 8px">'+r.meta+'</div><p>'+r.body+'</p></div>';
    }).join('');
    document.getElementById('view-resurse').innerHTML =
      '<div class="eyebrow">RESURSE RECOMANDATE</div>'
      + '<h1 class="page-title">Resurse externe</h1>'
      + '<p class="page-lede">Puncte de plecare oficiale, gratuite, curate pentru echipă.</p>'
      + '<div class="res-grid">'+cards+'</div>';
  }

  /* ---------- master render ---------- */
  function render(){
    renderHeader();
    renderSidebar();
    ['view-lesson','view-glossary','view-map','view-onboarding','view-resurse'].forEach(function(id){
      document.getElementById(id).style.display = 'none';
    });
    var mainEl = document.getElementById('main-view');
    var showToc = state.route === 'lesson';
    document.getElementById('toc-aside').style.display = showToc ? '' : 'none';
    mainEl.style.maxWidth = state.route==='lesson' ? '800px' : (state.route==='onboarding' ? '760px' : (state.route==='resurse' ? '820px' : '1040px'));

    if(state.route === 'lesson'){ document.getElementById('view-lesson').style.display=''; renderLesson(); renderToc(); }
    else if(state.route === 'glosar'){ document.getElementById('view-glossary').style.display=''; renderGlossary(); }
    else if(state.route === 'map'){ document.getElementById('view-map').style.display=''; renderMap(); }
    else if(state.route === 'onboarding'){ document.getElementById('view-onboarding').style.display=''; renderOnboarding(); }
    else if(state.route === 'resurse'){ document.getElementById('view-resurse').style.display=''; renderResurse(); }

    mainEl.classList.remove('scr'); void mainEl.offsetWidth; mainEl.classList.add('scr');
  }

  /* ---------- actions ---------- */
  function go(route, extra){
    var patch = {route:route};
    if(extra) for(var k in extra) patch[k]=extra[k];
    setState(patch);
    window.scrollTo(0,0);
  }
  function openLesson(id){
    setState({route:'lesson', activeLesson:id});
    window.scrollTo(0,0);
  }

  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-action]');
    if(!el) return;
    var action = el.dataset.action;
    if(action === 'goto-lesson'){ openLesson(el.dataset.lesson); }
    else if(action === 'goto-route'){ go(el.dataset.route); }
    else if(action === 'toggle-module'){
      var id = parseInt(el.dataset.mod,10);
      var mod = MODULES.filter(function(m){return m.id===id;})[0];
      if(mod && mod.available) setState({expandedModule: state.expandedModule===id ? 0 : id});
    }
    else if(action === 'toggle-theme'){
      var next = state.theme==='dark' ? 'light' : 'dark';
      try{ localStorage.setItem('academy_theme', next); }catch(err){}
      setState({theme:next});
    }
    else if(action === 'toggle-save'){
      var lid = el.dataset.lesson;
      var s = {}; s[lid] = !state.saved[lid];
      setState({saved: Object.assign({}, state.saved, s)});
    }
    else if(action === 'toggle-exercise'){
      var elid = el.dataset.lesson;
      var s2 = {}; s2[elid] = !state.exerciseOpen[elid];
      setState({exerciseOpen: Object.assign({}, state.exerciseOpen, s2)});
    }
    else if(action === 'prev-lesson'){
      var cur = findLesson(state.activeLesson);
      if(cur.index > 0) openLesson(cur.module.lessons[cur.index-1].id);
    }
    else if(action === 'next-lesson'){
      var cur2 = findLesson(state.activeLesson);
      if(cur2.index < cur2.module.lessons.length-1) openLesson(cur2.module.lessons[cur2.index+1].id);
    }
    else if(action === 'scroll-toc'){
      var target = el.dataset.target;
      setState({activeToc: target});
      var sec = document.getElementById(target);
      if(sec) window.scrollTo({top: sec.getBoundingClientRect().top + window.scrollY - 88, behavior:'smooth'});
    }
    else if(action === 'filter-cat'){ setState({glossaryCatFilter: el.dataset.cat}); }
    else if(action === 'map-node'){
      var node = MAP_NODES.filter(function(n){return n.id===el.dataset.node;})[0];
      if(!node) return;
      if(node.action.type === 'lesson') openLesson(node.action.lesson);
      else if(node.action.type === 'glosar') go('glosar', {glossaryCatFilter: node.action.cat, q:''});
    }
  });

  /* scroll-spy for TOC (lesson route only) */
  window.addEventListener('scroll', function(){
    if(state.route !== 'lesson') return;
    var best = null, bestTop = -Infinity;
    TOC_SECTIONS.forEach(function(t){
      var el = document.getElementById(t.id);
      if(!el) return;
      var top = el.getBoundingClientRect().top;
      if(top <= 120 && top > bestTop){ bestTop = top; best = t.id; }
    });
    if(best && best !== state.activeToc){ state.activeToc = best; renderToc(); }
  }, {passive:true});

  loadPrefs();
  document.addEventListener('DOMContentLoaded', render);
  if(document.readyState !== 'loading') render();
})();
