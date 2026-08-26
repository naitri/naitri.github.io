// ---------------------------------------------------------------------------
// Colour scheme controller.
//
// The resolved theme is written to <html data-theme="..."> by an inline script
// in the page head, so the first paint is already correct. This block owns the
// toggle, persistence, and the `themechange` event that the canvas animations
// listen to (canvas colours cannot come from CSS).
// ---------------------------------------------------------------------------
const themeApi = (() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const BAR = { dark: '#06101d', light: '#f6f7f9' };

  const current = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  function paint(mode) {
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
    if (meta) meta.setAttribute('content', BAR[mode]);
    if (toggle) {
      toggle.setAttribute('aria-checked', mode === 'dark' ? 'true' : 'false');
      toggle.title = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: mode } }));
  }

  function set(mode, remember) {
    if (mode !== 'dark' && mode !== 'light') return;
    if (remember) { try { localStorage.setItem('theme', mode); } catch (e) { /* private mode */ } }
    paint(mode);
  }

  toggle?.addEventListener('click', () => set(current() === 'dark' ? 'light' : 'dark', true));

  // With no explicit choice stored, keep following the operating system.
  const followSystem = (event) => {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
    if (stored !== 'light' && stored !== 'dark') paint(event.matches ? 'dark' : 'light');
  };
  if (systemDark.addEventListener) systemDark.addEventListener('change', followSystem);
  else if (systemDark.addListener) systemDark.addListener(followSystem);

  paint(current());
  return { current, set };
})();

const isDark = () => themeApi.current() === 'dark';

const header = document.querySelector('.site-header');
const year = document.getElementById('year');
const reveals = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();
if (year) year.textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  reveals.forEach((item) => revealObserver.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}

// Hero background clip. The <video> ships with only a poster; the source is
// attached here so narrow screens, reduced-motion visitors, and data-saver
// users never download the file. The poster carries the hero on its own.
(() => {
  const video = document.getElementById('hero-video');
  if (!video || !video.dataset.mp4) return;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduceMotion || saveData) return;

  // Phones get a smaller cut of the same clip rather than no clip at all.
  const narrow = window.matchMedia('(max-width: 760px)').matches;
  const source = document.createElement('source');
  source.src = (narrow && video.dataset.mp4Small) ? video.dataset.mp4Small : video.dataset.mp4;
  source.type = 'video/mp4';
  video.appendChild(source);
  video.load();

  const start = () => { const p = video.play(); if (p) p.catch(() => {}); };
  if (video.readyState >= 2) start(); else video.addEventListener('loadeddata', start, { once: true });

  // Stop decoding while the hero is off screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) start(); else video.pause(); });
    }, { rootMargin: '120px 0px' }).observe(video);
  }
})();

const heroPhoto = document.querySelector('.hero-photo');
heroPhoto?.addEventListener('error', () => { heroPhoto.style.display = 'none'; });

// Interactive research pillars: hover/focus on desktop, tap to pin on touch.
const brainStage = document.getElementById('brain-stage');
const popover = document.getElementById('pillar-popover');
const hotspotButtons = Array.from(document.querySelectorAll('.brain-hotspot'));
const detailCards = Array.from(document.querySelectorAll('.pillar-detail'));
const closeButton = document.querySelector('.pillar-close');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let closeTimer = 0;
let pinnedPillar = null;
let activePillar = null;

function openPillar(id, { pin = false } = {}) {
  if (!id) return;
  activePillar = id;
  if (pin) pinnedPillar = id;
  clearTimeout(closeTimer);
  hotspotButtons.forEach((button) => {
    const active = button.dataset.pillar === id;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-expanded', active ? 'true' : 'false');
  });
  detailCards.forEach((card) => card.classList.toggle('is-active', card.dataset.detail === id));
  popover?.classList.add('is-open');
  if (popover) popover.dataset.active = id;
  brainStage?.classList.add('has-open');
}

