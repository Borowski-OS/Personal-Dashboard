/* ============================ LIFE OS MAIL — the Mac agent (Apple Mail, JXA) ============================  LIFEOS_MAIL_AGENT
   Talks to Apple Mail on Brad's Mac and speaks the same `mailsync` contract to the Life OS brain as the Google agent.
   launchd runs it every 10 minutes (com.lifeos.mail, set up by install.sh):
     osascript -l JavaScript lifeos-mail.js            sort new mail, run queued replies / emails / moves
     osascript -l JavaScript lifeos-mail.js --dry      show what would go to Life OS (counts + subjects); changes nothing
                                                       (add --counts for counts only, no subjects)
     osascript -l JavaScript lifeos-mail.js --status   accounts, last sync, last problem
   Every enabled account in Apple Mail is one inbox. A new one is first announced with an empty mailsync (no mail), so Life OS
   can turn it away before anything is sent. Per account, per run: new mail in its own inbox (since the last sync − 30 min;
   first run 3 days; newest 40) + Brad's sent mail + corrections → ONE mailsync POST → apply the sorting → run the commands
   exactly once → POST the results back in the same run.
   In Mail: Needs reply = red flag, Important = orange flag (both stay in the inbox); FYI → mailbox "Life OS/FYI", Unimportant →
   "Life OS/Unimportant" (on Gmail those ARE the Life OS labels), Spam / Junk → the account's Junk mailbox (no Junk mailbox:
   "Life OS/Junk"). Life OS's older answers still work: cat 'spam' = Spam / Junk, and junk with spam:false = "Life OS/Junk".
   Mail Brad flagged himself, or a reply to his own mail, never leaves the inbox and keeps his flag. Nothing is ever deleted or
   trashed. Replies go out from the account that received the message.
   Files beside it (~/Library/Application Support/LifeOSMail; LIFEOS_MAIL_DIR overrides): config.json {key, brain} written by
   install.sh (chmod 600), state.json (what's been handled), run.lock. Public file: no keys, no mail, no addresses in here. */
ObjC.import('Foundation');

var VERSION='2', LABEL='com.lifeos.mail';                              // 2 = knows Unimportant (Life OS keeps v1 on the old buckets)
var BRAIN_URL='https://script.google.com/macros/s/AKfycbwdO_d4gj2Rj_cLM7JFvehuRUHuwFFocaxJz0MwJxKYhECksIHVe3p3VdhbgjKioWd-/exec';
var BOX={fyi:'Life OS/FYI', unimportant:'Life OS/Unimportant', junk:'Life OS/Junk'}, FLAG={reply:0, important:1};   // Mail flag colours: 0 red, 1 orange
var LBLCAT={'Life OS/Needs reply':'reply', 'Life OS/Important':'important', 'Life OS/FYI':'fyi', 'Life OS/Unimportant':'unimportant', 'Life OS/Junk':'junk'};
var CATS={reply:1, important:1, fyi:1, unimportant:1, junk:1};
var JUNK_NAMES=['Junk','Spam','[Gmail]/Spam','[Google Mail]/Spam','Bulk Mail','Bulk','Bulk Folder','Junk E-mail','Junk Email'];
var ARCH_NAMES=['Archive','[Gmail]/All Mail','[Google Mail]/All Mail','All Mail','Archives'], INBOX_NAMES=['INBOX','Inbox'];
var MAX_ITEMS=40, MAX_SENT=30, RING=2000, SENT_RING=600, DONE_RING=500, LOG_N=60;
var DAY=864e5, LOOKBACK=3*DAY, SENT_BACK=7*DAY, OVERLAP=30*60000, RECHECK=6*3600e3;
var HARD=240000, ENUM_BY=75000, GATHER_BY=110000, ACCT_BY=170000, CMD_BY=200000, MAX_ROUNDS=3;   // ms into the run; hard stop at 4 min
var T0=Date.now(), DRY=false, COUNTS=false, DIR='', SA=null, Mail=null, MINE={}, RUNERR=[];
var SKEYS=['pend','pc','carry','lastSync','lastSent','floor','stopped','checked','lastErr','hello','mkFail'];   // per-account maps in state.json

function run(argv){
  argv=argv||[]; T0=Date.now(); RUNERR=[]; MINE={}; DRY=argv.indexOf('--dry')>=0; COUNTS=argv.indexOf('--counts')>=0;
  SA=Application.currentApplication(); SA.includeStandardAdditions=true;
  DIR=dir_();
  if(argv.indexOf('--status')>=0) return status_();
  var cfg=cfg_();
  if(!DRY && !cfg.key) throw new Error('Life OS Mail isn’t set up yet: run the install command from the Life OS Mail page (Mail → Connect your inboxes).');
  var lk=DRY?'':lock_();
  if(lk===null){ say_('busy: the last run is still going'); return; }
  if(!DRY) scrub_();
  try{ return DRY?dry_():sync_(cfg); }
  catch(e){ var pm=permMsg_(e); say_('ERROR '+(pm||msg_(e))); if(pm) throw new Error(pm); }
  finally{ if(lk) rm_(lk); }
}

