(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const finePointer = matchMedia('(pointer: fine)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loader = $('#loader');
  const progress = $('#scrollProgress');
  const header = $('#siteHeader');
  const processLine = $('#processLine');
  const processWrap = $('.process-wrap');
  const hero = $('#hero');
  const orbA = $('.orb-a');
  const orbB = $('.orb-b');

  // Cinematic loader: build the Vértice mark, lock it, then release the page.
  let loaderHidden = false;
  let loaderExiting = false;
  const loaderPercent = $('#loaderPercent');
  const loaderStartedAt = performance.now();
  const loaderMinimum = reducedMotion ? 120 : 1480;
  let assetsReady = document.readyState === 'complete';
  let percentFrame = 0;

  const updateLoaderPercent = () => {
    if (!loader || loaderHidden) return;
    const elapsed = performance.now() - loaderStartedAt;
    const cap = assetsReady ? 100 : 92;
    const visualTarget = Math.min(cap, Math.round((elapsed / loaderMinimum) * 100));
    if (loaderPercent) loaderPercent.textContent = `${Math.max(0, visualTarget)}%`;
    if (!loaderExiting) percentFrame = requestAnimationFrame(updateLoaderPercent);
  };
  percentFrame = requestAnimationFrame(updateLoaderPercent);

  const finishLoader = () => {
    if (!loader || loaderHidden) return;
    loaderHidden = true;
    cancelAnimationFrame(percentFrame);
    loader.classList.add('hidden');
    document.body.classList.remove('loader-active');
    document.body.classList.add('page-ready');
  };

  const beginLoaderExit = () => {
    if (!loader || loaderExiting || loaderHidden) return;
    loaderExiting = true;
    assetsReady = true;
    if (loaderPercent) loaderPercent.textContent = '100%';
    loader.classList.add('is-exiting');
    setTimeout(finishLoader, reducedMotion ? 80 : 930);
  };

  const scheduleLoaderExit = () => {
    assetsReady = true;
    const elapsed = performance.now() - loaderStartedAt;
    const remaining = Math.max(0, loaderMinimum - elapsed);
    setTimeout(beginLoaderExit, remaining);
  };

  if (assetsReady) scheduleLoaderExit();
  else addEventListener('load', scheduleLoaderExit, { once: true });
  // Absolute safety valve: a failed remote request must never trap navigation.
  setTimeout(beginLoaderExit, reducedMotion ? 500 : 3600);

  // One animation-frame loop for all scroll-driven UI.
  let scrollTicking = false;
  const updateOnScroll = () => {
    const y = scrollY;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);

    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
    header?.classList.toggle('scrolled', y > 24);

    if (processWrap && processLine) {
      const rect = processWrap.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.72 - rect.top) / Math.max(1, rect.height * 0.82)));
      processLine.style.transform = `scaleY(${p})`;
    }

    if (!reducedMotion && y < innerHeight * 1.25) {
      if (orbA) orbA.style.translate = `0 ${y * 0.045}px`;
      if (orbB) orbB.style.translate = `0 ${-y * 0.025}px`;
    }

    scrollTicking = false;
  };
  const requestScrollUpdate = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateOnScroll);
    }
  };
  addEventListener('scroll', requestScrollUpdate, { passive: true });
  addEventListener('resize', requestScrollUpdate, { passive: true });
  requestScrollUpdate();

  // Custom cursor: desktop/fine-pointer only.
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (finePointer && !reducedMotion && dot && ring) {
    document.documentElement.classList.add('has-custom-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;
    let cursorRunning = true;

    addEventListener('pointermove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    }, { passive: true });

    const cursorLoop = () => {
      if (!cursorRunning) return;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    };
    requestAnimationFrame(cursorLoop);

    document.addEventListener('pointerover', (event) => {
      if (event.target.closest('a, button, .service-card, .gallery-track figure')) ring.classList.add('active');
    });
    document.addEventListener('pointerout', (event) => {
      if (event.target.closest('a, button, .service-card, .gallery-track figure')) ring.classList.remove('active');
    });
    document.addEventListener('mouseleave', () => ring.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => ring.classList.remove('cursor-hidden'));

    document.addEventListener('visibilitychange', () => {
      cursorRunning = !document.hidden;
      if (cursorRunning) requestAnimationFrame(cursorLoop);
    });
  }

  // Hero glow follows pointer with CSS-accelerated position variables.
  const heroGlow = $('#heroGlow');
  if (hero && heroGlow && finePointer && !reducedMotion) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      heroGlow.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      heroGlow.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
      heroGlow.classList.add('is-active');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => heroGlow.classList.remove('is-active'));
  }

  // Mobile menu with complete state cleanup.
  const menuBtn = $('#menuToggle');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('open', open);
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
  $$('#mobileMenu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  addEventListener('resize', () => {
    if (innerWidth > 980) setMenu(false);
  }, { passive: true });

  // Reveal-on-scroll.
  const revealItems = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((element) => element.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach((element) => revealObserver.observe(element));
  }

  // Active desktop navigation item.
  const navLinks = $$('.desktop-nav a');
  const navById = new Map(navLinks.map((link) => [link.getAttribute('href')?.slice(1), link]));
  const navSections = [...navById.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.remove('active'));
      navById.get(visible.target.id)?.classList.add('active');
    }, { rootMargin: '-30% 0px -58% 0px', threshold: [0, 0.15, 0.4] });
    navSections.forEach((section) => navObserver.observe(section));
  }

  // Magnetic buttons use variables instead of replacing transforms.
  if (finePointer && !reducedMotion) {
    $$('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.setProperty('--mag-x', `${x * 0.08}px`);
        element.style.setProperty('--mag-y', `${y * 0.11}px`);
      }, { passive: true });
      element.addEventListener('pointerleave', () => {
        element.style.setProperty('--mag-x', '0px');
        element.style.setProperty('--mag-y', '0px');
      });
    });
  }

  // Spotlight cards.
  if (finePointer && !reducedMotion) {
    $$('.spotlight').forEach((card) => card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, { passive: true }));
  }

  // Subtle tilt without clobbering reveal transforms.
  if (finePointer && !reducedMotion) {
    $$('[data-tilt]').forEach((element) => {
      const amount = Number(element.dataset.tilt) || 4;
      const target = element.classList.contains('hero-visual') ? $('.browser-shell', element) : element;
      if (!target) return;
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty('--tilt-x', `${-y * amount}deg`);
        target.style.setProperty('--tilt-y', `${x * amount}deg`);
      }, { passive: true });
      element.addEventListener('pointerleave', () => {
        target.style.setProperty('--tilt-x', '0deg');
        target.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Counters.
  const counters = $$('[data-counter]');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.counter) || 0;
        const duration = 900;
        const start = performance.now();
        const tick = (time) => {
          const progress = Math.min(1, (time - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(element);
      });
    }, { threshold: 0.55 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => { counter.textContent = counter.dataset.counter; });
  }

  // Native, snap-based gallery: smoother on touch and avoids blank-end bugs.
  const track = $('#galleryTrack');
  const slides = track ? $$('figure', track) : [];
  const prev = $('#galleryPrev');
  const next = $('#galleryNext');
  const indexEl = $('#galleryIndex');
  let galleryIndex = 0;
  let galleryScrollTick = false;

  const slideScrollLeft = (slide) => {
    if (!track || !slide) return 0;
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    return track.scrollLeft + slideRect.left - trackRect.left;
  };
  const nearestSlideIndex = () => {
    if (!track || !slides.length) return 0;
    let nearest = 0;
    let distance = Infinity;
    slides.forEach((slide, index) => {
      const d = Math.abs(slideScrollLeft(slide) - track.scrollLeft);
      if (d < distance) { distance = d; nearest = index; }
    });
    return nearest;
  };
  const setGalleryIndex = (index) => {
    galleryIndex = Math.max(0, Math.min(slides.length - 1, index));
    if (indexEl) indexEl.textContent = String(galleryIndex + 1).padStart(2, '0');
    prev?.toggleAttribute('disabled', galleryIndex === 0);
    next?.toggleAttribute('disabled', galleryIndex === slides.length - 1);
  };
  const goToSlide = (index, behavior = 'smooth') => {
    if (!track || !slides.length) return;
    const safe = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: slideScrollLeft(slides[safe]), behavior: reducedMotion ? 'auto' : behavior });
    setGalleryIndex(safe);
  };
  prev?.addEventListener('click', () => goToSlide(galleryIndex - 1));
  next?.addEventListener('click', () => goToSlide(galleryIndex + 1));
  track?.addEventListener('scroll', () => {
    if (galleryScrollTick) return;
    galleryScrollTick = true;
    requestAnimationFrame(() => {
      setGalleryIndex(nearestSlideIndex());
      galleryScrollTick = false;
    });
  }, { passive: true });

  // Pointer dragging for desktop gallery.
  if (track && finePointer && !reducedMotion) {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    track.addEventListener('pointerdown', (event) => {
      dragging = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('dragging');
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      track.scrollLeft = startScroll - (event.clientX - startX);
    });
    const finishDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      goToSlide(nearestSlideIndex());
    };
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
  }
  setGalleryIndex(0);


  // Vértice Lab: one real internal project at a time, lazy and responsive.
  const labData = {
    moda: { src:'projetos/ambar-rua/index.html', poster:'assets/previews/ambar-rua.webp', url:'verticeweb / âmbar-rua', title:'Âmbar Rua — editorial que vira vitrine.', reason:'Moda com ritmo editorial, coleção navegável e uma apresentação que valoriza cada peça sem perder o caminho até o contato.', benefits:['Lookbook','Catálogo','WhatsApp'], label:'Âmbar Rua' },
    burger: { src:'projetos/brasa91/index.html', poster:'assets/previews/brasa91.webp', url:'verticeweb / brasa-91', title:'BRASA 91 — desejo antes do primeiro clique.', reason:'Uma hamburgueria com presença dark, produtos em destaque e interação pensada para encurtar o caminho do cardápio até o pedido.', benefits:['Cardápio','Combo builder','Pedido'], label:'BRASA 91' },
    barbearia: { src:'projetos/cobalto/index.html', poster:'assets/previews/cobalto.webp', url:'verticeweb / cobalto', title:'Cobalto — atitude, método e agenda.', reason:'Uma barbearia urbana com linguagem editorial, processo visual e um fluxo de agendamento que mantém personalidade até o último CTA.', benefits:['Agenda','Equipe','Método'], label:'Cobalto' },
    pet: { src:'projetos/pingo-pet/index.html', poster:'assets/previews/pingo-pet.webp', url:'verticeweb / pingo-pet', title:'Pingo Pet — cuidado fácil de entender.', reason:'Serviços, rotina e confiança organizados em uma experiência leve, amigável e preparada para levar o tutor ao agendamento.', benefits:['Serviços','Planos','Agendamento'], label:'Pingo Pet' },
    auto: { src:'projetos/torque12/index.html', poster:'assets/previews/torque12.webp', url:'verticeweb / torque-12', title:'Torque 12 — oficina com presença técnica.', reason:'Visual industrial, diagnóstico guiado e orçamento estruturado para transformar uma oficina em uma marca mais confiável e memorável.', benefits:['Diagnóstico','Serviços','Orçamento'], label:'Torque 12' }
  };
  const labShell=$('#labShell');
  const labBrowser=$('#labBrowser');
  const labFrame=$('#labFrame');
  const labPoster=$('#labPoster');
  const labOptions=$$('.lab-option');
  let labCurrent='moda';
  let labLoadToken=0;

  const fitLabViewer=()=>{
    if(!labBrowser||!labFrame)return;
    const stage=$('.lab-live-stage',labBrowser); if(!stage)return;
    const mobile=labBrowser.dataset.view==='mobile';
    const viewportWidth=mobile?390:1440;
    const viewportHeight=mobile?844:1100;
    const aw=Math.max(120,stage.clientWidth-(mobile?34:0));
    const ah=Math.max(180,stage.clientHeight-(mobile?24:0));
    const scale=mobile?Math.min(1,aw/viewportWidth,ah/viewportHeight):aw/viewportWidth;
    labFrame.style.width=`${viewportWidth}px`;
    labFrame.style.height=`${viewportHeight}px`;
    labFrame.style.left='50%'; labFrame.style.marginLeft=`${-viewportWidth/2}px`;
    labFrame.style.top=mobile?'12px':'0'; labFrame.style.transform=`scale(${scale})`;
  };
  const loadLab=(key,force=false)=>{
    const data=labData[key]; if(!data||!labBrowser||!labFrame)return;
    labCurrent=key; labLoadToken+=1; const token=labLoadToken;
    labOptions.forEach(btn=>{const active=btn.dataset.lab===key;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});
    $('#labStrategy') && ($('#labStrategy').textContent=data.title);
    $('#labReason') && ($('#labReason').textContent=data.reason);
    $('#labBenefits') && ($('#labBenefits').innerHTML=data.benefits.map(x=>`<span>${x}</span>`).join(''));
    $('#labUrl') && ($('#labUrl').textContent=data.url);
    const link=$('#labProjectLink'); if(link)link.href=data.src;
    if(labPoster){labPoster.src=data.poster;labPoster.alt=`Prévia do projeto ${data.label}`;}
    labFrame.title=`Preview ao vivo de ${data.label}`;
    labBrowser.classList.add('is-changing'); labBrowser.classList.remove('is-loaded');
    if(force||labFrame.dataset.src!==data.src){
      labFrame.dataset.src=data.src;
      requestAnimationFrame(()=>{ if(token!==labLoadToken)return; labFrame.src=data.src; fitLabViewer(); });
    } else { fitLabViewer(); }
  };
  if(labFrame){labFrame.addEventListener('load',()=>{labBrowser?.classList.add('is-loaded');labBrowser?.classList.remove('is-changing');requestAnimationFrame(fitLabViewer);});}
  labOptions.forEach(btn=>btn.addEventListener('click',()=>loadLab(btn.dataset.lab,true)));
  $$('[data-lab-device]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!labBrowser)return; const mode=btn.dataset.labDevice==='mobile'?'mobile':'desktop'; labBrowser.dataset.view=mode;
    $$('[data-lab-device]').forEach(other=>{const active=other===btn;other.classList.toggle('is-active',active);other.setAttribute('aria-pressed',String(active));});
    requestAnimationFrame(fitLabViewer);
  }));
  if(labShell&&labBrowser&&finePointer&&!reducedMotion){
    let tick=false,px=.5,py=.5;
    labShell.addEventListener('pointermove',event=>{const r=labShell.getBoundingClientRect();px=(event.clientX-r.left)/r.width;py=(event.clientY-r.top)/r.height;if(tick)return;tick=true;requestAnimationFrame(()=>{labShell.style.setProperty('--lab-x',`${px*100}%`);labShell.style.setProperty('--lab-y',`${py*100}%`);labBrowser.style.setProperty('--lab-ry',`${(px-.5)*2.2}deg`);labBrowser.style.setProperty('--lab-rx',`${(.5-py)*1.6}deg`);const stage=$('.lab-live-stage',labBrowser);if(stage){const sr=stage.getBoundingClientRect();stage.style.setProperty('--scan-x',`${Math.max(0,Math.min(sr.width,event.clientX-sr.left))}px`);}labBrowser.classList.add('signal-active');tick=false;});},{passive:true});
    labShell.addEventListener('pointerleave',()=>{labBrowser.style.setProperty('--lab-ry','0deg');labBrowser.style.setProperty('--lab-rx','0deg');labBrowser.classList.remove('signal-active');});
  }
  const startLab=()=>loadLab(labCurrent,true);
  if(labShell&&'IntersectionObserver' in window){const io=new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){startLab();observer.disconnect();}},{rootMargin:'90px 0px',threshold:.01});io.observe(labShell);}else startLab();
  addEventListener('resize',()=>requestAnimationFrame(fitLabViewer),{passive:true});

  // Vértice Glass Refraction — light follows the pointer without moving the card itself.
  if (finePointer && !reducedMotion) {
    $$('.glass-reactive').forEach((surface) => {
      let frame = 0;
      let px = 50, py = 50;
      surface.addEventListener('pointerenter', () => surface.classList.add('glass-lit'));
      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        px = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        py = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          surface.style.setProperty('--glass-x', `${Math.max(0, Math.min(100, px))}%`);
          surface.style.setProperty('--glass-y', `${Math.max(0, Math.min(100, py))}%`);
          frame = 0;
        });
      }, { passive: true });
      surface.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        surface.classList.remove('glass-lit');
        surface.style.setProperty('--glass-x', '50%');
        surface.style.setProperty('--glass-y', '50%');
      });
    });
  }

  // FAQ: one open item at a time keeps the section calm and scannable.
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    const button = $('button', item);
    const symbol = $('b', button);
    button?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach((other) => {
        other.classList.remove('open');
        const otherButton = $('button', other);
        otherButton?.setAttribute('aria-expanded', 'false');
        const otherSymbol = $('b', otherButton);
        if (otherSymbol) otherSymbol.textContent = '+';
      });
      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        if (symbol) symbol.textContent = '−';
      }
    });
  });


  // ----------------------------------------------------------
  // Vértice Live Viewer — real internal pages, lazy-loaded.
  // ----------------------------------------------------------
  const liveViewers = $$('[data-live-viewer]');
  const fitLiveViewer = (viewer) => {
    const frame = $('[data-live-frame]', viewer);
    const stage = $('.live-stage', viewer);
    if (!frame || !stage) return;

    const mobile = viewer.dataset.view === 'mobile';
    const viewportWidth = mobile ? 390 : 1440;
    const viewportHeight = mobile ? 844 : 1200;
    const availableWidth = Math.max(120, stage.clientWidth - (mobile ? 34 : 0));
    const availableHeight = Math.max(180, stage.clientHeight - (mobile ? 22 : 0));
    const scale = mobile
      ? Math.min(1, availableWidth / viewportWidth, availableHeight / viewportHeight)
      : availableWidth / viewportWidth;

    frame.style.width = `${viewportWidth}px`;
    frame.style.height = `${viewportHeight}px`;
    frame.style.left = '50%';
    frame.style.marginLeft = `${-viewportWidth / 2}px`;
    frame.style.top = mobile ? '11px' : '0';
    frame.style.transform = `scale(${scale})`;
  };

  const loadLiveViewer = (viewer) => {
    if (viewer.dataset.loaded === 'true') return;
    const frame = $('[data-live-frame]', viewer);
    const src = viewer.dataset.src;
    if (!frame || !src) return;
    viewer.dataset.loaded = 'true';
    frame.addEventListener('load', () => {
      viewer.classList.add('is-loaded');
      requestAnimationFrame(() => fitLiveViewer(viewer));
    }, { once: true });
    frame.src = src;
    fitLiveViewer(viewer);
  };

  if (liveViewers.length) {
    if ('IntersectionObserver' in window) {
      const liveObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadLiveViewer(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '100px 0px', threshold: 0.01 });
      liveViewers.forEach((viewer) => liveObserver.observe(viewer));
    } else {
      liveViewers.forEach(loadLiveViewer);
    }

    liveViewers.forEach((viewer) => {
      $$('.live-device-switch button', viewer).forEach((button) => {
        button.addEventListener('click', () => {
          const mode = button.dataset.device === 'mobile' ? 'mobile' : 'desktop';
          viewer.dataset.view = mode;
          $$('.live-device-switch button', viewer).forEach((other) => {
            const active = other === button;
            other.classList.toggle('is-active', active);
            other.setAttribute('aria-pressed', String(active));
          });
          loadLiveViewer(viewer);
          requestAnimationFrame(() => fitLiveViewer(viewer));
        });
      });
    });

    let liveResizeTick = false;
    addEventListener('resize', () => {
      if (liveResizeTick) return;
      liveResizeTick = true;
      requestAnimationFrame(() => {
        liveViewers.forEach((viewer) => {
          if (viewer.dataset.loaded === 'true') fitLiveViewer(viewer);
        });
        liveResizeTick = false;
      });
    }, { passive: true });
  }

  // Vértice Signal Lens — pointer-reactive light instead of generic hover lift.
  if (finePointer && !reducedMotion) {
    $$('.project-card').forEach((card) => {
      card.addEventListener('pointerenter', () => {
        card.classList.add('signal-active');
        ring?.classList.add('active');
      });
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
        card.style.setProperty('--project-x', `${x}px`);
        card.style.setProperty('--project-y', `${y}px`);
        const viewer = $('.project-live', card);
        if (viewer) {
          const viewerRect = viewer.getBoundingClientRect();
          const scanX = Math.max(0, Math.min(viewerRect.width, event.clientX - viewerRect.left));
          viewer.style.setProperty('--scan-x', `${scanX}px`);
        }
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('signal-active');
        ring?.classList.remove('active');
      });
    });
  }

  // Interactive project matcher: helps the lead self-select before contacting sales.
  const matchData = {
    leads: {
      kicker: 'LANDING PAGE',
      title: 'Uma página, uma oferta,<br>um próximo passo claro.',
      text: 'Ideal para anúncios, campanhas e serviços em que você quer reduzir distrações e levar o visitante direto para o WhatsApp.',
      benefits: ['Copy orientada à oferta', 'CTA estratégico', 'Mobile first', '3 meses de hospedagem grátis'],
      message: 'Olá! Quero uma Landing Page e gostaria de entender a proposta.'
    },
    autoridade: {
      kicker: 'SITE INSTITUCIONAL',
      title: 'Sua empresa explicada<br>com clareza e presença.',
      text: 'Ideal para negócios que precisam apresentar serviços, diferenciais, estrutura e confiança em um endereço digital próprio.',
      benefits: ['Arquitetura de conteúdo', 'Design sob medida', 'SEO essencial', 'WhatsApp integrado'],
      message: 'Olá! Quero um site institucional para profissionalizar a presença da minha empresa.'
    },
    catalogo: {
      kicker: 'CATÁLOGO ONLINE',
      title: 'Produtos organizados.<br>Compra sem confusão.',
      text: 'Ideal para lojas e comércios que querem mostrar variedade, categorias e detalhes dos produtos antes de levar o cliente para o atendimento.',
      benefits: ['Categorias', 'Busca e filtros', 'Destaques comerciais', 'Pedidos pelo WhatsApp'],
      message: 'Olá! Quero um catálogo online para apresentar meus produtos e receber pedidos.'
    }
  };
  const matchResult = $('#matchResult');
  const matchButtons = $$('.match-option');
  let matchTimer = 0;
  const setMatch = (key) => {
    const data = matchData[key];
    if (!data || !matchResult) return;
    clearTimeout(matchTimer);
    matchResult.classList.add('is-changing');
    matchButtons.forEach((button) => {
      const active = button.dataset.match === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    matchTimer = setTimeout(() => {
      const kicker = $('#matchKicker');
      const title = $('#matchTitle');
      const text = $('#matchText');
      const benefits = $('#matchBenefits');
      const cta = $('#matchCta');
      if (kicker) kicker.textContent = data.kicker;
      if (title) title.innerHTML = data.title;
      if (text) text.textContent = data.text;
      if (benefits) benefits.innerHTML = data.benefits.map((item) => `<span>${item}</span>`).join('');
      if (cta) cta.href = `https://wa.me/5511925330433?text=${encodeURIComponent(data.message)}`;
      matchResult.classList.remove('is-changing');
    }, reducedMotion ? 0 : 140);
  };
  matchButtons.forEach((button) => button.addEventListener('click', () => setMatch(button.dataset.match)));

  // Pause decorative animations in background tabs.
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('is-paused', document.hidden);
  });
})();
