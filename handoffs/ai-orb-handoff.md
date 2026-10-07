# Handoff: Apple-style AI orb launcher (from Brad's Personal OS)

**Goal:** make the AI chat button on the church dashboard look and behave exactly like the one in Brad's Personal OS:
a floating, transparent sphere of ~1,200 tiny glowing blue dots that slowly rotates in 3D and "breathes"
(inspired by Apple's iPhone setup / Siri particle orb). No circle, no background, no text label; just the dots
with a soft blue glow. The same orb appears large (150px) on the chat's empty "welcome" screen.

It's pure HTML/CSS/canvas (no libraries, no images). Drop in the three pieces below and wire 2 lines to your
existing open/close chat functions.

---

## 1. HTML (the launcher button)

Replace the current chat bubble/button with this (keep your own click handler name):

```html
<button id="aiFab" onclick="openAI()" title="Ask AI (⌘J)" aria-label="Open AI assistant">
  <canvas class="ai-sphere"></canvas>
</button>
```

Optional welcome orb inside the chat panel's empty state:

```html
<canvas class="ai-sphere ai-hello-orb"></canvas>
```

Any `<canvas class="ai-sphere">` on the page gets animated automatically, at whatever size its CSS gives it.

## 2. CSS

```css
#aiFab {
  all: unset;
  position: fixed; right: 22px; bottom: 22px; z-index: 2400;
  width: 68px; height: 68px; border-radius: 50%;
  display: block; cursor: pointer;
  background: transparent; border: none; box-shadow: none; overflow: visible;
  transition: transform .18s;
}
#aiFab:hover { transform: scale(1.08); }
#aiFab.hidden { display: none; }
#aiFab:focus-visible { outline: 2px solid rgba(90,160,255,.8); outline-offset: 4px; }
#aiFab canvas { filter: drop-shadow(0 0 6px rgba(90,160,255,.45)); }

canvas.ai-sphere { display: block; width: 100%; height: 100%; }
.ai-hello-orb { width: 150px !important; height: 150px !important; margin: 0 auto; }

/* phones: a bit smaller; lift it above a bottom tab bar if the dashboard has one (adjust 74px or use 16px if not) */
@media (max-width: 640px) {
  #aiFab { right: 14px; bottom: calc(74px + env(safe-area-inset-bottom)); width: 58px; height: 58px; }
}
```

Designed for a dark background. On a light page, the blue additive glow still works but is subtler. If needed,
change the dot lightness in the JS (`light=62+18*front` → `light=45+15*front`) and drop `'lighter'` blending.

## 3. JavaScript (one self-contained block; put it anywhere after the button, or at the end of the page)

```js
/* ---------- AI orb: Apple-style particle sphere (hundreds of tiny flowing blue dots, rotating in 3D) ---------- */
(function(){
  var N=1200, pts=[], t0=performance.now(), raf=null, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gold=Math.PI*(3-Math.sqrt(5));
  for(var i=0;i<N;i++){ var y=1-(i/(N-1))*2, rad=Math.sqrt(1-y*y), th=gold*i;
    pts.push({x:Math.cos(th)*rad, y:y, z:Math.sin(th)*rad, ph:Math.random()*6.283, sp:0.6+Math.random()*0.9, s:0.35+Math.random()*0.75, depth:0.55+Math.random()*0.45}); }
  function draw(cv, t){
    var dpr=Math.min(2, window.devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return;
    if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
    var ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    var R=Math.min(W,H)*0.36, cx=W/2, cy=H/2, ay=t*0.35, ax=Math.sin(t*0.23)*0.45+0.35;
    var cay=Math.cos(ay), say=Math.sin(ay), cax=Math.cos(ax), sax=Math.sin(ax), big=W>40;
    if(W>100){ var halo=ctx.createRadialGradient(cx,cy,R*0.1,cx,cy,R*1.35); halo.addColorStop(0,'rgba(90,150,255,.20)'); halo.addColorStop(1,'rgba(90,150,255,0)'); ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(cx,cy,Math.min(W,H)/2,0,6.283); ctx.fill(); }
    ctx.globalCompositeOperation='lighter';
    for(var i=0;i<N;i++){ var p=pts[i];
      // flowing surface: each point breathes in/out and drifts along the sphere
      var flow=1+0.07*Math.sin(t*p.sp+p.ph)+0.05*Math.sin(t*0.9+p.y*5+p.ph*0.3), r=R*flow*p.depth;
      var x=p.x*r, y=p.y*r, z=p.z*r;
      var x1=x*cay+z*say, z1=-x*say+z*cay; var y1=y*cax-z1*sax, z2=y*sax+z1*cax;
      var persp=1/(1-z2/(R*3.2)), px=cx+x1*persp, py=cy+y1*persp, front=(z2/R+1)/2;
      var a=(0.28+0.72*front)*(0.6+0.4*Math.sin(t*1.7+p.ph)), size=Math.max(0.6,R/32)*p.s*persp*(0.7+0.5*front);
      var hue=208+18*Math.sin(p.ph+t*0.2), light=62+18*front;
      ctx.fillStyle='hsla('+hue.toFixed(0)+',95%,'+light.toFixed(0)+'%,'+a.toFixed(3)+')';
      ctx.fillRect(px-size/2, py-size/2, size, size);
    }
    ctx.globalCompositeOperation='source-over';
  }
  function frame(now){ var t=(now-t0)/1000, any=false;
    document.querySelectorAll('canvas.ai-sphere').forEach(function(cv){ if(cv.offsetParent===null) return; any=true; draw(cv,t); });
    raf=(any&&!document.hidden&&!reduce)?requestAnimationFrame(frame):null; }
  function wake(){ if(!raf) raf=requestAnimationFrame(frame); }
  window.aiHiveWake=wake;
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) wake(); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', wake); else wake();
})();
```

How it works (so you can tweak it):
- **Points:** 1,200 points spread evenly over a sphere with a Fibonacci (golden-angle) spiral. Each point has its own
  random phase, speed, size and depth (0.55–1.0 of the radius), so the orb looks like a cloud, not a shell.
- **Motion:** it spins around the vertical axis (`t*0.35`) with a gentle nodding tilt (`sin(t*0.23)`). Each dot
  "breathes" in and out (`flow`) and twinkles (`a`). The color drifts within blue hues (`208±18`).
- **Depth:** perspective scaling, and front dots are bigger and brighter than back ones. `'lighter'` blending makes overlaps glow.
- **Halo:** a soft radial glow is drawn only on large canvases (the 150px welcome orb), never on the small button.
- **Sharp on retina:** the canvas is sized to devicePixelRatio (capped at 2) and resizes itself if CSS changes its size.
- **Performance:** one shared `requestAnimationFrame` loop draws every visible `canvas.ai-sphere`. It stops when none is
  visible, the tab is hidden, or the user has "reduce motion" turned on (then it shows one still frame).
  Cost is ~1,200 `fillRect`s per visible orb per frame, which is fine on phones.

## 4. Wire-up (2 lines)

The loop sleeps when no orb is visible, so wake it whenever an orb becomes visible again:

```js
function openAI(){  /* …your existing code that shows the panel… */  document.getElementById('aiFab').classList.add('hidden');    if (window.aiHiveWake) aiHiveWake(); }
function closeAI(){ /* …your existing code that hides the panel… */  document.getElementById('aiFab').classList.remove('hidden'); if (window.aiHiveWake) aiHiveWake(); }
```

Also call `aiHiveWake()` after rendering the chat welcome screen (if you add the big orb there), and after login/unlock
if the button starts hidden.

## 5. Checklist for the church dashboard thread

- [ ] Remove the old bubble's icon/text/background so only the canvas shows.
- [ ] Make sure no other CSS rule (e.g. a theme override) re-adds a background/border to `#aiFab`. In Personal OS, older
      rules had to be overridden with `!important`. Search the stylesheet for `#aiFab` and delete stale rules instead.
- [ ] If the dashboard has a bottom tab bar on phones, adjust the mobile `bottom:` so the orb sits above it.
- [ ] Test: desktop hover (it grows slightly), phone size, dark/light theme, and that it stops animating when the chat is open.
- [ ] Rename `aiHiveWake` only if it clashes with something; the button id `aiFab` can change too (update the CSS).