/* ---------------- one run ---------------- */
function sync_(cfg){
  var S=load_(); stale_(S); mail_();
  var A=accounts_(true), now=Date.now(), parts=[];
  if(!A.length){ save_(S); say_('no enabled accounts with an email address in Apple Mail'); return; }
  A.forEach(function(a){ a.addrs.forEach(function(x){ MINE[x]=1; }); });
  var chk=A.filter(function(a){ return S.stopped[a.key] && now-(Date.parse(S.checked[a.key]||'')||0)>RECHECK; });
  hello_(A.filter(function(a){ return !S.stopped[a.key]; }), cfg, S, parts);
  var act=A.filter(function(a){ return !S.stopped[a.key] && !a.hold; });
  var sc=scan_(act, S), sn=sent_(act, S), snap=snap_(act, S);
  mineRefs_(sc);
  act.forEach(function(a){
    if(late_(ACCT_BY)){ parts.push(a.name+': next run'); return; }
    try{ parts.push(a.name+': '+acct_(a, cfg, S, sc[a.key], sn[a.key], snap)); }
    catch(e){ if(permMsg_(e)) throw e;
      S.lastErr[a.key]=clip_(stamp_()+' — '+msg_(e), 600); parts.push(a.name+': ERR '+clip_(msg_(e), 160)); }
    finally{ try{ save_(S); }catch(e){ RUNERR.push('saving state: '+msg_(e)); } }
  });
  chk.forEach(function(a){                                            // switched off in Life OS: ask again every 6 h (no mail is read or sent)
    if(late_(ACCT_BY)) return;
    try{ var r=post_(cfg, body_(cfg, a, {first:false, items:[], sent:[], corrections:[], results:(S.pend[a.key]||[]).slice(), error:''}));
      ackPend_(S, a.key, S.pend[a.key]||[]); S.checked[a.key]=iso_(Date.now());
      if(r.config && r.config.stop===true) parts.push(a.name+': switched off in Life OS');
      else { delete S.stopped[a.key]; delete S.checked[a.key]; S.hello[a.key]=S.hello[a.key]||iso_(Date.now());   // Life OS said yes: no second hello
        if((r.commands||[]).length) S.carry[a.key]=uniqQ_((S.carry[a.key]||[]).concat(r.commands));   // handed out: first thing next run
        parts.push(a.name+': switched back on (sorting resumes next run)'); }
    }catch(e){ parts.push(a.name+': ERR '+clip_(msg_(e), 160)); }
  });
  var line=(parts.join(' · ')||'nothing to do')+(RUNERR.length?' | '+RUNERR.join(' | '):'')+' · '+((Date.now()-T0)/1000).toFixed(1)+'s';
  S.lastRun={at:iso_(Date.now()), line:clip_(line, 600)};
  save_(S); say_(line);
  if(!A.some(function(a){ return !S.stopped[a.key]; })){
    say_('Life OS switched sorting off for every inbox on this Mac: stopping the Mac agent (run the install command again to restart it)');
    stopAgent_(); }
}
// One account: POST (items, sent, corrections, earlier results) → commit → sorting → commands → results POST.
function acct_(a, cfg, S, o, s, snap){
  a.errs=a.errs.concat(o.errs);
  var first=!S.lastSync[a.key], corr=corr_(a, S, snap), pc=(S.pc[a.key]||[]).slice(), pend=(S.pend[a.key]||[]).slice(), err0=S.lastErr[a.key]||'';
  var r=post_(cfg, body_(cfg, a, {first:first, items:o.items.map(pub_), sent:s.sent, corrections:corr.map(pubC_).concat(pc), results:pend, error:err0}));
  // Life OS has it all now: commit (a failed POST commits nothing, so the same mail goes again next run)
  ackPend_(S, a.key, pend); S.pc[a.key]=(S.pc[a.key]||[]).slice(pc.length);
  s.ids.forEach(function(id){ sentAdd_(S, id); });
  o.skip.forEach(function(id){ seenPut_(S, {i:id, a:a.key, c:'', t:Date.now()}); });   // Brad's own messages: never items
  corr.forEach(function(c){ var e=c._e;
    if(c.kind==='rescued'){ e.q=1; e.m=''; e.c='important'; e.f=-1; }
    else { e.r=1; if(e.f===FLAG.reply) try{ var h=find_(a, e.i, true); if(h && ours_(h.m, e)){ unflag_(h.m); e.f=-1; } }catch(x){ a.errs.push('clearing a flag: '+msg_(x)); } } });
  S.lastSync[a.key]=iso_(T0); if(!s.cut) S.lastSent[a.key]=iso_(T0);
  if(S.lastErr[a.key]===err0) delete S.lastErr[a.key];
  if(stopped_(r, S, a)) return 'switched off in Life OS';
  var n=apply_(a, r.decisions, o, S);
  floor_(a, S, o); save_(S);
  var cmds=uniqQ_((S.carry[a.key]||[]).concat(r.commands||[])), ran=0, round=0;
  while(cmds.length && round<MAX_ROUNDS){
    var rc=runCmds_(a, cmds, S); cmds=rc.left;
    if(!rc.out.length) break;
    ran+=rc.out.length; addPend_(S, a.key, rc.out); save_(S);
    var sq=(S.pend[a.key]||[]).slice(), pc2=(S.pc[a.key]||[]).slice(), r2;
    try{ r2=post_(cfg, body_(cfg, a, {first:false, items:[], sent:[], corrections:pc2, results:sq, error:a.errs.concat(RUNERR).join(' | ')})); }
    catch(e){ a.errs.push('reporting results: '+msg_(e)); break; }   // results stay pending → next run
    ackPend_(S, a.key, sq); S.pc[a.key]=(S.pc[a.key]||[]).slice(pc2.length);
    if(stopped_(r2, S, a)){ cmds=[]; break; }
    cmds=uniqQ_(cmds.concat(r2.commands||[])); round++;
  }
  carry_(S, a.key, cmds);                                             // handed out but not run (out of time): first thing next run
  var all=a.errs.concat(RUNERR);                                       // run-wide problems (reading Sent etc.) belong to every inbox
  if(all.length) S.lastErr[a.key]=clip_(stamp_()+' — '+all.join(' | '), 600);
  return o.items.length+' new, '+n+' sorted'+(ran?', '+ran+' command'+(ran>1?'s':''):'')+(o.cand.length>o.items.length+o.skip.length?', more next run':'')+
    (a.errs.length?' ('+clip_(a.errs.join(' | '), 200)+')':'');
}
function body_(cfg, a, x){
  return {action:'mailsync', akey:cfg.key, account:a.key, accountName:a.name, source:'mac', agentVersion:VERSION, first:!!x.first,
    items:x.items, sent:x.sent, corrections:x.corrections, results:x.results, error:x.error||''}; }
function stopped_(r, S, a){ if(!(r && r.config && r.config.stop===true)) return false;
  S.stopped[a.key]=S.checked[a.key]=iso_(Date.now()); return true; }
// An inbox Life OS has never heard from: say hello first with an empty mailsync (just the address and account name), so Life
// OS can answer config.stop (e.g. an account it doesn't expect) before a single email is sent. Once per inbox.
function hello_(A, cfg, S, parts){
  A.forEach(function(a){ if(S.lastSync[a.key] || S.hello[a.key]) return;
    if(late_(ENUM_BY)){ a.hold=1; return; }
    try{ var r=post_(cfg, body_(cfg, a, {first:true, items:[], sent:[], corrections:[], results:[], error:''}));
      if(stopped_(r, S, a)){ parts.push(a.name+': not connected (switched off in Life OS)'); return; }
      S.hello[a.key]=iso_(Date.now());
      if((r.commands||[]).length) S.carry[a.key]=uniqQ_((S.carry[a.key]||[]).concat(r.commands));   // handed out: run in this run's sync
    }catch(e){ a.hold=1; S.lastErr[a.key]=clip_(stamp_()+' — '+msg_(e), 600); parts.push(a.name+': ERR '+clip_(msg_(e), 160)); }
    finally{ try{ save_(S); }catch(e){ RUNERR.push('saving state: '+msg_(e)); } } });
}

/* ---------------- --dry / --status ---------------- */
function dry_(){
  var S=load_(); mail_();
  var A=accounts_(true), L=['Life OS Mail (Mac) — dry run: nothing was sent to Life OS and nothing in Mail changed.'];
  A.forEach(function(a){ a.addrs.forEach(function(x){ MINE[x]=1; }); });
  var act=A.filter(function(a){ return !S.stopped[a.key]; });
  var sc=scan_(act, S), sn=sent_(act, S), snap=snap_(act, S);
  mineRefs_(sc);
  if(!A.length) L.push('No enabled accounts with an email address in Apple Mail.');
  A.forEach(function(a){
    if(S.stopped[a.key]){ L.push(a.name+' <'+a.key+'>: switched off in Life OS'); return; }
    var o=sc[a.key], c=corr_(a, S, snap), more=o.cand.length-o.items.length-o.skip.length;
    L.push(a.name+' <'+a.key+'>: '+o.items.length+' new to sort'+(more>0?' (+'+more+' next run)':'')+', '+sn[a.key].sent.length+' sent, '+
      c.length+' correction'+(c.length===1?'':'s')+(S.lastSync[a.key]?'':' — first sync: looks back 3 days'));
    if(!COUNTS) o.items.forEach(function(it){ L.push('   - '+(it.subject||'(no subject)')); });
    o.errs.concat(a.errs).forEach(function(e){ L.push('   ! '+e); }); });
  if(RUNERR.length) L.push('Problems: '+RUNERR.join(' | '));
  return L.join('\n');
}
function status_(){
  var S=load_(), cfg=cfg_(), L=['Life OS Mail — Mac agent v'+VERSION, 'Folder: '+DIR,
    'Connect key: '+(cfg.key?'saved':'MISSING (run the install command from the Life OS Mail page)'), 'Life OS: '+cfg.brain];
  var A=[], up=false; Mail=Application('Mail'); try{ up=Mail.running(); }catch(_){}
  if(!up) L.push('Apple Mail: not running (the next run opens it)');
  else try{ A=accounts_(false); }catch(e){ L.push('Apple Mail: '+(permMsg_(e)||msg_(e))); }
  var keys=A.map(function(a){ return a.key; }), nm={};
  A.forEach(function(a){ nm[a.key]=a.name; });
  Object.keys(S.lastSync).forEach(function(k){ if(keys.indexOf(k)<0) keys.push(k); });
  L.push('Accounts:'+(keys.length?'':' none found'));
  keys.forEach(function(k){
    L.push('  '+(nm[k]||'(not in Mail now)')+' <'+k+'>: '+(S.stopped[k]?'switched off in Life OS':S.lastSync[k]?'last sync '+fmt_(S.lastSync[k]):'not synced yet')+
      (S.lastErr[k]?'\n      last problem: '+S.lastErr[k]:'')); });
  var pend=0; Object.keys(S.pend).forEach(function(k){ pend+=(S.pend[k]||[]).length; });
  L.push('Last run: '+(S.lastRun?fmt_(S.lastRun.at)+' — '+S.lastRun.line:'never'));
  L.push('Remembered: '+S.seen.length+' emails, '+S.doneQ.length+' commands run, '+pend+' result'+(pend===1?'':'s')+' waiting to report');
  return L.join('\n');
}

