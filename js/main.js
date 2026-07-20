/* ==========================================================================
   LYVORA — Core UI Behaviour
   ========================================================================== */

(function(){
  'use strict';

  /* ---------------- Loading screen (very first paint) ---------------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    const ls = document.getElementById('loading-screen');
    if(ls){ setTimeout(()=>ls.classList.add('hide'), 150); }
  });

  /* ---------------- Luxury Splash (first visit per session) ---------------- */
  function initSplash(){
    const splash = document.getElementById('splash');
    if(!splash) return;
    const seen = sessionStorage.getItem('lyvora_splash_seen');
    if(seen){ splash.remove(); return; }

    // sparkles
    const wrap = splash.querySelector('.splash-inner');
    for(let i=0;i<10;i++){
      const s = document.createElement('span');
      s.className = 'sparkle';
      const angle = Math.random()*Math.PI*2;
      const dist = 60 + Math.random()*90;
      s.style.setProperty('--sx', Math.cos(angle)*dist+'px');
      s.style.setProperty('--sy', Math.sin(angle)*dist+'px');
      s.style.left = (48 + Math.random()*10)+'%';
      s.style.top = (46 + Math.random()*12)+'%';
      s.style.animationDelay = (1.4 + Math.random()*0.6)+'s';
      wrap.appendChild(s);
    }

    const total = 2200;
    setTimeout(()=>{
      splash.classList.add('splash-out');
      sessionStorage.setItem('lyvora_splash_seen','1');
      setTimeout(()=>{
        splash.remove();
        document.body.classList.add('splash-done');
        triggerStagger();
      }, 700);
    }, total);
  }

  function triggerStagger(){
    document.querySelectorAll('.hero-content, .stagger').forEach(el=>{
      el.classList.add('in-view');
    });
  }

  /* ---------------- Navbar scroll state ---------------- */
  function initNavbar(){
    const nav = document.querySelector('.navbar');
    if(!nav) return;
    const onScroll = ()=>{
      if(window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ---------------- Mobile hamburger menu ---------------- */
  function initMobileNav(){
    const btn = document.querySelector('.hamburger');
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.getElementById('nav-overlay');
    if(!btn || !menu) return;
    const close = ()=>{ btn.classList.remove('active'); menu.classList.remove('show'); overlay?.classList.remove('show'); document.body.style.overflow=''; };
    const open = ()=>{ btn.classList.add('active'); menu.classList.add('show'); overlay?.classList.add('show'); document.body.style.overflow='hidden'; };
    btn.addEventListener('click', ()=> btn.classList.contains('active') ? close() : open());
    overlay?.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', close));
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal(){
    const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .stagger');
    if(!targets.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold:.15 });
    targets.forEach(t=>io.observe(t));
  }

  /* ---------------- Counter animation ---------------- */
  function initCounters(){
    const counters = document.querySelectorAll('.counter-item .num[data-count]');
    if(!counters.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1400; const start = performance.now();
        function tick(now){
          const p = Math.min(1,(now-start)/dur);
          const eased = 1 - Math.pow(1-p,3);
          el.textContent = (target*eased).toFixed(target % 1 !== 0 ? 1 : 0) + suffix;
          if(p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, {threshold:.4});
    counters.forEach(c=>io.observe(c));
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop(){
    const btn = document.getElementById('back-to-top');
    if(!btn) return;
    window.addEventListener('scroll', ()=>{
      if(window.scrollY > 500) btn.classList.add('show'); else btn.classList.remove('show');
    }, {passive:true});
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  /* ---------------- Ripple effect ---------------- */
  function initRipple(){
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('.btn, .qa-btn');
      if(!btn) return;
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      r.className='ripple';
      r.style.width = r.style.height = size+'px';
      r.style.left = (e.clientX - rect.left - size/2)+'px';
      r.style.top = (e.clientY - rect.top - size/2)+'px';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      setTimeout(()=>r.remove(), 650);
    });
  }

  /* ---------------- Toast notifications ---------------- */
  window.lyToast = function(message, type='default'){
    let container = document.getElementById('toast-container');
    if(!container){
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = {
      success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6 9 17l-5-5"/></svg>',
      error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      default:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2 3 7l9 5 9-5-9-5Z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>'
    };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `${icons[type]||icons.default}<span>${message}</span>`;
    container.appendChild(t);
    setTimeout(()=>{
      t.classList.add('hide');
      setTimeout(()=>t.remove(), 420);
    }, 2600);
  };

  /* ---------------- Newsletter ---------------- */
  function initNewsletter(){
    const forms = document.querySelectorAll('.newsletter-form');
    if(!forms.length) return;
    forms.forEach(form=>{
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const input = form.querySelector('input');
        if(input.value && input.checkValidity()){
          lyToast('Welcome to the inner circle — check your inbox soon.', 'success');
          form.reset();
        } else {
          lyToast('Please enter a valid email address.', 'error');
        }
      });
    });
  }

  /* ---------------- Lazy load images ---------------- */
  function initLazyLoad(){
    const imgs = document.querySelectorAll('img[data-src]');
    if(!imgs.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const img = e.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          io.unobserve(img);
        }
      });
    }, {rootMargin:'150px'});
    imgs.forEach(i=>io.observe(i));
  }

  /* ---------------- Simple EN/AR language switch ---------------- */
  function initLangSwitch(){
    const btns = document.querySelectorAll('.lang-switch');
    if(!btns.length) return;
    const saved = localStorage.getItem('lyvora_lang') || 'en';
    applyLang(saved);
    btns.forEach(b=> b.addEventListener('click', ()=>{
      const current = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const next = current === 'en' ? 'ar' : 'en';
      applyLang(next);
      localStorage.setItem('lyvora_lang', next);
    }));
  }
  function applyLang(lang){
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(el=>{
      el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll('.lang-switch .lang-text').forEach(el=>{
      el.textContent = lang === 'ar' ? 'EN' : 'AR';
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    initSplash();
    initNavbar();
    initMobileNav();
    initReveal();
    initCounters();
    initBackToTop();
    initRipple();
    initNewsletter();
    initLazyLoad();
    initLangSwitch();
    if(!document.getElementById('splash')) triggerStagger();
  });

})();
