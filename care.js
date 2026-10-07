/* ============================================================
   Find care — "who do I go to, what are my options, what will it cost"
   Plan rules below are copied from the plan documents (public plan info, HIOS 41094NV0060009).
   Personal numbers (member IDs, deductible used so far, PCP) come from the private Health tab of the sheet.
   In-network practices come from care/providers.json, parsed from the Renown HMO Provider Directory (10/26 edition).
   Every answer names its source so it can be checked.
============================================================ */
var CARE = { need:null, city:'near', spec:'', q:'', db:null, loading:false };
var CARE_PLAN = {
  name:'AHP Renown Platinum HMO', carrier:'Hometown Health (Renown Health Plan)', hios:'41094NV0060009',
  ded:{ind:500, fam:1000}, oop:{ind:4500, fam:9000},
  src:{ sob:'Schedule of Benefits 2026', sbc:'Summary of Benefits & Coverage (11/1/2026–10/31/2027)', dir:'Renown HMO Provider Directory, 10/26 edition',
        mychart:'MyChart benefit overview', dental:'UHC Voluntary Options PPO 20 summary (P9058)', vsp:'VSP Signature plan summary', doctoroo:'Doctoroo flyer', rx:'Renown Pharmacy & Optum Rx flyers' },
  links:{ directory:'https://apps.hometownhealth.com/onlineproviderdirectory/en', directories:'https://www.hometownhealth.com/provider_directories/',
          telehealth:'https://www.hometownhealth.com/telehealth/', mychart:'https://mychart.hometownhealth.com',
          formulary:'https://www.hometownhealth.com/pharmacy-services/drug-formularies/', pharmacies:'https://www.hometownhealth.com/pharmacy-services/pharmacy-networks/',
          optum:'https://www.optumrx.com', renownPrice:'https://www.renown.org/Patients-and-Visitors/Billing/Pricing-Transparency',
          ctPrice:'https://www.carsontahoe.com/price-transparency.html', uhcDental:'https://www.myuhc.com', vsp:'https://www.vsp.com', doctoroo:'https://doctoroo.com' },
  phones:{ hth:'775-982-3232', hthToll:'800-336-0123', renownEst:'775-982-3993', ctEst:'775-445-8545', doctoroo:'888-888-9930', teladoc:'800-835-2362', renownRx:'775-982-5280' }
};
/* ranking: home first, then work, then the airport side of the valley */
var CARE_CITY_RANK = { 'Carson City':0, 'Reno':1, 'Sparks':1, 'Minden':2, 'Gardnerville':2, 'Dayton':3, 'Fernley':4, 'Silver Springs':4, 'Yerington':5, 'Fallon':5 };
var CARE_CITY_SETS = { near:['Carson City','Reno','Sparks','Minden','Gardnerville','Dayton'], carson:['Carson City'], reno:['Reno','Sparks'], valley:['Minden','Gardnerville'], all:null };