/* ---------------- Apple Mail: accounts + reading ---------------- */
function mail_(){
  Mail=Application('Mail'); var up=false; try{ up=Mail.running(); }catch(_){}
  if(up) return;
  try{ Mail.launch(); }catch(e){ if(permMsg_(e)) throw e; }           // opens without coming to the front; never quit by us
  for(var i=0;i<20;i++){ delay(1); try{ if(Mail.running()) break; }catch(_){} }
  delay(3);
}
// Enabled accounts that have an address: {acc, name, key = addr (first address, lowercase), addrs, full, bx (mailbox cache), errs}
function accounts_(wait){
  var list=[];
  for(var k=0;k<(wait?8:1);k++){
    try{ list=Mail.accounts(); }catch(e){ if(permMsg_(e)) throw e;
      if(e && e.errorNumber===-1712 || /-1712|timed? ?out/i.test(msg_(e))){   // the first Apple Event: usually a permission box nobody answered
        var w=new Error('Mail didn’t answer within 2 minutes. If a box asks to let osascript (or Terminal) control Mail, click OK, then run it again'); w.aeWait=1; throw w; }
      RUNERR.push('reading accounts: '+msg_(e)); }
    if(list.length) break; if(wait) delay(2); }
  var out=[], had={};
  list.forEach(function(acc){
    try{ if(!acc.enabled()) return;
      var ad=(acc.emailAddresses()||[]).map(function(x){ return String(x).trim().toLowerCase(); }).filter(function(x){ return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(x); });
      if(!ad.length || had[ad[0]]) return; had[ad[0]]=1;
      var full=''; try{ full=String(acc.fullName()||'').trim(); }catch(_){}
      out.push({acc:acc, name:String(acc.name()), key:ad[0], addr:ad[0], addrs:ad, full:full, bx:{}, errs:[]});
    }catch(e){ if(permMsg_(e)) throw e; RUNERR.push('an account: '+msg_(e)); } });
  return out;
}
function since_(a, S, now){
  var last=Date.parse(S.lastSync[a.key]||'')||0, fl=+S.floor[a.key]||0, s=last?last-OVERLAP:now-LOOKBACK;
  if(fl && fl-60000<s) s=fl-60000;                                    // reach back to the oldest mail Life OS hasn't sorted yet
  return Math.max(s, now-LOOKBACK);                                   // never more than 3 days (no mass-sorting of old mail)
}
// New mail per account, from that account's own inbox. Mail walks the whole mailbox for every whose(), so the list is read in
// batch (3 Apple Events per account, whatever its size), sorted newest first here (Mail's order isn't promised), handled ids
// skipped; then the newest 40 are read one by one, round-robin across accounts so one big or slow inbox can't starve the rest.
function scan_(A, S){
  var out={}, now=Date.now(), pick={}, halt={};
  A.forEach(function(a){ a.since=since_(a, S, now);
    var o=out[a.key]={cand:[], items:[], byId:{}, spec:{}, skip:[], errs:[], cut:false}, L=null, dup={};
    if(late_(ENUM_BY)){ o.cut=true; return; }
    var ib=inboxBox_(a); if(!ib){ o.errs.push('couldn’t find the inbox of '+a.name+' in Mail'); return; }
    try{ L=list_(ib.messages.whose({dateReceived:{'>':new Date(a.since)}}), ['messageId', 'dateReceived']); }
    catch(e){ if(permMsg_(e)) throw e; o.errs.push('reading the inbox: '+msg_(e)); return; }
    if(!L){ o.cut=true; return; }                                     // mail kept coming and going while it was read: next run
    L.messageId.forEach(function(x, i){ var id=mid_(x), d=+L.dateReceived[i];
      if(!id || dup[id] || seenHas_(S, a.key, id) || !(d>a.since)) return; dup[id]=1; o.cand.push({m:L.ms[i], id:id, d:d}); });
    o.cand.sort(function(x, y){ return y.d-x.d; }); pick[a.key]=o.cand.slice(0, MAX_ITEMS); });
  for(var k=0;k<MAX_ITEMS;k++) A.forEach(function(a){
    var o=out[a.key], c=(pick[a.key]||[])[k]; if(!c || halt[a.key]) return;
    if(late_(o.items.length+o.skip.length<3?ACCT_BY-40000:GATHER_BY)){ o.cut=halt[a.key]=true; return; }   // a slow Mail still moves forward a few each run
    var got=safe_(function(){ return mid_(c.m.messageId()); }, null);
    if(got===null) return;                                            // moved or deleted since the list was read: next run
    if(got!==c.id){ o.cut=halt[a.key]=true; return; }                 // the list shifted between reads: the rest next run
    try{ var it=item_(c, a); if(!it){ o.skip.push(c.id); return; } o.items.push(it); o.byId[it.id]=it; o.spec[it.id]=c.m; }
    catch(e){ o.errs.push('reading an email: '+clip_(msg_(e), 120)); } });
  return out;
}
// A whose() result read in batch: the message references plus the named properties, re-read once if the counts disagree.
function list_(ref, props){
  for(var k=0;k<2;k++){
    var L={ms:ref()||[]}, ok=true;
    props.forEach(function(p){ if(ok){ L[p]=ref[p]()||[]; ok=L[p].length===L.ms.length; } });
    if(ok) return L; }
  return null;
}
function item_(c, a){
  var m=c.m, from=String(m.sender()||''), fe=emails_(from)[0]||'';
  if(fe && a.addrs.indexOf(fe)>=0) return null;                      // Brad's own message (a copy to himself): not an item
  var h=hdrs_(safe_(function(){ return m.allHeaders(); }, '')), raw=String(safe_(function(){ return m.content(); }, '')||'');
  var body=clip_(stripQuoted_(raw.replace(/\uFFFC/g, '')), 2500), junk=!!safe_(function(){ return m.junkMailStatus(); }, false);
  return {id:c.id, threadId:c.id, date:new Date(c.d).toISOString(), from:clip_(from, 300),
    to:clip_(rcpt_(m.toRecipients).join(', '), 1000), cc:clip_(rcpt_(m.ccRecipients).join(', '), 1000),
    deliveredTo:clip_([h('delivered-to'), h('x-original-to'), h('x-forwarded-to'), h('x-forwarded-for')].filter(String).join(', '), 500),
    subject:clip_(String(safe_(function(){ return m.subject(); }, '')||''), 300), snippet:clip_(body.replace(/\s+/g, ' ').trim(), 300), body:body,
    listUnsub:!!h('list-unsubscribe'), bulk:/bulk|list|junk/i.test(h('precedence'))||!!h('list-id'), category:junk?'promotions':null,
    starred:!!safe_(function(){ return m.flaggedStatus(); }, false), bradInThread:false, msgCount:1,
    _refs:(h('in-reply-to')+' '+h('references')).match(/<[^<>\s]+>/g)||[]};
}
// bradInThread: the email answers something Brad sent (In-Reply-To / References names a message in his Sent, last 30 days).
function mineRefs_(sc){
  var need=Object.keys(sc).some(function(k){ return sc[k].items.some(function(it){ return it._refs.length; }); });
  if(!need) return;
  var set={};
  try{ (Mail.sentMailbox.messages.whose({dateSent:{'>':new Date(Date.now()-30*DAY)}}).messageId()||[]).forEach(function(x){ var id=mid_(x); if(id) set[id]=1; }); }
  catch(e){ RUNERR.push('reading Sent for threads: '+msg_(e)); return; }
  Object.keys(sc).forEach(function(k){ sc[k].items.forEach(function(it){ it.bradInThread=it._refs.some(function(r){ return !!set[mid_(r)]; }); }); });
}
// Brad's sent mail since the last sync, per account (by the sender address); max 30 each, newest first.
function sent_(A, S){
  var out={}, now=Date.now(), lo=now, by={}, rows=[];
  A.forEach(function(a){ out[a.key]={sent:[], ids:[], cut:false};
    var l=Date.parse(S.lastSent[a.key]||'')||0; a.sentSince=Math.max(l?l-OVERLAP:now-SENT_BACK, now-SENT_BACK); lo=Math.min(lo, a.sentSince);
    a.addrs.forEach(function(x){ by[x]=a; }); });
  if(!A.length) return out;
  var L=null, cut=function(){ A.forEach(function(a){ out[a.key].cut=true; }); };   // unfinished: lastSent stays put
  if(late_(GATHER_BY)){ cut(); return out; }
  try{ L=list_(Mail.sentMailbox.messages.whose({dateSent:{'>':new Date(lo)}}), ['messageId', 'sender', 'dateSent']); }
  catch(e){ if(permMsg_(e)) throw e; RUNERR.push('reading Sent: '+msg_(e)); return out; }
  if(!L){ cut(); return out; }
  L.ms.forEach(function(m, i){ var id=mid_(L.messageId[i]), a=by[emails_(L.sender[i])[0]||''], d=+L.dateSent[i];
    if(id && !S.sentSet[id] && a && d>a.sentSince) rows.push({m:m, id:id, d:d, a:a}); });
  rows.sort(function(x, y){ return y.d-x.d; });
  rows.forEach(function(r){ var o=out[r.a.key]; if(o.sent.length>=MAX_SENT || o.halt) return; if(late_(GATHER_BY)){ o.cut=true; return; }
    var got=safe_(function(){ return mid_(r.m.messageId()); }, null);
    if(got!==r.id){ if(got!==null) o.cut=o.halt=true; return; }      // gone: skip; list shifted: the rest next run
    try{ var m=r.m, to=[].concat(rcpt_(m.toRecipients), rcpt_(m.ccRecipients), rcpt_(m.bccRecipients)).filter(function(x, i, arr){ return !MINE[x] && arr.indexOf(x)===i; }).slice(0, 20);
      var sn=clip_(stripQuoted_(String(safe_(function(){ return m.content(); }, '')||'').replace(/\uFFFC/g, '')).replace(/\s+/g, ' ').trim(), 300);
      o.sent.push({to:to, date:new Date(r.d).toISOString(), subject:clip_(String(safe_(function(){ return m.subject(); }, '')||''), 300), snippet:sn});
      o.ids.push(r.id); }catch(e){} });
  return out;
}
// Corrections from what Brad did in Mail: rescued = something we moved out (FYI/Unimportant/Junk/Archive) is back in the inbox;
// replied = a Needs-reply email now shows "replied". Each is reported once. snap_ reads, per account and only when something is
// waiting to be noticed, the Message-IDs in its own inbox (last 30 days) and the replied ones (their own whose(), so two lists
// never have to line up).
function snap_(A, S){
  var out={}, d=new Date(Date.now()-30*DAY), put=function(set){ return function(x){ var id=mid_(x); if(id) set[id]=1; }; };
  A.forEach(function(a){
    var resc=S.seen.some(function(e){ return e.a===a.key && e.m && !e.q; }), rep=S.seen.some(function(e){ return e.a===a.key && e.c==='reply' && !e.r; });
    if(!(resc || rep) || late_(ACCT_BY-40000)) return;
    var ib=inboxBox_(a); if(!ib) return;
    try{ var o={inbox:{}, replied:{}};
      if(resc) (ib.messages.whose({dateReceived:{'>':d}}).messageId()||[]).forEach(put(o.inbox));
      if(rep) (ib.messages.whose({_and:[{dateReceived:{'>':d}}, {wasRepliedTo:true}]}).messageId()||[]).forEach(put(o.replied));
      out[a.key]=o;
    }catch(e){ if(permMsg_(e)) throw e; a.errs.push('checking moved / replied mail: '+msg_(e)); } });
  return out;
}
function corr_(a, S, snap){
  var out=[], s=snap && snap[a.key]; if(!s) return out;
  S.seen.forEach(function(e){ if(e.a!==a.key || out.length>=60) return;
    if(e.m && !e.q && s.inbox[e.i]) out.push({id:e.i, threadId:e.i, from:e.fr||'', kind:'rescued', _e:e});
    else if(e.c==='reply' && !e.r && s.replied[e.i]) out.push({id:e.i, threadId:e.i, from:e.fr||'', kind:'replied', _e:e}); });
  return out;
}

