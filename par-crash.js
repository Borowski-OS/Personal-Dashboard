/* PAR test-day crash course (Oct 8 2026): Brad's weak areas — NTSB 830, airspace, how stalls/spins/CG relate, plus a little METAR.
   PAR_CRASH_SHEET = one-page cheat sheet (HTML) shown above the Crash course drill. New original questions (CC-*) are appended
   to PAR_BANK below after independent review. */
window.PAR_CRASH_SHEET = [
 ['NTSB (49 CFR 830): what to report, and when', [
  '<b>Accident</b> = from boarding with intent to fly until everyone gets off, someone dies or is <b>seriously injured</b>, or the airplane gets <b>substantial damage</b>.',
  '<b>Serious injury</b>: hospitalized <b>more than 48 hours</b>, starting <b>within 7 days</b> of the injury · any bone fracture <b>except simple fractures of fingers, toes or nose</b> · severe bleeding, nerve, muscle or tendon damage · any internal organ injury · 2nd/3rd-degree burns, or any burns over <b>5%</b> of the body.',
  '<b>Substantial damage</b> = hurts structural strength, performance or flight characteristics and normally needs major repair. <b>NOT substantial</b>: engine failure or damage limited to one engine · bent fairings or cowling · dented skin · small punctures in skin or fabric · <b>ground damage</b> to propeller or rotor blades · damage to landing gear, wheels, tires, flaps, engine accessories, brakes or <b>wingtips</b>.',
  '<b>Notify the NTSB immediately</b> (830.5) for any accident, overdue aircraft believed in an accident, or these incidents: flight-control system malfunction/failure · a required crewmember can’t do their duties from injury or illness · <b>in-flight fire</b> · <b>in-flight collision</b> · damage to <b>other property</b> over <b>$25,000</b> · release of all or part of a <b>propeller blade</b> (not caused solely by ground contact) · complete loss of information from <b>more than 50%</b> of the cockpit displays (EFIS-type).',
  '<b>Written report</b> (Form 6120.1): within <b>10 days</b> after an accident · if an overdue aircraft is <b>still missing after 7 days</b>, report then · incidents: <b>only if the NTSB asks</b>.',
  '<b>Wreckage</b>: don’t move it except to <b>remove people</b>, protect the wreckage from further damage, or protect the public.']],
 ['Airspace: the traps', [
  '<b>Entry</b>: Class B = ATC <b>clearance</b> (“cleared into the Bravo”). Class C and D = <b>two-way communication</b>: ATC answers using your call sign (“N123, standby” = you may enter; “Aircraft calling, standby” = you may not).',
  '<b>Class B</b>: students need an endorsement (and some B airports bar them). <b>Mode C/ADS-B</b> within 30 NM of the primary airport (the veil). <b>Class C</b>: 5 NM core from the surface, 10 NM shelf starting at <b>1,200 ft AGL</b>, both up to 4,000 ft above the airport (charted in MSL); outer area 20 NM.',
  '<b>ADS-B Out / transponder</b>: in A, B, C; in the 30 NM veil; <b>above the ceiling of Class B or C</b>, within its lateral limits, up to 10,000 MSL; and <b>at or above 10,000 MSL</b> except at or below 2,500 AGL. Not required <b>under</b> a Class C shelf.',
  '<b>Speeds</b>: 250 kt below 10,000 MSL · 200 kt under a Class B shelf or in a VFR corridor · 200 kt within 4 NM of a Class C/D primary airport at or below 2,500 AGL.',
  '<b>Class E floors</b>: surface (dashed magenta) · 700 AGL (fuzzy magenta) · 1,200 AGL (fuzzy blue / default) · 14,500 MSL everywhere. Outside the sharp edge of a blue vignette, Class G goes all the way up to 14,500 MSL (common around Carson City). Class D turns into E or G when the tower closes.',
  '<b>VFR weather traps</b>: Class B = 3 SM, clear of clouds. Class C, D, E below 10,000 MSL = 3 SM, 500 below/1,000 above/2,000 sideways. Class G at or below 1,200 AGL: <b>day</b> = 1 SM, clear of clouds; <b>night</b> = 3 SM, 500/1,000/2,000 (exception: at night in the pattern within ½ mile of the runway, 1 SM and clear of clouds). Class G above 1,200 AGL to 10,000 MSL: day 1 SM, night 3 SM, both 500/1,000/2,000. At or above 10,000 MSL (and over 1,200 AGL) = 5 SM, 1,000 below/1,000 above/1 SM sideways.',
  '<b>Surface area of B/C/D/E</b>: with a ceiling below <b>1,000 ft</b> you can’t fly VFR under it anywhere in the surface area, and you need <b>3 SM ground visibility</b> to take off, land or enter the pattern (otherwise ask for Special VFR).',
  '<b>Special VFR</b>: in a surface area, below 10,000 MSL, with ATC clearance, 1 SM and clear of clouds. At <b>night</b> it requires an instrument rating and an IFR-equipped airplane.',
  '<b>Special-use</b>: Prohibited = no entry without the using agency’s permission (plan on never) · Restricted = need permission when active · MOA = VFR may go through, use caution · Alert = lots of training; <b>every pilot, participating or just passing through, is equally responsible for collision avoidance</b> · Warning = starts <b>3 NM off the U.S. coast</b>, over domestic or international water (or both).',
  '<b>VFR cruising</b> (above 3,000 AGL, by <b>magnetic course</b>): 0–179° = odd thousands + 500 (3,500, 5,500) · 180–359° = even thousands + 500. <b>Oxygen</b>: crew after 30 min above 12,500 to 14,000 · crew always above 14,000 · offer to passengers above 15,000.']],
 ['Stalls, spins and CG: how they connect', [
  'A stall is exceeding the <b>critical angle of attack</b>. It can happen at <b>any airspeed, any attitude, any power setting</b>.',
  'Stall speed goes <b>up</b> with: more weight · more load factor (bank) · <b>forward CG</b> · ice or frost · flaps up. It goes <b>down</b> with: less weight, aft CG, flaps down, power on.',
  '<b>Load factor in a level turn</b>: 30° = 1.15 G (stall speed +7%) · 45° = 1.41 G (+19%) · <b>60° = 2 G (+41%)</b>. New stall speed = stall speed × √(load factor). Example: stalls at 50 kt → in a 60° bank ≈ 71 kt.',
  '<b>Forward CG</b>: more tail-down force needed → <b>higher stall speed</b>, more stable, slower cruise, hardest to raise the nose (flare). <b>Aft CG</b>: <b>lower stall speed</b>, faster cruise, <b>less stable</b>, more prone to stalls/spins and <b>harder (maybe impossible) spin recovery</b> (flat spin).',
  '<b>Spin</b> = a stall <b>plus yaw</b> (both wings stalled, one more than the other: autorotation). Classic trap: a <b>skidding, cross-controlled turn base-to-final</b>. The inside wing stalls first and the airplane snaps into a spin. A <b>spiral</b> is not stalled: speed builds fast.',
  '<b>Spin recovery (PARE)</b>: Power idle · Ailerons neutral · Rudder full opposite the rotation · Elevator briskly forward to break the stall. Then neutralize rudder and recover from the dive.',
  '<b>Normal category</b>: intentional spins prohibited. <b>Utility</b>: limited aerobatics, sometimes spins if approved. <b>Parachutes</b> required (91.307) for banks over 60° or pitch over 30° with a passenger, except on a <b>checkride</b>, or for <b>spins and other maneuvers required for a certificate or rating</b> when given by a CFI. Load limits: Normal category 3.8 G, Utility 4.4 G.',
  '<b>Maneuvering speed (VA) goes down as weight goes down</b>, so a lightly loaded airplane needs to be flown slower in turbulence.',
  '<b>CG math</b>: CG = total moment ÷ total weight. Weight shift: weight moved ÷ total weight = CG change ÷ distance moved. Avgas = 6 lb/gal · oil 7.5 lb/gal.']],
 ['METAR/TAF: just the gotchas', [
  'Wind is <b>true</b> and in knots (ATIS and tower winds are <b>magnetic</b>). Visibility in statute miles. Cloud heights are <b>AGL</b> in hundreds of feet: BKN030 = 3,000 ft.',
  'The <b>ceiling</b> is the lowest <b>BKN</b>, <b>OVC</b> or <b>VV</b> layer, never FEW or SCT. TAF: FM = from (a lasting change), BECMG = gradual change during the time window shown, TEMPO = temporary, PROB30 = about a 30% chance.',
  'Winds aloft: true, knots; no wind within 1,500 ft of the station; no temperature at 3,000 ft <b>or within 2,500 ft of the station’s elevation</b>. <b>9900</b> = light and variable. Direction over 36 (e.g. 7425) means subtract 50 from the direction and add 100 to the speed: 240° at 125 kt.']]
];