/* ---- the needs: cost rows + where to look + what to double-check ---- */
var CARE_NEEDS = [
  { id:'sick', label:'Sick or hurt (not an emergency)', icon:'🤒',
    cost:[ {what:'Teladoc virtual visit (general medicine, 24/7)', you:'$0', src:'sob:6 — "General Med Urgent Care by Teladoc $0/visit, deductible does not apply"'},
           {what:'Primary care sick visit', you:'$10 copay', src:'sob:3'},
           {what:'Doctoroo house call (urgent care at home, 7am–midnight)', you:'$20 copay', src:'sob:5 "Mobile Urgent Care $20/visit" + Doctoroo flyer "same price as your urgent care copay"'},
           {what:'Urgent care center', you:'$20 copay', src:'sob:5'},
           {what:'Emergency room (non-emergency use)', you:'Deductible, then $200', src:'sob:5 — avoid for things urgent care can handle'} ],
    extra:[ {name:'Teladoc', detail:'Phone or video, any hour. Prescriptions sent to your pharmacy.', phone:'800-835-2362', url:'telehealth', cost:'$0', why:'cheapest and fastest'},
            {name:'Doctoroo house call', detail:'A clinician comes to the house, 7am–midnight, 365 days. Illness, respiratory, ENT, eye, wound care, musculoskeletal.', phone:'888-888-9930', url:'doctoroo', cost:'$20', why:'no waiting room'},
            {name:'Your PCP', detail:'pcp', cost:'$10', why:'knows your history'} ],
    specs:['Urgent Care'], pcp:true,
    verify:['Urgent care is $20 only at in-network centers (list below). Out-of-network urgent care is not covered. (SBC)',
            'If symptoms are life-threatening, go to the ER or call 911 — any ER counts in an emergency.'] },
  { id:'er', label:'Emergency', icon:'🚨',
    cost:[ {what:'Emergency room', you:'Deductible, then $200 copay — waived if you are admitted', src:'sob:5'},
           {what:'Ambulance (ground, air, water)', you:'$200 copay, deductible does not apply', src:'sob:5'},
           {what:'Out-of-network ER', you:'Same $200 copay after deductible', src:'sbc:8'} ],
    specs:['Acute Care Hospital'],
    verify:['Call 911 for anything life-threatening. Emergency care is covered at any hospital.',
            'After the visit, the plan may ask for records to confirm it was an emergency — keep discharge papers.'] },
  { id:'pcp', label:'Checkup / primary care', icon:'🩺',
    cost:[ {what:'Annual physical, screenings, immunizations', you:'$0 (1 physical per calendar year)', src:'sob:4 + MyChart'},
           {what:'Office visit for an injury or illness', you:'$10 copay', src:'sob:3'},
           {what:'Physician-to-physician eConsult', you:'$20', src:'sob:3'},
           {what:'Allergy testing', you:'$0', src:'sob:6'} ],
    extra:[ {name:'Your PCP', detail:'pcp', cost:'$10', why:'your designated HMO doctor'} ],
    specs:['Family Medicine','Internal Medicine','Geriatric Medicine - Family Medicine'], pcp:true,
    verify:['HMO rule: adults must have a Renown-network PCP on file (Renown, Alpine Family Medicine, Virginia Family Care Center or Reno Family Physician). (sob:2)',
            'No referral is required to see a specialist on this plan. (sob:2)',
            'Ask the office to code a physical as preventive — anything flagged as a problem visit becomes a $10 copay.'] },
  { id:'spec', label:'See a specialist', icon:'👩‍⚕️',
    cost:[ {what:'Specialist office visit', you:'$20 copay, deductible does not apply', src:'sob:3'},
           {what:'Dermatology by Teladoc', you:'$20', src:'sob:7'},
           {what:'OB-GYN', you:'$20 (no prior authorization needed)', src:'sbc:8'} ],
    specs:'picker',
    verify:['No referral needed, but some services the specialist orders need prior authorization (imaging, surgery, therapy). (sob:2, sbc:8–9)',
            'Confirm the office still takes Renown HMO before booking: 775-982-3232.'] },
  { id:'lab', label:'Lab work / blood tests', icon:'🧪',
    cost:[ {what:'Outpatient lab (blood work, cultures)', you:'$0', src:'sob:4 "Laboratory Outpatient and Professional Services — No Cost"'} ],
    specs:['Lab'], hospitalsToo:true,
    verify:['Use an in-network draw site (below). Out-of-network lab is 100% yours. (sbc:8)',
            'Hospital-based labs (Carson Tahoe, Renown) are in network and still $0.'] },
  { id:'img', label:'X-ray / imaging', icon:'🩻',
    cost:[ {what:'X-ray or diagnostic imaging', you:'$20 copay', src:'sob:4'},
           {what:'MRI, CT or PET scan', you:'$250 per visit, deductible does not apply', src:'sob:4'},
           {what:'Mammogram (screening)', you:'$0 as preventive care', src:'sob:4'} ],
    specs:['Diagnostic Radiology','Mammography Screening Center'], hospitalsToo:true,
    verify:['MRI/CT/PET need prior authorization from Hometown Health — the ordering doctor requests it. Without it: reduced or no benefit. (sbc:8)',
            'The copay is fixed, so the facility choice is about convenience, not price.'] },
  { id:'pt', label:'Physical therapy / rehab', icon:'🏃',
    cost:[ {what:'Physical or occupational therapy', you:'Deductible first, then $20 per visit (120 visits/yr)', src:'sob:4', ded:true},
           {what:'Speech therapy', you:'Deductible first, then $20 per visit', src:'sob:4', ded:true},
           {what:'Chiropractic (see its own tab)', you:'$20, no deductible', src:'sob:6'} ],
    specs:['Physical Therapy','Phys Med And Rehab','Occupational Therapist','Sports Medicine','Speech Therapy'],
    verify:['Prior authorization required. (sbc:9)',
            'Until the deductible is met you pay the plan\'s negotiated rate per visit — ask the clinic for the Hometown Health rate before the first visit.'] },
  { id:'chiro', label:'Chiropractor', icon:'🦴',
    cost:[ {what:'Chiropractic / spinal manipulation', you:'$20 copay, 20 visits per calendar year', src:'sob:6'} ],
    specs:['Chiropractic'],
    verify:['20-visit yearly cap is for medically necessary care; maintenance adjustments are excluded. (sbc:10)'] },
  { id:'mind', label:'Mental health / counseling', icon:'🧠',
    cost:[ {what:'Therapy or psychiatry office visit', you:'$10 copay', src:'sob:4'},
           {what:'Mental health by Teladoc', you:'$20', src:'sob:7'},
           {what:'Intensive outpatient / partial hospitalization', you:'$10 per visit (prior auth)', src:'sob:4, sbc:9'},
           {what:'Inpatient stay', you:'$2,000 per stay (prior auth)', src:'sob:5'} ],
    specs:['Counselor Professional','Psychologist','Licensed Clinical Social Worker','Marriage & Family Therapist','Psychiatry & Neurology Psychiatry','Mental Health Clinic/Center'],
    verify:['Office visits need no referral or prior auth; programs and inpatient care do. (sbc:9)'] },
  { id:'rx', label:'Prescriptions', icon:'💊',
    cost:[ {what:'Tier 1 generic (30-day)', you:'$10', src:'sob:7'}, {what:'Tier 2 preferred brand', you:'$30', src:'sob:7'},
           {what:'Tier 3 non-preferred brand', you:'$50', src:'sob:7'}, {what:'Tier 4 specialty', you:'20% coinsurance', src:'sob:7'},
           {what:'90-day supply by mail (Optum Home Delivery)', you:'2× the 30-day copay (one month free)', src:'sob:7'},
           {what:'90-day supply at retail or Renown Pharmacy', you:'3× the 30-day copay', src:'sob:7'} ],
    extra:[ {name:'Renown Pharmacy — Pringle Way (open 24/7)', detail:'75 Pringle Way, Reno', phone:'775-982-7737', cost:'tier copay', why:'preferred pharmacy, delivery + auto-refill'},
            {name:'Renown Pharmacy — Locust St', detail:'21 Locust St, Reno · mail-order and transfers', phone:'775-982-5280', cost:'tier copay', why:'home delivery'},
            {name:'Renown Pharmacy — Double R', detail:'10101 Double R Blvd, Reno (South Meadows)', phone:'775-982-5366', cost:'tier copay', why:'near your PCP'},
            {name:'Any Optum Rx network pharmacy', detail:'Find one and compare drug prices at optumrx.com', url:'optum', cost:'tier copay', why:'closest to home'} ],
    verify:['Only drugs on the Hometown formulary at a network pharmacy are covered. (sob:2) — check the formulary link below.',
            'The deductible is "medical and drug combined" and the drug tiers do not carry the "deductible does not apply" note, so expect to pay the plan\'s drug price until $500 is met — confirm with Hometown Health. (sob:3, 7)',
            'Manufacturer copay cards do not count toward the deductible or out-of-pocket max. (sob:3)'] },
  { id:'surg', label:'Surgery / procedure', icon:'🔪',
    cost:[ {what:'Procedure done in the doctor\'s office', you:'$400', src:'sob:3'},
           {what:'Outpatient surgery — facility fee (ambulatory surgery center)', you:'$400 per visit', src:'sob:4'},
           {what:'Outpatient surgery — surgeon / physician fee', you:'$0', src:'sob:4'},
           {what:'Inpatient surgery (hospital stay)', you:'$2,000 per stay, covers room, surgeon, OR, imaging, labs', src:'sob:5'},
           {what:'Bariatric surgery', you:'$400, 1 per lifetime, prior auth', src:'sob:6'} ],
    specs:['Ambulatory Surgical Clinic/Center','Surgery','Orthopedic Surgery','Hand Surgery','Colon And Rectal Surgery','Vascular Surgery','Plastic Surgery','Oral & Maxillofacial Surgery'], hospitalsToo:true,
    verify:['Prior authorization required for surgery and hospital stays. (sbc:8)',
            'Ask for a written estimate first: Renown 775-982-3993 (MyChart estimator) · Carson Tahoe 775-445-8545. You are entitled to a Good Faith Estimate before non-emergency care.'] },
  { id:'hosp', label:'Hospital stay', icon:'🏥',
    cost:[ {what:'Inpatient hospital stay', you:'$2,000 per stay, deductible does not apply', src:'sob:5'},
           {what:'Childbirth / delivery (facility)', you:'$2,000 per stay; prenatal and postnatal care $0', src:'sob:4–5'},
           {what:'Skilled nursing facility', you:'$2,000 per stay, 60 days/yr', src:'sob:5'} ],
    specs:['Acute Care Hospital','Acute Rehabilitation Facility'],
    verify:['Prior authorization required except for emergency admissions. (sbc:8)',
            'Out-of-pocket max this year: $4,500 per person / $9,000 family — a stay plus follow-ups cannot exceed that in network. (sob:3)'] },
  { id:'dental', label:'Dental', icon:'🦷',
    cost:[ {what:'Cleanings (2/yr), exams, bitewing X-rays', you:'$0 in network (100%, no deductible)', src:'dental:1'},
           {what:'Fillings, extractions, root canals, gum treatment', you:'20% after the $25 deductible', src:'dental:1'},
           {what:'Crowns, bridges, dentures', you:'50% after the deductible', src:'dental:1'},
           {what:'Orthodontics (under 19 only)', you:'50%, $1,500 lifetime', src:'dental:1'},
           {what:'Plan pays at most', you:'$1,500 per person per calendar year', src:'dental:1'} ],
    extra:[ {name:'Find a network dentist', detail:'myuhc.com → Find a dentist → Employer plans → "National Options PPO 20"', url:'uhcDental', cost:'', why:'in-network rates'} ],
    dentist:true,
    verify:['Out-of-network dentists are paid at 80/60/35% of the allowable fee and can bill the difference. (dental:1)',
            'Anything likely over $500: ask the dentist for a pre-treatment estimate first. (dental:1)',
            'Carrier shown as UnitedHealthcare Voluntary Options PPO 20 (plan P9058) — confirm against your dental ID card.'] },
  { id:'vision', label:'Eyes / vision', icon:'👓',
    cost:[ {what:'WellVision eye exam', you:'Covered in full after the exam copay', src:'vsp:3'},
           {what:'Frames', you:'Covered up to the frame allowance, then 20% off the rest', src:'vsp:3'},
           {what:'Lenses (single, bifocal, trifocal, standard progressive)', you:'Covered in full after copay', src:'vsp:3'},
           {what:'Contacts instead of glasses', you:'Covered up to the contact allowance; fitting ≤ $60', src:'vsp:3'},
           {what:'Urgent eye problem (pink eye, dry eye, sudden changes)', you:'Essential Medical Eye Care, copay ≤ $20', src:'vsp:4'} ],
    extra:[ {name:'Find a VSP Signature doctor', detail:'vsp.com → Find a Doctor → filter network "Signature"', url:'vsp', cost:'', why:'in-network pricing'} ],
    eyeDoctor:true,
    verify:['The exam copay and the frame/contact allowance amounts are on pages 1–2 of the VSP summary, which were not in the upload — add them to the Health tab (keys vision_copay, vision_allowance).',
            'Confirm your eye doctor is in the VSP Signature network (not just "takes VSP").'] }
];