/* ---------------- applying Life OS's sorting (only to mail this run sent it) ---------------- */
function apply_(a, decs, o, S){
  var n=0;
  (decs||[]).forEach(function(d){
    var id=String(d && d.id || ''), it=o.byId[id], m=o.spec[id]; if(!it || !m) return;
    if(late_(HARD-20000)) return;                                     // unmarked → sent again next run; Life OS reuses its decision
    var cat=d.cat==='spam'?'junk':CATS[d.cat]?String(d.cat):'important';   // 'spam' = an older Life OS's Spam / Junk
    var e={i:id, a:a.key, c:cat, t:Date.parse(it.date)||Date.now(), fr:emails_(it.from)[0]||'', m:'', f:-1, s:it.starred?1:0};
    try{
      var star=it.starred; try{ star=!!m.flaggedStatus(); }catch(_){}    // flagged by Brad (maybe just now): his flag stays, it stays in the inbox
      if(cat==='junk' && (star || it.bradInThread)) e.c=cat='unimportant';  // never Spam: it just stays where it is
      if(cat==='reply' || cat==='important'){
        var fi=FLAG[cat];
        if(cat==='reply' && safe_(function(){ return m.wasRepliedTo(); }, false)){   // he answered before we got here
          fi=FLAG.important; e.r=1; (S.pc[a.key]=S.pc[a.key]||[]).push({id:id, threadId:id, from:it.from, kind:'replied'}); }
        if(!star){ flag_(m, fi); e.f=fi; }
      } else if(!star && !it.bradInThread){
        var tgt=d.spam && cat==='junk'?'spam':d.archive?(BOX[cat]?cat:'junk'):'';   // junk without spam = an older Life OS's archive-only junk
        if(tgt) e.m=moveTo_(a, m, tgt, S);
      }
      n++;
    }catch(x){ a.errs.push('sorting an email: '+clip_(msg_(x), 160)); }      // no subject: the log stays free of email text
    seenPut_(S, e);
  });
  return n;
}
function floor_(a, S, o){
  var f=0; o.cand.forEach(function(c){ if(!seenHas_(S, a.key, c.id) && (!f || c.d<f)) f=c.d; });
  if(o.cut && (!f || a.since+60000<f)) f=a.since+60000;               // didn't finish looking: start from the same place next run
  if(f) S.floor[a.key]=f; else delete S.floor[a.key];
}

