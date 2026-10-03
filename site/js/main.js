/* ============================================
   HARMONIE SANTÉ — V2 Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Cursor glow effect
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
    });
  }

  const header = document.getElementById('header');

  // Mobile menu
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = header.offsetHeight + 10;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { passive: true });

  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // Counter animation
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm).entries());

      const message = `Olá! Vim pelo site e gostaria de agendar uma consulta na Harmonie Santé.\n\n` +
        `*Nome:* ${data.name}\n` +
        `*E-mail:* ${data.email}\n` +
        `*Telefone:* ${data.phone}\n` +
        `*Área de interesse:* ${data.service}\n` +
        `*Mensagem:* ${data.message || 'Sem mensagem adicional'}`;

      const whatsappUrl = `https://wa.me/5511950764000?text=${encodeURIComponent(message)}`;

      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Redirecionando...</span>';
      btn.style.background = '#25D366';

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        btn.innerHTML = '<span>Enviado com sucesso</span>';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          contactForm.reset();
        }, 2500);
      }, 500);
    });
  }

  // Phone mask
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
      e.target.value = v;
    });
  }

});

/* ============================================
   Hero — Carrossel da entrada da clínica
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('#heroDots .hero-dot'));
  if (slides.length < 2) return;

  const INTERVAL = 6000;
  let current = 0;
  let timer = null;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const start = () => {
    stop();
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); start(); });
  });

  // Pausa quando a aba está em segundo plano
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // Swipe no mobile
  let touchX = null;
  const hero = slider.closest('.hero');
  hero.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); start(); }
    touchX = null;
  }, { passive: true });

  start();
});

/* ============================================
   Nossa Estrutura — Galeria com filtros e lightbox
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.gallery-item'));
  const filters = Array.from(document.querySelectorAll('.gallery-filter'));
  const moreBtn = document.getElementById('galleryMore');
  const moreWrap = moreBtn ? moreBtn.parentElement : null;

  const PAGE = 12;
  let activeFilter = 'all';
  let shown = PAGE;

  const matching = () => items.filter(it => activeFilter === 'all' || it.dataset.cat === activeFilter);

  const render = () => {
    const list = matching();
    items.forEach(it => { it.hidden = true; });
    list.slice(0, shown).forEach(it => { it.hidden = false; });
    if (moreWrap) moreWrap.hidden = list.length <= shown;
  };

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      shown = PAGE;
      render();
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener('click', () => { shown += PAGE; render(); });
  }

  render();

  // ---- Lightbox ----
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const counter = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let list = [];
  let index = 0;
  let lastFocus = null;

  const preload = (i) => {
    const it = list[(i + list.length) % list.length];
    if (it) { const p = new Image(); p.src = it.href; }
  };

  const show = (i) => {
    index = (i + list.length) % list.length;
    const it = list[index];
    img.src = it.href;
    img.alt = it.querySelector('img').alt;
    caption.textContent = it.dataset.caption;
    counter.textContent = `${index + 1} / ${list.length}`;
    preload(index + 1);
    preload(index - 1);
  };

  const open = (it) => {
    list = matching();  // navega apenas pelas fotos do filtro ativo
    lastFocus = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    show(list.indexOf(it));
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocus) lastFocus.focus();
  };

  items.forEach(it => {
    it.addEventListener('click', (e) => { e.preventDefault(); open(it); });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  // Swipe no lightbox
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
    touchX = null;
  }, { passive: true });
});