/* ---------- helpers ---------- */
function careSrc(code){ var m=String(code||'').match(/^(\w+):([\d–\-, ]+)(.*)$/); if(!m) return esc(code);
  var doc=CARE_PLAN.src[m[1]]||m[1]; return esc(doc)+', p.'+esc(m[2].trim())+(m[3]?esc(m[3]):''); }
function careKv(){ var h=kv('Health'); var n=function(k,d){ var v=parseFloat(String(h[k]||'').replace(/[^0-9.]/g,'')); return isNaN(v)?d:v; };
  return { dedUsed:n('med_ded_used',null), oopUsed:n('med_oop_used',null), famDedUsed:n('med_fam_ded_used',null), famOopUsed:n('med_fam_oop_used',null), asof:h.med_spent_asof||'', pcp:h.pcp||'', dentist:h.dentist||'', eye:h.eye_doctor||'', vcopay:h.vision_copay||'', vallow:h.vision_allowance||'' }; }
function careStatus(){ var k=careKv(), P=CARE_PLAN; if(k.dedUsed==null&&k.oopUsed==null) return '';
  var dl=k.dedUsed==null?null:Math.max(0,P.ded.ind-k.dedUsed), ol=k.oopUsed==null?null:Math.max(0,P.oop.ind-k.oopUsed);
  return '<div class="fc-status">'
    +(dl!=null?'<span><b>'+money(k.dedUsed)+'</b> of your '+money(P.ded.ind)+' deductible used · <b>'+money(dl)+'</b> to go</span>':'')
    +(ol!=null?'<span><b>'+money(k.oopUsed)+'</b> of the '+money(P.oop.ind)+' out-of-pocket max · family '+(k.famOopUsed!=null?money(k.famOopUsed):'—')+' of '+money(P.oop.fam)+'</span>':'')
    +(k.asof?'<span class="fc-asof">as of '+esc(k.asof)+' (MyChart) · resets Jan 1</span>':'')+'</div>'; }