function closePillar({ force = false } = {}) {
  if (pinnedPillar && !force) return;
  pinnedPillar = null;
  activePillar = null;
  clearTimeout(closeTimer);
  hotspotButtons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');
  });
  detailCards.forEach((card) => card.classList.remove('is-active'));
  popover?.classList.remove('is-open');
  if (popover) delete popover.dataset.active;
  brainStage?.classList.remove('has-open');
}

hotspotButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.pillar;
    if (pinnedPillar === id) closePillar({ force: true });
    else openPillar(id, { pin: true });
  });
  button.addEventListener('focus', () => openPillar(button.dataset.pillar));
  button.addEventListener('mouseenter', () => {
    if (finePointer.matches && !pinnedPillar) openPillar(button.dataset.pillar);
  });
  button.addEventListener('mouseleave', () => {
    if (finePointer.matches && !pinnedPillar) closeTimer = window.setTimeout(() => closePillar(), 130);
  });
});
popover?.addEventListener('mouseenter', () => clearTimeout(closeTimer));
popover?.addEventListener('mouseleave', () => {
  if (finePointer.matches && !pinnedPillar) closeTimer = window.setTimeout(() => closePillar(), 110);
});
closeButton?.addEventListener('click', () => closePillar({ force: true }));
brainStage?.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePillar({ force: true }); });

// Ambient neurons behind the research map.
// Ambient neurons behind the research map.
const ambientCanvas = document.getElementById('neural-canvas');
const mapSection = document.querySelector('.brain-map-section');
if (ambientCanvas && mapSection) {
  const ctx = ambientCanvas.getContext('2d');
  let width = 1, height = 1, dpr = 1, raf = 0, running = true;
  const neurons = [];
  // The research band flips with the theme, so these ambient neurons carry two
  // palettes: additive glow on dark, ordinary ink on light.
  const PALETTES = {
    dark:  ['117,232,255','205,140,255','255,189,104','121,159,255'],
    light: ['15,111,146','122,64,168','176,96,18','44,78,158']
  };
  let palette = PALETTES[isDark() ? 'dark' : 'light'];
  window.addEventListener('themechange', (event) => {
    palette = PALETTES[event.detail.theme === 'dark' ? 'dark' : 'light'];
    build();
    if (reduceMotion) draw(0);
  });

  function build() {
    neurons.length = 0;
    // Scale with area now that the field covers the viewport rather than one band.
    const count = Math.max(12, Math.min(24, Math.round(width / 70)));
    for (let i = 0; i < count; i += 1) {
      neurons.push({
        x: ((i * 97) % Math.max(width, 1)),
        y: height * (.08 + (((i * 61) % 84) / 100)),
        r: 1 + (i % 4) * .35,
        phase: i * .73,
        color: palette[i % palette.length]
      });
    }
  }
  function resize() {
    const rect = mapSection.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width)); height = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    ambientCanvas.width = Math.round(width * dpr); ambientCanvas.height = Math.round(height * dpr);
    ambientCanvas.style.width = `${width}px`; ambientCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0); build();
    if (reduceMotion || !running) draw(0);
  }
  function draw(t = 0) {
    const dark = isDark();
    ctx.clearRect(0,0,width,height); ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    neurons.forEach((n, i) => {
      const x = n.x + Math.sin(t*.00022+n.phase)*5;
      const y = n.y + Math.cos(t*.00018+n.phase)*3;
      for (let j=i+1;j<neurons.length;j+=1) {
        const m=neurons[j]; const mx=m.x+Math.sin(t*.00022+m.phase)*5; const my=m.y+Math.cos(t*.00018+m.phase)*3;
        const dist=Math.hypot(x-mx,y-my); if(dist>170) continue;
        ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+mx)/2+Math.sin(i+j)*18,(y+my)/2-12,mx,my);
        const edgeAlpha=dark?(.045+(1-dist/170)*.055):(.05+(1-dist/170)*.07);
        ctx.strokeStyle=`rgba(${n.color},${edgeAlpha})`;ctx.lineWidth=dark?.7:.8;ctx.stroke();
      }
      const pulse=.5+.5*Math.sin(t*.0014+n.phase);ctx.beginPath();ctx.arc(x,y,n.r+pulse*.8,0,Math.PI*2);ctx.fillStyle=`rgba(${n.color},${dark?(.16+pulse*.3):(.14+pulse*.22)})`;if(dark){ctx.shadowColor=`rgba(${n.color},.55)`;ctx.shadowBlur=7+pulse*7;}ctx.fill();ctx.shadowBlur=0;
    });
    ctx.globalCompositeOperation='source-over';
    if (!reduceMotion && running) raf=requestAnimationFrame(draw);
  }
  resize(); draw(0);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mapSection); else window.addEventListener('resize',resize,{passive:true});
  if (!reduceMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries)=>{const next=entries.some(e=>e.isIntersecting);if(next===running)return;running=next;if(running)raf=requestAnimationFrame(draw);else cancelAnimationFrame(raf);},{rootMargin:'120px 0px'}).observe(mapSection);
  }
}

