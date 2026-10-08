/* PAR test prep — figures. Original chart images drawn as SVG (nothing from the FAA testing supplement), so the
   question can only be answered by reading the chart. Each figure: id → {title, svg}. Values are for a generic
   four-seat trainer ("the airplane") and are internally consistent; they are NOT any real POH. */
(function(){
  var F = {};
  var S = function(w,h,body){ return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="100%" style="background:#fff;border-radius:8px;font-family:Helvetica,Arial,sans-serif;color:#111">'+body+'</svg>'; };
  var T = function(x,y,t,o){ o=o||{}; return '<text x="'+x+'" y="'+y+'" font-size="'+(o.s||12)+'" fill="'+(o.c||'#111')+'"'+(o.a?' text-anchor="'+o.a+'"':'')+(o.b?' font-weight="700"':'')+(o.f?' font-family="'+o.f+'"':'')+(o.r?' transform="rotate('+o.r+' '+x+' '+y+')"':'')+'>'+t+'</text>'; };
  function table(x,y,cols,rows,cw,rh,opt){ opt=opt||{}; var out='', w=cw.reduce(function(a,b){return a+b;},0);
    out+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+rh+'" fill="#e8e8e8" stroke="#333"/>';
    var cx=x; cols.forEach(function(c,i){ out+=T(cx+cw[i]/2, y+rh*0.65, c, {s:opt.fs||11,a:'middle',b:true}); cx+=cw[i]; });
    rows.forEach(function(r,ri){ var yy=y+rh*(ri+1); out+='<rect x="'+x+'" y="'+yy+'" width="'+w+'" height="'+rh+'" fill="'+(ri%2?'#f7f7f7':'#fff')+'" stroke="#333"/>'; var cx2=x;
      r.forEach(function(v,i){ out+=T(cx2+cw[i]/2, yy+rh*0.65, v, {s:opt.fs||11,a:'middle',b:i===0&&opt.boldFirst}); cx2+=cw[i]; }); });
    var cx3=x; cw.forEach(function(w0){ out+='<line x1="'+cx3+'" y1="'+y+'" x2="'+cx3+'" y2="'+(y+rh*(rows.length+1))+'" stroke="#333"/>'; cx3+=w0; });
    return out; }

  /* ---------- Weight & balance ---------- */
  (function(){
    var b='';
    b+=T(16,22,'FIGURE A — WEIGHT AND BALANCE DATA',{s:14,b:true});
    b+=T(16,40,'Maximum ramp weight 2,558 lb · Maximum takeoff/landing weight 2,550 lb · Utility category maximum 2,200 lb',{s:11});
    b+=table(16,52,['Item','Weight (lb)','Arm (in)','Moment (lb-in)'],[
      ['Basic empty weight (incl. oil)','1,680','39.6','66,528'],
      ['Front seats (pilot & passenger)','—','37.0','—'],
      ['Rear seats','—','73.0','—'],
      ['Fuel — 53 gal usable, 6 lb/gal','—','48.0','—'],
      ['Baggage area A (max 120 lb)','—','95.0','—'],
      ['Baggage area B (max 50 lb)','—','123.0','—']],[230,90,70,110],20,{fs:11,boldFirst:false});
    b+=T(16,208,'Baggage areas A + B combined may not exceed 120 lb. Unusable fuel is included in basic empty weight.',{s:10.5,c:'#333'});
    // envelope
    var ox=560, oy=60, W=300, H=200;  // plot area: CG 34..48 in (x), weight 1,500..2,600 lb (y)
    var X=function(cg){ return ox+(cg-34)/14*W; }, Y=function(wt){ return oy+H-(wt-1500)/1100*H; };
    b+='<rect x="'+ox+'" y="'+oy+'" width="'+W+'" height="'+H+'" fill="#fff" stroke="#333"/>';
    for(var cg=34;cg<=48;cg+=2){ b+='<line x1="'+X(cg)+'" y1="'+oy+'" x2="'+X(cg)+'" y2="'+(oy+H)+'" stroke="#ddd"/>'+T(X(cg),oy+H+14,String(cg),{s:10,a:'middle'}); }
    for(var wt=1600;wt<=2600;wt+=200){ b+='<line x1="'+ox+'" y1="'+Y(wt)+'" x2="'+(ox+W)+'" y2="'+Y(wt)+'" stroke="#ddd"/>'+T(ox-6,Y(wt)+4,wt.toLocaleString(),{s:10,a:'end'}); }
    // normal category: fwd 35.0 to 1,950 then line to 41.0 at 2,550; aft 47.3
    b+='<polygon points="'+X(35)+','+Y(1500)+' '+X(35)+','+Y(1950)+' '+X(41)+','+Y(2550)+' '+X(47.3)+','+Y(2550)+' '+X(47.3)+','+Y(1500)+'" fill="rgba(60,120,220,.12)" stroke="#1f5fbf" stroke-width="2"/>';
    // utility: fwd 35.0 to 1,950 then line to 40.5 at 2,200; aft 40.5; max 2,200
    b+='<polygon points="'+X(35)+','+Y(1500)+' '+X(35)+','+Y(1950)+' '+X(40.5)+','+Y(2200)+' '+X(40.5)+','+Y(1500)+'" fill="none" stroke="#b02020" stroke-width="2" stroke-dasharray="6 4"/>';
    b+=T(X(43),Y(2100),'NORMAL CATEGORY',{s:11,b:true,c:'#1f5fbf',a:'middle'})+T(X(37.5),Y(1700),'UTILITY',{s:10,b:true,c:'#b02020',a:'middle'});
    b+=T(ox+W/2,oy+H+30,'Center of gravity — inches aft of datum',{s:11,a:'middle'})+T(ox-40,oy+H/2,'Weight (lb)',{s:11,a:'middle',r:-90});
    b+=T(ox,oy-10,'CENTER OF GRAVITY LIMITS',{s:12,b:true});
    F.wb={title:'Figure A — Weight and balance data and CG envelope', svg:S(880,300,b)};
  })();

  /* ---------- Takeoff distance ---------- */
  (function(){
    var rows=[['Sea level','860 / 1,465','925 / 1,575','995 / 1,690','1,070 / 1,810','1,150 / 1,945'],
      ['1,000','940 / 1,600','1,010 / 1,720','1,090 / 1,850','1,170 / 1,990','1,260 / 2,135'],
      ['2,000','1,025 / 1,755','1,110 / 1,890','1,195 / 2,030','1,285 / 2,185','1,380 / 2,350'],
      ['3,000','1,125 / 1,925','1,215 / 2,080','1,310 / 2,240','1,410 / 2,410','1,515 / 2,600'],
      ['4,000','1,235 / 2,120','1,335 / 2,295','1,440 / 2,480','1,550 / 2,675','1,660 / 2,885'],
      ['5,000','1,355 / 2,345','1,465 / 2,545','1,585 / 2,755','1,705 / 2,975','1,825 / 3,215'],
      ['6,000','1,495 / 2,605','1,615 / 2,830','1,745 / 3,075','1,875 / 3,335','2,010 / 3,615'],
      ['7,000','1,645 / 2,910','1,785 / 3,170','1,920 / 3,440','2,065 / 3,750','2,215 / 4,075'],
      ['8,000','1,820 / 3,255','1,970 / 3,560','2,120 / 3,880','2,280 / 4,245','2,450 / 4,635']];
    var b=T(16,22,'FIGURE B — SHORT-FIELD TAKEOFF DISTANCE (ground roll / total to clear 50-ft obstacle), feet',{s:13,b:true})
      +T(16,40,'Conditions: 2,550 lb · flaps 10° · full throttle before brake release · paved, level, dry runway · zero wind · lift-off 51 KIAS, 56 KIAS at 50 ft',{s:10.5})
      +table(16,50,['Pressure altitude (ft)','0 °C','10 °C','20 °C','30 °C','40 °C'],rows,[150,130,130,130,130,130],19,{fs:11,boldFirst:true})
      +T(16,262,'NOTES: 1. Decrease distances 10% for each 9 knots of headwind. For operation with tailwinds up to 10 knots, increase distances by 10% for each 2 knots.',{s:10.5})
      +T(16,278,'2. For operation on a dry, grass runway, increase distances by 15% of the “ground roll” figure.  3. Where distance values have been replaced by dashes, the climb gradient is inadequate.',{s:10.5});
    F.to={title:'Figure B — Short-field takeoff distance', svg:S(880,290,b)};
  })();

  /* ---------- Landing distance ---------- */
  (function(){
    var base=[545,1290]; var rows=[]; var pas=['Sea level','1,000','2,000','3,000','4,000','5,000','6,000','7,000','8,000'];
    for(var i=0;i<pas.length;i++){ var r=[pas[i]]; for(var t=0;t<5;t++){ var gr=Math.round((base[0]+i*22+t*20)/5)*5, tot=Math.round((base[1]+i*40+t*30)/5)*5; r.push(gr.toLocaleString()+' / '+tot.toLocaleString()); } rows.push(r); }
    var b=T(16,22,'FIGURE C — SHORT-FIELD LANDING DISTANCE (ground roll / total over 50-ft obstacle), feet',{s:13,b:true})
      +T(16,40,'Conditions: 2,550 lb · flaps 30° · power off · maximum braking · paved, level, dry runway · zero wind · speed at 50 ft 61 KIAS',{s:10.5})
      +table(16,50,['Pressure altitude (ft)','0 °C','10 °C','20 °C','30 °C','40 °C'],rows,[150,130,130,130,130,130],19,{fs:11,boldFirst:true})
      +T(16,262,'NOTES: 1. Decrease distances 10% for each 9 knots of headwind. For operation with tailwinds up to 10 knots, increase distances by 10% for each 2 knots.',{s:10.5})
      +T(16,278,'2. For operation on a dry, grass runway, increase distances by 45% of the “ground roll” figure.',{s:10.5});
    F.ldg={title:'Figure C — Short-field landing distance', svg:S(880,290,b)};
  })();

  /* ---------- Crosswind component chart ---------- */
  (function(){
    var ox=70, oy=270, R=230; var b=T(16,22,'FIGURE D — WIND COMPONENT CHART',{s:13,b:true});
    for(var sp=10;sp<=50;sp+=10){ var r=R*sp/50; b+='<path d="M '+ox+' '+(oy-r)+' A '+r+' '+r+' 0 0 1 '+(ox+r)+' '+oy+'" fill="none" stroke="#888"/>'+T(ox+r*0.72+6,oy-r*0.72-4,sp+' kt',{s:9,c:'#555'}); }
    for(var a=0;a<=90;a+=10){ var rad=a*Math.PI/180; var x2=ox+R*Math.sin(rad), y2=oy-R*Math.cos(rad); b+='<line x1="'+ox+'" y1="'+oy+'" x2="'+x2+'" y2="'+y2+'" stroke="#aaa"/>'+T(ox+(R+14)*Math.sin(rad),oy-(R+14)*Math.cos(rad)+4,a+'°',{s:9.5,a:'middle'}); }
    for(var g=0;g<=50;g+=10){ var p=R*g/50; b+='<line x1="'+ox+'" y1="'+(oy-p)+'" x2="'+(ox+R)+'" y2="'+(oy-p)+'" stroke="#ddd"/>'+'<line x1="'+(ox+p)+'" y1="'+oy+'" x2="'+(ox+p)+'" y2="'+(oy-R)+'" stroke="#ddd"/>'+T(ox-8,oy-p+4,String(g),{s:10,a:'end'})+T(ox+p,oy+14,String(g),{s:10,a:'middle'}); }
    b+='<line x1="'+ox+'" y1="'+oy+'" x2="'+(ox+R)+'" y2="'+oy+'" stroke="#111" stroke-width="1.5"/><line x1="'+ox+'" y1="'+oy+'" x2="'+ox+'" y2="'+(oy-R)+'" stroke="#111" stroke-width="1.5"/>';
    b+=T(ox+R/2,oy+32,'CROSSWIND COMPONENT (kt)',{s:11,a:'middle',b:true})+T(ox-44,oy-R/2,'HEADWIND COMPONENT (kt)',{s:11,a:'middle',b:true,r:-90});
    b+=T(360,70,'Angle between wind direction and runway',{s:11,b:true})+T(360,88,'heading, measured from the runway.',{s:11})+T(360,114,'Arcs = wind speed. Read headwind on the',{s:11})+T(360,130,'vertical axis and crosswind on the horizontal.',{s:11});
    F.xw={title:'Figure D — Wind component chart', svg:S(620,320,b)};
  })();

  /* ---------- METAR / SPECI / PIREP ---------- */
  (function(){
    var lines=['METAR KRVN 141753Z 25012G22KT 10SM FEW060 BKN110 24/02 A2992 RMK AO2 PK WND 25028/1712 SLP108 T02390017',
      'METAR KMDN 141755Z AUTO 00000KT 1/2SM FG VV002 06/06 A3001 RMK AO2',
      'SPECI KSAK 141812Z 18006KT 2SM -RA BR OVC008 12/11 A2985 RMK AO2 RAB05 P0002',
      'METAR KELY 141756Z 33018G30KT 300V360 7SM -SHSN BKN025 OVC040 M03/M08 A2971 RMK AO2 WSHFT 1735',
      '',
      'UA /OV RVN180015 /TM 1730 /FL085 /TP C172 /SK BKN070-TOP090 /TA 02 /WV 24025KT /TB LGT-MOD /IC NEG /RM SMOOTH ABV 090',
      'UUA /OV SAK /TM 1805 /FL040 /TP PA28 /TB SEV /RM LLWS +15KT ON FINAL RWY 18'];
    var b=T(16,22,'FIGURE E — AVIATION ROUTINE WEATHER REPORTS AND PILOT REPORTS',{s:13,b:true});
    lines.forEach(function(l,i){ b+=T(16,50+i*22,l,{s:12.5,f:'Menlo, Consolas, monospace'}); });
    F.wx={title:'Figure E — METAR / SPECI / PIREP', svg:S(880,220,b)};
  })();

  /* ---------- TAF + winds aloft ---------- */
  (function(){
    var lines=['TAF KRVN 141730Z 1418/1518 24010KT P6SM FEW070',
      '     FM142000 25015G25KT P6SM SCT060 BKN090',
      '     TEMPO 1422/1424 4SM TSRA BKN040CB',
      '     FM150300 30008KT P6SM SKC',
      '     FM151500 VRB03KT 3SM BR SCT015',
      '',
      'FB  DATA BASED ON 141200Z   VALID 150000Z   FOR USE 2100-0600Z. TEMPS NEG ABV 24000',
      'FT   3000    6000    9000    12000   18000   24000',
      'RVN  2415    2425-02 2535-07 2545-12 2660-24 2775-36',
      'SAK  1808    2012+04 2216-01 2320-06 2340-18 2355-30',
      'ELY          3320-05 3325-10 3330-15 3345-27 3350-40'];
    var b=T(16,22,'FIGURE F — TERMINAL AERODROME FORECAST AND WINDS/TEMPERATURES ALOFT FORECAST',{s:13,b:true});
    lines.forEach(function(l,i){ b+=T(16,50+i*22,l,{s:12.5,f:'Menlo, Consolas, monospace'}); });
    F.taf={title:'Figure F — TAF and winds aloft (FB)', svg:S(880,300,b)};
  })();

  /* ---------- Airport signs ---------- */
  (function(){
    var signs=[ ['A','#c8102e','#fff','16-34',''], ['B','#f2c511','#111','B →',''], ['C','#111','#f2c511','A',''], ['D','#c8102e','#fff','ILS',''],
      ['E','#f2c511','#111','MIL ↑',''], ['F','#f2c511','#111','⇤ 16-34 ⇥','stripe'], ['G','#111','#fff','3',''], ['H','#fff','#c8102e','⊘','circle'] ];
    var b=T(16,22,'FIGURE G — AIRPORT SIGNS',{s:13,b:true});
    signs.forEach(function(s,i){ var x=16+(i%4)*210, y=40+Math.floor(i/4)*120;
      b+='<rect x="'+x+'" y="'+y+'" width="180" height="70" rx="6" fill="'+s[1]+'" stroke="#333" stroke-width="2"/>';
      if(s[4]==='stripe'){ for(var k=0;k<6;k++){ b+='<rect x="'+(x+8+k*28)+'" y="'+(y+8)+'" width="14" height="54" fill="#111"/>'; } b+='<rect x="'+(x+8)+'" y="'+(y+26)+'" width="164" height="18" fill="'+s[1]+'"/>'; b+=T(x+90,y+40,'',{}); }
      else if(s[4]==='circle'){ b+='<circle cx="'+(x+90)+'" cy="'+(y+35)+'" r="26" fill="#c8102e"/><rect x="'+(x+66)+'" y="'+(y+31)+'" width="48" height="8" fill="#fff"/>'; }
      else b+=T(x+90,y+45,s[3],{s:26,b:true,c:s[2],a:'middle'});
      b+=T(x+90,y+92,'Sign '+s[0],{s:12,b:true,a:'middle'}); });
    F.signs={title:'Figure G — Airport signs', svg:S(880,290,b)};
  })();

  /* ---------- Runway markings ---------- */
  (function(){
    var b=T(16,22,'FIGURE H — RUNWAY AND TAXIWAY MARKINGS (not to scale)',{s:13,b:true});
    b+='<rect x="40" y="60" width="800" height="110" fill="#555"/>';
    // blast pad chevrons (left end)
    for(var i=0;i<4;i++){ var x=48+i*24; b+='<polyline points="'+x+',70 '+(x+16)+',115 '+x+',160" fill="none" stroke="#f2c511" stroke-width="4"/>'; }
    b+='<line x1="150" y1="60" x2="150" y2="170" stroke="#fff" stroke-width="6"/>';   // demarcation bar
    for(var k=0;k<5;k++){ b+='<line x1="162" y1="'+(80+k*20)+'" x2="250" y2="'+(80+k*20)+'" stroke="#fff" stroke-width="3"/><polygon points="250,'+(75+k*20)+' 262,'+(80+k*20)+' 250,'+(85+k*20)+'" fill="#fff"/>'; } // displaced threshold arrows
    for(var m=0;m<8;m++){ b+='<rect x="272" y="'+(66+m*13)+'" width="40" height="7" fill="#fff"/>'; }   // threshold bars
    b+=T(360,125,'27',{s:40,b:true,c:'#fff',a:'middle'});
    b+='<rect x="420" y="78" width="30" height="16" fill="#fff"/><rect x="420" y="136" width="30" height="16" fill="#fff"/>';  // TDZ pair
    b+='<rect x="500" y="78" width="60" height="16" fill="#fff"/><rect x="500" y="136" width="60" height="16" fill="#fff"/>';  // aiming point
    for(var c=0;c<6;c++){ b+='<rect x="'+(600+c*28)+'" y="112" width="16" height="6" fill="#fff"/>'; }  // centerline
    b+=T(100,190,'1',{s:13,b:true,a:'middle'})+T(150,190,'2',{s:13,b:true,a:'middle'})+T(210,190,'3',{s:13,b:true,a:'middle'})+T(292,190,'4',{s:13,b:true,a:'middle'})+T(435,190,'5',{s:13,b:true,a:'middle'})+T(530,190,'6',{s:13,b:true,a:'middle'});
    // taxiway joining from below with hold-short markings
    b+='<rect x="640" y="170" width="70" height="130" fill="#777"/>';
    b+='<line x1="640" y1="200" x2="710" y2="200" stroke="#f2c511" stroke-width="4"/><line x1="640" y1="208" x2="710" y2="208" stroke="#f2c511" stroke-width="4"/>';
    b+='<line x1="640" y1="216" x2="710" y2="216" stroke="#f2c511" stroke-width="4" stroke-dasharray="8 6"/><line x1="640" y1="224" x2="710" y2="224" stroke="#f2c511" stroke-width="4" stroke-dasharray="8 6"/>';
    b+=T(725,215,'7',{s:13,b:true});
    b+='<line x1="640" y1="250" x2="710" y2="250" stroke="#f2c511" stroke-width="4"/><line x1="640" y1="264" x2="710" y2="264" stroke="#f2c511" stroke-width="4"/>';
    for(var l=0;l<6;l++){ b+='<line x1="'+(646+l*12)+'" y1="250" x2="'+(646+l*12)+'" y2="264" stroke="#f2c511" stroke-width="3"/>'; }
    b+=T(725,262,'8',{s:13,b:true});
    b+='<line x1="675" y1="170" x2="675" y2="300" stroke="#f2c511" stroke-width="3"/>';
    b+='<line x1="760" y1="180" x2="840" y2="180" stroke="#f2c511" stroke-width="3"/><line x1="760" y1="188" x2="840" y2="188" stroke="#f2c511" stroke-width="3" stroke-dasharray="8 6"/>'+T(800,205,'9',{s:13,b:true,a:'middle'});
    b+=T(16,320,'Numbered items are referenced by the questions.',{s:10.5,c:'#333'});
    F.rwy={title:'Figure H — Runway and taxiway markings', svg:S(880,330,b)};
  })();

  /* ---------- VOR indications ---------- */
  (function(){
    var panels=[{l:'A',obs:'030',flag:'TO',dots:-2},{l:'B',obs:'210',flag:'FROM',dots:0},{l:'C',obs:'090',flag:'TO',dots:5},{l:'D',obs:'270',flag:'FROM',dots:3}];
    var b=T(16,22,'FIGURE I — VOR COURSE DEVIATION INDICATIONS',{s:13,b:true});
    panels.forEach(function(p,i){ var cx=120+i*215, cy=150, r=85;
      b+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#222" stroke="#999" stroke-width="3"/>';
      for(var d=-2;d<=2;d++){ if(d) b+='<circle cx="'+(cx+d*16)+'" cy="'+cy+'" r="3" fill="#ddd"/>'; }
      b+='<line x1="'+(cx+p.dots*16)+'" y1="'+(cy-55)+'" x2="'+(cx+p.dots*16)+'" y2="'+(cy+55)+'" stroke="#fff" stroke-width="4"/>';
      b+='<rect x="'+(cx-28)+'" y="'+(cy-r-2)+'" width="56" height="20" fill="#fff" stroke="#333"/>'+T(cx,cy-r+13,p.obs,{s:13,b:true,a:'middle'});
      b+=T(cx,cy+34,p.flag,{s:12,b:true,c:'#fff',a:'middle'})+T(cx,cy-30,'OBS '+p.obs+'°',{s:10,c:'#ccc',a:'middle'});
      b+=T(cx,cy+r+22,'Indicator '+p.l,{s:12,b:true,a:'middle'}); });
    b+=T(16,278,'Needle shown relative to center; each dot = 2°. The OBS course selected is shown in the window above each instrument.',{s:10.5,c:'#333'});
    F.vor={title:'Figure I — VOR indications', svg:S(880,290,b)};
  })();

  /* ---------- Airspeed indicator ---------- */
  (function(){
    var cx=170, cy=160, r=130; var b=T(16,22,'FIGURE J — AIRSPEED INDICATOR',{s:13,b:true});
    var ang=function(v){ return (-120 + (v-40)/(200-40)*300)*Math.PI/180; };   // 40..200 kt over 300°
    var arc=function(v1,v2,rr,col,w){ var a1=ang(v1), a2=ang(v2); var x1=cx+rr*Math.sin(a1), y1=cy-rr*Math.cos(a1), x2=cx+rr*Math.sin(a2), y2=cy-rr*Math.cos(a2); return '<path d="M '+x1+' '+y1+' A '+rr+' '+rr+' 0 '+((v2-v1)/160*300>180?1:0)+' 1 '+x2+' '+y2+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"/>'; };
    b+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#222" stroke="#999" stroke-width="3"/>';
    b+=arc(40,85,r-14,'#fff',8)+arc(48,129,r-24,'#2f9e44',8)+arc(129,163,r-24,'#f2c511',8);
    var a163=ang(163); b+='<line x1="'+(cx+(r-32)*Math.sin(a163))+'" y1="'+(cy-(r-32)*Math.cos(a163))+'" x2="'+(cx+(r-8)*Math.sin(a163))+'" y2="'+(cy-(r-8)*Math.cos(a163))+'" stroke="#e03131" stroke-width="5"/>';
    for(var v=40;v<=200;v+=20){ var a=ang(v); b+=T(cx+(r-44)*Math.sin(a), cy-(r-44)*Math.cos(a)+4, String(v), {s:11,c:'#fff',a:'middle',b:true}); }
    var an=ang(112); b+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+(r-20)*Math.sin(an))+'" y2="'+(cy-(r-20)*Math.cos(an))+'" stroke="#fff" stroke-width="4"/><circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#ccc"/>';
    b+=T(cx,cy+60,'KNOTS',{s:11,c:'#ccc',a:'middle'});
    b+=T(340,70,'White arc: 40 – 85 kt',{s:12})+T(340,92,'Green arc: 48 – 129 kt',{s:12})+T(340,114,'Yellow arc: 129 – 163 kt',{s:12})+T(340,136,'Red line: 163 kt',{s:12})+T(340,170,'Needle indicates 112 kt.',{s:12,b:true})+T(340,200,'The airplane’s POH lists VA = 105 KIAS at 2,550 lb and 92 KIAS at 1,900 lb.',{s:11.5});
    F.asi={title:'Figure J — Airspeed indicator', svg:S(700,310,b)};
  })();

  /* ---------- Flight instruments (unusual attitude) ---------- */
  (function(){
    var b=T(16,22,'FIGURE K — FLIGHT INSTRUMENT INDICATIONS',{s:13,b:true});
    function gauge(cx,cy,label){ return '<circle cx="'+cx+'" cy="'+cy+'" r="70" fill="#222" stroke="#999" stroke-width="3"/>'+T(cx,cy+92,label,{s:11,b:true,a:'middle'}); }
    // ASI 150 and increasing
    var cx=100, cy=120; b+=gauge(cx,cy,'AIRSPEED'); b+=T(cx,cy-30,'150',{s:16,c:'#fff',a:'middle',b:true})+T(cx,cy+28,'KT',{s:10,c:'#ccc',a:'middle'})+'<polygon points="'+(cx+30)+','+(cy-5)+' '+(cx+44)+','+(cy-5)+' '+(cx+37)+','+(cy-20)+'" fill="#f2c511"/>'+T(cx+37,cy+10,'↑',{s:14,c:'#f2c511',a:'middle'});
    // Attitude indicator: nose low, right bank 45
    cx=290; b+='<clipPath id="aiclip"><circle cx="'+cx+'" cy="'+cy+'" r="68"/></clipPath><g clip-path="url(#aiclip)" transform="rotate(45 '+cx+' '+cy+')"><rect x="'+(cx-100)+'" y="'+(cy-120)+'" width="200" height="104" fill="#3b8bd6"/><rect x="'+(cx-100)+'" y="'+(cy-16)+'" width="200" height="140" fill="#8b5a2b"/><line x1="'+(cx-100)+'" y1="'+(cy-16)+'" x2="'+(cx+100)+'" y2="'+(cy-16)+'" stroke="#fff" stroke-width="2"/></g>';
    b+='<circle cx="'+cx+'" cy="'+cy+'" r="70" fill="none" stroke="#999" stroke-width="3"/><line x1="'+(cx-30)+'" y1="'+cy+'" x2="'+(cx-8)+'" y2="'+cy+'" stroke="#f2c511" stroke-width="4"/><line x1="'+(cx+8)+'" y1="'+cy+'" x2="'+(cx+30)+'" y2="'+cy+'" stroke="#f2c511" stroke-width="4"/><circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#f2c511"/>'+T(cx,cy+92,'ATTITUDE',{s:11,b:true,a:'middle'});
    // Altimeter decreasing
    cx=480; b+=gauge(cx,cy,'ALTIMETER'); b+=T(cx,cy-24,'4,300',{s:16,c:'#fff',a:'middle',b:true})+T(cx,cy+30,'29.92',{s:11,c:'#ccc',a:'middle'})+T(cx+40,cy+8,'↓',{s:18,c:'#f2c511',a:'middle'});
    // Turn coordinator right, ball left
    cx=100; cy=310; b+=gauge(cx,cy,'TURN COORDINATOR'); b+='<g transform="rotate(25 '+cx+' '+cy+')"><rect x="'+(cx-40)+'" y="'+(cy-4)+'" width="80" height="8" fill="#fff"/><rect x="'+(cx-6)+'" y="'+(cy-16)+'" width="12" height="14" fill="#fff"/></g><rect x="'+(cx-34)+'" y="'+(cy+36)+'" width="68" height="14" rx="7" fill="#444" stroke="#999"/><circle cx="'+(cx-20)+'" cy="'+(cy+43)+'" r="6" fill="#ddd"/>';
    // Heading indicator
    cx=290; b+=gauge(cx,cy,'HEADING INDICATOR'); b+=T(cx,cy+6,'135',{s:18,c:'#fff',a:'middle',b:true})+'<polygon points="'+cx+','+(cy-66)+' '+(cx-6)+','+(cy-54)+' '+(cx+6)+','+(cy-54)+'" fill="#f2c511"/>';
    // VSI -1500
    cx=480; b+=gauge(cx,cy,'VERTICAL SPEED'); b+=T(cx,cy+6,'−1,500',{s:16,c:'#fff',a:'middle',b:true})+T(cx,cy+28,'FPM',{s:10,c:'#ccc',a:'middle'});
    b+=T(600,110,'Airspeed: 150 kt and increasing',{s:12})+T(600,135,'Altimeter: 4,300 ft and decreasing',{s:12})+T(600,160,'Vertical speed: 1,500 fpm down',{s:12})+T(600,185,'Turn coordinator: right turn, ball left',{s:12})+T(600,210,'Attitude: nose low, right bank',{s:12});
    F.six={title:'Figure K — Flight instrument indications', svg:S(880,420,b)};
  })();

  /* ---------- Airspace profile ---------- */
  (function(){
    var b=T(16,22,'FIGURE L — AIRSPACE PROFILE (altitudes MSL unless noted; airport field elevations shown)',{s:13,b:true});
    var ox=40, oy=330, W=820, H=250; var Y=function(ft){ return oy-ft/18000*H; };
    b+='<rect x="'+ox+'" y="'+Y(18000)+'" width="'+W+'" height="'+(oy-Y(18000))+'" fill="#fff" stroke="#333"/>';
    [1200,2500,4000,10000,14500,18000].forEach(function(ft){ b+='<line x1="'+ox+'" y1="'+Y(ft)+'" x2="'+(ox+W)+'" y2="'+Y(ft)+'" stroke="#e5e5e5"/>'+T(ox-4,Y(ft)+4,ft.toLocaleString(),{s:9.5,a:'end'}); });
    // Class A above 18,000
    b+='<rect x="'+ox+'" y="'+(Y(18000)-22)+'" width="'+W+'" height="22" fill="#eee" stroke="#333"/>'+T(ox+W/2,Y(18000)-7,'CLASS A — 18,000 MSL and above (FL600)',{s:11,b:true,a:'middle'});
    // Class B at left: field elev 1,000; inner SFC-10,000 (shown as "100/SFC"), middle 3,000-10,000, outer 5,000-10,000
    b+='<rect x="'+ox+'" y="'+Y(10000)+'" width="100" height="'+(Y(1000)-Y(10000))+'" fill="rgba(0,70,200,.18)" stroke="#1f5fbf"/><rect x="'+(ox+100)+'" y="'+Y(10000)+'" width="70" height="'+(Y(3000)-Y(10000))+'" fill="rgba(0,70,200,.18)" stroke="#1f5fbf"/><rect x="'+(ox+170)+'" y="'+Y(10000)+'" width="70" height="'+(Y(5000)-Y(10000))+'" fill="rgba(0,70,200,.18)" stroke="#1f5fbf"/>';
    b+=T(ox+120,Y(10000)-6,'CLASS B · ceiling 10,000 MSL · METRO (elev 1,000)',{s:10,b:true,c:'#1f5fbf',a:'middle'})+T(ox+135,Y(3000)+14,'floor 3,000',{s:9,c:'#1f5fbf',a:'middle'})+T(ox+205,Y(5000)+14,'floor 5,000',{s:9,c:'#1f5fbf',a:'middle'})+T(ox+50,Y(1000)+14,'SFC',{s:9,c:'#1f5fbf',a:'middle'});
    // Class C middle: field elev 2,000; inner SFC-6,000 (4,000 AGL), outer 3,200-6,000 (1,200 AGL)
    b+='<rect x="'+(ox+330)+'" y="'+Y(6000)+'" width="90" height="'+(Y(2000)-Y(6000))+'" fill="rgba(160,0,120,.15)" stroke="#a0007a"/><rect x="'+(ox+420)+'" y="'+Y(6000)+'" width="60" height="'+(Y(3200)-Y(6000))+'" fill="rgba(160,0,120,.15)" stroke="#a0007a"/><rect x="'+(ox+270)+'" y="'+Y(6000)+'" width="60" height="'+(Y(3200)-Y(6000))+'" fill="rgba(160,0,120,.15)" stroke="#a0007a"/>';
    b+=T(ox+375,Y(6000)-6,'CLASS C · ceiling 6,000 MSL · CAPITAL (elev 2,000)',{s:10,b:true,c:'#a0007a',a:'middle'})+T(ox+450,Y(3200)+14,'floor 3,200',{s:9,c:'#a0007a',a:'middle'})+T(ox+300,Y(3200)+14,'floor 3,200',{s:9,c:'#a0007a',a:'middle'});
    // Class D right: field elev 4,500; SFC to 7,000 (2,500 AGL)
    b+='<rect x="'+(ox+600)+'" y="'+Y(7000)+'" width="90" height="'+(Y(4500)-Y(7000))+'" fill="rgba(0,120,200,.15)" stroke="#0a78c8" stroke-dasharray="6 4"/>'+T(ox+645,Y(7000)-6,'CLASS D · ceiling 7,000 MSL · HILLTOP (elev 4,500)',{s:10,b:true,c:'#0a78c8',a:'middle'});
    // Class E floors: 700 AGL near airports, 1,200 AGL elsewhere; surface-based E at one airport
    b+=T(ox+W-10,Y(14500)-4,'CLASS E floor at 14,500 MSL where no lower floor is charted (Class G below)',{s:9.5,a:'end',c:'#a0007a'});
    b+=T(ox+W-10,Y(1200)-4,'Class E floor 1,200 AGL (blue vignette) · 700 AGL near airports (magenta vignette)',{s:9.5,a:'end',c:'#555'});
    // ground
    b+='<rect x="'+ox+'" y="'+oy+'" width="'+W+'" height="30" fill="#c9b58f"/>'+T(ox+W/2,oy+20,'TERRAIN (sea level at left edge)',{s:10,a:'middle'});
    // numbered points
    var pts=[[ox+50,Y(2200),'1'],[ox+135,Y(2600),'2'],[ox+205,Y(7500),'3'],[ox+375,Y(5000),'4'],[ox+450,Y(2800),'5'],[ox+645,Y(6000),'6'],[ox+760,Y(16000),'7'],[ox+760,Y(900),'8']];
    pts.forEach(function(p){ b+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="11" fill="#111"/>'+T(p[0],p[1]+4,p[2],{s:11,b:true,c:'#fff',a:'middle'}); });
    b+=T(16,385,'Points 1–8 are aircraft positions referenced by the questions. Point 8 is at 900 ft MSL over flat terrain at sea level, 15 NM from any airport.',{s:10.5,c:'#333'});
    F.air={title:'Figure L — Airspace profile', svg:S(880,400,b)};
  })();

  /* ---------- Density altitude ---------- */
  (function(){
    var rows=[['Sea level (ISA 15 °C)','−3,000','−1,800','−600','600','1,800','3,000'],['2,000 (ISA 11 °C)','−520','680','1,880','3,080','4,280','5,480'],
      ['4,000 (ISA 7 °C)','1,960','3,160','4,360','5,560','6,760','7,960'],['6,000 (ISA 3 °C)','4,440','5,640','6,840','8,040','9,240','10,440'],['8,000 (ISA −1 °C)','6,920','8,120','9,320','10,520','11,720','12,920']];
    var b=T(16,22,'FIGURE M — DENSITY ALTITUDE (feet) FROM PRESSURE ALTITUDE AND OUTSIDE AIR TEMPERATURE',{s:13,b:true})
      +table(16,40,['Pressure altitude (ft)','−10 °C','0 °C','10 °C','20 °C','30 °C','40 °C'],rows,[190,110,110,110,110,110,110],22,{fs:11.5,boldFirst:true})
      +T(16,200,'Pressure altitude = field elevation corrected for the altimeter setting: add 1,000 ft for every 1.00 inHg the setting is below 29.92; subtract for settings above 29.92.',{s:10.5});
    F.da={title:'Figure M — Density altitude', svg:S(880,215,b)};
  })();

  /* ---------- Sectional chart excerpt (original) ---------- */
  (function(){
    var b='<rect x="0" y="0" width="880" height="470" fill="#f3efe4"/>'+T(16,22,'FIGURE N — SECTIONAL CHART EXCERPT (original training chart, not to scale)',{s:13,b:true});
    // terrain tints
    b+='<path d="M 0 300 Q 200 200 420 300 T 880 260 L 880 470 L 0 470 Z" fill="#e9dcc3"/><path d="M 600 470 Q 700 330 880 360 L 880 470 Z" fill="#dcc9a8"/>';
    // Class E 700 vignette around RIVERTON (magenta blurry ring)
    b+='<circle cx="300" cy="230" r="118" fill="none" stroke="#d64fa0" stroke-width="18" opacity=".28"/>';
    // Class D dashed blue circle
    b+='<circle cx="300" cy="230" r="62" fill="none" stroke="#1f5fbf" stroke-width="2" stroke-dasharray="7 5"/>'+T(362,196,'[−70]',{s:11,c:'#1f5fbf',b:true});
    // airport symbol with runways (towered: blue)
    b+='<circle cx="300" cy="230" r="14" fill="none" stroke="#1f5fbf" stroke-width="2"/><rect x="292" y="210" width="16" height="40" fill="#1f5fbf" transform="rotate(110 300 230)"/><circle cx="300" cy="230" r="2.5" fill="#fff"/>';
    for(var t=0;t<4;t++){ b+='<line x1="'+(300+Math.cos(t*Math.PI/2)*18)+'" y1="'+(230+Math.sin(t*Math.PI/2)*18)+'" x2="'+(300+Math.cos(t*Math.PI/2)*22)+'" y2="'+(230+Math.sin(t*Math.PI/2)*22)+'" stroke="#1f5fbf" stroke-width="2"/>'; }
    b+=T(322,246,'RIVERTON (RVN)',{s:11.5,b:true,c:'#1f5fbf'})+T(322,260,'CT - 118.3 ★ ATIS 124.75',{s:10,c:'#1f5fbf'})+T(322,274,'4520 *L 60 122.8 ©',{s:10,c:'#1f5fbf'})+T(322,288,'RP 29',{s:10,c:'#1f5fbf'});
    // VOR compass rose + box
    b+='<circle cx="560" cy="150" r="60" fill="none" stroke="#1f5fbf" stroke-width="1"/>';
    for(var d=0;d<360;d+=30){ var r1=60, r2=d%90?54:48, rad=(d-90)*Math.PI/180; b+='<line x1="'+(560+r1*Math.cos(rad))+'" y1="'+(150+r1*Math.sin(rad))+'" x2="'+(560+r2*Math.cos(rad))+'" y2="'+(150+r2*Math.sin(rad))+'" stroke="#1f5fbf"/>'; if(d%90===0) b+=T(560+70*Math.cos(rad),150+70*Math.sin(rad)+4,String(d||360).padStart(3,'0').slice(0,2),{s:9,c:'#1f5fbf',a:'middle'}); }
    b+='<polygon points="560,142 567,146 567,154 560,158 553,154 553,146" fill="none" stroke="#1f5fbf" stroke-width="2"/><circle cx="560" cy="150" r="2" fill="#1f5fbf"/>';
    b+='<rect x="590" y="58" width="128" height="34" fill="#fff" stroke="#1f5fbf"/>'+T(654,72,'RIVERTON',{s:10.5,b:true,c:'#1f5fbf',a:'middle'})+T(654,86,'114.2 Ch 89 RVN',{s:10,c:'#1f5fbf',a:'middle'});
    // Victor airway
    b+='<line x1="300" y1="230" x2="560" y2="150" stroke="#1f5fbf" stroke-width="3" opacity=".45"/>'+T(430,180,'V 240',{s:11,b:true,c:'#1f5fbf',r:-17})+T(380,205,'072°',{s:10,c:'#1f5fbf',r:-17});
    // Obstacles
    b+='<polygon points="700,300 706,318 694,318" fill="#1f1f1f"/>'+T(712,312,'2,849',{s:10,b:true})+T(712,324,'(449)',{s:10});
    b+='<polygon points="150,120 156,138 144,138" fill="#1f1f1f"/><polygon points="162,118 168,138 156,138" fill="#1f1f1f"/>'+T(174,130,'1,804',{s:10,b:true})+T(174,142,'(1,049)',{s:10})+'<circle cx="156" cy="120" r="4" fill="none" stroke="#1f1f1f"/>';
    // MEF
    b+=T(440,360,'3',{s:34,b:true,c:'#1f5fbf'})+T(462,346,'6',{s:18,b:true,c:'#1f5fbf'});
    // MOA
    b+='<path d="M 620 380 L 860 330 L 860 460 L 640 460 Z" fill="none" stroke="#a0007a" stroke-width="5" opacity=".5"/>'+T(740,420,'SILVER MOA',{s:12,b:true,c:'#a0007a',a:'middle'});
    // Restricted area
    b+='<line x1="40" y1="400" x2="200" y2="330" stroke="#1f5fbf" stroke-width="5" opacity=".6"/><line x1="40" y1="400" x2="200" y2="330" stroke="#1f5fbf" stroke-width="1"/>'+T(110,350,'R-4805',{s:12,b:true,c:'#1f5fbf',r:-24});
    // private airport + glider symbol
    b+='<circle cx="640" cy="260" r="9" fill="none" stroke="#a0007a" stroke-width="2"/><text x="640" y="264" font-size="9" fill="#a0007a" text-anchor="middle">R</text>'+T(655,256,'HIGH MEADOW (Pvt)',{s:10,c:'#a0007a'})+T(655,270,'5380 - 26',{s:10,c:'#a0007a'});
    b+='<circle cx="500" cy="300" r="9" fill="none" stroke="#a0007a" stroke-width="2"/><line x1="491" y1="300" x2="509" y2="300" stroke="#a0007a" stroke-width="2"/>'+T(515,296,'SAGE FLAT',{s:10,c:'#a0007a'})+T(515,310,'4710 - 26 122.9',{s:10,c:'#a0007a'});
    // lat/long ticks + isogonic line
    b+='<line x1="0" y1="430" x2="880" y2="430" stroke="#333" stroke-width="1"/>'+T(10,446,'39°00′',{s:10})+'<line x1="760" y1="0" x2="790" y2="470" stroke="#a0007a" stroke-width="1" stroke-dasharray="4 3"/>'+T(770,60,'13° E',{s:10,c:'#a0007a',r:85});
    b+=T(16,462,'Legend reminder: airport data = name (ID), elevation, lighting, longest runway (hundreds of ft), CTAF; © = CTAF; ★ = part-time; * before L = lighting limitations',{s:9.5,c:'#333'});
    F.sec={title:'Figure N — Sectional chart excerpt', svg:S(880,470,b)};
  })();

  /* ---------- Chart Supplement entry ---------- */
  (function(){
    var lines=['RIVERTON   (RVN)   3 NW   UTC−8(−7DT)   N39°12.34′ W119°45.67′                                   RENO',
      '  4520   B   S4   FUEL 100LL, JET A   OX 1, 3   TPA—5520(1000)   Class D   ARFF Index A',
      '  RWY 11-29:  H6001X100 (ASPH-GRVD)   S-30, D-45   HIRL   0.6% up W',
      '    RWY 11:  PAPI(P2L)—GA 3.0° TCH 45′.  Thld dsplcd 300′.  Tree.',
      '    RWY 29:  REIL.  PAPI(P2L)—GA 3.5° TCH 50′.  Rgt tfc.  Pole.',
      '  RWY 02-20:  2200X60 (TURF)   Rwy 20 Rgt tfc.',
      '  AIRPORT REMARKS: Attended 1500–0100Z‡. Unattended rwy lgts preset low intsty; to incr intsty & ACTVT REIL',
      '    Rwy 29 — CTAF. Deer and coyote on and invof arpt. Glider ops wkends. Noise abatement: avoid ovft of',
      '    residential area S of arpt below 2000′ AGL.',
      '  WEATHER DATA SOURCES: ASOS 124.75 (775) 555-0199.',
      '  COMMUNICATIONS: CTAF 118.3   UNICOM 122.95   ATIS 124.75',
      '    RCO 122.1R 114.2T (RENO RADIO)',
      '    ® NORCAL APP/DEP CON 126.3',
      '    TOWER 118.3 (1400–0400Z‡)   GND CON 121.9   CLNC DEL 121.9',
      '  AIRSPACE: CLASS D svc 1400–0400Z‡ other times CLASS E.',
      '  RADIO AIDS TO NAVIGATION: NOTAM FILE RVN.',
      '    (L) VOR/DME 114.2  RVN  Chan 89  N39°14.10′ W119°40.22′   252° 4.6 NM to fld.  4,830/13E.'];
    var b=T(16,22,'FIGURE O — CHART SUPPLEMENT ENTRY',{s:13,b:true});
    lines.forEach(function(l,i){ b+=T(16,48+i*19,l,{s:11.5,f:'Menlo, Consolas, monospace'}); });
    F.cs={title:'Figure O — Chart Supplement entry', svg:S(880,380,b)};
  })();

  /* ---------- Traffic pattern ---------- */
  (function(){
    var b=T(16,22,'FIGURE P — TRAFFIC PATTERN (view from above, north at top)',{s:13,b:true});
    b+='<rect x="300" y="200" width="280" height="24" fill="#555"/>'+T(306,217,'09',{s:14,b:true,c:'#fff'})+T(574,217,'27',{s:14,b:true,c:'#fff',a:'end'});
    b+='<polyline points="150,212 150,110 730,110 730,212" fill="none" stroke="#1f5fbf" stroke-width="3" stroke-dasharray="10 6"/>';
    b+='<line x1="150" y1="212" x2="300" y2="212" stroke="#1f5fbf" stroke-width="3" stroke-dasharray="10 6"/><line x1="580" y1="212" x2="730" y2="212" stroke="#1f5fbf" stroke-width="3" stroke-dasharray="10 6"/>';
    b+=T(440,100,'1',{s:13,b:true,a:'middle'})+T(740,160,'2',{s:13,b:true})+T(225,230,'3',{s:13,b:true,a:'middle'})+T(140,160,'4',{s:13,b:true,a:'end'})+T(655,230,'5',{s:13,b:true,a:'middle'});
    // windsock: wind from 240
    b+='<circle cx="640" cy="300" r="4" fill="#111"/><line x1="640" y1="300" x2="596" y2="332" stroke="#e8590c" stroke-width="8"/>'+T(640,352,'wind sock (fabric streams away from the wind)',{s:10,a:'middle'});
    b+=T(16,380,'Legs are numbered 1–5. The arrow of the sock is the direction the fabric streams.',{s:10.5,c:'#333'});
    F.pat={title:'Figure P — Traffic pattern', svg:S(880,395,b)};
  })();

  /* ---------- Surface station model ---------- */
  (function(){
    var b=T(16,22,'FIGURE Q — SURFACE ANALYSIS STATION MODELS',{s:13,b:true});
    function station(cx,cy,label,cover,wd,ws,temp,dew,pres,wx){
      var out='<circle cx="'+cx+'" cy="'+cy+'" r="14" fill="#fff" stroke="#111" stroke-width="2"/>';
      if(cover==='ovc') out+='<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="#111"/>';
      if(cover==='bkn') out+='<path d="M '+cx+' '+(cy-12)+' A 12 12 0 1 1 '+(cx-12)+' '+cy+' Z" fill="#111"/>';
      if(cover==='sct') out+='<path d="M '+cx+' '+(cy-12)+' A 12 12 0 0 1 '+(cx+12)+' '+cy+' L '+cx+' '+cy+' Z" fill="#111"/>';
      var rad=(wd-90)*Math.PI/180, x2=cx+60*Math.cos(rad), y2=cy+60*Math.sin(rad);
      out+='<line x1="'+(cx+14*Math.cos(rad))+'" y1="'+(cy+14*Math.sin(rad))+'" x2="'+x2+'" y2="'+y2+'" stroke="#111" stroke-width="2"/>';
      var n=ws, px=x2, py=y2, step=0; while(n>=10){ var bx=px-step*8*Math.cos(rad), by=py-step*8*Math.sin(rad); out+='<line x1="'+bx+'" y1="'+by+'" x2="'+(bx+14*Math.cos(rad-Math.PI/2.2))+'" y2="'+(by+14*Math.sin(rad-Math.PI/2.2))+'" stroke="#111" stroke-width="2"/>'; n-=10; step++; }
      if(n>=5){ var hx=px-step*8*Math.cos(rad), hy=py-step*8*Math.sin(rad); out+='<line x1="'+hx+'" y1="'+hy+'" x2="'+(hx+8*Math.cos(rad-Math.PI/2.2))+'" y2="'+(hy+8*Math.sin(rad-Math.PI/2.2))+'" stroke="#111" stroke-width="2"/>'; }
      out+=T(cx-20,cy-12,temp,{s:12,b:true,a:'end'})+T(cx-20,cy+18,dew,{s:12,b:true,a:'end'})+T(cx+20,cy-12,pres,{s:12,b:true})+(wx?T(cx-44,cy+4,wx,{s:12,b:true,a:'end'}):'');
      out+=T(cx,cy+60,'Station '+label,{s:12,b:true,a:'middle'}); return out; }
    b+=station(150,130,'1','bkn',310,25,'54','41','104','')+station(430,130,'2','ovc',180,15,'63','61','998','•  •')+station(710,130,'3','sct',240,5,'81','36','157','');
    b+=T(16,230,'Temperatures °F · pressure as the last three digits of the sea-level pressure in millibars (tenths) · wind barbs: full = 10 kt, half = 5 kt, flag = 50 kt',{s:10.5,c:'#333'});
    F.stn={title:'Figure Q — Station models', svg:S(880,245,b)};
  })();

  /* ---------- Cruise performance ---------- */
  (function(){
    var rows=[['4,000','2,500','75','116','9.9'],['4,000','2,400','67','111','8.9'],['4,000','2,300','60','106','8.1'],['4,000','2,200','54','100','7.4'],
      ['6,000','2,500','71','115','9.4'],['6,000','2,400','64','110','8.5'],['6,000','2,300','58','105','7.8'],['6,000','2,200','52','99','7.2'],
      ['8,000','2,550','73','118','9.6'],['8,000','2,500','68','114','9.0'],['8,000','2,400','61','109','8.2'],['8,000','2,300','55','103','7.5']];
    var b=T(16,22,'FIGURE R — CRUISE PERFORMANCE, 2,550 lb, standard temperature, mixture leaned per POH',{s:13,b:true})
      +table(16,40,['Pressure altitude (ft)','RPM','% BHP','KTAS','GPH'],rows,[170,110,110,110,110],19,{fs:11,boldFirst:true})
      +T(16,300,'Usable fuel 53 gal. Allow 1.4 gal for engine start, taxi, and takeoff. Climb fuel from Figure S.',{s:10.5});
    F.cruise={title:'Figure R — Cruise performance', svg:S(880,315,b)};
  })();

  /* ---------- Time, fuel, distance to climb ---------- */
  (function(){
    var rows=[['Sea level','15','0','0','0'],['1,000','13','1','0.4','2'],['2,000','11','3','0.8','4'],['3,000','9','4','1.2','6'],['4,000','7','6','1.5','8'],['5,000','5','8','1.9','10'],['6,000','3','10','2.2','13'],['7,000','1','12','2.6','16'],['8,000','−1','14','3.0','19'],['9,000','−3','17','3.5','22'],['10,000','−5','20','4.0','27']];
    var b=T(16,22,'FIGURE S — TIME, FUEL, AND DISTANCE TO CLIMB from sea level, 2,550 lb, flaps up, full throttle, 74 KIAS, standard temperature',{s:12.5,b:true})
      +table(16,40,['Pressure altitude (ft)','Std temp (°C)','Time (min)','Fuel used (gal)','Distance (NM)'],rows,[170,120,110,130,120],19,{fs:11,boldFirst:true})
      +T(16,288,'NOTES: 1. Add 1.4 gal for engine start, taxi, and takeoff.  2. Increase time, fuel, and distance by 10% for each 10 °C above standard temperature.  3. Distances are zero wind.',{s:10.5});
    F.climb={title:'Figure S — Time, fuel, and distance to climb', svg:S(880,300,b)};
  })();

  /* ---------- Stall speeds ---------- */
  (function(){
    var rows=[['Flaps up','48','52','57','68'],['Flaps 10°','43','46','51','61'],['Flaps 30°','40','43','48','57']];
    var b=T(16,22,'FIGURE T — STALL SPEEDS (KIAS), 2,550 lb, power off, most forward CG',{s:13,b:true})
      +table(16,40,['Configuration','Bank 0°','Bank 30°','Bank 45°','Bank 60°'],rows,[170,120,120,120,120],22,{fs:11.5,boldFirst:true});
    F.stall={title:'Figure T — Stall speeds', svg:S(700,140,b)};
  })();

  window.PAR_FIGS = F;
})();
