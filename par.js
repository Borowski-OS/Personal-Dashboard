/* ============================================================
   PAR written-test prep engine (Flying tab → "FAA written test" card)
   - Question bank: par-bank-*.js (original questions, public) + extra questions pasted into the private sheet (Flying kv par_extra)
   - Figures: par-figs.js (original SVG charts)
   - Retired archive: faa-par.js (the FAA sample set Brad has memorized) — never shown, only counted
   - Progress (seen registry, per-question history, per-area stats, mock results) lives in the PRIVATE sheet, Flying kv tab,
     keys par_seen / par_hist / par_area / par_mocks / par_extra (JSON strings), cached in localStorage lifeos_par.
   Real-test model: 65 questions, 120 minutes, 5 unscored (hidden), scored on 60, pass 70%.
============================================================ */
var PAR = { ready:false, loading:false, tab:'drill', area:'auto', q:null, picked:null, drillQueue:[], mock:null, saveT:null, st:null };
var PAR_FILES = ['par-figs.js?v=2','par-bank-1.js?v=2','par-bank-2.js?v=2','par-bank-3.js?v=2','par-bank-4.js?v=2','par-bank-5.js?v=2','par-bank-6.js?v=2','par-crash.js?v=3','faa-par.js?v=1'];
var PAR_TEST = { n:65, scored:60, unscored:5, minutes:120, pass:70 };
var PAR_AREAS = {
  'I.A':'Pilot qualifications','I.B':'Airworthiness requirements','I.C':'Weather information','I.D':'Cross-country flight planning','I.E':'National Airspace System',
  'I.F':'Performance and limitations','I.G':'Operation of systems','I.H':'Human factors / ADM','II.A':'Preflight assessment','II.B':'Flight deck management','II.C':'Engine starting',
  'II.D':'Taxiing, signs and markings','II.F':'Before takeoff check','III.A':'Communications, light signals, transponder, NTSB','III.B':'Traffic patterns and right-of-way',
  'IV.A':'Normal takeoff and climb','IV.B':'Normal approach and landing','IV.C':'Soft-field takeoff','IV.D':'Soft-field landing','IV.E':'Short-field takeoff','IV.F':'Short-field landing',
  'IV.M':'Forward slip','IV.N':'Go-around','V.A':'Steep turns','V.B':'Ground reference maneuvers','VI.A':'Pilotage and dead reckoning','VI.B':'Navigation systems and radar',
  'VI.C':'Diversion','VI.D':'Lost procedures','VII.A':'Slow flight','VII.B':'Power-off stalls','VII.C':'Power-on stalls','VII.D':'Spin awareness','VIII.A':'Instrument flying basics',
  'VIII.B':'Instrument climbs','VIII.C':'Instrument descents','VIII.D':'Instrument turns','VIII.E':'Unusual attitudes / inadvertent IMC','VIII.F':'Radio, nav and radar on instruments',
  'IX.A':'Emergency descent','IX.B':'Emergency approach and landing','IX.C':'Systems and equipment malfunctions','IX.D':'Emergency equipment and survival gear','XI.A':'Night operations','XII.A':'Postflight procedures' };
/* study pointers: where to go back and learn it (TFP = The Finer Points ground school), and what to drill in Sporty's */
var PAR_STUDY = {
  'I.A':{tfp:'Regulations — pilot certificates, currency and privileges',sp:'Regulations'},'I.B':{tfp:'Regulations — aircraft documents, inspections, ADs, inoperative equipment',sp:'Regulations / Aircraft Systems'},
  'I.C':{tfp:'Weather — theory, then weather services (METAR, TAF, FB, AIRMET/SIGMET, GFA)',sp:'Weather and Weather Services'},'I.D':{tfp:'Navigation and flight planning — fuel, time/UTC, flight plans, VFR cruising altitudes',sp:'Flight Planning / Navigation'},
  'I.E':{tfp:'Airspace — classes, requirements, SUA, TFRs, chart symbols',sp:'Airspace / Sectional Charts'},'I.F':{tfp:'Performance and weight & balance — charts, density altitude, crosswind',sp:'Performance / Weight and Balance'},
  'I.G':{tfp:'Aircraft systems — engine, fuel, electrical, pitot-static, gyros',sp:'Aircraft Systems / Flight Instruments'},'I.H':{tfp:'Aeromedical factors and ADM — hypoxia, illusions, IMSAFE, PAVE, hazardous attitudes',sp:'Aeromedical / Decision Making'},
  'II.A':{tfp:'Preflight inspection and self-assessment',sp:'Preflight'},'II.B':{tfp:'Flight deck management and checklists',sp:'Preflight'},'II.C':{tfp:'Engine starting procedures',sp:'Aircraft Systems'},
  'II.D':{tfp:'Airport operations — signs, markings, lighting, taxi',sp:'Airport Operations'},'III.A':{tfp:'Communications, light signals, transponder, NTSB reporting',sp:'Airport Operations / Regulations'},
  'III.B':{tfp:'Traffic patterns, right-of-way, ATIS/AWOS',sp:'Airport Operations'},'IV.A':{tfp:'Takeoffs and climbs — VX/VY, wind, wake turbulence',sp:'Takeoffs and Landings'},'IV.B':{tfp:'Approaches and landings — stabilized approach, wind shear, crosswind',sp:'Takeoffs and Landings'},
  'IV.C':{tfp:'Soft-field takeoff and ground effect',sp:'Takeoffs and Landings'},'IV.D':{tfp:'Soft-field landing',sp:'Takeoffs and Landings'},'IV.E':{tfp:'Short-field takeoff',sp:'Takeoffs and Landings'},'IV.F':{tfp:'Short-field landing',sp:'Takeoffs and Landings'},
  'IV.M':{tfp:'Forward slips',sp:'Takeoffs and Landings'},'IV.N':{tfp:'Go-arounds',sp:'Takeoffs and Landings'},'V.A':{tfp:'Steep turns and load factor',sp:'Aerodynamics'},'V.B':{tfp:'Ground reference maneuvers',sp:'Maneuvers'},
  'VI.A':{tfp:'Pilotage, dead reckoning, compass errors',sp:'Navigation'},'VI.B':{tfp:'VOR, GPS, transponder and ADS-B, radar services',sp:'Navigation / Radio Navigation'},'VI.C':{tfp:'Diversions',sp:'Navigation'},'VI.D':{tfp:'Lost procedures',sp:'Navigation'},
  'VII.A':{tfp:'Slow flight and the region of reversed command',sp:'Aerodynamics'},'VII.B':{tfp:'Stalls — recognition and recovery',sp:'Aerodynamics'},'VII.C':{tfp:'Power-on stalls',sp:'Aerodynamics'},'VII.D':{tfp:'Spins',sp:'Aerodynamics'},
  'VIII.A':{tfp:'Attitude instrument flying',sp:'Flight Instruments'},'VIII.B':{tfp:'Instrument climbs',sp:'Flight Instruments'},'VIII.C':{tfp:'Instrument descents',sp:'Flight Instruments'},'VIII.D':{tfp:'Instrument turns',sp:'Flight Instruments'},
  'VIII.E':{tfp:'Unusual attitudes and inadvertent IMC',sp:'Flight Instruments / Aeromedical'},'VIII.F':{tfp:'Using ATC and radar when in trouble',sp:'Communications'},'IX.A':{tfp:'Emergency descents and fires',sp:'Emergencies'},'IX.B':{tfp:'Engine failure and forced landings; ELT',sp:'Emergencies'},
  'IX.C':{tfp:'System malfunctions',sp:'Aircraft Systems / Emergencies'},'IX.D':{tfp:'Emergency equipment and survival',sp:'Emergencies'},'XI.A':{tfp:'Night operations — vision, lighting, illusions',sp:'Night Flying'},'XII.A':{tfp:'Postflight and securing',sp:'Preflight / Postflight'} };

