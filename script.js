// =============================================
// ELITE EVENTS MANAGEMENT — Main Script
// Pure Vanilla JS — no dependencies
// =============================================

(function () {
  'use strict';

  /* -----------------------------------------------
     NAVBAR — scroll state + active link
  ----------------------------------------------- */
  const navbar     = document.querySelector('.navbar');
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  function syncNavScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', syncNavScroll, { passive: true });
  syncNavScroll();

  // Mark the active page link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a[href]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* -----------------------------------------------
     HERO PARALLAX
  ----------------------------------------------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      // Move background upward slightly as user scrolls
      heroBg.style.transform = 'scale(1.06) translateY(' + scrolled * 0.28 + 'px)';
    }, { passive: true });
  }

  /* -----------------------------------------------
     SCROLL FADE-IN (IntersectionObserver)
  ----------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* -----------------------------------------------
     GALLERY FILTERS
  ----------------------------------------------- */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        galleryItems.forEach(function (item) {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
        });

        // Rebuild lightbox image list after filter change
        buildLightboxList();
      });
    });
  }

  /* -----------------------------------------------
     LIGHTBOX
  ----------------------------------------------- */
  const lightbox        = document.querySelector('.lightbox');
  const lightboxImg     = lightbox ? lightbox.querySelector('img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const lightboxClose   = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev    = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext    = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  let lbImages = [];
  let lbIndex  = 0;

  function buildLightboxList() {
    lbImages = [];
    document.querySelectorAll('.gallery-item:not(.hidden)').forEach(function (item) {
      lbImages.push({
        src:     item.querySelector('img').src,
        caption: item.dataset.caption || ''
      });
    });
  }

  function openLightbox(idx) {
    buildLightboxList();
    lbIndex = idx;
    showLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showLightboxImage() {
    if (!lbImages[lbIndex]) return;
    lightboxImg.src = lbImages[lbIndex].src;
    if (lightboxCaption) lightboxCaption.textContent = lbImages[lbIndex].caption;
  }

  function lbNext() {
    lbIndex = (lbIndex + 1) % lbImages.length;
    showLightboxImage();
  }

  function lbPrev() {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    showLightboxImage();
  }

  if (lightbox) {
    // Build initial list
    buildLightboxList();

    // Wire up gallery item clicks
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.classList.contains('hidden')) return;
        const visible = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
        const idx = visible.indexOf(item);
        openLightbox(idx !== -1 ? idx : 0);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext)  lightboxNext.addEventListener('click', lbNext);
    if (lightboxPrev)  lightboxPrev.addEventListener('click', lbPrev);

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowRight')  lbNext();
      if (e.key === 'ArrowLeft')   lbPrev();
    });

    // Touch/swipe support on lightbox
    var tsX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      tsX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tsX;
      if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); }
    }, { passive: true });
  }

  /* -----------------------------------------------
     CONTACT FORM — client-side validation
     Uses div-based form (no <form> tag) as specified
  ----------------------------------------------- */
  var submitBtn   = document.getElementById('submitBtn');
  var formWrapper = document.getElementById('formWrapper');
  var formSuccess = document.getElementById('formSuccess');

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    var group = el.closest('.form-group');
    if (!group) return;
    group.classList.add('has-error');
    var errEl = group.querySelector('.field-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var group = el.closest('.form-group');
    if (group) group.classList.remove('has-error');
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var valid = true;

      // Full Name
      clearError('fullName');
      if (!getVal('fullName')) {
        setError('fullName', 'Please enter your full name');
        valid = false;
      }

      // Email
      clearError('email');
      if (!isValidEmail(getVal('email'))) {
        setError('email', 'Please enter a valid email address');
        valid = false;
      }

      // Phone
      clearError('phone');
      if (!getVal('phone')) {
        setError('phone', 'Please enter your phone number');
        valid = false;
      }

      // Event Type
      clearError('eventType');
      if (!getVal('eventType')) {
        setError('eventType', 'Please select an event type');
        valid = false;
      }

      // Message
      clearError('message');
      if (getVal('message').length < 10) {
        setError('message', 'Please enter a message (at least 10 characters)');
        valid = false;
      }

      if (!valid) return;

      // Show loading state
      submitBtn.textContent = 'Sending\u2026';
      submitBtn.disabled = true;

      // Simulate async submit (replace with real API call if needed)
      setTimeout(function () {
        if (formWrapper) formWrapper.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
      }, 1200);
    });

    // Clear errors on input
    ['fullName', 'email', 'phone', 'eventType', 'eventDate', 'message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { clearError(id); });
      if (el) el.addEventListener('change', function () { clearError(id); });
    });
  }

})();
