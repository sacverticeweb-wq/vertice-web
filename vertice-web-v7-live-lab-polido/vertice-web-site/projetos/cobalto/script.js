(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Loader
  addEventListener('load', () => setTimeout(() => $('.loader')?.classList.add('done'), reduce ? 0 : 800));

  // Header + progress
  const header = $('[data-header]');
  const progress = $('.scroll-progress i');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 30);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal system
  const revealEls = $$('.reveal, .reveal-text');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add('in'));

  // Menu
  const menuBtn = $('.menu-btn');
  const menu = $('.menu-overlay');
  const setMenu = open => {
    menuBtn?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    menuBtn?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu?.classList.toggle('open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
  $$('.menu-overlay a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  // Custom cursor
  const cursor = $('.cursor');
  if (cursor && matchMedia('(pointer:fine)').matches && !reduce) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cursor.classList.add('show'); });
    addEventListener('pointerleave', () => cursor.classList.remove('show'));
    addEventListener('pointerdown', () => cursor.classList.add('press'));
    addEventListener('pointerup', () => cursor.classList.remove('press'));
    const tick = () => {
      cx += (x - cx) * .22; cy += (y - cy) * .22;
      cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`;
      requestAnimationFrame(tick);
    };
    tick();
    $$('a,button,[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => {
        cursor.classList.add('hot');
        $('span', cursor).textContent = el.dataset.cursor || 'ABRIR';
      });
      el.addEventListener('pointerleave', () => {
        cursor.classList.remove('hot');
        $('span', cursor).textContent = 'VER';
      });
    });
  }

  // Service image preview
  const servicePreview = $('.service-preview');
  const previewImg = servicePreview ? $('img', servicePreview) : null;
  if (servicePreview && previewImg && matchMedia('(pointer:fine)').matches) {
    $$('.service-row').forEach(row => {
      row.addEventListener('pointerenter', () => {
        previewImg.src = row.dataset.preview;
        servicePreview.classList.add('show');
      });
      row.addEventListener('pointermove', e => {
        servicePreview.style.left = `${e.clientX + 25}px`;
        servicePreview.style.top = `${e.clientY - 30}px`;
      });
      row.addEventListener('pointerleave', () => servicePreview.classList.remove('show'));
    });
  }

  // Drag-to-scroll lookbook
  const rail = $('[data-drag-scroll]');
  if (rail) {
    let down = false, startX = 0, startScroll = 0;
    rail.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button')) return;
      down = true; startX = e.clientX; startScroll = rail.scrollLeft;
      rail.classList.add('dragging');
      rail.setPointerCapture?.(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if (!down) return;
      rail.scrollLeft = startScroll - (e.clientX - startX) * 1.2;
    });
    const stop = () => { down = false; rail.classList.remove('dragging'); };
    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
  }

  // Process scroll focus: the card nearest the viewport center stays crisp.
  const methodSection = $('.method');
  const methodSteps = $$('[data-method-step]');
  const methodMeter = $('.method-meter');
  if (methodSection && methodSteps.length) {
    let methodTick = false;
    const updateMethodFocus = () => {
      const center = innerHeight * .52;
      let best = 0, bestDistance = Infinity;
      methodSteps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height * .5;
        const distance = Math.abs(stepCenter - center);
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });
      methodSteps.forEach((step,index)=>step.classList.toggle('is-focus', index === best));
      const rect = methodSection.getBoundingClientRect();
      const travel = Math.max(1, rect.height - innerHeight);
      const progressValue = Math.max(0, Math.min(1, -rect.top / travel));
      methodSection.style.setProperty('--method-progress', String(progressValue));
      methodTick = false;
    };
    const requestMethodFocus = () => { if(methodTick) return; methodTick = true; requestAnimationFrame(updateMethodFocus); };
    addEventListener('scroll', requestMethodFocus, { passive:true });
    addEventListener('resize', requestMethodFocus, { passive:true });
    updateMethodFocus();
  }

  // Booking
  let barber = 'Rafa Monteiro', day = 'Hoje', time = '18:40';
  const selectedBarber = $('#selectedBarber');
  const slotResult = $('#slotResult');
  const render = () => {
    if (selectedBarber) selectedBarber.textContent = barber;
    if (slotResult) slotResult.textContent = `${barber} · ${day} · ${time}`;
  };
  $$('[data-barber]').forEach(btn => btn.addEventListener('click', () => {
    barber = btn.dataset.barber;
    render();
    $('#agenda')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
  $$('.days .choice').forEach(btn => btn.addEventListener('click', () => {
    $$('.days .choice').forEach(x => x.classList.remove('active'));
    btn.classList.add('active'); day = btn.dataset.day; render();
  }));
  $$('.times .choice').forEach(btn => btn.addEventListener('click', () => {
    $$('.times .choice').forEach(x => x.classList.remove('active'));
    btn.classList.add('active'); time = btn.dataset.time; render();
  }));
  render();

  // FAQ
  $$('.faq-item button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const open = item.classList.contains('active');
    $$('.faq-item').forEach(x => { x.classList.remove('active'); $('button i', x).textContent = '+'; });
    if (!open) { item.classList.add('active'); $('button i', item).textContent = '−'; }
  }));

  // Active nav
  const navLinks = $$('.nav-desktop a');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
    }), { rootMargin: '-40% 0px -50% 0px' });
    navLinks.forEach(a => { const section = $(a.hash); if (section) navObserver.observe(section); });
  }
})();