/* The provider index is private: it lives in the Cloudflare relay's KV and is fetched with a key from the private Config tab
   (care_key; care_url overrides the default). It is cached on this device (localStorage) so after the first open it is instant,
   and re-checked in the background once a day. carePrefetch() runs right after unlock so it is usually ready before the Health tab opens. */
var CARE_LS='lifeos_care', CARE_RELAY='https://lifeos-aircraft.brad-5a1.workers.dev/care';
function careUrl(){ var c=kv('Config'); if(!c.care_key) return ''; return (c.care_url||CARE_RELAY)+'?k='+encodeURIComponent(c.care_key); }
function careFromCache(){ if(CARE.db) return true; try{ var c=JSON.parse(localStorage.getItem(CARE_LS)||'null'); if(c&&c.data&&c.data.length){ CARE.db=c.data; CARE.cachedAt=c.t||0; CARE.etag=c.etag||''; return true; } }catch(e){} return false; }
function careLoad(force){ if(CARE.loading) return; var had=careFromCache();
  if(had && !force && Date.now()-(CARE.cachedAt||0) < 24*3600e3){ careRefresh(); return; }   // fresh enough
  var url=careUrl(); if(!url){ if(!had){ CARE.dbErr='Add Config keys care_key (and optionally care_url) so the dashboard can fetch the private provider index.'; } careRefresh(); return; }
  CARE.loading=true; var hdr={}; if(had&&CARE.etag) hdr['If-None-Match']=CARE.etag;
  fetch(url,{headers:hdr}).then(function(r){ if(r.status===304){ CARE.cachedAt=Date.now(); careStash(); return null; } if(!r.ok) throw new Error('HTTP '+r.status); CARE.etag=r.headers.get('ETag')||''; return r.json(); })
    .then(function(j){ CARE.loading=false; if(j){ CARE.db=j; CARE.cachedAt=Date.now(); CARE.dbErr=''; careStash(); } careRefresh(); })
    .catch(function(e){ CARE.loading=false; if(!CARE.db) CARE.dbErr='Could not load the provider index ('+(e&&e.message||'network')+').'; careRefresh(); }); }
