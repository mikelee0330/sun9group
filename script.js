/* Sun9 Group — script.js (全站共用) */

const SB_URL  = 'https://sdjqekzcqmohxslvzsgi.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkanFla3pjcW1vaHhzbHZ6c2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU5NDksImV4cCI6MjA4OTQ5MTk0OX0.3yxKXgqgazMo2g4DPKdSynSbYkFNnJ3C6hasaEMiq48';
const IMG_CDN = `${SB_URL}/storage/v1/object/public/images`;
const sb      = supabase.createClient(SB_URL, SB_KEY);

/* 圖片 CDN 路徑 */
const IMGS = {
  edinburgh: `${IMG_CDN}/founder-edinburgh.jpg`,
  workshop:  `${IMG_CDN}/founder-workshop.jpg`,
};

/* 平滑滾動 */
function smoothTo(id, e) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* 語系切換 */
let enInit = false;
function setLang(lang) {
  const isEN = lang === 'en';
  const zhPage = document.getElementById('zh-page');
  const enPage = document.getElementById('en-page');
  const zhNav  = document.getElementById('zh-nav');
  const enNav  = document.getElementById('en-nav');
  const btnZH  = document.getElementById('btn-zh');
  const btnEN  = document.getElementById('btn-en');

  if (zhPage) zhPage.style.display = isEN ? 'none' : 'block';
  if (enPage) enPage.style.display = isEN ? 'block' : 'none';
  if (zhNav)  zhNav.style.cssText  = isEN ? 'display:none!important' : '';
  if (enNav)  enNav.style.cssText  = isEN ? '' : 'display:none!important';

  if (btnZH) {
    btnZH.className = !isEN
      ? 'font-cinzel text-xs tracking-wider px-4 py-2 cursor-pointer transition-all bg-gold text-bk border-none'
      : 'font-cinzel text-xs tracking-wider px-4 py-2 cursor-pointer transition-all bg-transparent text-white/30 border-none';
  }
  if (btnEN) {
    btnEN.className = isEN
      ? 'font-cinzel text-xs tracking-wider px-4 py-2 cursor-pointer transition-all bg-gold text-bk border-none'
      : 'font-cinzel text-xs tracking-wider px-4 py-2 cursor-pointer transition-all bg-transparent text-white/30 border-none';
  }
  if (isEN && !enInit) { initParticles('en-c'); enInit = true; }
  window.scrollTo(0, 0);
}

/* 載入文字內容 */
async function loadContent() {
  try {
    const { data } = await sb.from('content').select('key,value');
    if (!data) return;
    const map = {};
    data.forEach(r => map[r.key] = r.value);
    function set(id, key) {
      const el = document.getElementById(id);
      if (el && map[key] !== undefined) el.innerHTML = map[key].replace(/\n/g, '<br>');
    }
    set('txt-hero-title',    'hero_title_2');
    set('txt-hero-sub',      'hero_subtitle');
    set('txt-pos-main',      'positioning_main');
    set('txt-pos-sub',       'positioning_sub');
    set('txt-founder-name',  'founder_name');
    set('txt-founder-title', 'founder_title');
    set('txt-founder-bio',   'founder_bio');
    set('txt-founder-quote', 'founder_quote');
    set('txt-p1-num','proof_1_num'); set('txt-p1-lab','proof_1_label');
    set('txt-p2-num','proof_2_num'); set('txt-p2-lab','proof_2_label');
    set('txt-p3-num','proof_3_num'); set('txt-p3-lab','proof_3_label');
  } catch(e) { console.log('Content load skipped'); }
}

/* 載入 Portfolio */
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

/* 圖片替換為 CDN URL */
function loadImages() {
  document.querySelectorAll('[data-img]').forEach(el => {
    const key = el.getAttribute('data-img');
    if (IMGS[key]) el.src = IMGS[key];
  });
}

/* 粒子特效 */
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

/* Scroll Reveal */
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('on');revObs.unobserve(e.target);} });
}, {threshold:.07});
document.querySelectorAll('.rev').forEach(el=>revObs.observe(el));

/* Parallax */
window.addEventListener('scroll', ()=>{
  const hi = document.querySelector('.hero-inner');
  if (hi && !document.body.classList.contains('lang-en'))
    hi.style.transform = `translateY(${window.pageYOffset*.11}px)`;
});

/* 初始化 */
window.addEventListener('load', ()=>{
  loadImages();
  if (document.getElementById('c')) { initParticles('c'); loadContent(); loadPortfolio(); }
});
