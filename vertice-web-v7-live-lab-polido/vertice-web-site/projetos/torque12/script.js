(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  // Boot / ignition intro
  const boot = $('.boot');
  const hideBoot = () => setTimeout(() => boot?.classList.add('hide'), reduced ? 0 : 520);
  if (document.readyState === 'complete') hideBoot();
  else window.addEventListener('load', hideBoot, { once: true });
  setTimeout(() => boot?.classList.add('hide'), 1800);

  // Header + page progress + process progress + parallax value
  const progress = $('.scroll-progress i');
  const header = $('.site-header');
  const process = $('#processTrack');
  const processFill = $('.track-line i');
  let ticking = false;

  const updateScroll = () => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pct = Math.min(1, y / max);
    if (progress) progress.style.width = `${pct * 100}%`;
    header?.classList.toggle('scrolled', y > 30);
    document.documentElement.style.setProperty('--scrollY', `${y}px`);

    if (process && processFill) {
      const r = process.getBoundingClientRect();
      const total = r.height + innerHeight * .6;
      const passed = innerHeight * .65 - r.top;
      const p = Math.max(0, Math.min(1, passed / total));
      processFill.style.width = `${p * 100}%`;
      const steps = $$('.process-step', process);
      steps.forEach((step, i) => step.classList.toggle('active', p >= (i + .18) / steps.length));
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  // Slow reveal on scroll
  const reveals = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 4) * 65, 195)}ms`;
      io.observe(el);
    });
  }

  // Cursor light + subtle hero motion
  const glow = $('.cursor-glow');
  const hero = $('.hero');
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
      if (hero) {
        const r = hero.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 2;
        const y = ((e.clientY - r.top) / r.height - .5) * 2;
        document.documentElement.style.setProperty('--mx', x.toFixed(3));
        document.documentElement.style.setProperty('--my', y.toFixed(3));
      }
    }, { passive: true });
  }

  // Magnetic buttons
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .12;
        const y = (e.clientY - r.top - r.height / 2) * .16;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = 'translate3d(0,0,0)');
    });
  }

  // Card tilt: very restrained so text stays readable
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - .5) * -2.1;
        const ry = ((e.clientX - r.left) / r.width - .5) * 2.1;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)');
    });
  }

  // Services interactive state
  const serviceTitle = $('#serviceVisualTitle');
  const serviceNames = {
    preventiva: 'REVISÃO / CHASSIS',
    freios: 'BRAKE / SUSPENSION',
    eletronico: 'ECU / ELECTRONICS',
    arrefecimento: 'COOLING / THERMAL'
  };
  $$('.service-row').forEach(row => {
    const activate = () => {
      $$('.service-row').forEach(x => x.classList.remove('active'));
      row.classList.add('active');
      if (serviceTitle) {
        serviceTitle.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
        serviceTitle.textContent = serviceNames[row.dataset.service] || 'SYSTEM / CHECK';
      }
    };
    row.addEventListener('mouseenter', activate);
    row.addEventListener('focusin', activate);
    row.addEventListener('click', activate);
  });

  // Interactive diagnostic terminal
  const diagMsg = $('#diagMsg');
  const diagCode = $('#diagCode');
  const diagLevel = $('#diagLevel');
  const diagOutput = $('.diag-output');
  let diagTimer;
  $$('.symptoms button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.symptoms button').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      clearTimeout(diagTimer);
      if (diagCode) diagCode.textContent = btn.dataset.code || 'T12_SCAN';
      if (diagLevel) diagLevel.textContent = 'PROCESSING';
      if (diagMsg) diagMsg.textContent = 'Lendo entrada e preparando triagem...';
      diagOutput?.classList.add('processing');
      diagTimer = setTimeout(() => {
        if (diagLevel) diagLevel.textContent = btn.dataset.level || 'CHECK';
        if (diagMsg) diagMsg.textContent = btn.dataset.msg || '';
        diagOutput?.classList.remove('processing');
      }, reduced ? 0 : 520);
    });
  });

  // Counters and dashboard gauges when they enter view
  const animateCounter = el => {
    const target = Number(el.dataset.count || 0);
    const pad = target >= 100 ? 3 : 2;
    if (reduced) { el.textContent = String(target).padStart(pad, '0'); return; }
    const start = performance.now();
    const duration = 1100;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * eased)).padStart(pad, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = $$('[data-count]');
  const dashboard = $('.dashboard');
  if ('IntersectionObserver' in window) {
    const specialIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches('[data-count]')) animateCounter(entry.target);
        if (entry.target.classList.contains('dashboard')) entry.target.classList.add('animated');
        specialIO.unobserve(entry.target);
      });
    }, { threshold: .35 });
    counters.forEach(c => specialIO.observe(c));
    if (dashboard) specialIO.observe(dashboard);
  } else {
    counters.forEach(animateCounter);
    dashboard?.classList.add('animated');
  }

  // Mobile nav menu
  const menuBtn = $('.menu-toggle');
  menuBtn?.addEventListener('click', () => {
    const active = header?.classList.toggle('menu-active');
    document.body.classList.toggle('menu-open', !!active);
    menuBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', active ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.site-header nav a').forEach(a => a.addEventListener('click', () => {
    header?.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  // Demo form feedback
  const form = $('#budgetForm');
  const response = $('#formResponse');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const vehicle = form.elements.vehicle?.value.trim();
    const symptom = form.elements.symptom?.value.trim();
    if (!vehicle || !symptom) {
      if (response) {
        response.textContent = '> PREENCHA VEÍCULO/ANO E O SINTOMA PARA SIMULAR O ATENDIMENTO.';
        response.classList.add('show');
      }
      return;
    }
    if (response) {
      response.textContent = '> REQUEST_READY / DEMO — EM UM SITE REAL, AQUI SERIA ABERTO O CANAL DE ATENDIMENTO.';
      response.classList.add('show');
    }
  });
})();
