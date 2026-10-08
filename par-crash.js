/* PAR test-day crash course (Oct 8 2026): Brad's weak areas — NTSB 830, airspace, how stalls/spins/CG relate, plus a little METAR.
   PAR_CRASH_SHEET = one-page cheat sheet (HTML) shown above the Crash course drill. New original questions (CC-*) are appended
   to PAR_BANK below after independent review. */
window.PAR_CRASH_SHEET = [
 ['NTSB (49 CFR 830): what to report, and when', [
  '<b>Accident</b> = from boarding with intent to fly until everyone gets off, someone dies or is <b>seriously injured</b>, or the airplane gets <b>substantial damage</b>.',
  '<b>Serious injury</b>: hospitalized <b>more than 48 hours</b>, starting <b>within 7 days</b> of the injury · any bone fracture <b>except simple fractures of fingers, toes or nose</b> · severe bleeding, nerve, muscle or tendon damage · any internal organ injury · 2nd/3rd-degree burns, or any burns over <b>5%</b> of the body.',
  '<b>Substantial damage</b> = hurts structural strength, performance or flight characteristics and normally needs major repair. <b>NOT substantial</b>: engine failure or damage limited to one engine · bent fairings or cowling · dented skin · small punctures in skin or fabric · <b>ground damage</b> to propeller or rotor blades · damage to landing gear, wheels, tires, flaps, engine accessories, brakes or <b>wingtips</b>.',
  '<b>Notify the NTSB immediately</b> (830.5) for any accident, overdue aircraft believed in an accident, or these incidents: flight-control system malfunction/failure · a required crewmember can’t do their duties from injury or illness · <b>in-flight fire</b> · <b>in-flight collision</b> · damage to <b>other property</b> over <b>$25,000</b> · release of all or part of a <b>propeller blade</b> (not caused solely by ground contact) · loss of displays (EFIS) info.',
  '<b>Written report</b> (Form 6120.1): within <b>10 days</b> after an accident · within <b>7 days</b> if an overdue aircraft is still missing · incidents: <b>only if the NTSB asks</b>.',
  '<b>Wreckage</b>: don’t move it except to <b>remove people</b>, protect the wreckage from further damage, or protect the public.']],
 ['Airspace: the traps', [
  '<b>Entry</b>: Class B = ATC <b>clearance</b> (“cleared into the Bravo”). Class C and D = <b>two-way communication</b>: ATC answers using your call sign (“N123, standby” = you may enter; “Aircraft calling, standby” = you may not).',
  '<b>Class B</b>: students need an endorsement (and some B airports bar them). <b>Mode C/ADS-B</b> within 30 NM of the primary airport (the veil). <b>Class C</b>: 5 NM core from the surface, 10 NM shelf, both to 4,000 ft AGL; outer area 20 NM.',
  '<b>ADS-B Out / transponder</b>: in A, B, C; in the 30 NM veil; <b>above the ceiling of Class C</b> (up to 10,000 MSL); and <b>at or above 10,000 MSL</b> except at or below 2,500 AGL. Not required <b>under</b> a Class C shelf.',
  '<b>Speeds</b>: 250 kt below 10,000 MSL · 200 kt under a Class B shelf or in a VFR corridor · 200 kt within 4 NM of a Class C/D primary airport at or below 2,500 AGL.',
  '<b>Class E floors</b>: surface (dashed magenta) · 700 AGL (fuzzy magenta) · 1,200 AGL (fuzzy blue / default) · 14,500 MSL everywhere. Class D turns into E or G when the tower closes.',
  '<b>VFR weather traps</b>: Class G at or below 1,200 AGL, <b>day</b> = 1 SM, clear of clouds; <b>night</b> = 3 SM, 500/1,000/2,000. At or above 10,000 MSL (and over 1,200 AGL) = 5 SM, 1,000 below/1,000 above/1 SM sideways. Surface area of B/C/D/E: need a <b>1,000-ft ceiling and 3 SM</b> to take off, land or enter the pattern.',
  '<b>Special VFR</b>: in a surface area, below 10,000 MSL, with ATC clearance, 1 SM and clear of clouds. At <b>night</b> it requires an instrument rating and an IFR-equipped airplane.',
  '<b>Special-use</b>: Prohibited = never · Restricted = need permission when active · MOA = VFR may go through, use caution · Alert = lots of training, be vigilant · Warning = hazard over international water.',
  '<b>VFR cruising</b> (above 3,000 AGL, by <b>magnetic course</b>): 0–179° = odd thousands + 500 (3,500, 5,500) · 180–359° = even thousands + 500. <b>Oxygen</b>: crew after 30 min above 12,500 to 14,000 · crew always above 14,000 · offer to passengers above 15,000.']],
 ['Stalls, spins and CG: how they connect', [
  'A stall is exceeding the <b>critical angle of attack</b>. It can happen at <b>any airspeed, any attitude, any power setting</b>.',
  'Stall speed goes <b>up</b> with: more weight · more load factor (bank) · <b>forward CG</b> · ice or frost · flaps up. It goes <b>down</b> with: less weight, aft CG, flaps down, power on.',
  '<b>Load factor in a level turn</b>: 30° = 1.15 G (stall speed +7%) · 45° = 1.41 G (+19%) · <b>60° = 2 G (+41%)</b>. New stall speed = stall speed × √(load factor). Example: stalls at 50 kt → in a 60° bank ≈ 71 kt.',
  '<b>Forward CG</b>: more tail-down force needed → <b>higher stall speed</b>, more stable, slower cruise, hardest to raise the nose (flare). <b>Aft CG</b>: <b>lower stall speed</b>, faster cruise, <b>less stable</b>, more prone to stalls/spins and <b>harder (maybe impossible) spin recovery</b> (flat spin).',
  '<b>Spin</b> = a stall <b>plus yaw</b> (both wings stalled, one more than the other: autorotation). Classic trap: a <b>skidding, cross-controlled turn base-to-final</b>. The inside wing stalls first and the airplane snaps into a spin. A <b>spiral</b> is not stalled: speed builds fast.',
  '<b>Spin recovery (PARE)</b>: Power idle · Ailerons neutral · Rudder full opposite the rotation · Elevator briskly forward to break the stall. Then neutralize rudder and recover from the dive.',
  '<b>Normal category</b>: intentional spins prohibited. <b>Utility</b>: limited aerobatics, sometimes spins if approved. <b>Parachutes</b> required (91.307) for banks over 60° or pitch over 30° with a passenger, except during training for a certificate or rating with a CFI.',
  '<b>Maneuvering speed (VA) goes down as weight goes down</b>, so a lightly loaded airplane needs to be flown slower in turbulence.',
  '<b>CG math</b>: CG = total moment ÷ total weight. Weight shift: weight moved ÷ total weight = CG change ÷ distance moved. Avgas = 6 lb/gal · oil 7.5 lb/gal.']],
 ['METAR/TAF: just the gotchas', [
  'Wind is <b>true</b> and in knots (ATIS and tower winds are <b>magnetic</b>). Visibility in statute miles. Cloud heights are <b>AGL</b> in hundreds of feet: BKN030 = 3,000 ft.',
  'The <b>ceiling</b> is the lowest <b>BKN</b>, <b>OVC</b> or <b>VV</b> layer, never FEW or SCT. TAF: FM = from (a lasting change), TEMPO = temporary, PROB30 = 30% chance.',
  'Winds aloft: true, knots; no wind within 1,500 ft of the station, no temperature at 3,000 ft. <b>9900</b> = light and variable. Direction over 36 (e.g. 7425) means subtract 50 from the direction and add 100 to the speed: 240° at 125 kt.']]
];