// The connectome itself is procedural: fibers and action potentials are drawn, not a static image.
const connectomeCanvas = document.getElementById('connectome-canvas');
if (connectomeCanvas && brainStage) {
  const ctx = connectomeCanvas.getContext('2d');
  let w=1,h=1,dpr=1,raf=0,running=true;
  let pointerX=0,pointerY=0;
  const nodes=[]; const edges=[]; const signals=[];
  // The panel flips with the theme, so the procedural connectome carries two
  // palettes: additive neon on dark, ordinary ink on light.
  const SCHEMES={
    dark: {vision:'100,211,255',memory:'246,112,255',action:'255,176,74',bridge:'150,120,255'},
    light:{vision:'12,108,150',  memory:'166,32,142',  action:'176,96,10',  bridge:'78,58,150'}
  };
  let COLORS=SCHEMES[isDark()?'dark':'light'];

  const clusters=[
    {key:'vision',cx:.22,cy:.53,rx:.16,ry:.29,count:34},
    {key:'vision',cx:.78,cy:.53,rx:.16,ry:.29,count:34},
    {key:'memory',cx:.43,cy:.27,rx:.14,ry:.11,count:18},
    {key:'memory',cx:.57,cy:.27,rx:.14,ry:.11,count:18},
    {key:'action',cx:.50,cy:.47,rx:.12,ry:.20,count:26},
    {key:'bridge',cx:.50,cy:.70,rx:.24,ry:.16,count:28}
  ];
  const paint=(key)=>COLORS[key];

  function rand(seed){const x=Math.sin(seed*999.71)*43758.5453;return x-Math.floor(x)}
  function rebuild(){
    nodes.length=0;edges.length=0;signals.length=0;
    let seed=1;
    clusters.forEach((c,ci)=>{
      for(let i=0;i<c.count;i+=1){
        const a=rand(seed++)*Math.PI*2;const r=Math.sqrt(rand(seed++));
        nodes.push({key:c.key,x:c.cx+Math.cos(a)*c.rx*r,y:c.cy+Math.sin(a)*c.ry*r,r:.7+rand(seed++)*1.6,phase:rand(seed++)*6.28,cluster:ci});
      }
    });
    for(let i=0;i<nodes.length;i+=1){
      const a=nodes[i];
      const distances=[];
      for(let j=0;j<nodes.length;j+=1){if(i===j)continue;const b=nodes[j];const dx=(a.x-b.x),dy=(a.y-b.y);const d=Math.hypot(dx*1.25,dy);if(d<.22)distances.push([d,j]);}
      distances.sort((x,y)=>x[0]-y[0]);
      distances.slice(0,2+(i%3===0?1:0)).forEach(([,j])=>{if(j<i)return;edges.push({a:i,b:j,bend:(rand(seed++)-.5)*.10,key:a.key});});
    }
    // deliberate cross-brain tracts
    const left=nodes.map((n,i)=>[n,i]).filter(([n])=>n.x<.35).map(([,i])=>i);
    const right=nodes.map((n,i)=>[n,i]).filter(([n])=>n.x>.65).map(([,i])=>i);
    for(let k=0;k<18;k+=1){edges.push({a:left[k%left.length],b:right[(k*3)%right.length],bend:(k%2?-.16:.16),key:'action'});}
    for(let s=0;s<64;s+=1){signals.push({edge:Math.floor(rand(seed++)*edges.length),offset:rand(seed++),speed:.035+rand(seed++)*.075,size:1.2+rand(seed++)*1.8});}
  }
  function resize(){
    const rect=connectomeCanvas.getBoundingClientRect();w=Math.max(1,Math.round(rect.width));h=Math.max(1,Math.round(rect.height));dpr=Math.min(window.devicePixelRatio||1,1.75);connectomeCanvas.width=Math.round(w*dpr);connectomeCanvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);rebuild();
    if(reduceMotion||!running)draw(0);
  }
  function pt(n){return{x:n.x*w+pointerX*4*(n.x-.5),y:n.y*h+pointerY*3*(n.y-.5)}}
  function qPoint(p0,p1,p2,t){const u=1-t;return{x:u*u*p0.x+2*u*t*p1.x+t*t*p2.x,y:u*u*p0.y+2*u*t*p1.y+t*t*p2.y}}
  function edgeGeometry(e){const a=pt(nodes[e.a]),b=pt(nodes[e.b]);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return{a,b,c:{x:mx+(b.y-a.y)*e.bend,y:my-(b.x-a.x)*e.bend}}}
  function regionBoost(key){return activePillar==='reasoning'&&key==='memory'||activePillar==='imaging'&&key==='vision'||activePillar==='flight'&&key==='action'}
  function draw(t=0){
    const dark=isDark();
    ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation=dark?'lighter':'source-over';
    // subtle region volumes
    clusters.forEach((c)=>{const col=paint(c.key);const boost=regionBoost(c.key);const g=ctx.createRadialGradient(c.cx*w,c.cy*h,0,c.cx*w,c.cy*h,Math.max(c.rx*w,c.ry*h));g.addColorStop(0,`rgba(${col},${boost?(dark?.12:.09):(dark?.035:.028)})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect((c.cx-c.rx)*w,(c.cy-c.ry)*h,c.rx*2*w,c.ry*2*h);});
    edges.forEach((e,idx)=>{const {a,b,c}=edgeGeometry(e);const col=paint(e.key);const boost=regionBoost(nodes[e.a].key)||regionBoost(nodes[e.b].key);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.x,c.y,b.x,b.y);ctx.strokeStyle=`rgba(${col},${boost?(dark?.38:.42):(dark?.16:.2)})`;ctx.lineWidth=boost?1.55:.82;ctx.stroke();if(idx%11===0){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.x+3,c.y-2,b.x,b.y);ctx.strokeStyle=`rgba(${col},${dark?.045:.06})`;ctx.lineWidth=3;ctx.stroke();}});
    nodes.forEach((n)=>{const p=pt(n);const col=paint(n.key);const pulse=.5+.5*Math.sin(t*.002+n.phase);const boost=regionBoost(n.key);ctx.beginPath();ctx.arc(p.x,p.y,n.r+(boost?1.1:0)+pulse*.5,0,Math.PI*2);ctx.fillStyle=`rgba(${col},${boost?(dark?.88:.9):(dark?.46:.55)})`;if(dark){ctx.shadowColor=`rgba(${col},${boost?.9:.48})`;ctx.shadowBlur=(boost?12:5)+pulse*5;}ctx.fill();ctx.shadowBlur=0;});
    signals.forEach((s,i)=>{const e=edges[s.edge];if(!e)return;const geo=edgeGeometry(e);const col=paint(e.key);const tt=(s.offset+(t*.0001*s.speed*70))%1;const p=qPoint(geo.a,geo.c,geo.b,tt);const key=nodes[e.a].key;const boost=regionBoost(key);ctx.beginPath();ctx.arc(p.x,p.y,s.size+(boost?1:0),0,Math.PI*2);ctx.fillStyle=`rgba(${col},${boost?.99:.86})`;if(dark){ctx.shadowColor=`rgba(${col},1)`;ctx.shadowBlur=boost?18:10;}ctx.fill();ctx.shadowBlur=0;});
    ctx.globalCompositeOperation='source-over';
    if(!reduceMotion&&running)raf=requestAnimationFrame(draw);
  }
  window.addEventListener('themechange',(event)=>{
    COLORS=SCHEMES[event.detail.theme==='dark'?'dark':'light'];
    if(reduceMotion||!running)draw(0);
  });
  brainStage.addEventListener('pointermove',(event)=>{if(event.pointerType==='touch')return;const r=brainStage.getBoundingClientRect();pointerX=((event.clientX-r.left)/r.width-.5)*2;pointerY=((event.clientY-r.top)/r.height-.5)*2;});
  brainStage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  resize();draw(0);
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(connectomeCanvas);else window.addEventListener('resize',resize,{passive:true});
  if(!reduceMotion&&'IntersectionObserver'in window){new IntersectionObserver((entries)=>{const next=entries.some(e=>e.isIntersecting);if(next===running)return;running=next;if(running)raf=requestAnimationFrame(draw);else cancelAnimationFrame(raf);},{rootMargin:'120px 0px'}).observe(brainStage);}
}

// Graceful logo fallback for local/offline previews.
document.querySelectorAll('.experience-logo img').forEach((img) => {
  img.addEventListener('error', () => {
    const shell = img.closest('.experience-logo');
    if (!shell) return;
    img.remove();
    const fallback = document.createElement('span');
    fallback.className = 'experience-logo-fallback';
    fallback.textContent = shell.dataset.fallback || '•';
    shell.appendChild(fallback);
  });
});


// Homepage news strip. The drift is applied as a transform rather than by
// setting scrollLeft, because scroll offsets are whole pixels and a 9px/s crawl
// therefore advanced in visible 1px steps. Transforms interpolate sub-pixel and
// stay on the compositor, so the same speed is smooth. Losing the native
// scroller costs us swipe and wheel, which are re-added below.
(() => {
  const viewport = document.getElementById('news-strip');
  const track = viewport && viewport.querySelector('.news-track');
  if (!viewport || !track) return;

  const SPEED = 9;                      // px per second
  let offset = 0, direction = 1, paused = false, onScreen = false;
  let last = 0, raf = 0, resume = 0;
  let dragging = false, dragged = 0, startX = 0, startOffset = 0;

  const limit = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  const clamp = (v) => Math.min(Math.max(v, 0), limit());
  const paint = () => { track.style.transform = `translate3d(${-offset}px,0,0)`; };

  const hold = () => { paused = true; clearTimeout(resume); };
  const releaseSoon = (ms = 2500) => {
    clearTimeout(resume);
    resume = setTimeout(() => { paused = false; last = 0; }, ms);
  };

  const step = (now) => {
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    if (!paused && !dragging && onScreen) {
      const max = limit();
      if (max > 4) {
        offset += direction * SPEED * dt;
        if (offset >= max) { offset = max; direction = -1; }
        else if (offset <= 0) { offset = 0; direction = 1; }
        paint();
      }
    }
    raf = requestAnimationFrame(step);
  };

  // Glide to a target instead of jumping, for the arrow buttons and keyboard.
  let glide = 0;
  const glideTo = (target) => {
    cancelAnimationFrame(glide);
    const from = offset, to = clamp(target), t0 = performance.now(), ms = 420;
    if (reduceMotion) { offset = to; paint(); return; }
    const tick = (now) => {
      const k = Math.min((now - t0) / ms, 1);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // ease-in-out
      offset = from + (to - from) * e;
      paint();
      if (k < 1) glide = requestAnimationFrame(tick);
    };
    glide = requestAnimationFrame(tick);
  };
  const cardStep = () => {
    const card = track.querySelector('.news-card');
    return (card ? card.getBoundingClientRect().width : 264) + 10;
  };

  // Pointer drag stands in for the native scroll the transform displaced.
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true; dragged = 0; startX = e.clientX; startOffset = offset;
    hold();
    track.classList.add('is-dragging');
    try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    dragged = Math.max(dragged, Math.abs(dx));
    offset = clamp(startOffset - dx);
    paint();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false; last = 0;
    track.classList.remove('is-dragging');
    releaseSoon();
  };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((e) =>
    viewport.addEventListener(e, endDrag));
  // A drag that moved should not also open the card it started on.
  viewport.addEventListener('click', (e) => {
    if (dragged > 6) { e.preventDefault(); e.stopPropagation(); }
    dragged = 0;
  }, true);

  viewport.addEventListener('wheel', (e) => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (!dx) return;
    e.preventDefault();
    offset = clamp(offset + dx);
    paint(); hold(); releaseSoon();
  }, { passive: false });

  viewport.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    glideTo(offset + (e.key === 'ArrowRight' ? cardStep() : -cardStep()));
    hold(); releaseSoon(4000);
  });

  ['pointerenter', 'focusin'].forEach((e) => viewport.addEventListener(e, hold, { passive: true }));
  viewport.addEventListener('pointerleave', () => releaseSoon(600), { passive: true });
  viewport.addEventListener('focusout', () => releaseSoon(600), { passive: true });

  document.querySelectorAll('[data-news-scroll]').forEach((b) => b.addEventListener('click', () => {
    glideTo(offset + (b.dataset.newsScroll === 'next' ? cardStep() : -cardStep()));
    hold(); releaseSoon(4000);
  }));

  window.addEventListener('resize', () => { offset = clamp(offset); paint(); }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { onScreen = entries.some((x) => x.isIntersecting); },
      { threshold: .15 }).observe(viewport);
  } else { onScreen = true; }

  paint();
  if (!reduceMotion) raf = requestAnimationFrame(step);
})();

// Mathematical torus around the portrait: a projected parametric surface, split into
// back/front layers so the portrait genuinely intersects the manifold.
(() => {
  const backCanvas = document.getElementById('torus-back-canvas');
  const frontCanvas = document.getElementById('torus-front-canvas');
  const host = document.querySelector('.portrait-manifold');
  if (!backCanvas || !frontCanvas || !host) return;

  const bctx = backCanvas.getContext('2d');
  const fctx = frontCanvas.getContext('2d');
  let width = 1, height = 1, dpr = 1, raf = 0, running = true;
  const R = 1.58, r = .53;

  // The hero flips with the theme; the manifold is drawn in whichever ink reads
  // against it. Same geometry, two stroke palettes.
  const INK = {
    dark: {
      majorFront:'rgba(128,222,255,.52)', minorFront:'rgba(113,180,234,.28)',
      majorBack:'rgba(77,126,190,.20)',   minorBack:'rgba(73,104,156,.12)',
      meridianFront:'rgba(165,137,255,.30)', meridianBack:'rgba(96,79,155,.10)',
      flowFront:'rgba(155,240,255,.86)', flowBack:'rgba(89,164,215,.23)',
      dotFront:'rgba(198,242,255,.62)',  dotBack:'rgba(111,159,203,.20)'
    },
    light: {
      majorFront:'rgba(17,92,126,.62)',  minorFront:'rgba(56,110,150,.34)',
      majorBack:'rgba(112,142,175,.30)', minorBack:'rgba(130,158,188,.19)',
      meridianFront:'rgba(103,74,163,.34)', meridianBack:'rgba(146,132,186,.17)',
      flowFront:'rgba(11,88,124,.82)',   flowBack:'rgba(120,155,186,.32)',
      dotFront:'rgba(19,66,97,.62)',     dotBack:'rgba(129,160,190,.28)'
    }
  };
  let ink = INK[isDark() ? 'dark' : 'light'];

  function rotatePoint(x, y, z, phase) {
    // Slowly precess the torus while preserving a textbook state-space perspective.
    const ay = -.28 + Math.sin(phase * .37) * .035;
    const ax = 1.06;
    const az = -.055;

    let x1 = x * Math.cos(ay) + z * Math.sin(ay);
    let z1 = -x * Math.sin(ay) + z * Math.cos(ay);
    let y1 = y;

    let y2 = y1 * Math.cos(ax) - z1 * Math.sin(ax);
    let z2 = y1 * Math.sin(ax) + z1 * Math.cos(ax);
    let x2 = x1;

    const x3 = x2 * Math.cos(az) - y2 * Math.sin(az);
    const y3 = x2 * Math.sin(az) + y2 * Math.cos(az);
    return { x: x3, y: y3, z: z2 };
  }

  function torusPoint(u, v, phase) {
    const rr = R + r * Math.cos(v);
    return rotatePoint(rr * Math.cos(u), rr * Math.sin(u), r * Math.sin(v), phase);
  }

  function project(p) {
    const perspective = 4.9;
    const s = perspective / (perspective - p.z);
    const scale = Math.min(width / 5.0, height / 3.45);
    return { x: width / 2 + p.x * scale * s, y: height / 2 + p.y * scale * s, z: p.z, s };
  }

  function segmentCurve(ctxBack, ctxFront, points, frontColor, backColor, frontWidth=1, backWidth=.72) {
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1], b = points[i];
      const front = (a.z + b.z) * .5 > 0;
      const ctx = front ? ctxFront : ctxBack;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = front ? frontColor : backColor;
      ctx.lineWidth = front ? frontWidth : backWidth;
      ctx.stroke();
    }
  }

  function drawGrid(phase) {
    bctx.clearRect(0, 0, width, height);
    fctx.clearRect(0, 0, width, height);
    bctx.lineCap = fctx.lineCap = 'round';
    bctx.lineJoin = fctx.lineJoin = 'round';

    // Orbits around the major radius. These are the rings that actually read as
    // "going around" the torus; the dense meridian mesh that used to sit on top
    // of them turned the whole thing into a cross-hatch, so it is gone.
    for (let j = 0; j < 13; j += 1) {
      const v = (j / 13) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 160; i += 1) pts.push(project(torusPoint((i / 160) * Math.PI * 2, v, phase)));
      // Rings nearest the outer equator carry the form; the rest fall away.
      const equatorial = Math.abs(Math.cos(v));
      const major = equatorial > .72;
      segmentCurve(bctx, fctx, pts,
        major ? ink.majorFront : ink.minorFront,
        major ? ink.majorBack : ink.minorBack,
        major ? 1.5 : .7 + equatorial * .4,
        major ? .95 : .45 + equatorial * .25);
    }

    // A handful of tube cross-sections, spaced far apart, keep it reading as a
    // surface rather than a stack of loose hoops.
    for (let j = 0; j < 6; j += 1) {
      const u = (j / 6) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 52; i += 1) pts.push(project(torusPoint(u, (i / 52) * Math.PI * 2, phase)));
      segmentCurve(bctx, fctx, pts, ink.meridianFront, ink.meridianBack, .6, .38);
    }

    // Travelling arcs. Each rides the major radius at a fixed v, so the motion
    // goes *around* the torus instead of wandering across its surface. The tail
    // fades so the head reads as a direction of travel.
    const ARCS = [
      { v: 0,       span: Math.PI * .60, speed:  1.55, width: 2.2 },
      { v: Math.PI, span: Math.PI * .42, speed: -1.05, width: 1.4 }
    ];
    ARCS.forEach((arc) => {
      const head = phase * arc.speed;
      const STEPS = 64;
      let prev = project(torusPoint(head % (Math.PI * 2), arc.v, phase));
      for (let i = 1; i <= STEPS; i += 1) {
        const t = i / STEPS;                       // 0 at the head, 1 at the tail
        const u = head - t * arc.span;
        const pt = project(torusPoint(((u % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), arc.v, phase));
        const front = (prev.z + pt.z) * .5 > 0;
        const ctx = front ? fctx : bctx;
        ctx.save();
        ctx.globalAlpha = (1 - t) * (front ? 1 : .42);
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = front ? ink.flowFront : ink.flowBack;
        ctx.lineWidth = arc.width * (front ? 1 : .55);
        ctx.stroke();
        ctx.restore();
        prev = pt;
      }
      // The head itself, as a small travelling marker.
      const hp = project(torusPoint(((head % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), arc.v, phase));
      const hctx = hp.z > 0 ? fctx : bctx;
      hctx.beginPath(); hctx.arc(hp.x, hp.y, hp.z > 0 ? 2.6 : 1.5, 0, Math.PI * 2);
      hctx.fillStyle = hp.z > 0 ? ink.flowFront : ink.flowBack;
      hctx.fill();
    });

    // Markers sit at regular intervals on the outer ring and travel with it,
    // rather than being scattered at pseudo-random points on the surface.
    for (let k = 0; k < 18; k += 1) {
      const u = (k / 18) * Math.PI * 2 + phase * .22;
      const p = project(torusPoint(u % (Math.PI * 2), 0, phase));
      const ctx = p.z > 0 ? fctx : bctx;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.z > 0 ? 1.6 : .95, 0, Math.PI * 2);
      ctx.fillStyle = p.z > 0 ? ink.dotFront : ink.dotBack;
      ctx.fill();
    }
  }

  function resize() {
    const rect = backCanvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    [backCanvas, frontCanvas].forEach((canvas) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    });
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid(0);
  }

  function animate(t = 0) {
    drawGrid(t * .00028);
    if (!reduceMotion && running) raf = requestAnimationFrame(animate);
  }

  window.addEventListener('themechange', (event) => {
    ink = INK[event.detail.theme === 'dark' ? 'dark' : 'light'];
    if (reduceMotion || !running) drawGrid(0);
  });

  resize();
  if (!reduceMotion) animate(0);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(backCanvas);
  else window.addEventListener('resize', resize, { passive: true });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const next = entries.some((e) => e.isIntersecting);
      if (next === running) return;
      running = next;
      if (running) raf = requestAnimationFrame(animate); else cancelAnimationFrame(raf);
    }, { rootMargin: '120px 0px' }).observe(host);
  }
})();

// The brand mark doubles as a "you are here" indicator: it holds the initials at
// the top of the page and expands into the name of whichever section is in view.
(() => {
  const brand = document.querySelector('.brand');
  const mark = document.querySelector('.brand-mark');
  if (!brand || !mark) return;

  const initials = mark.dataset.brandDefault || mark.textContent.trim();
  const navLinks = Array.from(document.querySelectorAll('.nav a'));

  // On the News and Teaching pages the answer is fixed.
  if (brand.dataset.brandPage) {
    mark.textContent = brand.dataset.brandPage;
    brand.classList.add('is-section');
    return;
  }

  const SECTIONS = [
    ['research', 'Research'],
    ['publications', 'Publications'],
    ['news', 'News'],
    ['experience', 'Experience'],
    ['projects', 'Projects']
  ].map(([id, label]) => ({ el: document.getElementById(id), label, id }))
   .filter((s) => s.el);
  if (!SECTIONS.length) return;

  let current = '';
  const apply = (label, id) => {
    if (label === current) return;
    current = label;
    mark.textContent = label || initials;
    brand.classList.toggle('is-section', Boolean(label));
    navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', Boolean(id) && href.endsWith('#' + id));
    });
  };

  const pick = () => {
    // Whichever section covers the point just below the fixed header wins.
    const line = 90;
    let found = null;
    SECTIONS.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) found = s;
    });
    apply(found ? found.label : '', found ? found.id : '');
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { pick(); ticking = false; });
  }, { passive: true });
  pick();
})();
