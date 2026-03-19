/* Sun9 Group — script.js */
const SB_URL  = 'https://sdjqekzcqmohxslvzsgi.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkanFla3pjcW1vaHhzbHZ6c2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU5NDksImV4cCI6MjA4OTQ5MTk0OX0.3yxKXgqgazMo2g4DPKdSynSbYkFNnJ3C6hasaEMiq48';
const IMG_CDN = `${SB_URL}/storage/v1/object/public/images`;
const sb      = supabase.createClient(SB_URL, SB_KEY);

const IMGS = {
  edinburgh: `${IMG_CDN}/founder-edinburgh.jpg`,
  workshop:  `${IMG_CDN}/founder-workshop.jpg`,
};

function smoothTo(id, e) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadContent() {
  try {
    const { data } = await sb.from('content').select('key,value');
    if (!data) return;
    const map = {};
    data.forEach(r => map[r.key] = r.value);

    // Hero 標題：三行結構
    const t1 = document.getElementById('txt-hero-t1');
    const t2 = document.getElementById('txt-hero-t2');
    // t1 = 真正的差距，t2 = 在於誰能把流量...（含 HTML tag，直接 innerHTML）
    if (t1 && map['hero_title_1']) t1.innerHTML = map['hero_title_1'];
    if (t2 && map['hero_title_2']) t2.innerHTML = map['hero_title_2'];

    function setHTML(id, key) {
      const el = document.getElementById(id);
      if (el && map[key] !== undefined) {
        // 值若含 <br> 直接用，若含 \n 則轉換
        el.innerHTML = map[key].replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
      }
    }
    setHTML('txt-hero-sub',      'hero_subtitle');
    setHTML('txt-pos-main',      'positioning_main');
    setHTML('txt-pos-sub',       'positioning_sub');
    setHTML('txt-founder-name',  'founder_name');
    setHTML('txt-founder-title', 'founder_title');
    setHTML('txt-founder-bio',   'founder_bio');
    setHTML('txt-founder-quote', 'founder_quote');
    setHTML('txt-p1-num','proof_1_num'); setHTML('txt-p1-lab','proof_1_label');
    setHTML('txt-p2-num','proof_2_num'); setHTML('txt-p2-lab','proof_2_label');
    setHTML('txt-p3-num','proof_3_num'); setHTML('txt-p3-lab','proof_3_label');
  } catch(e) { console.log('Content load skipped:', e); }
}

async function loadPortfolio() {
  try {
    const { data } = await sb.from('portfolio').select('*').order('sort_order');
    if (!data || !data.length) return;
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    const d = ['d1','d2','d3'];
    grid.innerHTML = data.map((p,i) => `
      <div class="group relative border border-gold/10 p-10 overflow-hidden transition-colors duration-300 hover:border-gold/28 rev ${d[i]||''}">
        <div class="card-bottom-line"></div>
        <span class="font-cinzel text-gold opacity-60 mb-4 block" style="font-size:9px;letter-spacing:.3em">${p.tag||''}</span>
        <h3 class="font-serif font-light text-white mb-3 text-3xl">${p.name}</h3>
        <p class="font-zh font-light text-white/55 leading-loose mb-5 text-base">${(p.description||'').replace(/\n/g,'<br>')}</p>
        <p class="font-zh font-light text-white/28 text-sm tracking-widest">${p.detail||''}</p>
      </div>`).join('');
    grid.querySelectorAll('.rev').forEach(el => revObs.observe(el));
  } catch(e) {}
}

function loadImages() {
  document.querySelectorAll('[data-img]').forEach(el => {
    const key = el.getAttribute('data-img');
    if (IMGS[key]) el.src = IMGS[key];
  });
}

function initParticles(canvasId) {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x:-999, y:-999 };
  const N=110, LK=150, RP=120, G='rgba(201,168,76,';
  function resize() { W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; }
  function mkPt() { return {x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,sz:Math.random()*1.8+.3,a:Math.random()*.45+.15,ph:Math.random()*Math.PI*2}; }
  resize();
  for (let i=0;i<N;i++) pts.push(mkPt());
  window.addEventListener('resize', ()=>{ resize(); pts=[]; for(let i=0;i<N;i++) pts.push(mkPt()); });
  const hero = cv.parentElement;
  hero.addEventListener('mousemove', e=>{ const r=hero.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
  hero.addEventListener('mouseleave', ()=>{ mouse.x=-999; mouse.y=-999; });
  let t=0;
  function draw() {
    ctx.clearRect(0,0,W,H); t+=.008;
    const gc=ctx.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,W*.4);
    gc.addColorStop(0,'rgba(201,168,76,.04)'); gc.addColorStop(1,'transparent');
    ctx.fillStyle=gc; ctx.fillRect(0,0,W,H);
    if (mouse.x>0) { const gm=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,200); gm.addColorStop(0,'rgba(201,168,76,.09)'); gm.addColorStop(1,'transparent'); ctx.fillStyle=gm; ctx.fillRect(0,0,W,H); }
    pts.forEach(p=>{
      p.vx+=Math.sin(t+p.ph)*.012; p.vy+=Math.cos(t+p.ph*1.3)*.012;
      const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<RP){p.vx+=(dx/d)*.5;p.vy+=(dy/d)*.5;}
      p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;
      if(p.x<-5)p.x=W+5;if(p.x>W+5)p.x=-5;if(p.y<-5)p.y=H+5;if(p.y>H+5)p.y=-5;
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=G+p.a+')';ctx.fill();
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<LK){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=G+(.14*(1-d/LK))+')';ctx.lineWidth=.6;ctx.stroke();}
    }
    requestAnimationFrame(draw);
  }
  draw();
}

const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('on');revObs.unobserve(e.target);} });
}, {threshold:.07});
document.querySelectorAll('.rev').forEach(el=>revObs.observe(el));

window.addEventListener('scroll', ()=>{
  const hi = document.querySelector('.hero-inner');
  if (hi) hi.style.transform = `translateY(${window.pageYOffset*.11}px)`;
});

window.addEventListener('load', ()=>{
  loadImages();
  if (document.getElementById('c')) { initParticles('c'); loadContent(); loadPortfolio(); }
});