function careStash(){ try{ localStorage.setItem(CARE_LS, JSON.stringify({t:CARE.cachedAt, etag:CARE.etag, data:CARE.db})); }catch(e){} }
function carePrefetch(){ try{ careLoad(); }catch(e){} }
var CARE_JUNK_SPECS = {'Aprn':1,'Bcba':1,'Lcsw':1,'Ebi Lp':1,'Kci Usa':1,'Professional':1,'Physician':1,'Facility':1,'Therapist':1};
function careSpecialties(){ if(!CARE.db) return []; var m={}; CARE.db.forEach(function(e){ if((e.section==='Specialists'||e.section==='Other Providers')&&!CARE_JUNK_SPECS[e.specialty]) m[e.specialty]=(m[e.specialty]||0)+1; });
  return Object.keys(m).sort(); }
function careCityOk(c){ var set=CARE_CITY_SETS[CARE.city]; return !set||set.indexOf(c)>=0; }
function careFind(specs, q){ if(!CARE.db) return []; q=String(q||'').trim().toLowerCase();
  var out=CARE.db.filter(function(e){ if(!careCityOk(e.city)) return false;
    if(specs&&specs.length&&specs.indexOf(e.specialty)<0) return false;
    if(q){ var hay=(e.practice+' '+e.specialty+' '+e.address+' '+e.providers.map(function(p){return p.name;}).join(' ')).toLowerCase(); if(hay.indexOf(q)<0) return false; }
    return true; });
  out.sort(function(a,b){ var ra=CARE_CITY_RANK[a.city], rb=CARE_CITY_RANK[b.city]; ra=ra==null?9:ra; rb=rb==null?9:rb; return ra-rb||a.practice.localeCompare(b.practice); });
  return out; }
