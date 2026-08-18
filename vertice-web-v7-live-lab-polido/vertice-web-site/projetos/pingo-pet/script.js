(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  const menuOverlay = $('.menu-overlay');
  const menuClose = $('.mobile-menu__close');

  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    mobileMenu?.classList.toggle('open', open);
    menuOverlay?.classList.toggle('open', open);
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
  };

  menuToggle?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  menuClose?.addEventListener('click', () => setMenu(false));
  menuOverlay?.addEventListener('click', () => setMenu(false));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min((i % 4) * 55, 165)}ms`;
    revealObserver.observe(el);
  });

  const petData = {
    dog: {
      title: 'Seu doguinho',
      msg: 'Banho, tosa, hidratação e cuidados para cães de diferentes portes.',
      img: 'https://images.pexels.com/photos/13085581/pexels-photo-13085581.jpeg?auto=compress&cs=tinysrgb&w=1600',
      alt: 'Cachorro feliz em mesa de banho e tosa'
    },
    cat: {
      title: 'Seu gatinho',
      msg: 'Higiene e cuidado felino conforme perfil de manejo e disponibilidade.',
      img: 'https://images.pexels.com/photos/6130974/pexels-photo-6130974.jpeg?auto=compress&cs=tinysrgb&w=1600',
      alt: 'Gato recebendo cuidados de higiene em pet shop'
    }
  };
  const heroPetImage = $('#heroPetImage');
  $$('.pet-chip').forEach(btn => btn.addEventListener('click', () => {
    const pet = petData[btn.dataset.pet];
    if (!pet) return;
    $$('.pet-chip').forEach(b => b.classList.toggle('active', b === btn));
    $('#petTitle').textContent = pet.title;
    $('#petMsg').textContent = pet.msg;
    heroPetImage.style.opacity = '.25';
    heroPetImage.style.transform = 'scale(1.03)';
    setTimeout(() => {
      heroPetImage.src = pet.img;
      heroPetImage.alt = pet.alt;
      heroPetImage.onload = () => {
        heroPetImage.style.opacity = '1';
        heroPetImage.style.transform = 'scale(1)';
      };
    }, 150);
  }));
  if (heroPetImage) heroPetImage.style.transition = 'opacity .35s, transform .5s';

  const baRange = $('#baRange');
  const baBefore = $('#baBefore');
  const baHandle = $('#baHandle');
  const updateCompare = (value) => {
    if (!baBefore || !baHandle) return;
    baBefore.style.width = `${value}%`;
    baHandle.style.left = `${value}%`;
    const card = $('#baCard');
    const image = $('.ba-before .ba-img');
    if (card && image) image.style.width = `${card.clientWidth}px`;
  };
  baRange?.addEventListener('input', e => updateCompare(e.target.value));
  window.addEventListener('resize', () => updateCompare(baRange?.value || 50));
  updateCompare(50);

  const form = $('#agendaForm');
  const toast = $('#toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 3200);
  };
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#petName').value.trim() || 'meu pet';
    const type = $('#petType').value;
    const service = $('#petService').value;
    const message = `Olá, Pingo Pet! Quero agendar ${service.toLowerCase()} para ${name} (${type.toLowerCase()}). Pode me passar os horários disponíveis?`;
    navigator.clipboard?.writeText(message).then(
      () => showToast('Mensagem pronta e copiada ✦ Este projeto usa um número demonstrativo.'),
      () => showToast('Mensagem pronta ✦ Este projeto usa um número demonstrativo.')
    );
  });

  const glow = $('.cursor-glow');
  if (window.matchMedia('(pointer:fine)').matches && glow) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
  }

  const tilt = $('[data-tilt] .hero-photo-wrap');
  const tiltArea = $('[data-tilt]');
  if (tilt && tiltArea && window.matchMedia('(pointer:fine)').matches) {
    tiltArea.addEventListener('mousemove', (e) => {
      const r = tiltArea.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `rotate(2deg) rotateY(${x * 6}deg) rotateX(${y * -6}deg) translateY(-3px)`;
    });
    tiltArea.addEventListener('mouseleave', () => tilt.style.transform = 'rotate(2deg)');
  }

  $$('.magnetic').forEach((btn) => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
})();