/* ---------------- commands: reply / compose / move — each qid runs at most once, ever ---------------- */
function runCmds_(a, cmds, S){
  var out=[], left=[];
  cmds.forEach(function(c){
    if(!c || c.qid==null || c.qid==='') return; var q=String(c.qid);
    if(S.doneSet[q]){                                                  // already ran: never again — just repeat what happened
      if(!(S.pend[a.key]||[]).some(function(p){ return p.qid===q; })){ var old=logGet_(S, q);
        out.push(old?clean_(old):{qid:q, ok:false, error:'Ran earlier on the Mac; outcome unknown — check Mail (Sent and Drafts)', draftId:'', messageId:''}); }
      return; }
    if(late_(CMD_BY)){ left.push(c); return; }
    doneAdd_(S, q); logSet_(S, {qid:q, a:a.key, ok:false, error:'Interrupted while running — check Mail (Sent and Drafts) before trying again', draftId:'', messageId:'', _s:1});
    try{ save_(S); }catch(e){                                          // written down BEFORE touching Mail, or not run at all (no double sends)
      S.doneQ=S.doneQ.filter(function(x){ return x!==q; }); delete S.doneSet[q]; S.log=S.log.filter(function(x){ return x.qid!==q; });
      a.errs.push('couldn’t save before running a command: '+msg_(e)); left.push(c); return; }
    var r={qid:q, a:a.key, ok:true, error:'', draftId:'', messageId:''};
    try{
      if(c.type==='reply') cmdReply_(a, c, r, S);
      else if(c.type==='compose') cmdCompose_(a, c, r);
      else if(c.type==='move') cmdMove_(a, c, S);
      else throw new Error('unknown command type: '+c.type);
    }catch(e){ r.ok=false; r.error=clip_(msg_(e), 300); }
    logSet_(S, r); addPend_(S, a.key, [r]); out.push(clean_(r));       // the real outcome, saved right away: a crash later in this
    try{ save_(S); }catch(e){ RUNERR.push('saving state: '+msg_(e)); }  // round can't turn "Sent" into "Interrupted"
  });
  return {out:out, left:left};
}
function cmdReply_(a, c, r, S){
  var body=String(c.body||'').trim(); if(!body) throw new Error('the reply is empty');
  var id=mid_(c.msgId||c.threadId), h=find_(a, id, false, seenGet_(S, a.key, id));
  if(!h) throw new Error('that email isn’t in Apple Mail ('+a.name+': inbox, Life OS or Junk) any more');
  var send=truthy_(c.send), rp=reply_(h.m, truthy_(c.replyAll));
  out_(rp, function(){                                                   // any problem from here on: the reply is left open in Mail
    delay(1);                                                            // Mail fills in the quoted original in the background
    var fe=emails_(safe_(function(){ return rp.sender(); }, ''))[0];      // Mail answers from the account that got it; make sure
    if(fe && a.addrs.indexOf(fe)<0){ rp.sender=from_(a, a.addr); fe=emails_(safe_(function(){ return rp.sender(); }, ''))[0];
      if(fe && a.addrs.indexOf(fe)<0 && send) throw new Error('Mail wanted to answer from '+fe+', not '+a.key+' — not sent'); }
    var have=[].concat(rcpt_(rp.toRecipients), rcpt_(rp.ccRecipients));
    emails_(c.cc).concat(emails_(c.to)).forEach(function(x){              // extra people Brad named → cc (never his own addresses)
      if(have.indexOf(x)<0 && !MINE[x]){ have.push(x); pushRcpt_(rp.ccRecipients, 'CcRecipient', x); } });
    if(!setBody_(rp, body, true)) throw new Error('Mail didn’t keep the text of the reply — not sent');
    if(send){ if(rp.send()===false) throw new Error('Mail didn’t send it'); }
    else { rp.visible=true; r.draftId='mac-window'; }                  // left open in Mail, ready to send
  });
}
// The documented form first (app command, message as the direct parameter), then the message's own method.
function reply_(m, all){
  var o={openingWindow:false, replyToAll:!!all};
  try{ return Mail.reply(m, o); }catch(e){ if(permMsg_(e)) throw e; }
  return m.reply(o);
}
// Run f on an outgoing message; if anything fails, make the message visible (so nothing is left hidden in Mail) and say so.
function out_(o, f){
  try{ f(); }
  catch(e){ var shown=false; try{ o.visible=true; shown=true; }catch(_){}
    throw new Error(msg_(e)+(shown?' — it’s open in Mail on the Mac to check and send':'')); }
}
// Put Brad's text in an outgoing message and check Mail kept it: Mail builds a reply's quote in the background and can overwrite
// what was set. quote: keep what Mail put there (the quoted original) below Brad's text. Never sends a blank or quote-only email.
function setBody_(o, body, quote){
  var w=norm_(body), hd=w.slice(0, 60), tl=w.slice(-40), old='';
  for(var k=0;k<3;k++){
    var cur=String(safe_(function(){ return o.content(); }, '')||'');
    if(quote && norm_(cur) && norm_(cur).indexOf(hd)!==0) old=cur;     // what's there doesn't start with ours: Mail's quote of the original
    o.content=body+(old?'\n\n'+old:'');
    delay(0.5+k);
    var g=norm_(safe_(function(){ return o.content(); }, ''));
    if(g.indexOf(hd)===0 && g.indexOf(tl)>=0) return true; }        // Brad's text first, all of it (a quote that merely contains it doesn't count)
  return false;
}
function cmdCompose_(a, c, r){
  var to=emails_(c.to); if(!to.length) throw new Error('no recipient email address');
  var body=String(c.body||'').trim(); if(!body) throw new Error('the message is empty');
  var f=emails_(c.from)[0], addr=f && a.addrs.indexOf(f)>=0?f:a.addr, send=truthy_(c.send);   // only this account's own addresses
  var p={subject:String(c.subject||'').trim()||'(no subject)', content:body, visible:!send, sender:from_(a, addr)}, o=Mail.OutgoingMessage(p);
  try{ Mail.outgoingMessages.push(o); }catch(e){ if(permMsg_(e)) throw e; o=Mail.make({new:'outgoingMessage', withProperties:p}); }
  out_(o, function(){
    to.forEach(function(x){ pushRcpt_(o.toRecipients, 'ToRecipient', x); });
    emails_(c.cc).forEach(function(x){ if(to.indexOf(x)<0) pushRcpt_(o.ccRecipients, 'CcRecipient', x); });
    var fe=emails_(safe_(function(){ return o.sender(); }, ''))[0];     // Mail falls back to its default account on a sender it doesn't know
    if(fe!==addr){ o.sender=addr; fe=emails_(safe_(function(){ return o.sender(); }, ''))[0]; }
    if(send && fe && fe!==addr) throw new Error('Mail wanted to send it from '+fe+', not '+addr+' — not sent');
    if(!setBody_(o, body, false)) throw new Error('Mail didn’t keep the text of the email — not sent');
    if(send){ if(o.send()===false) throw new Error('Mail didn’t send it'); }
    else { if(!p.visible) o.visible=true; r.draftId='mac-window'; }
  });
}
function from_(a, addr){ return a.full?a.full+' <'+addr+'>':addr; }
function pushRcpt_(col, cls, x){
  try{ col.push(Mail[cls]({address:x})); return; }catch(e){ if(cls!=='ToRecipient') throw e; }
  col.push(Mail.Recipient({address:x}));
}
// move: to inbox (+ flag for Needs reply / Important), archive (Life OS/FYI, /Unimportant or /Junk by label, else Archive), spam
// (account Junk). 'trash' is treated like archive (Life OS/Junk without a label): the Mac agent never deletes or trashes anything.
function cmdMove_(a, c, S){
  var id=mid_(c.threadId||c.msgId), e=seenGet_(S, a.key, id), h=find_(a, id, false, e);
  if(!h) throw new Error('that email isn’t in Apple Mail ('+a.name+': inbox, Life OS or Junk) any more');
  var m=h.m, to=String(c.to||''), cat=LBLCAT[String(c.label||'')]||'';
  var ours=ours_(m, e), star=!!safe_(function(){ return m.flaggedStatus(); }, false) && !ours;
  if(!e) e={i:id, a:a.key, c:cat||'important', t:Date.now(), fr:emails_(safe_(function(){ return m.sender(); }, ''))[0]||'', m:'', f:-1, s:star?1:0};
  if(to==='inbox' || !to){                                           // back to the inbox (or just re-flag): red = Needs reply, orange = Important
    if(h.where!=='inbox'){
      if(!to) m=null;                                                 // label-only on mail outside the inbox: nothing to flag
      else { var ib=inboxBox_(a); if(!ib) throw new Error('couldn’t find the inbox of '+a.name); move_(m, ib); delay(1);
        var b=find_(a, id, true); m=b?b.m:null; } }                  // the moved copy, for its flag
    if(m && !star){ if(FLAG[cat]!=null){ flag_(m, FLAG[cat]); e.f=FLAG[cat]; } else if(ours){ unflag_(m); e.f=-1; } }
    if(to) e.m='';
    if(cat) e.c=cat; e.q=0; seenPut_(S, e); return; }
  var tgt=to==='spam'?'spam':to==='archive' || to==='trash'?(BOX[cat]?cat:to==='trash'?'junk':'archive'):'';
  if(!tgt) throw new Error('unknown place to move to: '+to);
  if(star && (h.where==='inbox' || tgt==='spam')){ e.c=tgt==='spam'?'unimportant':cat||e.c; seenPut_(S, e); return; }   // rail: flagged mail never leaves the inbox or goes to Junk
  if(ours){ unflag_(m); e.f=-1; }
  e.m=moveTo_(a, m, tgt, S); e.c=cat||(BOX[tgt]?tgt:'junk'); e.q=0; seenPut_(S, e);
}