function careMap(e){ return 'https://maps.apple.com/?q='+encodeURIComponent(e.practice+', '+e.address+', '+e.city+', NV'); }
function careEntry(e, cost){ var names=e.providers.map(function(p){ return p.name+' '+p.cred; });
  return '<div class="fc-opt"><div class="fc-opt-main"><b>'+esc(e.practice)+'</b>'+(cost?'<span class="fc-cost-pill">'+esc(cost)+'</span>':'')
    +'<div class="fc-opt-sub">'+esc(e.specialty)+' · '+esc(e.city)+(e.flags.length?' · '+esc(e.flags.join(', ')):'')+'</div>'
    +(e.address?'<div class="fc-opt-sub"><a href="'+careMap(e)+'" target="_blank" rel="noopener">'+esc(e.address)+' ↗</a></div>':'')
    +(names.length?'<details class="fc-names"><summary>'+names.length+' provider'+(names.length===1?'':'s')+'</summary>'+esc(names.join(' · '))+'</details>':'')
    +'</div><div class="fc-opt-side">'+(e.phone?'<a class="ebtn" href="tel:'+esc(e.phone.replace(/\D/g,''))+'">'+esc(e.phone)+'</a>':'')
    +'<span class="fc-src">Directory p.'+e.page+'</span></div></div>'; }
function careExtra(x){ var k=careKv(); var detail=x.detail==='pcp'?(k.pcp?esc(k.pcp):'<span style="color:var(--amber)">no PCP on file — add key pcp on the Health tab</span>'):esc(x.detail);
  var url=x.url?CARE_PLAN.links[x.url]:'';
  return '<div class="fc-opt fc-extra"><div class="fc-opt-main"><b>'+esc(x.name)+'</b>'+(x.cost?'<span class="fc-cost-pill">'+esc(x.cost)+'</span>':'')+'<div class="fc-opt-sub">'+detail+(x.why?' · <em>'+esc(x.why)+'</em>':'')+'</div></div>'
    +'<div class="fc-opt-side">'+(x.phone?'<a class="ebtn" href="tel:'+x.phone.replace(/\D/g,'')+'">'+esc(x.phone)+'</a>':'')+(url?'<a class="ebtn" href="'+url+'" target="_blank" rel="noopener">Open ↗</a>':'')+'</div></div>'; }
