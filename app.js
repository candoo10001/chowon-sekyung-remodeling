/**
 * THE SHARP PARK AVENUE 138 // MODERN LUXURY WHITE
 * Architectural Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Init Components
  initMobileMenu();
  initQuickNavigation();
  initJourneyIndicator();
  initSmoothScroll();
  initCounterAnimations();
  initHeroParallax();
  initHeaderScroll();
  initComparisonSlider();
  initFloorPlans();
  initCalculator();
  initLightbox();
  document.querySelectorAll('.map-filter').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
});

/* ==========================================================================
   1. MOBILE MENU & HEADER SCROLL
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  function setMenuOpen(open) {
    mobileMenu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }

  menuBtn.addEventListener('click', () => {
    setMenuOpen(mobileMenu.classList.contains('hidden'));
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('#main-header')) setMenuOpen(false);
  });
  const desktop = window.matchMedia('(min-width: 1280px)');
  desktop.addEventListener('change', () => setMenuOpen(false));
}

function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const updateShadow = () => header.classList.toggle('shadow-md', window.scrollY > 30);
  window.addEventListener('scroll', updateShadow, { passive: true });
  updateShadow();

  // Limit the dropdown to the visible space even while the notice is on screen.
  const menu = document.getElementById('mobile-menu');
  const updateMenuHeight = () => {
    if (menu) menu.style.maxHeight = `${Math.max(0, (window.visualViewport?.height || window.innerHeight) - header.getBoundingClientRect().bottom)}px`;
  };
  window.addEventListener('scroll', updateMenuHeight, { passive: true });
  window.addEventListener('resize', updateMenuHeight);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', updateMenuHeight);
  updateMenuHeight();
}

/* ==========================================================================
   2. BEFORE & AFTER MODERN LUXURY COMPARISON SLIDER
   ========================================================================== */
function initComparisonSlider() {
  const container = document.getElementById('comparison-container');
  const beforeWrapper = document.getElementById('before-wrapper');
  const handle = document.getElementById('slider-handle');

  if (!container || !beforeWrapper || !handle) return;

  const slider = document.getElementById('comparison-slider');
  let dragStart = null;
  let percentage = 50;

  function syncBeforeImageWidth() {
    const rect = container.getBoundingClientRect();
    const beforeImg = beforeWrapper.querySelector('img');
    if (beforeImg) {
      beforeImg.style.width = `${rect.width}px`;
      beforeImg.style.maxWidth = 'none';
    }
  }

  const beforeBadge = document.getElementById('before-badge');
  const afterBadge = document.getElementById('after-badge');

  function setPosition(value) {
    percentage = Math.max(5, Math.min(95, value));
    beforeWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
    if (slider) {
      slider.setAttribute('aria-valuenow', String(Math.round(percentage)));
      slider.setAttribute('aria-valuetext', `기존 모습 ${Math.round(percentage)}%, 리모델링 후 ${100 - Math.round(percentage)}%`);
    }

    if (beforeBadge) {
      if (percentage < 20) {
        beforeBadge.style.opacity = Math.max(0.2, (percentage - 5) / 15);
      } else {
        beforeBadge.style.opacity = '1';
      }
    }
    if (afterBadge) {
      if (percentage > 80) {
        afterBadge.style.opacity = Math.max(0.2, (95 - percentage) / 15);
      } else {
        afterBadge.style.opacity = '1';
      }
    }

  }

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    if (rect.width) setPosition((clientX - rect.left) / rect.width * 100);
  }

  syncBeforeImageWidth();
  window.addEventListener('resize', syncBeforeImageWidth);

  container.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dragStart = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    container.setPointerCapture(event.pointerId);
    if (event.pointerType === 'mouse') updateSliderPosition(event.clientX);
  });
  container.addEventListener('pointermove', event => {
    if (!dragStart || event.pointerId !== dragStart.id) return;
    const dx = Math.abs(event.clientX - dragStart.x);
    const dy = Math.abs(event.clientY - dragStart.y);
    if (!dragStart.moved && dy > dx && dy > 8) {
      dragStart = null; // A vertical gesture scrolls the page without moving the divider.
      return;
    }
    if (dx > 8) dragStart.moved = true;
    if (dragStart.moved) updateSliderPosition(event.clientX);
  });
  container.addEventListener('pointerup', event => {
    if (dragStart && event.pointerId === dragStart.id) updateSliderPosition(event.clientX);
    dragStart = null;
  });
  container.addEventListener('pointercancel', () => { dragStart = null; });
  container.addEventListener('lostpointercapture', () => { dragStart = null; });
  if (slider) slider.addEventListener('keydown', event => {
    const steps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
    if (event.key in steps) {
      event.preventDefault();
      setPosition(percentage + steps[event.key]);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setPosition(event.key === 'Home' ? 5 : 95);
    }
  });
}