/* Reviewer fixes to the existing bank (Oct 8 workflow review: 82 focus questions checked, every answer key correct; these fix explanations, citations and one option's wording). */
window.PAR_FIXES = {
"IE-03": {
"why": "For Class D (and C), the requirement is established two-way communication, which exists once the controller replies using the aircraft call sign, even with \"stand by\" (AIM 3-2-5b note). A clearance to enter (B, C) is a Class B requirement.",
"ref": "14 CFR 91.129(c); AIM 3-2-5b"
},
"IE-10": {
"why": "91.215(b)(4) and 91.225(d)(3) require a transponder and ADS-B Out above the ceiling and within the lateral boundaries of Class B or C airspace, up to 10,000 feet MSL. The pilot is outside the Class C itself (A is wrong) but inside the airspace where this equipment is required (B is wrong).",
"ref": "14 CFR 91.215(b)(4); 14 CFR 91.225(d)(3)"
},
"IE-11": {
"why": "When a part-time tower is closed, the Class D surface area reverts to what the Chart Supplement lists (\"other times CLASS E\" or \"CLASS G\"), and the airport operates as nontowered with self-announcing on the CTAF (AIM 3-2-5a, b). B and C misstate what happens.",
"ref": "AIM 3-2-5a, 3-2-5b; Chart Supplement \"AIRSPACE\" remarks"
},
"IE-16": {
"why": "91.157(b)(4): between sunset and sunrise, Special VFR (except for helicopters) is allowed only if the pilot meets the Part 61 requirements for instrument flight, meaning an instrument rating (61.3(e)) and instrument currency (61.57(c)), and the aircraft is IFR-equipped per 91.205(d). C ignores the night restriction, and the rule has no 'night endorsement' (A).",
"ref": "14 CFR 91.157(b); 14 CFR 61.3(e), 61.57(c)"
},
"IE-22": {
"why": "The standing stadium TFR (FDC NOTAM 4/3621, issued under 14 CFR 99.7 Special Security Instructions) bans flight within 3 NM and up to and including 3,000 feet AGL of any stadium with 30,000+ seats during MLB, NFL, NCAA Division I football and major motor-speedway races. It runs from 1 hour before the scheduled start until 1 hour after the event ends. Event-specific TFRs under 91.145 (such as the World Series or Indy 500) normally use 3 NM and 2,500 feet AGL, so always read the NOTAM. TFRs are mandatory (A) and apply to every aircraft not specifically authorized (C).",
"ref": "14 CFR 99.7 (FDC NOTAM 4/3621); 14 CFR 91.145; AIM 3-5-3"
},
"IE-26": {
"why": "The number in the dashed box by the Class D boundary is the ceiling in hundreds of feet MSL. [−70] means 7,000 feet MSL, and the minus sign means 'up to but not including' 7,000. That puts the top about 2,500 feet above the 4,520-foot field (7,000 − 4,520), which is the usual Class D height. Class D ceilings are charted in MSL, not AGL (B). C wrongly adds the ceiling to the field elevation."
},
"IE-27": {
"why": "Airport data line: field elevation 4,520 feet MSL. *L means lighting limitations exist, so check the Chart Supplement (a plain L means lit sunset to sunrise). 60 is the longest runway, 6,000 feet: a length, not a width. 122.8 is the UNICOM, and the © after it marks it as the CTAF (the ★ by the tower frequency means the tower is part-time). B misreads *L and treats 60 as a width. C misreads the elevation and the runway codes."
},
"IE-39": {
"why": "Class E generally runs from 14,500 feet MSL (or a lower charted floor) up to but not including 18,000 feet MSL, and Class A starts at 18,000 (C). A transponder and ADS-B Out are required at and above 10,000 feet MSL, except in the airspace at and below 2,500 feet AGL. At 16,000 feet over low terrain the airspace is controlled. Above 14,500 MSL, Class G exists only within 1,500 feet of the surface (A).",
"ref": "14 CFR 71.71; 14 CFR 91.215(b)(5); 14 CFR 91.225(d)(4); AIM 3-2-6"
},
"IE-40": {
"why": "The tower operates 1400–0400Z‡ (one hour earlier during daylight saving time), so at 0600Z it is closed, and the AIRSPACE line says Class E at other times (AIM 3-2-5a). The remarks explain the unattended runway lighting and that the REIL is turned on through the CTAF. A and B assume the tower is open.",
"ref": "Chart Supplement legend; AIM 3-2-5a, 3-2-6e1, 4-1-9"
},
"IF-16": {
"why": "Weights: 1,680 + 350 + 260 + 240 + 60 = 2,590 lb (40 over 2,550). Moments: 66,528 + 350×37 (12,950) + 260×73 (18,980) + 240×48 (11,520) + 60×95 (5,700) = 115,678. CG = 115,678 ÷ 2,590 = 44.7 in. That is between the 41.0-in forward limit (at 2,550 lb) and the 47.3-in aft limit, so the CG location is fine. The loaded point plots above the envelope only because the airplane is too heavy. Weight, not CG, is the problem.",
"o": [
"The airplane is 40 pounds over maximum takeoff weight, although the CG (about 44.7 inches) is between the forward and aft CG limits.",
"The airplane is within weight and balance limits for the normal category.",
"The airplane is within the weight limit but the CG is aft of the limit."
]
},
"IF-18": {
"why": "Takeoff moment = 2,380 × 43.8 ≈ 104,244 lb-in. 25 gal = 150 lb removed at arm 48.0 = 7,200 lb-in. New weight 2,230 lb; new moment ≈ 97,044; CG ≈ 43.5–43.6 in. Removing weight that sits aft of the CG moves the CG forward. C has the direction wrong; A is false."
},
"V-01": {
"why": "Going from 45° to 60° raises the load factor from 1.41 to 2.0 Gs. Stall speed rises with the square root of load factor: about 19% above the wings-level value at 45° and about 41% above it at 60°. Holding altitude takes more lift (back pressure) and more power. Too much back pressure can cause an accelerated stall well above the normal stall speed.",
"ref": "PHAK Ch. 5 (Load Factors in Steep Turns); AFH Ch. 10"
},
"VII-12": {
"why": "Published stall speeds are for maximum weight at the most forward CG. A lighter airplane (or one with a more aft CG) really does stall slower. At high angles of attack the pitot-static system also tends to read low (position error), so the needle can sit below the published VS0. Overloading (A) would raise the stall speed. A blocked pitot tube (B) makes the ASI drop to zero (drain hole open) or act like an altimeter (drain also blocked); it does not read slightly low only at the stall."
},
"IC-06": {
"why": "/SK BKN070-TOP090 is a broken layer from 7,000 to 9,000 feet; PIREP altitudes are MSL, not AGL (C). /OV RVN180015 places the report 15 NM on the 180° radial (south) of RVN, not north. /TB LGT-MOD and /IC NEG give turbulence and icing; the remark says smooth above 9,000, not below (A).",
"ref": "AIM 7-1-18 (TBL 7-1-18); FAA-H-8083-28"
},
"IC-07": {
"why": "UUA designates an urgent PIREP (UA is routine). It is used for hazardous conditions: tornadoes, funnel clouds or waterspouts, severe or extreme turbulence (including CAT), severe icing, hail, low-level wind shear (airspeed changes of 10 knots or more within 2,000 feet of the surface — this report's +15 KT on final qualifies), or volcanic ash. It is a pilot observation, not an automated or unidentified product.",
"ref": "AIM 7-1-18 (TBL 7-1-18); FAA-H-8083-28 (PIREPs)"
},
"IC-28": {
"why": "AO1 identifies an automated station without a precipitation discriminator; AO2 has one and can distinguish liquid from frozen precipitation. AUTO means no human augmentation (A). Thunderstorm reporting requires augmentation or a lightning sensor (B).",
"ref": "AIM 7-1-10; AIM 7-1-29"
},
"IC-52": {
"why": "91.155(c) and (d) prohibit VFR beneath a ceiling of less than 1,000 feet, or taking off, landing, or entering the pattern with ground visibility of less than 3 SM, within the surface area of controlled airspace designated for an airport. OVC012 is a 1,200-foot ceiling and 3SM meets the minimum, so VFR is legal and no SVFR is needed (C); 1,500 feet (A) is not the number. Cloud clearance still applies: in Class E below 10,000 feet MSL you must stay 500 feet below clouds (91.155(a)), so under a 1,200-foot overcast the pattern must be flown no higher than about 700 feet AGL — not a normal 1,000-foot pattern.",
"o": [
"the ceiling is at least 1,500 feet.",
"the ceiling is at least 1,000 feet and ground visibility is at least 3 statute miles — both are met here, so VFR is legal, though the pilot must still stay 500 feet below the overcast.",
"the pilot obtains a Special VFR clearance, because the visibility is below the 5-mile requirement."
],
"ref": "14 CFR 91.155(a), (c), (d)"
},
"III-12": {
"why": "830.2 says engine failure or damage limited to one engine, bent fairings or cowling, dented skin, small punctured holes, ground damage to propeller blades, and damage to landing gear, wheels, tires, flaps, engine accessories, brakes, or wingtips are not “substantial damage.” A prop strike on the runway plus a collapsed strut fits those exclusions, so with no injuries it is an incident, not an accident. Immediate notification (C) is for accidents and the incidents listed in 830.5; 10 days (A) is the report filing period after an accident.",
"ref": "49 CFR 830.2, 830.5, 830.15"
}
};
(window.PAR_BANK||[]).forEach(function(q){ var f=window.PAR_FIXES[q.id]; if(f){ for(var k in f) q[k]=f[k]; } });
/* New original crash-course questions (written for this dashboard; each passed two independent reviewers; 3 flagged as ambiguous were dropped). */
window.PAR_BANK = (window.PAR_BANK || []).concat([
{
"id": "CC-NTSB-01",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "After landing, a pilot stops on the ramp with the engine running to let a passenger out. The passenger walks forward into the turning propeller and suffers a fractured arm. The pilot is still in the airplane. Under 49 CFR Part 830, this event",
"o": [
"is not an accident, because the injured passenger had already gotten out of the airplane.",
"is not an accident, because the airplane was not in flight when the injury occurred.",
"is an accident, because the pilot was still aboard, so not all persons had disembarked."
],
"a": 2,
"why": "The accident window runs from when anyone boards with the intention of flight until ALL such persons have disembarked. The pilot was still aboard, so the window was open, and a fractured arm is a serious injury. The airplane does not have to be in flight (B), and one person getting out does not close the window (A).",
"ref": "49 CFR 830.2 (Aircraft accident; Serious injury)"
},
{
"id": "CC-NTSB-03",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "After a hard landing, a passenger is examined at a clinic and released the same day. The airplane's damage is limited to a blown tire and a bent wingtip. Which single injury would make this event an aircraft accident?",
"o": [
"A simple fracture of the nose.",
"A simple fracture of the wrist.",
"Simple fractures of two toes."
],
"a": 1,
"why": "Any bone fracture is a serious injury except simple fractures of the fingers, toes, or nose. The wrist is not on that exception list, so a simple wrist fracture makes this an accident. The nose (A) and toes (C) are the listed exceptions. Tires and wingtips are excluded from substantial damage.",
"ref": "49 CFR 830.2 (Serious injury; Substantial damage)"
},
{
"id": "CC-NTSB-04",
"acs": "PA.III.A.K8",
"k": "recall",
"q": "Which of these injuries, by itself, is NOT a serious injury under 49 CFR Part 830?",
"o": [
"Second-degree burns covering about 2 percent of the body.",
"A bruised (contused) liver, treated without a hospital admission.",
"A simple fracture of the nose."
],
"a": 2,
"why": "A simple nose fracture is one of the three fracture exceptions (fingers, toes, nose). Any second- or third-degree burn counts no matter how small; the 5 percent rule applies only to lesser burns (A). Any injury involving an internal organ counts even without a hospital stay (B).",
"ref": "49 CFR 830.2 (Serious injury)"
},
{
"id": "CC-NTSB-05",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "An airplane ground loops on landing, and no one is hurt. Which damage, by itself, would make the event an aircraft accident?",
"o": [
"A buckled main wing spar that must be replaced.",
"A crushed wingtip and a bent flap.",
"A collapsed main landing gear leg and two flat tires."
],
"a": 0,
"why": "Substantial damage is damage that hurts structural strength, performance, or flight characteristics and normally needs major repair or replacement; a buckled main spar fits. Wingtips and flaps (B) and landing gear, wheels, and tires (C) are specifically excluded from substantial damage.",
"ref": "49 CFR 830.2 (Aircraft accident; Substantial damage)"
},
{
"id": "CC-NTSB-06",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "The engine of a single-engine piston airplane fails in cruise because a connecting rod breaks. The pilot lands in a field. The only other damage is a dented belly skin and a bent cowling, and no one is hurt. Under Part 830, this event",
"o": [
"is an accident, because an engine failure in flight is substantial damage.",
"requires immediate NTSB notification as an incident, because the engine failed internally.",
"is not an accident and does not require immediate NTSB notification."
],
"a": 2,
"why": "Three things here are excluded from substantial damage: failure of or damage limited to a single engine, dented skin, and a bent cowling. No one was hurt, so this is not an accident (A). The only engine item on the immediate-notification list that could apply to a single-engine airplane is failure of an internal turbine engine component that throws debris out somewhere other than the exhaust path. A broken connecting rod in a piston engine does not qualify (B). The list also includes loss of power from two or more engines, but only for large multiengine aircraft over 12,500 lb. No report is required.",
"ref": "49 CFR 830.2 (Substantial damage); 830.5(a)(3)"
},
{
"id": "CC-NTSB-07",
"acs": "PA.III.A.K8",
"k": "recall",
"q": "With no injuries and no other damage, which propeller event requires immediate notification of the NTSB?",
"o": [
"The propeller tips curl when the nose gear collapses on landing.",
"Part of a propeller blade separates in cruise flight, and the pilot lands safely.",
"A propeller blade is nicked by a rock during the runup."
],
"a": 1,
"why": "Release of all or part of a propeller blade must be reported immediately unless it was caused solely by ground contact. A blade coming apart in flight qualifies. Curled tips from a gear collapse (A) and a rock nick on the ground (C) are ground damage to the propeller, which is excluded from substantial damage and is not on the notification list.",
"ref": "49 CFR 830.5(a)(8); 830.2 (Substantial damage)"
},
{
"id": "CC-NTSB-08",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "In cruise, the left aileron cable breaks. Using rudder and trim, the pilot lands safely. There are no injuries and no damage beyond the broken cable. What does Part 830 require of the operator?",
"o": [
"Nothing, because there was no injury and no substantial damage.",
"Immediate notification to the NTSB, then a written report within 10 days.",
"Immediate notification to the NTSB, and a written report only if the NTSB asks for one."
],
"a": 2,
"why": "A flight control system malfunction or failure is a listed serious incident, so the NTSB must be notified immediately even with no injury or damage (A is wrong). The 10-day written report is for accidents (B); for an incident, the written report is filed only when the NTSB asks for it.",
"ref": "49 CFR 830.5(a)(1); 830.15(a)"
},
{
"id": "CC-NTSB-09",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "While taxiing to the runway for takeoff, a pilot clips a parked fuel truck. The truck needs $32,000 in repairs; the airplane's damage is limited to a crushed wingtip. No one is hurt. The operator",
"o": [
"must notify the NTSB immediately, because damage to property other than the aircraft exceeds $25,000.",
"need not notify the NTSB, because the airplane did not receive substantial damage.",
"must file an accident report within 10 days, but immediate notification is not required."
],
"a": 0,
"why": "Damage to property other than the aircraft estimated at more than $25,000 is a listed serious incident requiring immediate notification. It is not an accident, because a wingtip is excluded from substantial damage and no one was hurt, so there is no 10-day accident report (C). The airplane's own damage does not decide this (B).",
"ref": "49 CFR 830.5(a)(6); 830.2 (Substantial damage); 830.15(a)"
},
{
"id": "CC-NTSB-10",
"acs": "PA.III.A.K8",
"k": "scenario",
"q": "In cruise, smoke and flames appear behind the instrument panel. The pilot puts the fire out with the extinguisher and lands safely. Damage is limited to some wiring, and no one is hurt. Who must notify whom?",
"o": [
"The pilot must notify the nearest FAA Flight Standards District Office within 48 hours.",
"The operator must notify the nearest NTSB office immediately, by the quickest means available.",
"No one; ATC's record of the emergency serves as the notification."
],
"a": 1,
"why": "An in-flight fire is a listed serious incident: the operator (the owner, renter, or whoever authorized the flight) must notify the NTSB immediately, by the quickest means available. Part 830 notification goes to the NTSB, not the FAA, and there is no 48-hour window (A). ATC's records do not satisfy the operator's duty (C).",
"ref": "49 CFR 830.5(a)(4); 830.2 (Operator)"
},
{
"id": "CC-NTSB-11",
"acs": "PA.III.A.K8",
"k": "recall",
"q": "An airplane is overdue and believed to have crashed, but searchers have not found it. The operator must file the NTSB written report",
"o": [
"within 10 days after the airplane was reported overdue.",
"after 7 days, if the airplane is still missing.",
"only after the wreckage is found."
],
"a": 1,
"why": "Written reports are due within 10 days after an accident, or after 7 days if an overdue aircraft is still missing. The 10-day period applies to known accidents (A), and the report is not held until the wreckage is found (C). Note that an overdue aircraft believed to be in an accident also requires immediate notification.",
"ref": "49 CFR 830.15(a); 830.5(b)"
},
{
"id": "CC-NTSB-12",
"acs": "PA.III.A.K8",
"k": "recall",
"q": "After an off-airport accident, before the NTSB takes custody, the operator may move the wreckage",
"o": [
"only to remove injured or trapped persons, protect the wreckage from further damage, or protect the public from injury.",
"to a hangar so the insurance adjuster and a mechanic can inspect it.",
"for any reason, as long as sketches and photographs of its original position are made first."
],
"a": 0,
"why": "Wreckage, mail, and cargo may be disturbed only as needed to remove injured or trapped persons, protect the wreckage from further damage, or protect the public. Moving it for an insurance inspection (B) is not allowed. Sketches and photos are required when moving the wreckage is necessary, but they do not create a new reason to move it (C).",
"ref": "49 CFR 830.10(b), (c)"
},
{
"id": "CC-SPIN-01",
"acs": "PA.VII.B.K1",
"k": "recall",
"q": "Which statement about the critical angle of attack is true?",
"o": [
"It increases with weight, so a heavier airplane can reach a higher angle of attack before it stalls.",
"For a given configuration, the wing stalls whenever it is exceeded, at any airspeed, attitude, or power setting.",
"It can be exceeded only with the nose above the horizon and the airspeed at or below the published stall speed."
],
"a": 1,
"why": "A wing stalls whenever it goes past its critical angle of attack, whatever the airspeed, pitch attitude or power. That is why a steep turn or an abrupt pull-up can stall you at high speed or with the nose low. A is wrong because weight changes the stall SPEED, not the stall angle. C is wrong because it leaves out accelerated and nose-low stalls.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Angle of Attack / Stalls; AFH (FAA-H-8083-3C) Ch. 5, Stalls"
},
{
"id": "CC-SPIN-02",
"acs": "PA.V.A.K1",
"k": "calc",
"q": "Your airplane's published power-off stall speed (flaps up) is 50 knots. What is its stall speed in a level, coordinated 60-degree banked turn?",
"o": [
"About 100 knots",
"About 59 knots",
"About 71 knots"
],
"a": 2,
"why": "Stall speed rises with the square root of the load factor. A level 60-degree turn pulls 2.0 G, and the square root of 2 is about 1.41, so 50 x 1.41 = about 71 kt. 100 kt comes from multiplying by the load factor itself instead of its square root. 59 kt is the 45-degree answer (square root of 1.41 = about 1.19).",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Load Factors and Stalling Speeds"
},
{
"id": "CC-SPIN-03",
"acs": "PA.V.A.K1",
"k": "calc",
"q": "An airplane weighing 2,300 pounds is flown in a level, coordinated 45-degree banked turn. Approximately how much total load must the wings support?",
"o": [
"About 3,250 lb",
"About 2,650 lb",
"About 4,600 lb"
],
"a": 0,
"why": "In a level 45-degree turn the load factor is 1.41 G, so the wings carry 2,300 x 1.41 = about 3,250 lb. 2,650 lb uses the 30-degree factor (1.15). 4,600 lb uses the 60-degree factor (2.0).",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Load Factors in Steep Turns (load factor chart)"
},
{
"id": "CC-SPIN-04",
"acs": "PA.VII.B.K1",
"k": "recall",
"q": "With everything inside the approved limits, which combination gives the LOWEST stall speed?",
"o": [
"Light weight, CG near the aft limit, flaps up, power at idle",
"Light weight, CG at the forward limit, full flaps, power on",
"Light weight, CG near the aft limit, full flaps, power on"
],
"a": 2,
"why": "Everything in C lowers stall speed. Lighter weight and an aft CG both lower it, because an aft CG means less tail down-load for the wing to carry. Flaps add maximum lift, and power adds prop slipstream and an upward pull from thrust. A gives up the flap and power benefits. B differs from C only by its forward CG, which adds tail down-load and raises stall speed.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Stalls and Effect of CG; AFH (FAA-H-8083-3C) Ch. 5, Stall factors"
},
{
"id": "CC-SPIN-05",
"acs": "PA.I.F.K2e",
"k": "recall",
"q": "As the center of gravity moves aft, and especially if it ends up behind the aft limit, which is true?",
"o": [
"Stall speed rises and the airplane becomes more stable, so stall and spin recovery get easier.",
"Stability decreases and stall/spin recovery gets harder; behind the aft limit, an unrecoverable flat spin becomes possible.",
"The elevator may not have enough authority to raise the nose in the landing flare, risking a nosewheel-first touchdown."
],
"a": 1,
"why": "An aft CG makes the airplane less stable and leaves the elevator less nose-down authority to break a stall, so stall and spin recovery get harder. Past the aft limit, a flat spin can develop that you may not be able to recover from. A describes a forward CG, which gives a higher stall speed, more stability and easier recovery. C is the forward-CG problem: not enough up-elevator to flare.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Effect of CG on Stability / Spins, and Ch. 10, Effects of Adverse Balance"
},
{
"id": "CC-SPIN-06",
"acs": "PA.I.F.K2e",
"k": "calc",
"q": "Your loaded airplane weighs 2,400 lb and the CG computes to 42.5 inches aft of datum. The aft CG limit is 42.0 inches. What is the minimum weight you must move from the aft baggage compartment (arm 120 in) to the front passenger seat (arm 40 in) to bring the CG within limits?",
"o": [
"15 lb",
"30 lb",
"10 lb"
],
"a": 0,
"why": "Weight to move = total weight x CG change / distance moved = 2,400 x 0.5 / 80 in (120 - 40) = 15 lb. The total weight stays the same because nothing leaves the airplane. 30 lb comes from dividing by the new arm (40 in), and 10 lb from dividing by the old arm (120 in), instead of the 80-inch distance moved.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 10, Weight-Shift Computation; Aircraft Weight and Balance Handbook (FAA-H-8083-1B)"
},
{
"id": "CC-SPIN-07",
"acs": "PA.VII.D.K1",
"k": "scenario",
"q": "Overshooting the runway centerline on a left base-to-final turn, a pilot adds left rudder to tighten the turn, holds right aileron to keep the bank from steepening, and pulls back on the yoke. If the airplane stalls, what is most likely to happen?",
"o": [
"The right (high, outside) wing stalls first and the airplane rolls over the top to the right.",
"Both wings stall at the same moment and the nose drops straight ahead, because rudder and aileron cancel out.",
"The left (low, inside) wing stalls first and the airplane rolls sharply further left, a likely spin entry close to the ground."
],
"a": 2,
"why": "In a skid the outside wing moves faster. Holding right aileron also lowers the left aileron, which raises the low wing's angle of attack. So the inside (left) wing stalls first and the airplane snaps further into the turn, the classic low-altitude spin entry. A is what happens in a slip (top rudder), where the high wing stalls and the airplane rolls over the top. B is wrong because crossed controls make the wings stall unevenly, not together.",
"ref": "AFH (FAA-H-8083-3C) Ch. 5, Cross-Control Stall; Ch. 8, base-to-final turn"
},
{
"id": "CC-SPIN-08",
"acs": "PA.VII.D.K1",
"k": "recall",
"q": "Which correctly tells a spin apart from a spiral?",
"o": [
"In a spin the wings are stalled and airspeed stays low; in a spiral the wings are not stalled and airspeed builds rapidly.",
"In a spin airspeed and G-load build rapidly; in a spiral the airspeed stays near the stall speed.",
"In a spin only the outside wing is stalled; in a spiral both wings are stalled but there is no yaw."
],
"a": 0,
"why": "A spin needs a stall plus yaw. Both wings are stalled, the inside one more deeply, so the airplane autorotates while airspeed stays low and nearly steady. A spiral is a steep descending turn with the wings NOT stalled, so airspeed and G-load build fast. B swaps the two. C gets the stalled wing backwards (the inside, descending wing is the more deeply stalled one), and a spiral is not stalled at all.",
"ref": "AFH (FAA-H-8083-3C) Ch. 5, Spins and Spiral Dive; PHAK (FAA-H-8083-25C) Ch. 5, Spins"
},
{
"id": "CC-SPIN-09",
"acs": "PA.VII.D.K1",
"k": "recall",
"q": "Unless the POH says otherwise, what is the correct spin recovery sequence?",
"o": [
"Power idle, ailerons opposite the rotation, rudder neutral, elevator full back to stop the nose-down pitch.",
"Power idle, ailerons neutral, full rudder opposite the rotation, then brisk forward elevator to break the stall.",
"Power idle, ailerons neutral, brisk forward elevator to break the stall, then full rudder opposite the rotation."
],
"a": 1,
"why": "The AFH order is PARE: Power idle, Ailerons neutral, full Rudder opposite the rotation, then Elevator briskly forward to break the stall. Neutralize the rudder when the rotation stops, then ease out of the dive. A uses opposite aileron, which can make the spin worse, and back elevator, which keeps the wing stalled. C swaps rudder and elevator; the AFH has full opposite rudder first, with forward elevator right after.",
"ref": "AFH (FAA-H-8083-3C) Ch. 5, Spin Recovery (steps 1-6)"
},
{
"id": "CC-SPIN-10",
"acs": "PA.VII.D.K1",
"k": "scenario",
"q": "A trainer is certificated in both the normal and utility categories and has the placard 'Intentional spins prohibited in normal category.' When may intentional spins be performed?",
"o": [
"In either category, as long as the spin is entered below maneuvering speed.",
"Only at a reduced weight, because the utility category has a lower limit load factor than the normal category.",
"Only when loaded within the utility-category weight and CG limits, and only if the POH approves spins."
],
"a": 2,
"why": "Normal category (+3.8 G) prohibits intentional spins. Utility category (+4.4 G) allows limited aerobatics, including spins, but only if the POH approves them and the airplane is inside the narrower utility weight and CG envelope (typically lighter, with a farther-forward aft limit so it will recover). A is wrong because entry airspeed doesn't make a normal-category spin legal. B has the load factors backwards: utility's limit is HIGHER than normal's.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Load Factors in Airplane Design (categories); AFH (FAA-H-8083-3C) Ch. 5, Intentional Spins; POH Sec. 2 placards"
},
{
"id": "CC-SPIN-11",
"acs": "PA.V.A.K1",
"k": "scenario",
"q": "The POH lists maneuvering speed (VA) as 105 KIAS at the 2,550-lb maximum weight. You are flying solo at about 2,000 lb and hit moderate turbulence. What should you do?",
"o": [
"Slow below 105 KIAS, because VA is lower at a lighter weight (roughly 93 KIAS here).",
"Fly at 105 KIAS, because VA is a fixed limit that does not change with weight.",
"You may fly faster than 105 KIAS, because a lighter airplane carries less load, so VA goes up."
],
"a": 0,
"why": "VA goes down as weight goes down. The same gust accelerates a lighter airplane more, so at a lower speed it can hit its limit load factor before it stalls. Here VA is about 105 x square root of (2,000 / 2,550) = about 93 KIAS. B treats VA as fixed, and C has it backwards.",
"ref": "PHAK (FAA-H-8083-25C) Ch. 5, Load Factors / Maneuvering Speed; ACS PA.V.A (maneuvering speed, including the impact of weight changes)"
},
{
"id": "CC-SPIN-12",
"acs": "PA.VII.D.K1",
"k": "scenario",
"q": "Under 14 CFR 91.307, which flight requires every occupant to wear an approved parachute?",
"o": [
"Brad, solo in a utility-category trainer, practicing 70-degree banked steep turns",
"Brad, with a non-pilot friend aboard, intentionally pitching 35 degrees nose-up for a steep climb demo",
"A CFI giving a CFI applicant the spin training required for the flight instructor certificate"
],
"a": 1,
"why": "91.307(c) requires every occupant to wear an approved parachute when the airplane carries anyone other than a crewmember and the pilot intentionally goes past 60 degrees of bank or 30 degrees nose-up or nose-down. B, a 35-degree pitch-up with a passenger aboard, triggers it. A carries no one but the crew. C is exempt under 91.307(d) because a CFI is giving spin training required for a certificate.",
"ref": "14 CFR 91.307(c) and (d)"
},
{
"id": "CC-AIR-01",
"acs": "PA.I.E.K1",
"k": "scenario",
"q": "Approaching Reno's Class C airspace, you call Reno Approach with your position, altitude and request. The controller answers, \"Aircraft calling Reno Approach, standby.\" What should you do?",
"o": [
"Enter the Class C. ATC answered your call, so two-way radio communication is established.",
"Stay outside the Class C until the controller answers using your call sign.",
"Enter the Class C, but stay below 2,500 ft AGL and slower than 200 knots until the controller calls back."
],
"a": 1,
"why": "Class C (and Class D) entry needs two-way communication, which exists only when ATC answers using your call sign. \"N1234X, standby\" would let you in. \"Aircraft calling..., standby\" does not, because the controller hasn't said who they're talking to. No rule allows a partial entry at a lower altitude or speed.",
"ref": "14 CFR 91.130(c); AIM 3-2-4"
},
{
"id": "CC-AIR-02",
"acs": "PA.I.E.K1",
"k": "scenario",
"q": "You are a private pilot flying VFR toward a Class B area in an airplane with a Mode C transponder and ADS-B Out. Approach answers your call: \"Cessna 1234X, radar contact, squawk 4521, maintain VFR.\" May you enter the Class B airspace?",
"o": [
"Yes. ATC used your call sign, so two-way communication is established.",
"Yes. Being radar identified with an assigned squawk code authorizes entry.",
"No. Class B requires a specific ATC clearance, such as \"cleared into the Class Bravo airspace.\""
],
"a": 2,
"why": "Class B is the one class that requires an actual clearance. Radar contact, a squawk code and \"maintain VFR\" are not a clearance. A call-sign reply is enough only for Class C and D.",
"ref": "14 CFR 91.131(a)(1); AIM 3-2-3"
},
{
"id": "CC-AIR-03",
"acs": "PA.I.E.K1",
"k": "recall",
"q": "Apart from an ATC clearance, what must a student pilot have to fly solo in a Class B airspace area?",
"o": [
"Ground and flight training from an authorized instructor in that specific Class B area, and a logbook endorsement for it dated within the preceding 90 days.",
"A one-time instructor endorsement that is good in any Class B airspace for 12 calendar months.",
"Nothing beyond the normal solo endorsement, because the ATC clearance is the only added requirement."
],
"a": 0,
"why": "Section 61.95 requires training in that particular Class B area plus an endorsement from the instructor who gave it, dated within the last 90 days. The endorsement is not a 12-month blanket for every Class B, and a solo endorsement alone is not enough. Some major Class B airports (Part 91 Appendix D, Section 4) don't allow student pilots to take off or land there at all.",
"ref": "14 CFR 61.95(a); 91.131(b)"
},
{
"id": "CC-AIR-04",
"acs": "PA.I.E.K1",
"k": "scenario",
"q": "Without ATC authorization, which flight may be made in a Cessna 172 (engine-driven electrical system) that has no ADS-B Out?",
"o": [
"At 9,500 ft MSL above the ceiling of a Class C area, within its lateral boundaries.",
"At 3,500 ft MSL, 25 NM from the primary airport of a Class B area (inside its 30-NM Mode C veil) and outside the Class B.",
"At 11,500 ft MSL in Class E airspace over a ridge 9,500 ft MSL high (2,000 ft AGL), far from any Class B or C."
],
"a": 2,
"why": "ADS-B Out is required above 10,000 ft MSL, except at or below 2,500 ft AGL. At 2,000 ft AGL the ridge flight falls inside that exception. Above a Class C ceiling within its lateral limits up to 10,000 MSL, and anywhere inside the 30-NM veil from the surface to 10,000 MSL, ADS-B Out (and a Mode C transponder) is required even when you are outside the Class B or C itself.",
"ref": "14 CFR 91.225(d)(2)-(4); 91.215(b)"
},
{
"id": "CC-AIR-05",
"acs": "PA.I.E.K1",
"k": "recall",
"q": "Unless ATC authorizes otherwise, which airspeed limit is correct?",
"o": [
"Beneath a Class B shelf (outside the Class B) at 3,500 ft MSL: 250 knots, since you are not in the Class B.",
"In a Class C outer shelf, 7 NM from the primary airport at 2,000 ft AGL: 250 knots.",
"Within 4 NM of a Class D primary airport at 1,500 ft AGL: 250 knots, because the 200-knot limit applies only to Class C."
],
"a": 1,
"why": "The 200-knot limit for Class C and D applies only within 4 NM of the primary airport at or below 2,500 ft AGL, so 7 NM out the general 250-knot limit below 10,000 MSL applies. Under a Class B shelf the limit is 200 knots. The 4 NM / 2,500 AGL 200-knot limit covers Class D as well as Class C.",
"ref": "14 CFR 91.117(a)-(c)"
},
{
"id": "CC-AIR-07",
"acs": "PA.I.E.K1",
"k": "recall",
"q": "Which pairing of airspace and basic VFR weather minimums is correct?",
"o": [
"Class G, at night, 1,000 ft AGL, not in a traffic pattern: 1 SM visibility and clear of clouds.",
"Class B: 3 SM visibility; 500 ft below, 1,000 ft above, 2,000 ft horizontal from clouds.",
"Class E, daytime, 10,500 ft MSL (about 3,000 ft AGL): 5 SM visibility; 1,000 ft below, 1,000 ft above, 1 SM horizontal from clouds."
],
"a": 2,
"why": "At or above 10,000 MSL and more than 1,200 AGL, the minimums are 5 SM and 1,000 below / 1,000 above / 1 SM horizontal. At night in low Class G, the minimums are 3 SM and 500/1,000/2,000. \"1 SM and clear of clouds\" applies at night only in a traffic pattern within 1/2 mile of the runway. Class B is 3 SM and simply clear of clouds.",
"ref": "14 CFR 91.155(a)-(b)"
},
{
"id": "CC-AIR-09",
"acs": "PA.I.E.K3",
"k": "scenario",
"q": "Your VFR route crosses an active MOA, an active restricted area and an alert area. Which of them may you enter only with permission from ATC or the controlling agency?",
"o": [
"The MOA and the restricted area.",
"Only the restricted area.",
"All three, whenever they are active."
],
"a": 1,
"why": "An active restricted area requires authorization from the controlling or using agency (91.133). VFR pilots may enter an active MOA without a clearance, though it's wise to call the controlling agency and use extreme caution. An alert area needs no permission, only extra vigilance. For comparison, prohibited areas are off-limits unless the using agency grants permission (in practice, plan never to enter one). Warning areas begin 3 NM off the U.S. coast and may lie over domestic waters, international waters, or both. Ref: 14 CFR 91.133; AIM 3-4-2 through 3-4-6.",
"ref": "14 CFR 91.133; AIM 3-4-3, 3-4-5, 3-4-6"
},
{
"id": "CC-AIR-10",
"acs": "PA.I.E.K1",
"k": "calc",
"q": "You will cruise VFR more than 3,000 ft AGL. True course is 184°, magnetic variation is 13° E, and a 12° right wind correction gives a magnetic heading of 183°. Which cruising altitude is appropriate?",
"o": [
"9,500 ft MSL",
"8,500 ft MSL",
"9,000 ft MSL"
],
"a": 0,
"why": "VFR cruising altitudes go by magnetic course, not true course or heading. 184° − 13° E = 171° magnetic, which falls in 0°–179°, so you fly odd thousands plus 500 (9,500). 8,500 comes from using the true course or the heading (both 180° or more). 9,000 leaves off the 500 feet, which makes it an IFR altitude.",
"ref": "14 CFR 91.159(a); PHAK (FAA-H-8083-25C) Ch. 16"
}
]);
