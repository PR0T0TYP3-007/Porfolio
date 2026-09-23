(()=>{
"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const root=document.documentElement;

/* ---------- generated artwork (swap for your own photos) ---------- */
const PAL={
  blue:['#030b1a','#0f3a6e','#7cc4ff','#020712','#e3f4ff'],
  indigo:['#050a1c','#1b2a6b','#7b93ff','#02040f','#d6dcff'],
  teal:['#03121a','#0a4a5c','#4fd1d1','#020a0f','#d6fffb'],
  mist:['#a9bdd3','#d3deea','#f0f4f9','#2c4560','#ffffff']
};
const rng=s=>()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
const hex=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('')};
function ridge(r,w,h,base,amp,steps,ph){
  let d=`M0 ${h}L0 ${base}`;
  for(let i=1;i<=steps;i++){
    const x=w*i/steps;
    const y=base-amp*(.3+.7*Math.abs(Math.sin(i*.83+ph)))*(.55+r()*.45);
    d+=`L${x.toFixed(0)} ${y.toFixed(0)}`;
  }
  return d+`L${w} ${h}Z`;
}
function scene(seed,p){
  const w=1600,h=1000,r=rng(seed),L=5;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".55" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient><radialGradient id="s"><stop offset="0" stop-color="${p[4]}" stop-opacity=".9"/><stop offset="1" stop-color="${p[4]}" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>`;
  const sx=w*(.25+r()*.5), sy=h*(.3+r()*.12);
  s+=`<circle cx="${sx}" cy="${sy}" r="${w*.24}" fill="url(#s)"/><circle cx="${sx}" cy="${sy}" r="64" fill="${p[4]}"/>`;
  for(let l=0;l<L;l++){
    const t=l/(L-1);
    s+=`<path d="${ridge(r,w,h,h*(.52+t*.3),100+(1-t)*150,13+l*3,r()*6)}" fill="${mix(p[2],p[3],.28+t*.72)}" opacity="${(.6+t*.4).toFixed(2)}"/>`;
  }
  return s+'</svg>';
}
const uri=svg=>`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
$$('[data-seed]').forEach(el=>{el.style.backgroundImage=uri(scene(+el.dataset.seed,PAL[el.dataset.pal]))});

function mtnSvg(seed,color,base,amp,steps){
  const r=rng(seed),w=1600,h=700;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${ridge(r,w,h,base,amp,steps,seed)}" fill="${color}"/></svg>`;
}
$('#mBack').innerHTML=mtnSvg(4,'#2a4677',330,300,16);
$('#mMid').innerHTML=mtnSvg(9,'#1a3055',440,300,19);
$('#mFront').innerHTML=mtnSvg(15,'#0D1B2E',560,280,22);

/* dashboard bars */

/* ---------- smooth scroll ---------- */
const maxScroll=()=>root.scrollHeight-innerHeight;
let cur=scrollY,tgt=scrollY,smooth=fine&&!reduced;
if(smooth){
  addEventListener('wheel',e=>{
    if(e.ctrlKey||root.classList.contains('lock'))return;
    e.preventDefault();
    tgt=clamp(tgt+e.deltaY*(e.deltaMode===1?32:1),0,maxScroll());
  },{passive:false});
  addEventListener('scroll',()=>{if(Math.abs(scrollY-cur)>4){cur=tgt=scrollY}},{passive:true});
}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href');
  if(id==='#')return e.preventDefault();
  const el=id==='#top'?document.body:$(id);
  if(!el)return;
  e.preventDefault();
  const y=id==='#top'?0:el.getBoundingClientRect().top+scrollY;
  if(smooth)tgt=clamp(y,0,maxScroll()); else scrollTo({top:y,behavior:reduced?'auto':'smooth'});
}));
$('#toTop').addEventListener('click',()=>{smooth?tgt=0:scrollTo({top:0,behavior:'smooth'})});
/* ---------- rubber buttons ---------- */
const btns=$$('.btn').map(el=>{
  const label=document.createElement('span');label.className='lbl';
  while(el.firstChild)label.appendChild(el.firstChild);
  const fill=document.createElement('span');fill.className='fill';
  el.append(fill,label);
  return {el,fill,label,x:0,y:0,vx:0,vy:0,tx:0,ty:0,inside:false,w:1,h:1};
});
let px=-999,py=-999;
addEventListener('pointermove',e=>{
  px=e.clientX;py=e.clientY;
  if(e.pointerType==='touch')return;
  btns.forEach(b=>{
    const r=b.el.getBoundingClientRect(),pad=44;
    b.w=r.width;b.h=r.height;
    const near=px>r.left-pad&&px<r.right+pad&&py>r.top-pad&&py<r.bottom+pad;
    const inside=px>=r.left&&px<=r.right&&py>=r.top&&py<=r.bottom;
    if(near){b.tx=(px-(r.left+r.width/2))*.32;b.ty=(py-(r.top+r.height/2))*.42}else{b.tx=0;b.ty=0}
    if(inside!==b.inside){
      b.inside=inside;
      const d=Math.hypot(r.width,r.height)*2.05;
      b.fill.style.setProperty('--d',d+'px');
      b.fill.style.left=(px-r.left)+'px';b.fill.style.top=(py-r.top)+'px';
      b.el.classList.toggle('on',inside);
    }
  });
},{passive:true});
function springBtns(){
  btns.forEach(b=>{
    const k=.13,d=.76;
    b.vx=(b.vx+(b.tx-b.x)*k)*d;b.vy=(b.vy+(b.ty-b.y)*k)*d;
    b.x+=b.vx;b.y+=b.vy;
    if(Math.abs(b.x)<.01&&Math.abs(b.y)<.01&&!b.tx&&!b.ty){if(b.el.style.transform)b.el.style.transform='';return}
    const sx=1+Math.abs(b.x)/b.w*.9-Math.abs(b.y)/b.h*.12+Math.abs(b.vx)*.004;
    const sy=1+Math.abs(b.y)/b.h*.8-Math.abs(b.x)/b.w*.1+Math.abs(b.vy)*.004;
    b.el.style.transform=`translate3d(${b.x}px,${b.y}px,0) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
    b.label.style.transform=`translate3d(${b.x*.35}px,${b.y*.35}px,0)`;
  });
}

/* ---------- reveal words ---------- */
$$('.reveal-words').forEach(p=>{
  const words=[];
  (function walk(n){[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){
      const f=document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(t=>{
        if(!t)return;
        if(!t.trim()){f.append(t);return}
        const s=document.createElement('span');s.className='w';s.textContent=t;f.append(s);words.push(s);
      });
      c.replaceWith(f);
    }else if(c.nodeType===1)walk(c);
  })})(p);
  p._w=words;p._m=$$('mark',p).map(m=>({m,w:$$('.w',m)}));
});

/* ---------- observers ---------- */
/* reveal-on-scroll is checked every frame (below, in frame()) rather than via
   IntersectionObserver: on this page scroll is driven by repeated scrollTo()
   calls from a rAF loop, which can suppress IntersectionObserver callbacks
   in some browsers and leave elements permanently unrevealed. */
const revealEls=$$('[data-io]');
if(reduced)revealEls.forEach(el=>el.classList.add('in'));
function checkReveal(){
  for(let i=revealEls.length-1;i>=0;i--){
    const r=revealEls[i].getBoundingClientRect();
    if(r.top<innerHeight*.85&&r.bottom>0){
      revealEls[i].classList.add('in');
      revealEls.splice(i,1);
    }
  }
}
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const to=+e.target.dataset.count,t0=performance.now(),dur=1600;
  (function step(t){const k=clamp((t-t0)/dur);e.target.textContent=Math.round(to*(1-Math.pow(1-k,4)))+(e.target.hasAttribute('data-plus')?'+':'');if(k<1)requestAnimationFrame(step)})(t0);
}),{threshold:.6});
$$('[data-count]').forEach(c=>{if(reduced)c.textContent=c.dataset.count+(c.hasAttribute('data-plus')?'+':'');else cio.observe(c)});

/* ---------- hero slideshow: slow zoom in, switch, zoom out ---------- */
const slides=$$('.slide'),bars=$$('#slideMeta i'),names=['Blue hour','Indigo dusk','Deep teal'];
let si=-1;
function showSlide(n){
  si=n;
  slides.forEach((s,i)=>{
    if(i===n){
      const zin=n%2===0;
      s.style.transition='none';s.style.transform=`scale(${zin?1:1.16})`;
      void s.offsetWidth;
      s.style.transition='opacity 1.8s ease, transform 9s linear';
      s.style.transform=`scale(${zin?1.16:1})`;
      s.classList.add('on');
    }else s.classList.remove('on');
  });
  bars.forEach((b,i)=>{b.classList.remove('on');if(i===n){void b.offsetWidth;b.classList.add('on')}});
  $('#slideName').textContent=names[n];
}
showSlide(0);
if(!reduced)setInterval(()=>showSlide((si+1)%slides.length),6500);

/* ---------- wheel ---------- */
const wItems=$$('#wheel .wi'),wDesc=[
  'Full-stack applications on React, Next.js, Tailwind CSS, Node and NestJS, built with clean architecture, tests and performance in mind.',
  'SQL, Python and BI tools to clean messy data, find the signal and turn it into clear answers your team can act on.',
  'REST APIs in NestJS, Express or FastAPI, with validation, clear documentation and tests, so your web app, mobile app and partners can rely on them.',
  'Scheduled jobs that pull data from your apps, spreadsheets and third-party tools into one clean, trustworthy source.',
  'CI/CD pipelines, containers and cloud setups that deploy reliably and are easy to roll back from the first commit.',
  'Live dashboards and automated reports that put the right numbers in front of the right people, without the spreadsheet wrangling.'
];
const wtext=$('#wtext'),wn=$('#wn');let wActive=-1;
function setWheel(i){
  if(i===wActive)return;wActive=i;
  wtext.classList.add('swap');
  setTimeout(()=>{wtext.textContent=wDesc[i];wtext.classList.remove('swap')},reduced?0:260);
  wn.textContent=i+1;
}
setWheel(0);wtext.textContent=wDesc[0];

/* ---------- FAQ ---------- */
$$('.faq-item .q').forEach(q=>q.addEventListener('click',()=>{
  const it=q.parentElement,open=!it.classList.contains('open');
  $$('.faq-item').forEach(o=>{o.classList.remove('open');$('.q',o).setAttribute('aria-expanded','false')});
  if(open){it.classList.add('open');q.setAttribute('aria-expanded','true')}
}));

/* ---------- clock ---------- */
function clock(){try{$('#clock').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Lagos'}).format(new Date())+' local time'}catch(e){}}
clock();setInterval(clock,30000);

/* ---------- main loop ---------- */
const nav=$('#nav'),heroIn=$('#heroIn'),cards=$$('.card'),par=$$('[data-speed]'),stage=$('#stage');
const statements=$$('.reveal-words'),mFront=$('#mFront'),mMid=$('#mMid'),mBack=$('#mBack'),services=$('#services'),giant=$('#giant');
cards.forEach((c,i)=>c.style.setProperty('--i',i));
let prevY=cur;

function frame(){
  if(smooth){
    const prevCur=cur;
    cur=lerp(cur,tgt,.085);
    if(Math.abs(tgt-cur)<.3)cur=tgt;
    if(cur!==prevCur)scrollTo(0,cur);
  }else cur=scrollY;
  if(revealEls.length)checkReveal();
  const y=scrollY,vh=innerHeight,vel=y-prevY;prevY=y;

  const p=clamp((y-30)/(vh*.55));
  nav.style.setProperty('--p',p.toFixed(3));
  nav.style.setProperty('--sp',clamp(y/Math.max(1,maxScroll())).toFixed(4));

  if(y<vh*1.2){const k=clamp(y/vh);heroIn.style.transform=`translate3d(0,${y*.25}px,0)`;heroIn.style.opacity=(1-k*1.1).toFixed(3)}

  statements.forEach(s=>{
    const r=s.getBoundingClientRect();
    const prog=clamp((vh*.85-r.top)/(r.height+vh*.85-vh*.4));
    const n=s._w.length;
    s._w.forEach((w,i)=>{w._o=clamp(prog*(n+4)-i);w.style.opacity=(.16+.84*w._o).toFixed(3)});
    s._m.forEach(o=>{o.m.style.setProperty('--m',(o.w.reduce((a,w)=>a+w._o,0)/o.w.length).toFixed(3))});
  });

  par.forEach(el=>{
    const r=el.parentElement.getBoundingClientRect();
    if(r.bottom<-200||r.top>vh+200)return;
    el.style.transform=`translate3d(0,${((r.top+r.height/2)-vh/2)*parseFloat(el.dataset.speed)}px,0)`;
  });


  const sr=stage.getBoundingClientRect();
  const t=clamp((vh-sr.top)/(vh+sr.height*.55));
  const e=t*t*(3-2*t);
  mBack.style.transform=`translate3d(0,${lerp(52,14,e)}%,0)`;
  mMid.style.transform=`translate3d(0,${lerp(70,14,e)}%,0)`;
  mFront.style.transform=`translate3d(0,${lerp(92,10,e)}%,0)`;

  cards.forEach((c,i)=>{
    const nx=cards[i+1];if(!nx||innerWidth<=860)return;
    const q=clamp((vh-nx.getBoundingClientRect().top)/(vh*.85));
    c.style.transform=`scale(${(1-q*.06).toFixed(4)})`;
    $('.dim',c).style.opacity=(q*.55).toFixed(3);
  });

  const sr2=services.getBoundingClientRect();
  const wp=clamp(-sr2.top/(sr2.height-vh));
  const n=wItems.length,step=innerWidth<700?26:24;
  const small=innerWidth<700;
  const R=small?innerWidth*.72:innerWidth*.58,cx0=small?-innerWidth*.4:-innerWidth*.2;
  let best=0,bd=1e9;
  wItems.forEach((it,i)=>{
    const a=i*step-wp*(n-1)*step;
    const ad=Math.abs(a);if(ad<bd){bd=ad;best=i}
    const o=clamp(1-ad/(step*2.6));
    it.style.left=cx0+'px';
    it.style.transform=`translateY(-50%) rotate(${a}deg) translateX(${R}px) rotate(${-a}deg)`;
    it.style.opacity=(.16+.84*o*o).toFixed(3);
  });
  setWheel(best);

  const gr=giant.getBoundingClientRect();
  giant.style.transform=`translate3d(${clamp((vh-gr.top)/vh)*-4+2}%,0,0)`;

  springBtns();
  requestAnimationFrame(frame);
}

/* ---------- intro sequence ---------- */
function start(){
  root.classList.remove('lock');
  document.body.classList.add('ready');
  $('#loader').classList.add('done');
}
if(reduced){document.body.classList.add('ready');$('#loader').style.display='none'}
else{
  root.classList.add('lock');
  const ln=$('#ldn'),t0=performance.now(),dur=1500;
  (function step(t){
    const k=clamp((t-t0)/dur);ln.textContent=Math.round(100*(1-Math.pow(1-k,3)));
    if(k<1)requestAnimationFrame(step);else setTimeout(start,250);
  })(t0);
}
requestAnimationFrame(frame);
})();