/* ==========================================================================
   3. ARCHITECTURAL FLOOR PLAN ENGINE (59㎡)
   ========================================================================== */
const floorPlanData = window.floorPlanData;

function initFloorPlans() {
  window.switchPlan('type59A');
  const zoom = document.getElementById('plan-zoom');
  zoom.addEventListener('click', () => {
    const expanded = zoom.getAttribute('aria-pressed') !== 'true';
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.textContent = expanded ? '전체 보기' : '도면 확대';
    document.getElementById('plan-svg-container').classList.toggle('is-zoomed', expanded);
    document.getElementById('plan-zoom-help').textContent = expanded ? '도면을 좌우로 밀어 자세히 확인하세요.' : '전체 배치를 먼저 보고, 확대해서 방 이름을 확인하세요.';
  });
}

window.switchPlan = function(type) {
  const data = floorPlanData[type];
  if (!data) return;

  const tabs = document.querySelectorAll('.plan-tab');
  tabs.forEach(tab => {
    const selected = tab.id === `tab-${type}`;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });

  const badgeEl = document.getElementById('plan-badge');
  const ratioEl = document.getElementById('plan-ratio');
  const codeEl = document.getElementById('plan-code');
  const titleEl = document.getElementById('plan-title');
  const descEl = document.getElementById('plan-desc');
  const specOldEl = document.getElementById('plan-spec-old');
  const specNewEl = document.getElementById('plan-spec-new');
  const specIncreaseEl = document.getElementById('plan-spec-increase');
  const specBalconyEl = document.getElementById('plan-spec-balcony');
  const svgContainer = document.getElementById('plan-svg-container');
  const featuresList = document.getElementById('plan-features-list');

  if (badgeEl) badgeEl.textContent = data.badge;
  if (ratioEl) ratioEl.textContent = data.ratio;
  if (codeEl) codeEl.textContent = data.code;
  const layoutEl = document.getElementById('plan-layout');
  if (layoutEl) layoutEl.textContent = data.layout;
  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.desc;
  if (specOldEl) specOldEl.textContent = data.specOld;
  if (specNewEl) specNewEl.textContent = data.specNew;
  if (specIncreaseEl) specIncreaseEl.textContent = data.specIncrease;
  if (specBalconyEl) specBalconyEl.textContent = data.specBalcony;

  if (svgContainer) {
    svgContainer.innerHTML = data.svg;
    svgContainer.scrollLeft = 0;
  }

  if (featuresList) {
    featuresList.innerHTML = data.features.map(f => `
      <li class="flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm font-medium">
        <i data-lucide="check" class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0"></i>
        <span>${f}</span>
      </li>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
  }
};

/* ==========================================================================
   4. INTERACTIVE MAP & LOCATION FILTER (FIXED LAYOUT)
   ========================================================================== */
window.filterMap = function(category, e) {
  const filters = document.querySelectorAll('.map-filter');
  filters.forEach(btn => {
    btn.classList.remove('active', 'bg-slate-900', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-600');
    btn.setAttribute('aria-pressed', 'false');
  });

  const evt = e || window.event;
  const activeBtn = evt ? (evt.currentTarget || evt.target) : null;
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-slate-900', 'text-white');
    activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
    activeBtn.setAttribute('aria-pressed', 'true');
  }

  const points = document.querySelectorAll('.map-point');
  points.forEach(point => {
    if (category === 'all' || point.classList.contains(category)) {
      point.style.display = 'block'; // FIXED: was flex, preserving natural block card flow
    } else {
      point.style.display = 'none';
    }
  });
};

/* ==========================================================================
   5. SMART 59㎡ VALUE CALCULATOR
   ========================================================================== */
function initCalculator() {
  const mobilePrices = window.matchMedia('(max-width: 767px)');
  const disclosures = [...document.querySelectorAll('[data-price-disclosure]')];
  function setPriceLayout() {
    disclosures.forEach(detail => { detail.open = !mobilePrices.matches; });
  }
  setPriceLayout();
  mobilePrices.addEventListener('change', setPriceLayout);
  const ids = ['value-sale', 'value-old-area', 'value-new-area', 'value-premium'];
  const inputs = ids.map(id => document.getElementById(id));
  const presets = [...document.querySelectorAll('[data-premium]')];
  const update = () => {
    for (const [input, output] of [[inputs[1], 'old-area-metric'], [inputs[2], 'new-area-metric']]) {
      document.getElementById(output).textContent = input.value && input.checkValidity() ? `약 ${(input.valueAsNumber * 3.305785).toFixed(1)}㎡ · 공급면적` : '';
    }
    const valid = inputs.every(input => input.value !== '' && input.checkValidity());
    document.getElementById('value-error').hidden = valid;
    inputs.forEach(input => input.setAttribute('aria-invalid', String(input.value === '' || !input.checkValidity())));
    presets.forEach(button => {
      const selected = inputs[3].value !== '' && Number(button.dataset.premium) === inputs[3].valueAsNumber;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
    if (!valid) {
      document.getElementById('value-assumptions').textContent = '입력값을 확인해 주세요.';
      for (const id of ['res-value','res-base-unit','res-new-unit','res-supply','value-formula']) document.getElementById(id).textContent = '—';
      return;
    }
    const [sale, oldArea, newArea, premium] = inputs.map(input => input.valueAsNumber);
    document.getElementById('value-assumptions').textContent = `${sale}억 · ${oldArea}평 → ${newArea}평 · ${premium > 0 ? '+' : ''}${premium}%`;
    const base = sale / oldArea * 10000, next = base * (1 + premium / 100);
    const money = value => Math.round(value).toLocaleString('ko-KR') + '만원';
    document.getElementById('res-value').textContent = (next * newArea / 10000).toFixed(2) + '억원';
    document.getElementById('res-base-unit').textContent = money(base);
    document.getElementById('res-new-unit').textContent = money(next);
    document.getElementById('res-supply').textContent = newArea + '평';
    document.getElementById('value-formula').textContent = `${sale}억 ÷ ${oldArea}평 × ${newArea}평 × ${(1 + premium / 100).toFixed(2)}`;
  };
  inputs.forEach(input => input.addEventListener('input', update));
  presets.forEach(button => button.addEventListener('click', () => { inputs[3].value = button.dataset.premium; update(); }));
  document.getElementById('value-reset').addEventListener('click', () => {
    inputs.forEach(input => { input.value = input.defaultValue; });
    update();
  });
  update();
}

/* ==========================================================================
   6. LIGHTBOX MODAL VIEWER
   ========================================================================== */
let lightboxTrigger = null;
let previousBodyOverflow = '';

function restoreLightboxState() {
  if (!lightboxTrigger || document.getElementById('lightboxModal').open) return;
  document.body.style.overflow = previousBodyOverflow;
  const trigger = lightboxTrigger;
  lightboxTrigger = null;
  trigger.focus({ preventScroll: true });
}

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;
  document.querySelectorAll('#gallery [onclick]').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', () => card.focus({ preventScroll: true }), { capture: true });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });
  modal.addEventListener('close', restoreLightboxState);
  modal.addEventListener('cancel', event => {
    event.preventDefault();
    window.closeLightbox();
  });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button, a[href], [tabindex="0"]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  modal.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
      window.closeLightbox();
    }
  });
}

window.openLightbox = function(src, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');

  if (!modal || !modalImg) return;

  modalImg.src = src;
  modalImg.alt = title || '더샵 파크에비뉴 138';
  if (modalTitle) modalTitle.textContent = title || '더샵 파크에비뉴 138';
  if (modalDesc) modalDesc.textContent = desc || '';

  if (modal.open) return;
  lightboxTrigger = document.activeElement;
  previousBodyOverflow = document.body.style.overflow;
  modal.showModal();
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (!modal || !modal.open) return;

  modal.close();
  // The native close event is queued; restore before another image can open.
  restoreLightboxState();
};


// Keep frequently used sections within thumb reach on long mobile pages.
function initQuickNavigation() {
  const nav = document.querySelector('.mobile-quick-nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('body > section[id]')];
  let scheduled = false;
  function update() {
    scheduled = false;
    const line = document.getElementById('main-header').getBoundingClientRect().bottom + 100;
    let current = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) current = '#' + section.id;
    }
    for (const link of links) {
      if (link.hash === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  // Avoid covering fields or results while a phone keyboard is open.
  document.addEventListener('focusin', event => {
    if (event.target.matches('input, textarea, select')) nav.classList.add('keyboard-open');
  });
  document.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      nav.classList.toggle('keyboard-open', document.activeElement.matches('input, textarea, select'));
    });
  });
  update();
}

/* ==========================================================================
   8. PERSISTENT JOURNEY INDICATOR (Story → Plan → Tour → Value)
   ========================================================================== */
function initJourneyIndicator() {
  const indicator = document.getElementById('journey-indicator');
  if (!indicator) return;

  const steps = [...indicator.querySelectorAll('.journey-step')];
  const sectionIds = ['transformation', 'floorplans', 'apartment-tour', 'calculator'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  let scheduled = false;
  function update() {
    scheduled = false;
    const header = document.getElementById('main-header');
    const line = (header ? header.getBoundingClientRect().bottom : 80) + 120;
    let currentId = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) {
        currentId = section.id;
      }
    }

    steps.forEach(step => {
      const target = step.getAttribute('data-step');
      const isActive = target === currentId;
      step.classList.toggle('active', isActive);
      step.setAttribute('aria-current', isActive ? 'step' : 'false');
    });
  }

  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ==========================================================================
   9. ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        obs.unobserve(el);
        const target = parseFloat(el.getAttribute('data-counter'));
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        if (isNaN(target)) return;

        if (reducedMotion) {
          el.textContent = target.toFixed(decimals);
          return;
        }

        const duration = 1200;
        const start = performance.now();
        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out expo
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = target * ease;
          el.textContent = current.toFixed(decimals);
          if (progress < 1) {
            requestAnimationFrame(frame);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }
        requestAnimationFrame(frame);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(c => observer.observe(c));
}

/* ==========================================================================
   10. SLOW CINEMATIC HERO PARALLAX
   ========================================================================== */
function initHeroParallax() {
  const heroImg = document.querySelector('#hero img');
  if (!heroImg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          heroImg.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
        }
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   11. LUXURY SMOOTH SCROLL NAVIGATION
   ========================================================================== */
function initSmoothScroll() {
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.length <= 1) return;

    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();

    const header = document.getElementById('main-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 80;
    const offset = Math.max(headerHeight + 16, 96);
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });

    if (history.pushState) {
      history.pushState(null, '', href);
    }
  });
}