/* ---------------- mailboxes, moving, flags ---------------- */
// Move out of the inbox → where it went: 'fyi' | 'unimportant' | 'junk' | 'spam' | 'archive'.
function moveTo_(a, m, tgt, S){
  var box=null, where=tgt;
  if(tgt==='spam'){ box=junkBox_(a); if(!box) where='junk'; }          // no Junk mailbox: Life OS/Junk
  if(!box && BOX[where]){ box=ensure_(a, BOX[where], S); if(!box) where='archive'; }   // ensure_ reports why
  if(!box) box=archBox_(a);
  if(!box) throw new Error('nowhere to move it in '+a.name+' (no Life OS, Junk or Archive mailbox)');
  move_(m, box); return where;
}
function move_(m, box){
  try{ Mail.move(m, {to:box}); return; }catch(e){ if(permMsg_(e)) throw e; }
  m.mailbox=box;
}
function flag_(m, i){ m.flaggedStatus=true; m.flagIndex=i; }
function unflag_(m){ m.flaggedStatus=false; }
function ours_(m, e){ if(!e || !(e.f>=0)) return false; try{ return !!m.flaggedStatus() && m.flagIndex()===e.f; }catch(_){ return false; } }
function findBox_(a, path){
  var k=path.toLowerCase(); if(a.bx[k]!==undefined) return a.bx[k];
  var acc=a.acc, b=null;
  try{ var x=acc.mailboxes.byName(path); x.name(); b=x; }catch(_){}
  if(!b && path.indexOf('/')>0) try{ var p=path.split('/'), y=acc.mailboxes.byName(p[0]); for(var i=1;i<p.length;i++) y=y.mailboxes.byName(p[i]); y.name(); b=y; }catch(_){}
  if(!b) try{ var ns=acc.mailboxes.name()||[]; for(var j=0;j<ns.length;j++) if(String(ns[j]).toLowerCase()===k){ b=acc.mailboxes.byName(ns[j]); break; } }catch(_){}
  return a.bx[k]=b;
}
// "Life OS/FYI" / "Life OS/Unimportant" / "Life OS/Junk": found, or made — three ways Mail accepts, each checked: it has to land IN this account (Mail can
// quietly put it under On My Mac instead; then we stop and say so). A failed attempt is retried once a day, not every run. Never in --dry.
function ensure_(a, path, S){
  var b=findBox_(a, path); if(b || DRY) return b;
  a.mk=a.mk||{}; if(a.mk[path]) return null; a.mk[path]=1;             // one attempt per run, not one per email
  var fk=a.key+'|'+path, p=path.split('/'), last='', stray='';
  if(Date.now()-(Date.parse(S.mkFail[fk]||'')||0)<DAY){ a.errs.push('no "'+path+'" mailbox in '+a.name+': '+nomk_(a)); return null; }
  var mk=function(n, at){ return Mail.make({new:'mailbox', withProperties:{name:n}, at:at}); }, tries=[
    function(){ return mk(path, a.acc); },
    function(){ a.acc.mailboxes.push(Mail.Mailbox({name:path})); return null; },
    function(){ delete a.bx[p[0].toLowerCase()]; var par=findBox_(a, p[0]);
      if(!par){ var pm=mk(p[0], a.acc); delete a.bx[p[0].toLowerCase()]; par=findBox_(a, p[0]); if(!par){ stray=strayOf_(a, pm); return null; } }
      return mk(p.slice(1).join('/'), par); } ];
  for(var i=0;i<tries.length && !stray;i++){
    var mb=null; try{ mb=tries[i](); }catch(e){ if(permMsg_(e)) throw e; last=msg_(e); }
    delete a.bx[path.toLowerCase()]; b=findBox_(a, path);
    if(b){ delete S.mkFail[fk]; return b; }
    stray=stray||strayOf_(a, mb); }
  S.mkFail[fk]=iso_(Date.now());
  a.errs.push('couldn’t create "'+path+'" in '+a.name+(stray?' (Mail made it under '+stray+' instead; that empty mailbox can be deleted)':last?' ('+clip_(last, 120)+')':'')+': '+nomk_(a));
  return null;
}
function nomk_(a){ return 'moved to Archive instead (tried again daily; or make it in Mail: Mailbox → New Mailbox, Location '+a.name+')'; }
// A mailbox make() handed back that exists but isn't in this account → where it landed ('' = nowhere we can see).
function strayOf_(a, mb){
  if(!mb) return '';
  try{ mb.name(); }catch(_){ return ''; }
  var an=''; try{ an=String(mb.account.name()||''); }catch(_){}
  return an===a.name?'':(an||'On My Mac');
}
function anyBox_(a, names){ for(var i=0;i<names.length;i++){ var b=findBox_(a, names[i]); if(b) return b; } return null; }
function junkBox_(a){ return anyBox_(a, JUNK_NAMES); }
function archBox_(a, noAll){ return anyBox_(a, noAll?ARCH_NAMES.filter(function(n){ return !/All Mail$/i.test(n); }):ARCH_NAMES); }
// The account's own inbox: by name, else the one under Mail's combined Inbox that belongs to this account.
function inboxBox_(a){
  if(a.inboxBox!==undefined) return a.inboxBox;
  var b=anyBox_(a, INBOX_NAMES);
  if(!b) try{ var bs=Mail.inbox.mailboxes()||[]; for(var i=0;i<bs.length && !b;i++) try{ if(String(bs[i].account.name())===a.name) b=bs[i]; }catch(_){} }
    catch(e){ if(permMsg_(e)) throw e; }
  return a.inboxBox=b;
}
// This account's copy of an email by Message-ID (Mail keeps it without <>): its inbox, then the mailbox we moved it to, then
// Life OS/Unimportant, Life OS/Junk, Life OS/FYI and Junk. Never [Gmail]/All Mail: it holds everything (one search could outlast Apple's 2-minute
// limit), and moving mail out of it would put it in Gmail's Trash. e = what state.json remembers about it.
function find_(a, id, inboxOnly, e){
  id=mid_(id); if(!id) return null;
  var look=function(box){ if(!box) return null;
    try{ var r=box.messages.whose({messageId:id})()||[]; return r[0]||null; }catch(x){ if(permMsg_(x)) throw x; return null; } };
  var m=look(inboxBox_(a)); if(m) return {m:m, where:'inbox'};
  if(inboxOnly) return null;
  var w=e && e.m||'', at={fyi:findBox_(a, BOX.fyi), unimportant:findBox_(a, BOX.unimportant), junk:findBox_(a, BOX.junk), spam:junkBox_(a), archive:w==='archive'?archBox_(a, true):null};
  var boxes=[at[w]||null, at.unimportant, at.junk, at.fyi, at.spam, at.archive];
  for(var i=0;i<boxes.length;i++){ if(!boxes[i] || boxes.indexOf(boxes[i])<i) continue; m=look(boxes[i]); if(m) return {m:m, where:'other'}; }
  return null;
}

