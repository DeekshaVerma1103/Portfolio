(function(){
'use strict';

const getTheme=()=>localStorage.getItem('theme')||'dark';
const setTheme=(t)=>{document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);updateThemeUI(t);};
const updateThemeUI=(t)=>{const icon=document.querySelector('.theme-icon');if(icon)icon.textContent=t==='dark'?'🌙':'☀️';};

document.addEventListener('DOMContentLoaded',()=>{
  const saved=getTheme();
  document.documentElement.setAttribute('data-theme',saved);
  updateThemeUI(saved);

  const toggle=document.querySelector('.theme-toggle');
  if(toggle)toggle.addEventListener('click',()=>setTheme(getTheme()==='dark'?'light':'dark'));

  const nav=document.querySelector('nav');
  const onScroll=()=>{if(nav)nav.classList.toggle('scrolled',window.scrollY>20);};
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  const currentPage=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-center a,.mobile-menu a').forEach(link=>{
    const href=link.getAttribute('href');
    if(href===currentPage||(currentPage===''&&href==='index.html'))link.classList.add('active');
  });

  const hamburger=document.querySelector('.hamburger');
  const mobileMenu=document.querySelector('.mobile-menu');
  if(hamburger&&mobileMenu){
    hamburger.addEventListener('click',()=>{hamburger.classList.toggle('open');mobileMenu.classList.toggle('open');});
    mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{hamburger.classList.remove('open');mobileMenu.classList.remove('open');}));
  }

  const overlay=document.querySelector('.page-transition');
  if(overlay){
    overlay.classList.remove('active');
    document.querySelectorAll('a[href]').forEach(link=>{
      const href=link.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('mailto')||href.startsWith('http')||link.target==='_blank')return;
      link.addEventListener('click',e=>{
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(()=>{window.location.href=href;},460);
      });
    });
  }

  const revealEls=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  if(revealEls.length){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry,i)=>{
        if(entry.isIntersecting){setTimeout(()=>entry.target.classList.add('visible'),i*90);observer.unobserve(entry.target);}
      });
    },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(el=>observer.observe(el));
  }

  const counters=document.querySelectorAll('.counter');
  if(counters.length){
    const countObs=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{if(entry.isIntersecting){animateCounter(entry.target);countObs.unobserve(entry.target);}});
    },{threshold:0.5});
    counters.forEach(c=>countObs.observe(c));
  }

  initParticles();

  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const rect=el.getBoundingClientRect();
      const x=(e.clientX-rect.left-rect.width/2)*0.3;
      const y=(e.clientY-rect.top-rect.height/2)*0.3;
      el.style.transform=`translate(${x}px,${y}px)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });

  const typeTarget=document.getElementById('typewriter');
  if(typeTarget){
    const phrases=['Information Technology Student','Python Learner','ML Enthusiast','Web Developer','Problem Solver'];
    let pi=0,ci=0,deleting=false;
    const speed={type:80,delete:40,pause:1800};
    function type(){
      const phrase=phrases[pi];
      if(!deleting){typeTarget.textContent=phrase.slice(0,++ci);if(ci===phrase.length){deleting=true;setTimeout(type,speed.pause);return;}}
      else{typeTarget.textContent=phrase.slice(0,--ci);if(ci===0){deleting=false;pi=(pi+1)%phrases.length;}}
      setTimeout(type,deleting?speed.delete:speed.type);
    }
    type();
  }

});

function initParticles(){
  const canvas=document.getElementById('particles-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  const PARTICLE_COUNT=55;
  const resize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;};
  window.addEventListener('resize',resize);
  resize();
  class Particle{
    constructor(){this.reset(true);}
    palette(){
      const light=document.documentElement.getAttribute('data-theme')==='light';
      return light?['22,126,163','93,104,179','45,138,91']:['0,212,255','139,156,244'];
    }
    reset(initial=false){
      this.x=Math.random()*W;this.y=initial?Math.random()*H:H+10;
      this.size=Math.random()*1.5+0.5;this.speedY=-(Math.random()*0.4+0.1);
      this.speedX=(Math.random()-0.5)*0.2;this.opacity=Math.random()*0.5+0.16;
      this.pulse=Math.random()*Math.PI*2;this.pulseSpeed=Math.random()*0.02+0.005;
      const colors=this.palette();
      this.color=colors[Math.floor(Math.random()*colors.length)];
    }
    update(){
      this.x+=this.speedX;this.y+=this.speedY;this.pulse+=this.pulseSpeed;
      if(this.y<-10||this.x<-10||this.x>W+10)this.reset();
      return this.opacity*(0.7+0.3*Math.sin(this.pulse));
    }
    draw(op){ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fillStyle=`rgba(${this.color},${op})`;ctx.fill();}
  }
  for(let i=0;i<PARTICLE_COUNT;i++)particles.push(new Particle());
  function drawLines(){
    const maxDist=120;
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<maxDist){
          ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);
          const light=document.documentElement.getAttribute('data-theme')==='light';
          ctx.strokeStyle=`rgba(${light?'22,126,163':'0,212,255'},${(1-dist/maxDist)*(light?0.16:0.1)})`;ctx.lineWidth=0.5;ctx.stroke();
        }
      }
    }
  }
  const animate=()=>{ctx.clearRect(0,0,W,H);drawLines();particles.forEach(p=>{const op=p.update();p.draw(op);});requestAnimationFrame(animate);};
  animate();
}

function animateCounter(el){
  const target=parseInt(el.dataset.target,10);
  const suffix=el.dataset.suffix||'';
  const duration=1800;const start=performance.now();
  const update=(now)=>{
    const elapsed=now-start;const progress=Math.min(elapsed/duration,1);
    const eased=1-Math.pow(1-progress,3);
    el.textContent=Math.round(eased*target)+suffix;
    if(progress<1)requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function spawnConfetti(){
  const colors=['#00D4FF','#8B9CF4','#52D080','#FFD166','#EF476F'];
  for(let i=0;i<60;i++){
    const el=document.createElement('div');const size=Math.random()*8+4;
    el.style.cssText=`position:fixed;top:-10px;left:${Math.random()*100}vw;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};z-index:9998;pointer-events:none;opacity:1;animation:confettiFall ${Math.random()*2+1.5}s ease-out forwards;animation-delay:${Math.random()*0.5}s;`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),4000);
  }
  if(!document.getElementById('confetti-style')){const s=document.createElement('style');s.id='confetti-style';s.textContent='@keyframes confettiFall{to{transform:translateY(105vh) rotate(720deg);opacity:0;}}';document.head.appendChild(s);}
}

window.animateCounter=animateCounter;
})();