function carePcpEntry(){ var k=careKv(); if(!CARE.db||!k.pcp) return ''; var last=k.pcp.split(',')[0].split(' ')[0].toLowerCase();
  var hit=CARE.db.filter(function(e){ return e.section==='Primary Care Physicians' && e.providers.some(function(p){ return p.name.toLowerCase().indexOf(last)===0; }); })[0];
  return hit?careEntry(hit,'$10'):''; }

/* ---------- rendering ---------- */
function findCareCard(){
  var chips=CARE_NEEDS.map(function(n){ return '<button class="fc-chip'+(CARE.need===n.id?' on':'')+'" onclick="careGo(\''+n.id+'\')"><span class="emo">'+n.icon+'</span> '+esc(n.label)+'</button>'; }).join('');
  return '<div class="card fc-card" id="sec-care"><div class="fc-head"><div><h2>Find care</h2><div class="sub">'+esc(CARE_PLAN.name)+' · '+esc(CARE_PLAN.carrier)+'. Pick what you need: what it costs you, where to go in network, and what to double-check — each with its source.</div></div>'
    +'<div class="fc-tools"><input id="fcQ" type="search" placeholder="Search in-network providers (name, specialty, street)…" value="'+esc(CARE.q)+'" oninput="careQ(this.value)">'
    +'<select id="fcCity" onchange="careCity(this.value)">'+[['near','Carson · Reno · Minden'],['carson','Carson City'],['reno','Reno · Sparks'],['valley','Minden · Gardnerville'],['all','Anywhere in network']].map(function(o){ return '<option value="'+o[0]+'"'+(CARE.city===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select></div></div>'
    +careStatus()+'<div class="fc-chips">'+chips+'</div><div id="fcBody">'+careBody()+'</div>'
    +'<div class="fc-foot"><a href="'+CARE_PLAN.links.directory+'" target="_blank" rel="noopener">Online provider directory ↗</a> · <a href="'+CARE_PLAN.links.mychart+'" target="_blank" rel="noopener">MyChart (benefits, claims, ID card, cost estimates) ↗</a> · <a href="'+CARE_PLAN.links.telehealth+'" target="_blank" rel="noopener">Telehealth ↗</a> · <a href="'+CARE_PLAN.links.formulary+'" target="_blank" rel="noopener">Drug formulary ↗</a> · Hometown Health <a href="tel:7759823232">775-982-3232</a> (M–F 7–8) · Directory is the 10/26 edition — listings change; confirm before you go.</div></div>';
}
function careBody(){
  if(CARE.q) return careSearchBody();
  var n=CARE_NEEDS.filter(function(x){ return x.id===CARE.need; })[0];
  if(!n) return '<div class="empty">Pick a need above, or search a provider name or specialty.</div>';
  var cost='<div class="fc-col"><div class="section-title">What it costs you</div>'+n.cost.map(function(c){
    return '<div class="fc-cost"><div class="fc-cost-l"><span>'+esc(c.what)+'</span><b>'+esc(c.you)+'</b></div><div class="fc-src">'+careSrc(c.src)+'</div></div>'; }).join('')
    +(n.cost.some(function(c){return c.ded;})?careDedNote():'')+'</div>';
  var where='<div class="fc-col"><div class="section-title">Where to go (in network)</div>';
  if(n.extra) where+=n.extra.map(careExtra).join('');
  if(n.pcp) where+=carePcpEntry();
  if(n.dentist){ var k=careKv(); where+='<div class="fc-opt fc-extra"><div class="fc-opt-main"><b>Your dentist</b><div class="fc-opt-sub">'+(k.dentist?esc(k.dentist):'<span style="color:var(--amber)">none on file — pick one from the PPO 20 network and add key dentist on the Health tab</span>')+'</div></div></div>'; }
  if(n.eyeDoctor){ var k2=careKv(); where+='<div class="fc-opt fc-extra"><div class="fc-opt-main"><b>Your eye doctor</b><div class="fc-opt-sub">'+(k2.eye?esc(k2.eye)+' — confirm VSP Signature':'<span style="color:var(--amber)">none on file</span>')+'</div></div></div>'; }
  if(n.specs==='picker'){
    var sp=careSpecialties(); where+='<select class="fc-sel" onchange="careSpec(this.value)"><option value="">Choose a specialty…</option>'+sp.map(function(s){ return '<option'+(CARE.spec===s?' selected':'')+'>'+esc(s)+'</option>'; }).join('')+'</select>';
    if(CARE.spec) where+=careList(careFind([CARE.spec]), '$20');
    else if(!CARE.db) where+=careLoading();
  } else if(n.specs){
    var specs=n.specs.slice(); if(n.hospitalsToo) specs.push('Acute Care Hospital');
    var list=careFind(specs); var costPill=(n.cost[0]&&/^\$\d+$/.test(n.cost[0].you.split(' ')[0]))?n.cost[0].you.split(' ')[0]:'';
    where+=CARE.db?careList(list,costPill):careLoading();
  }
  where+='</div>';
  var verify='<div class="fc-verify"><div class="section-title">Before you go</div><ul>'+n.verify.map(function(v){ return '<li>'+careSrcInline(v)+'</li>'; }).join('')+'</ul></div>';
  return '<div class="fc-grid">'+cost+where+'</div>'+verify;
}
function careSrcInline(t){ return esc(t).replace(/\((sob|sbc|dental|vsp|dir|mychart):([\d–\-, ]+)\)/g, function(_,d,p){ return '<span class="fc-src">('+esc(CARE_PLAN.src[d])+', p.'+esc(p)+')</span>'; }); }
function careDedNote(){ var k=careKv(); if(k.dedUsed==null) return '<div class="fc-note">Deductible-first items: you pay the plan\'s negotiated rate until $500 is met. Add key med_ded_used on the Health tab to track it here.</div>';
  var left=Math.max(0,CARE_PLAN.ded.ind-k.dedUsed); return '<div class="fc-note">You have <b>'+money(left)+'</b> of deductible left'+(k.asof?' (as of '+esc(k.asof)+')':'')+' — until it is met you pay the plan\'s negotiated rate for these, then the copay.</div>'; }
function careLoading(){ if(CARE.dbErr) return '<div class="empty">Could not load the provider list (care/providers.json).</div>'; careLoad(); return '<div class="empty">Loading the in-network directory…</div>'; }
function careList(list, cost){ if(!list.length) return '<div class="empty">Nothing in the directory for this filter — widen the area or use the online directory link below.</div>';
  var top=list.slice(0,12), rest=list.slice(12,60), beyond=Math.max(0,list.length-60);
  return top.map(function(e){ return careEntry(e,cost); }).join('')
    +(rest.length?'<details class="fc-more"><summary>'+(list.length-12)+' more</summary>'+rest.map(function(e){ return careEntry(e,cost); }).join('')
      +(beyond?'<div class="empty">'+beyond+' more not shown — narrow the area or type a name, street or specialty in the search box.</div>':'')+'</details>':'');
}
function careSearchBody(){ if(!CARE.db) return careLoading(); var list=careFind(null, CARE.q);
  return '<div class="fc-col"><div class="section-title">'+list.length+' match'+(list.length===1?'':'es')+' for “'+esc(CARE.q)+'”</div>'+careList(list,'')+'</div>'; }
function careRefresh(){ var b=document.getElementById('fcBody'); if(b) b.innerHTML=careBody(); }
function careGo(id){ CARE.need=id; CARE.q=''; var q=document.getElementById('fcQ'); if(q) q.value=''; document.querySelectorAll('.fc-chip').forEach(function(c){ c.classList.toggle('on', c.getAttribute('onclick').indexOf("'"+id+"'")>=0); }); careRefresh(); if(!CARE.db) careLoad(); }
function careQ(v){ CARE.q=v; clearTimeout(CARE.t); CARE.t=setTimeout(function(){ if(!CARE.db) careLoad(); careRefresh(); }, 180); }
function careCity(v){ CARE.city=v; careRefresh(); }
function careSpec(v){ CARE.spec=v; careRefresh(); }