/* ---------------- talking to Life OS ---------------- */
// curl follows Apps Script's 302 with -L and switches POST → GET for it (which is what Apps Script expects). No -X POST:
// with -L that would force POST on the redirect too and the echo URL refuses it.
function post_(cfg, body){
  var left=HARD-(Date.now()-T0); if(left<20000) throw new Error('out of time for this run (next run)');
  var pid=String(safe_(function(){ return $.NSProcessInfo.processInfo.processIdentifier; }, 0)), tmp=DIR+'/post-'+pid+'.json', res=DIR+'/resp-'+pid+'.json', code='', txt='';
  if(!writeFile_(tmp, JSON.stringify(body))) throw new Error('couldn’t write a temporary file in '+DIR);
  try{
    code=String(SA.doShellScript('/usr/bin/curl -sS -m '+Math.min(120, Math.floor(left/1000)-10)+' -H '+q_('Content-Type: application/json; charset=utf-8')+
      ' --data-binary @'+q_(tmp)+' -L -o '+q_(res)+' -w '+q_('%{http_code}')+' '+q_(cfg.brain), {alteringLineEndings:false})).trim();
    txt=readFile_(res)||'';
  }catch(e){ throw new Error('couldn’t reach Life OS: '+clip_(msg_(e).replace(/\s+/g, ' '), 200)); }
  finally{ rm_(tmp); rm_(res); }
  var plain=function(){ return clip_(txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), 160); };
  if(code!=='200') throw new Error('Life OS answered HTTP '+code+': '+plain());
  var j=null; try{ j=JSON.parse(txt); }catch(_){ throw new Error('Life OS sent back something that isn’t JSON: '+plain()); }
  if(!j || j.ok!==true){ var er=String(j && j.error || 'not ok');
    throw new Error(/unauthori/i.test(er)?'Life OS didn’t accept the connect key — run the install command from the Life OS Mail page again':'Life OS: '+clip_(er, 200)); }
  return j;
}
function pub_(it){ var o={}; Object.keys(it).forEach(function(k){ if(k.charAt(0)!=='_') o[k]=it[k]; }); return o; }
function pubC_(c){ return {id:c.id, threadId:c.threadId, from:c.from, kind:c.kind}; }
// Unload our own LaunchAgent (Life OS said stop for every inbox). disable keeps it off after a restart; install.sh re-enables.
function stopAgent_(){
  if(DRY) return;
  try{ SA.doShellScript('u=$(/usr/bin/id -u); /bin/launchctl disable gui/$u/'+LABEL+' >/dev/null 2>&1; (/bin/launchctl bootout gui/$u/'+LABEL+' >/dev/null 2>&1 &)'); }
  catch(e){ say_('couldn’t unload the LaunchAgent: '+msg_(e)); }
}

/* ---------------- state (state.json beside config.json) ---------------- */
// seen: [{i: Message-ID, a: account, c: category, t: received ms, fr: sender, m: where we moved it ('' = inbox),
//         f: flag colour we set (-1 none), s: Brad had flagged it, r: replied reported, q: rescued reported}] — newest 2,000
function load_(){
  var j=json_(readFile_(DIR+'/state.json'), {}), S={};
  S.seen=Array.isArray(j.seen)?j.seen.filter(function(e){ return e && e.i && e.a; }):[];
  S.sentSeen=Array.isArray(j.sentSeen)?j.sentSeen:[]; S.doneQ=Array.isArray(j.doneQ)?j.doneQ.map(String):[]; S.log=Array.isArray(j.log)?j.log:[];
  SKEYS.forEach(function(k){ S[k]=j[k] && typeof j[k]==='object' && !Array.isArray(j[k])?j[k]:{}; });
  S.lastRun=j.lastRun||null;
  S.ix={}; S.seen.forEach(function(e){ S.ix[e.a+'|'+e.i]=e; });
  S.sentSet={}; S.sentSeen.forEach(function(x){ S.sentSet[x]=1; });
  S.doneSet={}; S.doneQ.forEach(function(x){ S.doneSet[x]=1; });
  return S;
}
function save_(S){
  if(DRY) return;
  if(S.seen.length>RING){ S.seen=S.seen.slice(-RING); S.ix={}; S.seen.forEach(function(e){ S.ix[e.a+'|'+e.i]=e; }); }
  if(S.sentSeen.length>SENT_RING) S.sentSeen=S.sentSeen.slice(-SENT_RING);
  if(S.doneQ.length>DONE_RING) S.doneQ=S.doneQ.slice(-DONE_RING);
  var o={v:1, seen:S.seen, sentSeen:S.sentSeen, doneQ:S.doneQ, log:S.log.slice(-LOG_N), lastRun:S.lastRun};
  SKEYS.forEach(function(k){ o[k]=S[k]; });
  if(!writeFile_(DIR+'/state.json', JSON.stringify(o))) throw new Error('couldn’t write state.json in '+DIR);
}
function seenHas_(S, a, id){ return !!S.ix[a+'|'+id]; }
function seenGet_(S, a, id){ return S.ix[a+'|'+id]||null; }
function seenPut_(S, e){ var k=e.a+'|'+e.i, cur=S.ix[k];
  if(cur){ Object.keys(e).forEach(function(x){ cur[x]=e[x]; }); return cur; }
  S.seen.push(e); S.ix[k]=e; return e; }
function sentAdd_(S, id){ if(S.sentSet[id]) return; S.sentSet[id]=1; S.sentSeen.push(id); }
function doneAdd_(S, q){ if(S.doneSet[q]) return; S.doneSet[q]=1; S.doneQ.push(q); }
function logSet_(S, r){ S.log=S.log.filter(function(x){ return x.qid!==r.qid; }); S.log.push(r); if(S.log.length>LOG_N) S.log=S.log.slice(-LOG_N); }
function logGet_(S, q){ for(var i=S.log.length-1;i>=0;i--) if(S.log[i].qid===q) return S.log[i]; return null; }
function clean_(r){ return {qid:String(r.qid), ok:!!r.ok, error:r.error||'', draftId:r.draftId||'', messageId:r.messageId||''}; }
function addPend_(S, k, out){ var p=S.pend[k]||[]; out.forEach(function(r){ p=p.filter(function(x){ return x.qid!==r.qid; }); p.push(clean_(r)); }); S.pend[k]=p.slice(-60); }
function ackPend_(S, k, sent){ if(!sent.length) return; var q={}; sent.forEach(function(r){ q[r.qid]=1; });
  S.pend[k]=(S.pend[k]||[]).filter(function(r){ return !q[r.qid]; }); if(!S.pend[k].length) delete S.pend[k]; }
// A command whose run died midway (placeholder still marked) is reported as interrupted — never run again.
function stale_(S){ S.log.forEach(function(r){ if(!r._s) return; delete r._s; var k=r.a||'';
  if(k && !(S.pend[k]||[]).some(function(p){ return p.qid===r.qid; })) (S.pend[k]=S.pend[k]||[]).push(clean_(r)); }); }