/* ---------- loading ---------- */
function parLoadScript(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
function parEnsure(){ if(PAR.ready) return Promise.resolve(); if(PAR.loading) return PAR.loading;
  PAR.loading=PAR_FILES.reduce(function(p,f){ return p.then(function(){ return parLoadScript(f); }); }, Promise.resolve()).then(function(){ PAR.ready=true; PAR.loading=false; }).catch(function(e){ PAR.loading=false; throw e; });
  return PAR.loading; }
function parBank(){ var st=parState(); var extra=[]; try{ extra=JSON.parse(st.extra||'[]'); if(!Array.isArray(extra)) extra=[]; }catch(e){}
  extra=extra.filter(function(q){ return q&&q.id&&q.q&&Array.isArray(q.o)&&q.o.length===3&&q.a>=0&&q.a<3&&q.acs; });
  var seenIds={}; var out=[]; (window.PAR_BANK||[]).concat(extra).forEach(function(q){ if(!seenIds[q.id]){ seenIds[q.id]=1; out.push(q); } }); return out; }
function parArea(q){ return q.acs.split('.').slice(1,3).join('.'); }
function parRetired(){ return (window.FAA_PAR||[]).map(function(r){ return 'FAA-'+r[0]; }); }

/* ---------- state (private sheet + local cache) ---------- */
var PAR_LS='lifeos_par', PAR_KEYS=['par_seen','par_hist','par_area','par_mocks','par_extra'];
function parParse(v,d){ if(v==null||v==='') return d; if(typeof v!=='string') return v; try{ return JSON.parse(v); }catch(e){ return d; } }
function parState(){ if(PAR.st) return PAR.st;
  var f=(typeof kv==='function')?kv('Flying'):{}; var cache=null; try{ cache=JSON.parse(localStorage.getItem(PAR_LS)||'null'); }catch(e){}
  var fromSheet={ seen:parParse(f.par_seen,[]), hist:parParse(f.par_hist,{}), area:parParse(f.par_area,{}), mocks:parParse(f.par_mocks,[]), extra:(typeof f.par_extra==='string')?f.par_extra:JSON.stringify(f.par_extra||[]), t:Number(parParse(f.par_t,0))||0 };
  var st=fromSheet; if(cache&&cache.t&&cache.t>fromSheet.t) st=cache;   // the device cache can be newer than the last sheet sync
  if(!Array.isArray(st.seen)) st.seen=[]; if(!st.hist||typeof st.hist!=='object') st.hist={}; if(!st.area||typeof st.area!=='object') st.area={}; if(!Array.isArray(st.mocks)) st.mocks=[];
  PAR.st=st; return st; }
function parPersist(){ var st=parState(); st.t=Date.now(); try{ localStorage.setItem(PAR_LS, JSON.stringify(st)); }catch(e){}
  if(typeof DATA!=='undefined'&&DATA&&DATA.Flying){ DATA.Flying.par_seen=JSON.stringify(st.seen); DATA.Flying.par_hist=JSON.stringify(st.hist); DATA.Flying.par_area=JSON.stringify(st.area); DATA.Flying.par_mocks=JSON.stringify(st.mocks); DATA.Flying.par_extra=st.extra||'[]'; DATA.Flying.par_t=String(st.t); }
  clearTimeout(PAR.saveT); PAR.saveT=setTimeout(parFlush, 2500); }
function parFlush(){ var st=parState(); if(typeof apiWrite!=='function') return;
  apiWrite({action:'setkv',tab:'Flying',row:JSON.stringify({par_seen:JSON.stringify(st.seen), par_hist:JSON.stringify(st.hist), par_area:JSON.stringify(st.area), par_mocks:JSON.stringify(st.mocks.slice(-30)), par_extra:st.extra||'[]', par_t:String(st.t)})})
    .then(function(r){ var el=document.getElementById('parSync'); if(el) el.textContent=(r&&r.ok)?'saved to your sheet':'sheet save failed — kept on this device'; }).catch(function(){ var el=document.getElementById('parSync'); if(el) el.textContent='offline — kept on this device'; }); }
function parSeenSet(){ var st=parState(); var s={}; st.seen.forEach(function(i){ s[i]=1; }); parRetired().forEach(function(i){ s[i]=1; }); return s; }
function parUnseen(list){ var s=parSeenSet(); return (list||parBank()).filter(function(q){ return !s[q.id]; }); }
function parRecord(q, correct, mode){ var st=parState(); if(st.seen.indexOf(q.id)<0) st.seen.push(q.id);
  var h=st.hist[q.id]||[]; h.push(correct?1:0); st.hist[q.id]=h.slice(-5);
  var a=parArea(q); var ar=st.area[a]||{n:0,r:0}; ar.n++; if(correct) ar.r++; st.area[a]=ar; parPersist(); }
function parAreaStats(){ var st=parState(); var bank=parBank(); var counts={}; bank.forEach(function(q){ var a=parArea(q); counts[a]=counts[a]||{total:0,unseen:0}; counts[a].total++; });
  var s=parSeenSet(); bank.forEach(function(q){ if(!s[q.id]) counts[parArea(q)].unseen++; });
  return Object.keys(counts).sort(parAreaSort).map(function(a){ var ar=st.area[a]||{n:0,r:0}; return {area:a, name:PAR_AREAS[a]||a, total:counts[a].total, unseen:counts[a].unseen, n:ar.n, r:ar.r, pct:ar.n?Math.round(ar.r/ar.n*100):null, weak:ar.n>=5&&ar.r/ar.n<0.85}; }); }
function parAreaSort(a,b){ var R=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']; var pa=a.split('.'), pb=b.split('.'); return (R.indexOf(pa[0])-R.indexOf(pb[0]))||pa[1].localeCompare(pb[1]); }
function parReadiness(){ var st=parState(); var last=st.mocks.slice(-3); if(last.length<3) return {ready:false, why:'take '+(3-last.length)+' more mock test'+(3-last.length===1?'':'s')+' (need 3)'};
  var bad=last.filter(function(m){ return !(m.unseenPct>=85 && m.unseenN>=50); });
  if(bad.length) return {ready:false, why:'last 3 mocks must each score 85%+ on at least 50 unseen questions — '+last.map(function(m){ return (m.unseenPct==null?'—':m.unseenPct+'%'); }).join(' · ')};
  return {ready:true, why:'last 3 mocks: '+last.map(function(m){ return m.unseenPct+'%'; }).join(' · ')+' on unseen questions'}; }

/* ---------- mount / shell ---------- */
function parMount(){ var host=document.getElementById('parHost'); if(!host) return;
  if(!PAR.areaChosen){ try{ var wd=String((kv('Flying')||{}).written_date||'').match(/(\d{4})-(\d{2})-(\d{2})/); if(wd){ var dd=Math.round((new Date(wd[0]+'T12:00:00')-new Date(new Date().toDateString()+' 12:00'))/864e5); if(dd>=0&&dd<=1) PAR.area='crash'; } }catch(e){} }
  if(!PAR.ready){ host.innerHTML='<div class="empty">Loading the question bank…</div>'; parEnsure().then(function(){ PAR.st=null; parDraw(); }).catch(function(){ host.innerHTML='<div class="empty">Couldn’t load the question bank. Check your connection.</div>'; }); return; }
  parDraw(); }
function parDraw(){ var host=document.getElementById('parHost'); if(!host) return;
  var bank=parBank(), unseen=parUnseen(bank).length, st=parState(), rd=parReadiness();
  var tabs=[['drill','Drill'],['mock','Mock test'],['progress','Progress'],['bank','Bank']];
  var head='<div class="par-top"><div class="par-stats">'
    +'<span class="par-stat"><b>'+unseen+'</b> unseen of '+bank.length+'</span>'
    +'<span class="par-stat"><b>'+st.seen.length+'</b> answered · <b>'+parRetired().length+'</b> retired</span>'
    +'<span class="par-stat par-ready '+(rd.ready?'ok':'no')+'" title="'+esc(rd.why)+'">'+(rd.ready?'✓ Ready to test':'Not ready: '+esc(rd.why))+'</span>'
    +'<span class="par-stat par-sync" id="parSync"></span></div>'
    +'<div class="par-tabs">'+tabs.map(function(t){ return '<button class="par-tab'+(PAR.tab===t[0]?' on':'')+'" onclick="parTab(\''+t[0]+'\')">'+t[1]+(t[0]==='mock'&&PAR.mock&&!PAR.mock.done?' ●':'')+'</button>'; }).join('')+'</div></div>';
  var body = PAR.tab==='drill'?parDrillHtml() : PAR.tab==='mock'?parMockHtml() : PAR.tab==='progress'?parProgressHtml() : parBankHtml();
  host.innerHTML=head+'<div id="parBody">'+body+'</div>';
  if(PAR.tab==='mock'&&PAR.mock&&!PAR.mock.done) parTick(); }
function parTab(t){ PAR.tab=t; PAR.picked=null; parDraw(); }

/* ---------- question rendering (shared) ---------- */
function parFigHtml(q){ if(!q.fig||!window.PAR_FIGS||!PAR_FIGS[q.fig]) return ''; var f=PAR_FIGS[q.fig];
  return '<div class="par-fig"><div class="par-fig-h"><span>'+esc(f.title)+'</span><button class="ebtn" onclick="parFigOpen(\''+q.fig+'\')">⤢ Enlarge</button></div>'+f.svg+'</div>'; }
function parFigOpen(id){ var f=PAR_FIGS[id]; if(!f) return; if(typeof faqFigClose==='function') faqFigClose(true);
  var o=document.createElement('div'); o.id='figView'; o.innerHTML='<div class="fv-bar"><b>'+esc(f.title)+'</b><span class="fv-btns"><button onclick="faqFigZoom(-1)">−</button><button onclick="faqFigZoom(1)">＋</button><button class="fv-x" onclick="faqFigClose()">✕ Close</button></span></div><div class="fv-scroll"><div class="par-figbig">'+f.svg+'</div></div>';
  document.body.appendChild(o); document.body.style.overflow='hidden'; try{ history.pushState({fig:1},''); }catch(e){} window.FIGZ=1; }
function parQuestionHtml(q, picked, opts){ opts=opts||{}; var L='ABC';
  var meta='<div class="faq-meta">'+esc(q.acs)+' · '+esc(PAR_AREAS[parArea(q)]||parArea(q))+(opts.meta?' · '+opts.meta:'')+'</div>';
  var body='<div class="faq-card">'+meta+'<div class="faq-q">'+esc(q.q)+'</div>'+parFigHtml(q)
    +'<div class="faq-opts">'+q.o.map(function(o,k){ var cls=''; if(picked!=null&&opts.reveal){ cls=k===q.a?' ok':(k===picked?' bad':' dim'); } else if(picked===k) cls=' sel';
      return '<button class="faq-opt'+cls+'" onclick="'+opts.onpick+'('+k+')"><b>'+L[k]+'</b><span>'+esc(o)+'</span></button>'; }).join('')+'</div>';
  if(picked!=null&&opts.reveal) body+='<div class="faq-why"><b>'+(picked===q.a?'✓ Correct.':'✗ Correct answer: '+L[q.a]+'.')+'</b> '+esc(q.why)+'<div class="par-ref">Reference: '+esc(q.ref)+' · ACS '+esc(q.acs)+'</div></div>';
  return body+'</div>'; }

/* ---------- DRILL ---------- */
/* ---------- CRASH COURSE (test day): NTSB, airspace, stalls/spins/CG, and a few METARs ---------- */
var PAR_SPIN_IDS={'IF-16':1,'IF-17':1,'IF-18':1,'IF-19':1,'IF-21':1,'IF-22':1,'IF-27':1,'IF-28':1,'IF-31':1,'IG-21':1,'II-08':1,'IV-07':1,'IV-16':1,'IV-20':1,'V-01':1,'VII-03':1,'VII-04':1,'VII-05':1,'VII-06':1,'VII-07':1,'VII-08':1,'VII-09':1,'VII-10':1,'VII-11':1,'VII-12':1,'IX-09':1};
var PAR_CRASH_GROUPS=[['ntsb','NTSB'],['spin','Stalls · spins · CG'],['air','Airspace'],['wx','METAR (a few)']];
function parCrashGroup(q){ var id=q.id, acs=q.acs;
  if(/^CC-NTSB/.test(id)||/^PA\.III\.A\.K8/.test(acs)) return 'ntsb';
  if(/^CC-SPIN/.test(id)||PAR_SPIN_IDS[id]||/^PA\.VII\.[BCD]/.test(acs)) return 'spin';
  if(/^CC-AIR/.test(id)||/^PA\.I\.E/.test(acs)) return 'air';
  if(/^PA\.I\.C\.K2a/.test(acs)){ if(!PAR.wxIds) PAR.wxIds=parBank().filter(function(x){ return /^PA\.I\.C\.K2a/.test(x.acs) && !x.fig; }).slice(0,4).map(function(x){ return x.id; }); return PAR.wxIds.indexOf(id)>=0?'wx':null; }
  return null; }
function parCrashSheetHtml(){ var S=window.PAR_CRASH_SHEET||[]; if(!S.length) return '';
  return '<details class="par-sheet"'+(PAR.sheetOpen!==false?' open':'')+' ontoggle="PAR.sheetOpen=this.open"><summary>📋 Crash-course cheat sheet: read this first</summary>'
    +S.map(function(sec){ return '<div class="par-sheet-sec"><div class="par-sheet-h">'+sec[0]+'</div><ul>'+sec[1].map(function(li){ return '<li>'+li+'</li>'; }).join('')+'</ul></div>'; }).join('')+'</details>'; }
function parDrillPool(){ var bank=parBank(); if(PAR.area==='crash') return bank.filter(function(q){ var g=parCrashGroup(q); return g&&(!PAR.crashGroup||g===PAR.crashGroup); });
  if(PAR.area==='auto'){ var weak=parAreaStats().filter(function(a){ return a.weak; }).map(function(a){ return a.area; });
    if(!weak.length){ var least=parAreaStats().filter(function(a){ return a.n>0; }).sort(function(x,y){ return (x.r/x.n)-(y.r/y.n); }).slice(0,3).map(function(a){ return a.area; }); weak=least; }
    var noIfr=bank.filter(function(q){ return !/^PA\.VIII\./.test(q.acs); }); return weak.length?noIfr.filter(function(q){ return weak.indexOf(parArea(q))>=0; }):noIfr; }
  if(PAR.area==='all') return bank; if(PAR.area==='missed'){ var st=parState(); return bank.filter(function(q){ var h=st.hist[q.id]; return h&&h.length&&h[h.length-1]===0; }); }
  return bank.filter(function(q){ return parArea(q)===PAR.area; }); }
function parDrillNext(){ var pool=parDrillPool(); if(!pool.length){ PAR.q=null; return; }
  if(PAR.area==='crash'&&!PAR.crashGroup){ var order=['ntsb','spin','air','ntsb','spin','air','wx']; PAR.crashN=(PAR.crashN||0); var g=order[PAR.crashN%order.length]; PAR.crashN++;
    var sub=pool.filter(function(q){ return parCrashGroup(q)===g; }); if(sub.length) pool=sub; }
  var st=parState(), s=parSeenSet(); var unseen=pool.filter(function(q){ return !s[q.id]; });
  var pick; if(unseen.length) pick=unseen[Math.floor(Math.random()*unseen.length)];
  else { // all seen: prefer last-missed, then least-answered
    var missed=pool.filter(function(q){ var h=st.hist[q.id]; return h&&h[h.length-1]===0; }); var cand=missed.length?missed:pool;
    cand=cand.slice().sort(function(a,b){ return (st.hist[a.id]||[]).length-(st.hist[b.id]||[]).length; }).slice(0,Math.max(5,Math.ceil(cand.length/4))); pick=cand[Math.floor(Math.random()*cand.length)]; }
  PAR.q=pick; PAR.picked=null; }
function parDrillHtml(){ var stats=parAreaStats(); if(!PAR.q) parDrillNext();
  var st=parState(); var missedN=parBank().filter(function(q){ var h=st.hist[q.id]; return h&&h[h.length-1]===0; }).length;
  var crashChips=PAR.area==='crash'?'<div class="faq-chips par-crash-sub">'+[['','Mix all four']].concat(PAR_CRASH_GROUPS).map(function(g){ var n=parBank().filter(function(q){ var cg=parCrashGroup(q); return cg&&(!g[0]||cg===g[0]); }).length; return '<button class="faq-chip'+((PAR.crashGroup||'')===g[0]?' on':'')+'" onclick="parCrashSet(\''+g[0]+'\')">'+g[1]+' <small>'+n+'</small></button>'; }).join('')+'</div>':'';
  var chips='<div class="faq-chips"><button class="faq-chip crash'+(PAR.area==='crash'?' on':'')+'" onclick="parSetArea(\'crash\')">🎯 Crash course</button><button class="faq-chip'+(PAR.area==='auto'?' on':'')+'" onclick="parSetArea(\'auto\')">Weakest areas</button><button class="faq-chip'+(PAR.area==='all'?' on':'')+'" onclick="parSetArea(\'all\')">All</button>'
    +(missedN?'<button class="faq-chip'+(PAR.area==='missed'?' on':'')+'" onclick="parSetArea(\'missed\')">Missed ('+missedN+')</button>':'')
    +(PAR.area==='crash'?'':stats.map(function(a){ return '<button class="faq-chip'+(PAR.area===a.area?' on':'')+(a.weak?' weak':'')+'" onclick="parSetArea(\''+a.area+'\')" title="'+esc(a.name)+'">'+a.area+(a.pct!=null?' '+a.pct+'%':'')+' <small>'+a.unseen+' new</small></button>'; }).join(''))+'</div>'+crashChips+(PAR.area==='crash'?parCrashSheetHtml():'');
  if(!PAR.q) return chips+'<div class="empty">Nothing in this selection. Pick another area or add questions on the Bank tab.</div>';
  var pool=parDrillPool(), un=parUnseen(pool).length; var seenFlag=parSeenSet()[PAR.q.id]?'review (seen before)':'new';
  var body=parQuestionHtml(PAR.q, PAR.picked, {reveal:true, onpick:'parPick', meta:seenFlag+' · '+un+' unseen in this selection'});
  if(PAR.picked!=null) body+='<div style="text-align:right;margin-top:10px"><button class="ebtn pri" onclick="parNext()">Next →</button></div>';
  return chips+body; }
function parSetArea(a){ PAR.area=a; PAR.areaChosen=true; if(a!=='crash') PAR.crashGroup=''; PAR.q=null; PAR.picked=null; parDraw(); }
function parCrashSet(g){ PAR.crashGroup=g; PAR.q=null; PAR.picked=null; parDraw(); }
function parPick(k){ if(PAR.picked!=null||!PAR.q) return; PAR.picked=k; parRecord(PAR.q, k===PAR.q.a, 'drill'); var b=document.getElementById('parBody'); if(b) b.innerHTML=parDrillHtml(); }
function parNext(){ parDrillNext(); parDraw(); }

/* ---------- MOCK TEST ---------- */
var PAR_MOCK_LS='lifeos_par_mock';
function parMockLoad(){ if(PAR.mock) return PAR.mock; try{ var m=JSON.parse(localStorage.getItem(PAR_MOCK_LS)||'null'); if(m&&m.ids&&!m.done) PAR.mock=m; }catch(e){} return PAR.mock; }
function parMockSave(){ try{ if(PAR.mock) localStorage.setItem(PAR_MOCK_LS, JSON.stringify(PAR.mock)); else localStorage.removeItem(PAR_MOCK_LS); }catch(e){} }
function parShuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function parMockStart(){ var bank=parBank(), s=parSeenSet(); var unseen=parShuffle(bank.filter(function(q){ return !s[q.id]; })), seen=parShuffle(bank.filter(function(q){ return s[q.id]; }));
  // mirror the real test's emphasis: sample in proportion to the bank (which is weighted toward Area I, ADM and critical phases),
  // but cap any one area at 20% of the test so a big area cannot crowd out the rest
  var cap=Math.ceil(PAR_TEST.n*0.2), perA={}, pickU=[], leftover=[];
  unseen.forEach(function(q){ var a=parArea(q); if(pickU.length<PAR_TEST.n && (perA[a]||0)<cap){ perA[a]=(perA[a]||0)+1; pickU.push(q); } else leftover.push(q); });
  while(pickU.length<PAR_TEST.n && leftover.length) pickU.push(leftover.shift());
  var ids=pickU.map(function(q){ return q.id; }); var i=0; while(ids.length<PAR_TEST.n && i<seen.length){ ids.push(seen[i++].id); }
  if(ids.length<PAR_TEST.n){ alert('The bank has only '+ids.length+' questions available. Add more on the Bank tab to run a full 65-question mock.'); }
  parShuffle(ids); var unscored=parShuffle(ids.slice()).slice(0,PAR_TEST.unscored);
  PAR.mock={ ids:ids, unscored:unscored, answers:{}, flags:{}, i:0, start:Date.now(), end:Date.now()+PAR_TEST.minutes*60e3, done:false, unseenIds:ids.filter(function(id){ return !s[id]; }) };
  parMockSave(); PAR.tab='mock'; parDraw(); }
function parMockQ(id){ var b=parBank(); for(var i=0;i<b.length;i++) if(b[i].id===id) return b[i]; return null; }
function parMockHtml(){ var m=parMockLoad();
  if(!m){ var un=parUnseen().length; return '<div class="par-intro"><h3>Full mock test</h3><p>'+PAR_TEST.n+' questions, '+PAR_TEST.minutes+' minutes, three answer options. '+PAR_TEST.unscored+' of the questions are unscored trial items you can’t identify; your score is on the other '+PAR_TEST.scored+'. Passing is '+PAR_TEST.pass+'%. Questions are drawn from unseen questions first ('+un+' available) across all ACS areas; figures are shown with the question, as on the real test.</p>'
      +'<p class="foot">The timer keeps running if you leave the page. When time is up, or when you submit, you get a score report with the ACS codes you missed.</p><button class="ebtn pri" onclick="parMockStart()">Start a mock test</button></div>'+parMockHistoryHtml(); }
  if(m.done) return parReportHtml(m)+'<div style="margin-top:14px"><button class="ebtn pri" onclick="parMockClear()">Done — back to the summary</button></div>';
  var q=parMockQ(m.ids[m.i]); if(!q){ return '<div class="empty">Question missing — the bank changed. <button class="ebtn" onclick="parMockClear()">Discard this test</button></div>'; }
  var picked=m.answers[q.id];
  var grid='<div class="par-grid">'+m.ids.map(function(id,i){ var c=(i===m.i?' cur':'')+(m.answers[id]!=null?' done':'')+(m.flags[id]?' flag':''); return '<button class="par-cell'+c+'" onclick="parMockGo('+i+')">'+(i+1)+'</button>'; }).join('')+'</div>';
  var bar='<div class="par-bar"><span class="par-timer" id="parTimer">'+parClock(m.end-Date.now())+'</span><span>Question '+(m.i+1)+' of '+m.ids.length+' · '+Object.keys(m.answers).length+' answered</span>'
    +'<span class="par-navbtns"><button class="ebtn" onclick="parMockGo('+(m.i-1)+')"'+(m.i===0?' disabled':'')+'>← Prev</button><button class="ebtn'+(m.flags[q.id]?' pri':'')+'" onclick="parMockFlag()">⚑ Flag</button><button class="ebtn" onclick="parMockGo('+(m.i+1)+')"'+(m.i>=m.ids.length-1?' disabled':'')+'>Next →</button><button class="ebtn danger" onclick="parMockSubmit(false)">Submit test</button></span></div>';
  return bar+parQuestionHtml(q, picked, {reveal:false, onpick:'parMockPick', meta:'mock test'})+grid; }
function parClock(ms){ ms=Math.max(0,ms); var m=Math.floor(ms/60000), s=Math.floor(ms/1000)%60; return m+':'+(s<10?'0':'')+s; }
function parTick(){ clearInterval(PAR.timer); PAR.timer=setInterval(function(){ var m=PAR.mock; var el=document.getElementById('parTimer'); if(!m||m.done||!el){ clearInterval(PAR.timer); return; } var left=m.end-Date.now(); el.textContent=parClock(left); el.classList.toggle('low', left<10*60e3); if(left<=0){ clearInterval(PAR.timer); parMockSubmit(true); } }, 1000); }
function parMockPick(k){ var m=PAR.mock; if(!m||m.done) return; var id=m.ids[m.i]; m.answers[id]=k; parMockSave(); var b=document.getElementById('parBody'); if(b) b.innerHTML=parMockHtml(); }
function parMockGo(i){ var m=PAR.mock; if(!m) return; m.i=Math.max(0,Math.min(m.ids.length-1,i)); parMockSave(); var b=document.getElementById('parBody'); if(b) b.innerHTML=parMockHtml(); }
function parMockFlag(){ var m=PAR.mock; var id=m.ids[m.i]; m.flags[id]=!m.flags[id]; parMockSave(); var b=document.getElementById('parBody'); if(b) b.innerHTML=parMockHtml(); }
function parMockSubmit(auto){ var m=PAR.mock; if(!m||m.done) return; var left=Object.keys(m.answers).length;
  if(!auto && left<m.ids.length && !confirm((m.ids.length-left)+' question'+(m.ids.length-left===1?'':'s')+' unanswered (they count as wrong). Submit anyway?')) return;
  clearInterval(PAR.timer); var scoredIds=m.ids.filter(function(id){ return m.unscored.indexOf(id)<0; }); var right=0, missed=[], unseenRight=0, unseenN=0; var areaR={};
  m.ids.forEach(function(id){ var q=parMockQ(id); if(!q) return; var ok=m.answers[id]===q.a; parRecord(q, ok, 'mock');
    var scored=scoredIds.indexOf(id)>=0; if(scored){ if(ok) right++; else missed.push({id:id, acs:q.acs, area:parArea(q)}); }
    if(m.unseenIds.indexOf(id)>=0 && scored){ unseenN++; if(ok) unseenRight++; }
    var a=parArea(q); areaR[a]=areaR[a]||{n:0,r:0}; areaR[a].n++; if(ok) areaR[a].r++; });
  var pct=Math.round(right/scoredIds.length*100); var unseenPct=unseenN?Math.round(unseenRight/unseenN*100):null;
  m.done=true; m.result={ d:new Date().toISOString().slice(0,10), score:pct, right:right, scored:scoredIds.length, unseenN:unseenN, unseenPct:unseenPct, missed:missed, minutes:Math.round((Date.now()-m.start)/60000), pass:pct>=PAR_TEST.pass, areaR:areaR, auto:!!auto };
  var st=parState(); st.mocks.push({ d:m.result.d, score:pct, unseenN:unseenN, unseenPct:unseenPct, pass:m.result.pass, missed:missed.map(function(x){ return x.acs; }), minutes:m.result.minutes }); parPersist(); parMockSave(); parDraw(); }
function parMockClear(){ PAR.mock=null; parMockSave(); parDraw(); }
function parReportHtml(m){ var r=m.result; var byArea={}; r.missed.forEach(function(x){ (byArea[x.area]=byArea[x.area]||[]).push(x.acs); });
  var codes=Object.keys(byArea).sort(parAreaSort).map(function(a){ var uniq=byArea[a].filter(function(c,i,arr){ return arr.indexOf(c)===i; }); return '<div class="par-miss"><b>'+a+' '+esc(PAR_AREAS[a]||'')+'</b><div class="foot">'+uniq.map(function(c){ return '<code>'+esc(c)+'</code>'; }).join(' ')+'</div>'+(PAR_STUDY[a]?'<div class="par-pointer">Review in TFP: '+esc(PAR_STUDY[a].tfp)+' · Drill in Sporty’s: '+esc(PAR_STUDY[a].sp)+'</div>':'')+'</div>'; }).join('');
  var areas=Object.keys(r.areaR).sort(parAreaSort).map(function(a){ var x=r.areaR[a]; return '<span class="par-stat">'+a+' '+x.r+'/'+x.n+'</span>'; }).join('');
  return '<div class="par-report"><div class="par-score '+(r.pass?'pass':'fail')+'"><div class="par-score-n">'+r.score+'%</div><div><b>'+(r.pass?'PASS':'FAIL')+'</b> · '+r.right+' of '+r.scored+' scored questions'+(r.unseenPct!=null?' · <b>'+r.unseenPct+'%</b> on '+r.unseenN+' unseen':'')+' · '+r.minutes+' min'+(r.auto?' · time expired':'')+'</div></div>'
    +'<h4>Knowledge test report — ACS codes missed</h4>'+(codes||'<div class="foot">No scored questions missed.</div>')
    +'<h4>By area</h4><div class="par-stats">'+areas+'</div>'
    +'<details class="faq-more"><summary>Review every question</summary>'+m.ids.map(function(id,i){ var q=parMockQ(id); if(!q) return ''; var a=m.answers[id]; return '<div class="par-rev '+(a===q.a?'ok':'bad')+'"><div class="faq-meta">'+(i+1)+' · '+esc(q.acs)+(m.unscored.indexOf(id)>=0?' · unscored':'')+'</div>'+parQuestionHtml(q, a==null?-1:a, {reveal:true, onpick:'void'})+'</div>'; }).join('')+'</details></div>'; }
function parMockHistoryHtml(){ var st=parState(); if(!st.mocks.length) return ''; var last=st.mocks.slice(-6).reverse();
  return '<div class="section-title" style="margin-top:18px">Recent mock tests</div>'+last.map(function(m){ return '<div class="kv-row"><span class="k">'+esc(m.d)+' · '+m.minutes+' min'+(m.unseenPct!=null?' · '+m.unseenPct+'% on '+m.unseenN+' unseen':'')+'</span><span class="v" style="color:var('+(m.pass?'--green':'--red')+')">'+m.score+'% '+(m.pass?'pass':'fail')+'</span></div>'; }).join(''); }

/* ---------- PROGRESS ---------- */
function parProgressHtml(){ var stats=parAreaStats(), rd=parReadiness(), st=parState();
  var rows=stats.map(function(a){ var pct=a.pct; return '<div class="par-row'+(a.weak?' weak':'')+'"><div class="par-row-h"><span><b>'+a.area+'</b> '+esc(a.name)+'</span><span>'+(pct==null?'<span class="foot">not yet drilled</span>':'<b>'+pct+'%</b> <span class="foot">'+a.r+'/'+a.n+'</span>')+(a.weak?' <span class="tag blocked">under 85%</span>':'')+' <span class="foot">· '+a.unseen+' unseen of '+a.total+'</span></span></div>'
      +'<div class="bar"><span style="width:'+(pct==null?0:pct)+'%;background:var('+(a.weak?'--red':'--green')+')"></span></div>'
      +(a.weak&&PAR_STUDY[a.area]?'<div class="par-pointer">Understand it in TFP: '+esc(PAR_STUDY[a.area].tfp)+' · then drill Sporty’s: '+esc(PAR_STUDY[a.area].sp)+'</div>':'')+'</div>'; }).join('');
  var mocks=st.mocks.slice(-10).reverse().map(function(m){ return '<div class="kv-row"><span class="k">'+esc(m.d)+(m.unseenPct!=null?' · '+m.unseenPct+'% on '+m.unseenN+' unseen':'')+(m.missed&&m.missed.length?' · missed '+m.missed.length:'')+'</span><span class="v" style="color:var('+(m.pass?'--green':'--red')+')">'+m.score+'%</span></div>'; }).join('')||'<div class="empty">No mock tests yet.</div>';
  return '<div class="par-ready-box '+(rd.ready?'ok':'no')+'"><b>'+(rd.ready?'Ready to test.':'Not ready to test yet.')+'</b> '+esc(rd.why)+'<div class="foot">Rule: the last 3 mock tests must each score 85% or better on at least 50 unseen questions. Areas under 85% are flagged.</div></div>'
    +'<div class="section-title">Accuracy by ACS area</div>'+rows+'<div class="section-title" style="margin-top:16px">Mock test history</div>'+mocks
    +'<div class="foot" style="margin-top:14px">Progress is saved to the Flying tab of your private sheet (keys par_seen, par_hist, par_area, par_mocks) and cached on this device. <button class="linkbtn" onclick="parReset()">reset all progress</button></div>'; }
function parReset(){ if(!confirm('Erase all test-prep progress (seen list, history, mock results) on the sheet and this device?')) return; var st=parState(); st.seen=[]; st.hist={}; st.area={}; st.mocks=[]; PAR.mock=null; parMockSave(); parPersist(); parFlush(); PAR.q=null; parDraw(); }

/* ---------- BANK (counts, add questions) ---------- */
function parBankHtml(){ var stats=parAreaStats(); var st=parState(); var extra=[]; try{ extra=JSON.parse(st.extra||'[]'); }catch(e){}
  var dist=stats.map(function(a){ return '<span class="par-stat"><b>'+a.area+'</b> '+a.total+' <span class="foot">('+a.unseen+' unseen)</span></span>'; }).join('');
  return '<div class="section-title">Question bank</div><div class="par-stats">'+dist+'</div>'
    +'<div class="kv-row"><span class="k">Original questions in the dashboard</span><span class="v">'+(window.PAR_BANK||[]).length+'</span></div>'
    +'<div class="kv-row"><span class="k">Extra questions added from the sheet (par_extra)</span><span class="v">'+extra.length+'</span></div>'
    +'<div class="kv-row"><span class="k">Retired (FAA sample set you have memorized — never shown)</span><span class="v">'+parRetired().length+'</span></div>'
    +'<div class="section-title" style="margin-top:18px">Add more questions</div><p class="foot">When the unseen pool runs low: copy the generator prompt, paste it into a Claude chat, then paste the JSON it returns below. New questions are stored in your private sheet and merged into the bank; they are checked for the right shape and for IDs you already have.</p>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button class="ebtn" onclick="parCopyPrompt()">Copy generator prompt</button><span class="foot" id="parPromptMsg"></span></div>'
    +'<textarea id="parAdd" placeholder="Paste a JSON array of questions here…" style="width:100%;min-height:110px;font:12.5px Menlo,monospace;background:#111419;color:var(--text);border:1px solid var(--card-border-2);border-radius:8px;padding:8px"></textarea>'
    +'<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><button class="ebtn pri" onclick="parAddQuestions()">Add to bank</button><span class="foot" id="parAddMsg"></span></div>'; }
function parCopyPrompt(){ var st=parState(); var seenTopics=parBank().map(function(q){ return q.id+' '+q.acs+': '+q.q.slice(0,90); }).join('\n');
  var p='Write 40 NEW, ORIGINAL FAA Private Pilot Airplane (PAR) knowledge-test questions in FAA style for a dashboard question bank. Rules: 3 options (A/B/C), one correct; scenario-based where possible; weight toward ADM/risk management, taxi/takeoff/landing, airspace, weather products, and performance; plausible close distractors; hold to the precise FAA answer; NO copying from FAA sample questions, the PSI sample test, Sporty’s, The Finer Points, Gleim, King, Sheppard Air or other commercial products; do not reuse the scenarios below (same scenario/numbers/answer = same question). Each question must have: id (format "X-NNN", unique), acs (a real FAA-S-ACS-6C knowledge element code like PA.I.E.K1), k (one of recall|scenario|calc), q, o (array of 3 strings), a (index 0-2 of the correct option, vary it), why (why the right answer is right and why each distractor is wrong), ref (14 CFR section, PHAK chapter, AIM paragraph, or AFH chapter). Output ONLY a JSON array.\n\nQuestions already in the bank (do not duplicate these):\n'+seenTopics;
  var msg=document.getElementById('parPromptMsg'); try{ navigator.clipboard.writeText(p).then(function(){ if(msg) msg.textContent='Prompt copied ('+Math.round(p.length/1000)+'k characters).'; }); }catch(e){ if(msg) msg.textContent='Could not copy — select and copy from the console.'; console.log(p); } }
function parAddQuestions(){ var ta=document.getElementById('parAdd'), msg=document.getElementById('parAddMsg'); var txt=(ta&&ta.value||'').trim(); if(!txt){ if(msg) msg.textContent='Paste a JSON array first.'; return; }
  var arr; try{ arr=JSON.parse(txt); }catch(e){ var m=txt.match(/\[[\s\S]*\]/); try{ arr=JSON.parse(m?m[0]:''); }catch(e2){ if(msg) msg.textContent='That is not valid JSON.'; return; } }
  if(!Array.isArray(arr)){ if(msg) msg.textContent='Expected a JSON array.'; return; }
  var have={}; parBank().forEach(function(q){ have[q.id]=1; }); var st=parState(); var extra=[]; try{ extra=JSON.parse(st.extra||'[]'); if(!Array.isArray(extra)) extra=[]; }catch(e){ extra=[]; }
  var added=0, skipped=[]; arr.forEach(function(q){ var ok=q&&q.id&&q.q&&Array.isArray(q.o)&&q.o.length===3&&typeof q.a==='number'&&q.a>=0&&q.a<3&&q.acs&&/^PA\.[IVX]+\.[A-Z]\.K\d+[a-z]?$/.test(q.acs)&&q.why&&q.ref;
    if(!ok){ skipped.push((q&&q.id)||'?'); return; } if(have[q.id]){ skipped.push(q.id+' (duplicate id)'); return; } have[q.id]=1; extra.push({id:String(q.id),acs:q.acs,k:q.k||'scenario',q:String(q.q),o:q.o.map(String),a:q.a,why:String(q.why),ref:String(q.ref)}); added++; });
  var json=JSON.stringify(extra); if(json.length>45000){ if(msg) msg.textContent='Too many extra questions for one sheet cell (limit ~45k characters). Ask Claude to move some into a par-bank file instead.'; return; }
  st.extra=json; parPersist(); parFlush(); if(ta) ta.value=''; if(msg) msg.textContent='Added '+added+' question'+(added===1?'':'s')+(skipped.length?' · skipped '+skipped.length+': '+skipped.slice(0,5).join(', '):'')+'.'; parDraw(); }

/* keyboard: A/B/C answer, Enter/→ next (drill) or next question (mock) */
document.addEventListener('keydown', function(e){
  if(!document.getElementById('parHost')||/input|textarea|select/i.test((e.target||{}).tagName||'')) return;
  var k=e.key.toUpperCase();
  if(PAR.tab==='drill'){ if(PAR.picked==null && 'ABC'.indexOf(k)>=0 && k.length===1){ parPick('ABC'.indexOf(k)); } else if(PAR.picked!=null && (e.key==='ArrowRight'||e.key==='Enter')){ e.preventDefault(); parNext(); } }
  else if(PAR.tab==='mock'&&PAR.mock&&!PAR.mock.done){ if('ABC'.indexOf(k)>=0 && k.length===1) parMockPick('ABC'.indexOf(k)); else if(e.key==='ArrowRight') parMockGo(PAR.mock.i+1); else if(e.key==='ArrowLeft') parMockGo(PAR.mock.i-1); }
});
