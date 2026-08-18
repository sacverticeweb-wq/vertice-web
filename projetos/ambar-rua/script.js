(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const qs = (s, scope = document) => scope.querySelector(s);
  const qsa = (s, scope = document) => [...scope.querySelectorAll(s)];

  const loader = qs('#loader');
  const finishLoad = () => setTimeout(() => loader?.classList.add('done'), reduceMotion ? 0 : 420);
  if (document.readyState === 'complete') finishLoad();
  else addEventListener('load', finishLoad, { once: true });

  const header = qs('#header');
  const progress = qs('#scrollProgress');
  let lastY = 0;
  let ticking = false;

  const updateScene = () => {
    const y = scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progressPct = Math.min(100, Math.max(0, (y / max) * 100));
    if (progress) progress.style.width = `${progressPct}%`;

    header?.classList.toggle('scrolled', y > 24);
    if (y > 420 && y > lastY + 12) header?.classList.add('hidden');
    else if (y < lastY - 12 || y < 420) header?.classList.remove('hidden');
    lastY = Math.max(0, y);

    if (!reduceMotion) {
      qsa('.parallax').forEach(el => {
        const speed = Number(el.dataset.speed || 0.05);
        const rect = el.parentElement ? el.parentElement.getBoundingClientRect() : el.getBoundingClientRect();
        if (rect.bottom < -180 || rect.top > innerHeight + 180) return;
        const offset = (rect.top + rect.height / 2 - innerHeight / 2) * speed;
        el.style.transform = `translate3d(0,${offset}px,0)`;
      });
    }

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScene);
  };

  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick, { passive: true });
  updateScene();

  const reveals = qsa('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  const fashionMenu = qs('#fashionMenu');
  const menuTrigger = qs('.menu-trigger');
  const openMenu = () => {
    fashionMenu?.classList.add('open');
    fashionMenu?.setAttribute('aria-hidden', 'false');
    menuTrigger?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };
  const closeMenu = () => {
    fashionMenu?.classList.remove('open');
    fashionMenu?.setAttribute('aria-hidden', 'true');
    menuTrigger?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  menuTrigger?.addEventListener('click', () => {
    const isOpen = fashionMenu?.classList.contains('open');
    if (isOpen) closeMenu();
    else openMenu();
  });
  qs('.close-fashion')?.addEventListener('click', closeMenu);
  qsa('a', fashionMenu).forEach(a => a.addEventListener('click', closeMenu));

  qsa('.filter button').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.filter button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      qsa('.product').forEach(product => {
        const type = product.dataset.type || '';
        const shouldHide = filter !== 'all' && !type.split(/\s+/).includes(filter);
        product.classList.toggle('hidden', shouldHide);
      });
    });
  });

  const sizes = {
    PP: 'PP — modelagem ampla; vista 32–34 como referência geral.',
    P: 'P — modelagem ampla; vista 36 como referência geral.',
    M: 'M — modelagem ampla; vista 38–40 como referência geral.',
    G: 'G — modelagem ampla; vista 42–44 como referência geral.',
    GG: 'GG — modelagem ampla; vista 46 como referência geral.'
  };

  qsa('.fit .sizes button').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.fit .sizes button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const key = button.textContent.trim();
      const target = qs('#sizeText');
      if (target && sizes[key]) target.textContent = sizes[key];
    });
  });

  const modal = qs('#quickView');
  const quickImage = qs('#quickImage');
  const quickName = qs('#quickName');
  const quickDesc = qs('#quickDesc');
  const quickPrice = qs('#quickPrice');

  const closeQuick = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  qsa('.quick-open').forEach(button => {
    button.addEventListener('click', () => {
      const product = button.closest('.product');
      if (!product || !quickImage || !quickName || !quickDesc || !quickPrice || !modal) return;
      quickImage.src = product.dataset.image || '';
      quickImage.alt = product.dataset.name || 'Peça da coleção';
      quickName.textContent = product.dataset.name || 'Peça';
      quickDesc.textContent = product.dataset.desc || '';
      quickPrice.textContent = `R$ ${product.dataset.price || '0'}`;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });

  qs('.quick-close')?.addEventListener('click', closeQuick);
  qs('.quick-backdrop')?.addEventListener('click', closeQuick);

  addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeQuick();
      closeMenu();
    }
  });

  qsa('.quick-sizes button').forEach(button => {
    button.addEventListener('click', () => {
      qsa('.quick-sizes button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
    });
  });

  let bagCount = 0;
  qs('.add-bag')?.addEventListener('click', e => {
    bagCount += 1;
    const bagLabel = qs('#bagCount');
    if (bagLabel) bagLabel.textContent = String(bagCount);
    const button = e.currentTarget;
    const original = button.innerHTML;
    button.innerHTML = 'ADICIONADO À SACOLA <span>✓</span>';
    setTimeout(() => {
      button.innerHTML = original;
      closeQuick();
    }, 750);
  });

  qsa('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  qsa('.search-link,.bag-link').forEach(button => {
    button.addEventListener('click', () => {
      qs('#colecao')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Interactions are intentionally scroll/click based; no mouse-following hover effects.

})();
