(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const qs = (s, scope = document) => scope.querySelector(s);
  const qsa = (s, scope = document) => [...scope.querySelectorAll(s)];

  const header = qs('#header');
  const menuBtn = qs('.menu-btn');
  const mobileNav = qs('#mobileNav');
  const progressBar = qs('#scrollProgressBar');
  let lastScroll = 0;
  let ticking = false;

  const closeMenu = () => {
    if (!menuBtn || !mobileNav) return;
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const willOpen = !mobileNav.classList.contains('open');
      menuBtn.classList.toggle('active', willOpen);
      menuBtn.setAttribute('aria-expanded', String(willOpen));
      mobileNav.classList.toggle('open', willOpen);
      mobileNav.setAttribute('aria-hidden', String(!willOpen));
      document.body.classList.toggle('menu-open', willOpen);
    });
    qsa('a', mobileNav).forEach(a => a.addEventListener('click', closeMenu));
  }

  const updateScrollScene = () => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pct = Math.min(100, Math.max(0, (y / max) * 100));

    header?.classList.toggle('scrolled', y > 45);
    if (y > 550 && y > lastScroll + 12) header?.classList.add('hidden');
    else if (y < lastScroll - 12 || y < 550) header?.classList.remove('hidden');
    lastScroll = Math.max(0, y);

    if (progressBar) progressBar.style.width = `${pct}%`;

    if (!reduceMotion) {
      qsa('.parallax-media').forEach(el => {
        const speed = Number(el.dataset.speed || 0.08);
        const parent = el.parentElement || el;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom < -160 || rect.top > innerHeight + 160) return;
        const offset = (rect.top + rect.height / 2 - innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollScene);
  };

  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick, { passive: true });
  updateScrollScene();

  const reveals = qsa('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  qsa('.menu-tabs button').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.menu-tabs button').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      const category = button.dataset.cat;
      qsa('.food-card').forEach(card => {
        const hidden = category !== 'todos' && card.dataset.cat !== category;
        card.classList.toggle('hidden', hidden);
      });
    });
  });

  const groups = {
    base: { name: '91 Smash', price: 34, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=88' },
    extra: { name: 'Sem extra', price: 0 }
  };

  const money = value => `R$ ${value.toFixed(0)}`;
  const updateCombo = () => {
    const comboName = qs('#comboName');
    const baseLine = qs('#baseLine');
    const extraLine = qs('#extraLine');
    const comboTotal = qs('#comboTotal');
    const comboImage = qs('#comboImage');

    comboName && (comboName.textContent = groups.base.name);
    baseLine && (baseLine.textContent = groups.base.name);
    extraLine && (extraLine.textContent = groups.extra.name);
    comboTotal && (comboTotal.textContent = money(groups.base.price + groups.extra.price + 12));

    if (comboImage && groups.base.image && comboImage.src !== groups.base.image) {
      comboImage.style.opacity = '.18';
      comboImage.style.transform = 'scale(1.05)';
      const next = new Image();
      next.onload = () => {
        comboImage.src = groups.base.image;
        requestAnimationFrame(() => {
          comboImage.style.opacity = '1';
          comboImage.style.transform = 'scale(1)';
        });
      };
      next.src = groups.base.image;
    }
  };

  qsa('.pick').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.dataset.group;
      qsa(`.pick[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      groups[group] = {
        name: button.dataset.name,
        price: Number(button.dataset.price || 0),
        ...(button.dataset.image ? { image: button.dataset.image } : {})
      };
      updateCombo();
    });
  });

  const baseButtons = qsa('.pick[data-group="base"]');
  qsa('[data-select-base]').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.selectBase;
      const match = baseButtons.find(b => b.dataset.name === name);
      match?.click();
      qs('#combos')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  if (!reduceMotion && finePointer) {
    qsa('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 3.5}deg) rotateY(${x * 4.2}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    qsa('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate3d(${x * 0.07}px, ${y * 0.09}px, 0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    qsa('.food-card,.review-card,.pick,.ritual,.spotlight-card,.contact-panel').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty('--mx', `${x}%`);
        el.style.setProperty('--my', `${y}%`);
      });
    });
  }

  const glow = qs('.cursor-glow');
  if (glow && !reduceMotion && finePointer) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const animateGlow = () => {
      gx += (tx - gx) * 0.11;
      gy += (ty - gy) * 0.11;
      glow.style.transform = `translate3d(${gx - 170}px, ${gy - 170}px, 0)`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  const canvas = qs('#embers');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let dpr = Math.min(devicePixelRatio || 1, 1.7);
    let width = 0;
    let height = 0;
    let particles = [];
    const maxParticles = innerWidth < 700 ? 18 : 34;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.7);
      width = innerWidth;
      height = innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particle = (initial = false) => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 80,
      r: 0.5 + Math.random() * 1.7,
      vy: 0.22 + Math.random() * 0.7,
      vx: -0.18 + Math.random() * 0.36,
      life: 0.25 + Math.random() * 0.7,
      flicker: Math.random() * Math.PI * 2
    });

    resize();
    particles = Array.from({ length: maxParticles }, () => particle(true));
    addEventListener('resize', resize, { passive: true });

    const draw = t => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p, i) => {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(t * 0.001 + p.flicker) * 0.08;
        if (p.y < -20 || p.x < -20 || p.x > width + 20) particles[i] = p = particle();
        const alpha = p.life * (0.55 + Math.sin(t * 0.006 + p.flicker) * 0.25);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, ${110 + Math.random() * 50}, 20, ${Math.max(0.06, alpha)})`;
        ctx.shadowColor = 'rgba(255,95,0,.75)';
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }

  qsa('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();
