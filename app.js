/**
 * ============================================
 * ControlGastos Landing Page — JavaScript (Vanilla)
 * ============================================
 *
 * SEGURIDAD:
 * - NO se usa innerHTML en ninguna parte (prevención XSS).
 * - Se usa textContent y createElement para manipulación del DOM.
 * - Validación client-side + honeypot anti-bot.
 * - Envío de datos únicamente por HTTPS.
 * - Rate limiting en el botón de envío.
 */

'use strict';

/* ============================================
   1. MOBILE NAVIGATION
   ============================================ */

(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const navLinks = menu.querySelectorAll('.nav-link');

  function closeMenu() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', function () {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
})();


/* ============================================
   2. STICKY HEADER — SCROLL STATE
   ============================================ */

(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================================
   3. SCROLL REVEAL ANIMATIONS
   (IntersectionObserver — sin librerías externas)
   ============================================ */

(function initScrollReveal() {
  var revealTargets = [
    '.feature-card',
    '.problema-card',
    '.step-card',
    '.privacidad-item',
    '.faq-item',
    '.beta-card',
    '.hero-content',
    '.hero-image',
    '.privacidad-visual',
    '.privacidad-content'
  ];

  var elements = document.querySelectorAll(revealTargets.join(','));

  elements.forEach(function (el) {
    el.classList.add('reveal');

    // Delay escalonado para grillas
    if (el.classList.contains('feature-card')) {
      var idx = Array.from(document.querySelectorAll('.feature-card')).indexOf(el);
      if (idx < 6) el.classList.add('reveal-delay-' + (idx + 1));
    }
    if (el.classList.contains('problema-card')) {
      var idx = Array.from(document.querySelectorAll('.problema-card')).indexOf(el);
      if (idx < 3) el.classList.add('reveal-delay-' + (idx + 1));
    }
    if (el.classList.contains('step-card')) {
      var idx = Array.from(document.querySelectorAll('.step-card')).indexOf(el);
      if (idx < 3) el.classList.add('reveal-delay-' + (idx + 1));
    }
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();


/* ============================================
   4. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ============================================
   5. FORM VALIDATION & SECURE SUBMISSION
   ============================================ */

(function initForm() {
  var form         = document.getElementById('waitlist-form');
  var nameInput    = document.getElementById('user-name');
  var emailInput   = document.getElementById('user-email');
  var consentCheck = document.getElementById('consent-check');
  var honeypot     = document.getElementById('hp-website');
  var submitBtn    = document.getElementById('submit-btn');
  var formSuccess  = document.getElementById('form-success');

  var nameError    = document.getElementById('name-error');
  var emailError   = document.getElementById('email-error');
  var consentError = document.getElementById('consent-error');

  if (!form) return;

  var lastSubmitTime   = 0;
  var SUBMIT_COOLDOWN = 5000;

  function sanitize(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.textContent.trim();
  }

  function setError(el, msg) { el.textContent = msg; }
  function clearError(el)    { el.textContent = ''; }

  function validateName() {
    var v = nameInput.value.trim();
    var ok = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,100}$/.test(v);

    if (!v) {
      setError(nameError, 'El nombre es obligatorio.');
      nameInput.classList.add('input-error');
      nameInput.classList.remove('input-success');
      return false;
    }
    if (!ok) {
      setError(nameError, 'Ingresa un nombre válido (solo letras y espacios).');
      nameInput.classList.add('input-error');
      nameInput.classList.remove('input-success');
      return false;
    }
    clearError(nameError);
    nameInput.classList.remove('input-error');
    nameInput.classList.add('input-success');
    return true;
  }

  function validateEmail() {
    var v = emailInput.value.trim();
    var emailRx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!v) {
      setError(emailError, 'El correo electrónico es obligatorio.');
      emailInput.classList.add('input-error');
      emailInput.classList.remove('input-success');
      return false;
    }
    if (!emailRx.test(v) || v.length > 254) {
      setError(emailError, 'Ingresa un correo electrónico válido.');
      emailInput.classList.add('input-error');
      emailInput.classList.remove('input-success');
      return false;
    }
    clearError(emailError);
    emailInput.classList.remove('input-error');
    emailInput.classList.add('input-success');
    return true;
  }

  function validateConsent() {
    if (!consentCheck.checked) {
      setError(consentError, 'Debes aceptar la política de privacidad.');
      return false;
    }
    clearError(consentError);
    return true;
  }

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  consentCheck.addEventListener('change', validateConsent);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Honeypot
    if (honeypot && honeypot.value) {
      form.hidden = true;
      formSuccess.hidden = false;
      return;
    }

    // 2. Rate limiting
    var now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      setError(consentError, 'Por favor espera unos segundos antes de volver a intentar.');
      return;
    }

    // 3. Validar todos los campos
    var isNameValid    = validateName();
    var isEmailValid   = validateEmail();
    var isConsentValid = validateConsent();

    if (!isNameValid || !isEmailValid || !isConsentValid) {
      if (!isNameValid) nameInput.focus();
      else if (!isEmailValid) emailInput.focus();
      else consentCheck.focus();
      return;
    }

    // 4. Verificar HTTPS
    var formAction = form.getAttribute('action');
    if (!formAction || !formAction.startsWith('https://')) {
      setError(consentError, 'Error de configuración del formulario. Contacta al administrador.');
      console.error('[SECURITY] La URL del formulario no usa HTTPS.');
      return;
    }

    // 5. Preparar datos sanitizados
    var sanitizedName  = sanitize(nameInput.value);
    var sanitizedEmail = sanitize(emailInput.value);

    var formData = new FormData();
    formData.append('name', sanitizedName);
    formData.append('email', sanitizedEmail);

    // 6. Mostrar estado de carga
    submitBtn.classList.add('is-loading');
    lastSubmitTime = now;

    try {
      var response = await fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.hidden = true;
        formSuccess.hidden = false;
      } else {
        setError(consentError, 'Hubo un problema al enviar tu solicitud. Inténtalo de nuevo más tarde.');
      }
    } catch (networkError) {
      setError(consentError, 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
    } finally {
      submitBtn.classList.remove('is-loading');
    }
  });
})();


/* ============================================
   6. ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
   ============================================ */

(function initActiveNav() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-menu .nav-link:not(.nav-cta)');

  if (!sections.length || !navLinks.length) return;
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var activeId = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + activeId) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72) + 'px 0px -50% 0px'
    }
  );

  sections.forEach(function (section) { observer.observe(section); });
})();


/* ============================================
   7. COPYRIGHT YEAR AUTO-UPDATE
   ============================================ */

(function updateYear() {
  var footerBottom = document.querySelector('.footer-bottom p');
  if (footerBottom) {
    var y = new Date().getFullYear();
    footerBottom.textContent = '\u00A9 ' + y + ' ControlGastos. Todos los derechos reservados. Hecho con \u2615 y Flutter.';
  }
})();