function carry_(S, k, cmds){ var c=(cmds||[]).filter(function(x){ return x && x.qid!=null && !S.doneSet[String(x.qid)]; }).slice(0, 15);
  if(c.length) S.carry[k]=c; else delete S.carry[k]; }
function uniqQ_(cmds){ var s={}; return (cmds||[]).filter(function(c){ if(!c || c.qid==null) return false; var q=String(c.qid); if(s[q]) return false; s[q]=1; return true; }); }
function lock_(){
  var p=DIR+'/run.lock';
  for(var k=0;k<2;k++){
    if(mkdir_(p, false)){ writeFile_(p+'/started', String(Date.now())); return p; }
    if(!exists_(p)){ RUNERR.push('couldn’t make the run lock in '+DIR); return ''; }   // run unlocked rather than never
    var t=+(readFile_(p+'/started')||0)||mtime_(p);                 // no 'started' yet: another run is just starting (judge by the folder)
    if(!t || Date.now()-t>HARD+120000){ rm_(p); continue; }          // left behind by a run that died
    return null; }
  return null;
}

/* ---------------- files + environment (ObjC bridge) ---------------- */
function fm_(){ return $.NSFileManager.defaultManager; }
function readFile_(p){ try{ var s=$.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null), v=ObjC.unwrap(s); return typeof v==='string'?v:null; }catch(_){ return null; } }
function writeFile_(p, txt){ try{ return !!$(String(txt)).writeToFileAtomicallyEncodingError(p, true, $.NSUTF8StringEncoding, null); }catch(_){ return false; } }   // atomically = temp file + rename
// mkdir / exists / rm go through the shell: the ObjC file calls answered wrongly under launchd (the run lock was never
// removed, so every run reported "couldn't make the run lock" and temp files could pile up). A non-zero exit → null.
function sh_(cmd){ try{ return String(SA.doShellScript(cmd)).trim(); }catch(_){ return null; } }
function mkdir_(p, deep){ return sh_('/bin/mkdir '+(deep?'-p ':'')+q_(p)+' 2>/dev/null && echo ok')==='ok'; }
function mtime_(p){ try{ var d=fm_().attributesOfItemAtPathError(p, null).objectForKey('NSFileModificationDate'); return Math.round(+d.timeIntervalSince1970*1000)||0; }catch(_){ return 0; } }
function exists_(p){ return sh_('[ -e '+q_(p)+' ] && echo y || echo n')==='y'; }
function rm_(p){ p=String(p||''); if(!DIR || p.indexOf(DIR+'/')!==0 || /\/\.\.?(\/|$)/.test(p)) return; sh_('/bin/rm -rf '+q_(p)); }   // only ever inside our own folder
// leftovers from runs that died mid-post (they hold mail text): anything older than 10 minutes goes
function scrub_(){ sh_('/usr/bin/find '+q_(DIR)+' -maxdepth 1 -type f \\( -name '+q_('post-*.json')+' -o -name '+q_('resp-*.json')+' \\) -mmin +10 -delete'); }
function env_(k){ try{ var v=ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(k)); return typeof v==='string'?v:''; }catch(_){ return ''; } }
function dir_(){
  var d=env_('LIFEOS_MAIL_DIR')||(ObjC.unwrap($.NSHomeDirectory())+'/Library/Application Support/LifeOSMail');
  mkdir_(d, true); return d;
}
function cfg_(){ var j=json_(readFile_(DIR+'/config.json'), {}); return {key:String(j.key||'').trim(), brain:String(j.brain||'').trim()||BRAIN_URL}; }

/* ---------------- helpers ---------------- */
function hdrs_(raw){
  var o={}, t=String(raw||'').replace(/\r\n?/g, '\n'), end=t.search(/\n\n/); if(end>0) t=t.slice(0, end);
  t.replace(/\n[ \t]+/g, ' ').split('\n').forEach(function(l){ var k=l.match(/^([!-9;-~]+):[ \t]*(.*)$/); if(k){ var n=k[1].toLowerCase(); (o[n]=o[n]||[]).push(k[2].trim()); } });
  return function(n){ return (o[n]||[]).join(', '); };
}
function rcpt_(col){
  try{ var a=col.address(); if(Array.isArray(a)) return a.map(function(x){ return String(x||'').trim().toLowerCase(); }).filter(String); }catch(_){}
  try{ return col().map(function(r){ return String(r.address()||'').trim().toLowerCase(); }).filter(String); }catch(_){ return []; }
}
// Plain text minus the quoted conversation below a reply, with long tracking links shortened to their site (same as the Google agent).
function stripQuoted_(t){
  t=String(t||'').replace(/\r\n?/g, '\n');
  var k=t.search(/^[ \t]*(On [^\n]{0,200}(\n[^\n]{0,200})?wrote:[ \t]*$|-{2,}[ \t]*Original Message[ \t]*-{2,}|_{10,}[ \t]*$|From:[ \t][^\n]+\n([^\n]*\n){0,2}?(Sent|Date):[ \t])/im);
  if(k>0) t=t.slice(0, k);
  t=t.split('\n').filter(function(l){ return !/^[ \t]*>/.test(l); }).join('\n');
  t=t.replace(/https?:\/\/[^\s<>"')\]]{50,}/g, function(u){ var s=u.match(/^https?:\/\/[^\/?#]+/); return (s?s[0]:u.slice(0, 40))+'/…'; });
  return t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
// -1743 not permitted / -1744 would need consent (a background job can't show the box): both mean the Automation switch.
function permMsg_(e){
  var n=e && e.errorNumber, s=msg_(e);
  if(e && e.aeWait) return s;                                         // Mail never answered (see accounts_)
  if(n!==-1743 && n!==-1744 && !/-174[34]|not authori[sz]ed to send apple events|(would )?requires? user consent/i.test(s)) return '';
  return 'macOS hasn’t let this control Mail yet: open System Settings → Privacy & Security → Automation, switch on Mail under osascript (and Terminal), then run it again';
}
function norm_(s){ s=String(s==null?'':s); try{ s=s.normalize('NFC'); }catch(_){} return s.replace(/\uFFFC/g, '').replace(/\s+/g, ' ').trim(); }
function mid_(x){ return String(x==null?'':x).trim().replace(/^<+|>+$/g, ''); }
function emails_(s){ var m=String(s||'').match(/[A-Z0-9._%+'\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi)||[], o=[];
  m.forEach(function(x){ x=x.toLowerCase(); if(o.indexOf(x)<0) o.push(x); }); return o; }
function late_(by){ return Date.now()-T0>by; }
function safe_(f, d){ try{ var v=f(); return v==null?d:v; }catch(_){ return d; } }
function clip_(s, n){ s=String(s==null?'':s); return s.length>n?s.slice(0, n-1)+'…':s; }
function json_(s, d){ if(s==null) return d; try{ var v=JSON.parse(s); return v==null?d:v; }catch(_){ return d; } }
function msg_(e){ return String(e && e.message || e); }
function truthy_(v){ return v===true || v===1 || v==='1' || v==='true'; }
function q_(s){ return "'"+String(s).replace(/'/g, "'\\''")+"'"; }
function iso_(t){ return new Date(t).toISOString(); }
function p2_(n){ return (n<10?'0':'')+n; }
function stamp_(){ var d=new Date(Date.now()); return d.getFullYear()+'-'+p2_(d.getMonth()+1)+'-'+p2_(d.getDate())+' '+p2_(d.getHours())+':'+p2_(d.getMinutes())+':'+p2_(d.getSeconds()); }
function fmt_(iso){ var d=new Date(iso); return isNaN(d.getTime())?String(iso):d.toLocaleString(); }
function say_(s){ console.log(stamp_()+'  '+s); return s; }
