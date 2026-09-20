/**
 * THE SHARP PARK AVENUE 138 (초원세경 리모델링)
 * Interactive Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Init Components
  initMobileMenu();
  initHeaderScroll();
  initComparisonSlider();
  initFloorPlans();
  initCalculator();
});

/* ==========================================================================
   1. MOBILE MENU & HEADER SCROLL
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('shadow-xl', 'bg-brand-dark/95');
      header.classList.remove('bg-brand-dark/85');
    } else {
      header.classList.remove('shadow-xl');
      header.classList.add('bg-brand-dark/85');
    }
  });
}

/* ==========================================================================
   2. BEFORE & AFTER INTERACTIVE SLIDER
   ========================================================================== */
function initComparisonSlider() {
  const container = document.getElementById('comparison-container');
  const beforeWrapper = document.getElementById('before-wrapper');
  const handle = document.getElementById('slider-handle');

  if (!container || !beforeWrapper || !handle) return;

  let isDragging = false;

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

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;

    // Constrain within container bounds (5% to 95% for nice visuals)
    if (x < rect.width * 0.05) x = rect.width * 0.05;
    if (x > rect.width * 0.95) x = rect.width * 0.95;

    const percentage = (x / rect.width) * 100;
    beforeWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;

    // Smoothly handle badge visibility near extreme edges without shrinking text
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

    syncBeforeImageWidth();
  }

  // Initial image width calibration
  syncBeforeImageWidth();
  window.addEventListener('resize', syncBeforeImageWidth);

  // Pointer / Mouse Events
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Events for Mobile / Tablet
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length === 0) return;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* ==========================================================================
   3. FLOOR PLAN DATA & DYNAMIC SVG RENDERING
   ========================================================================== */
const floorPlanData = {
  type59A: {
    badge: '3Bay 맞통풍 판상형 시그니처',
    ratio: '전용률 78.8%',
    code: 'THE SHARP 59A SIGNATURE UNIT',
    title: '59㎡ A-TYPE (3Bay 판상형)',
    desc: '초원세경 709세대 전 조합원을 위한 주력 평면! 1996년 2Bay 복도식 구조에서 침실 3개, 욕실 2개, 안방 워크인 드레스룸 및 파우더룸을 갖춘 최신 3Bay 계단식 맞통풍 판상형으로 완벽 탈바꿈합니다.',
    specOld: '기존 전용 49.68㎡ (공급 19평형, 2Bay 복도식)',
    specNew: '리모델링 후 전용 59.90㎡ (공급 25평형, 계단식)',
    specIncrease: '+10.22㎡ (전용 순증가 + 발코니 확장 시 총 81.4㎡)',
    specBalcony: '서비스 발코니 확장 약 +21.5㎡ (실사용 81.4㎡ / 25평형 실공간)',
    features: [
      '소음 없는 100% 계단식 설계 (1개 층 2세대 프라이빗 엘리베이터 홀)',
      '전면 3Bay 채광 극대화 & 주방-거실 맞통풍 환기 구조',
      '안방 부부욕실 + 워크인 드레스룸 + 파우더룸 독립 설계',
      '주방 ㄷ자형 아일랜드 대면형 싱크 & 현관 클린 팬트리'
    ],
    svg: `
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Boundaries -->
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#0c1829" stroke="#d4af37" stroke-width="2"/>
        
        <!-- Expanded Balcony Extension Marker (Top/Bottom) -->
        <rect x="22" y="22" width="376" height="35" fill="rgba(0,168,132,0.15)" stroke="#00a884" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="210" y="44" class="blueprint-text" fill="#2dd4bf">발코니 서비스 면적 확장 구간 (+21.5㎡ 실사용 공간 확보)</text>
        
        <!-- 3-Bay Front: Bedroom 2, Living, Master -->
        <rect x="25" y="60" width="100" height="150" class="blueprint-room" />
        <text x="75" y="125" class="blueprint-text">침실 2 (자녀방)</text>
        <text x="75" y="142" class="blueprint-area">3.0m x 3.3m</text>

        <!-- Main Living Room (Center) -->
        <rect x="130" y="60" width="155" height="150" class="blueprint-room" />
        <text x="207" y="125" class="blueprint-text">거 실 (3.8m 광폭)</text>
        <text x="207" y="142" class="blueprint-area">LIVING ROOM (맞통풍)</text>

        <!-- Master Bedroom (Right) -->
        <rect x="290" y="60" width="105" height="150" class="blueprint-room" />
        <text x="342" y="125" class="blueprint-text">침실 1 (안방)</text>
        <text x="342" y="142" class="blueprint-area">MASTER BEDROOM</text>
        
        <!-- Walk-in Dressroom & Master Bath inside Master (Top Right) -->
        <rect x="290" y="60" width="105" height="45" fill="rgba(212,175,55,0.12)" stroke="#d4af37" stroke-width="1"/>
        <text x="342" y="85" class="blueprint-text" fill="#d4af37">드레스룸 / 부부욕실</text>

        <!-- Back row: Bedroom 3, Kitchen, Common Bath, Entry -->
        <rect x="25" y="215" width="100" height="60" class="blueprint-room" />
        <text x="75" y="245" class="blueprint-text">침실 3 (서재/다목적)</text>

        <!-- Kitchen & Dining (Center Bottom) -->
        <rect x="130" y="215" width="95" height="60" class="blueprint-room" />
        <text x="177" y="245" class="blueprint-text">주방 / 식당 (ㄷ자형)</text>
        <text x="177" y="260" class="blueprint-area">대면형 아일랜드</text>

        <!-- Common Bath -->
        <rect x="230" y="215" width="55" height="60" class="blueprint-room" />
        <text x="257" y="245" class="blueprint-text">욕실 2 (욕조)</text>
        
        <!-- Entrance & Pantry -->
        <rect x="290" y="215" width="105" height="60" fill="rgba(255,255,255,0.08)" stroke="#475569" stroke-width="1"/>
        <text x="342" y="245" class="blueprint-text">현관 / 클린팬트리</text>
      </svg>
    `
  },
  type59B: {
    badge: '와이드 거실 & LDK 오픈 다이닝 특화',
    ratio: '전용률 78.5%',
    code: 'THE SHARP 59B OPEN LIVING',
    title: '59㎡ B-TYPE (와이드 거실 특화형)',
    desc: '거실과 주방의 개방감을 극대화한 젊은 감각의 59㎡ 혁신 평면! 4.2m 광폭 거실과 대형 아일랜드 식탁, 대용량 수납 팬트리를 배치하여 30평형대 이상의 공간감을 실현했습니다.',
    specOld: '기존 전용 49.68㎡ (공급 19평형, 2Bay 복도식)',
    specNew: '리모델링 후 전용 59.90㎡ (공급 25평형, 계단식)',
    specIncrease: '+10.22㎡ (전용 순증가 + 발코니 확장 시 총 81.4㎡)',
    specBalcony: '서비스 발코니 확장 약 +21.5㎡ (실사용 81.4㎡ / 25평형 실공간)',
    features: [
      '4.2m 광폭 거실로 확 트인 중앙공원 조망권 극대화',
      '거실-주방이 하나로 이어지는 LDK 일체형 개방형 구조',
      '안방 대형 워크인 드레스룸 및 호텔식 독립 세면대',
      '현관 에어샤워 & 워크인 대형 팬트리 수납 무상 제공'
    ],
    svg: `
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#0c1829" stroke="#d4af37" stroke-width="2"/>
        <rect x="22" y="22" width="376" height="35" fill="rgba(0,168,132,0.15)" stroke="#00a884" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="210" y="44" class="blueprint-text" fill="#2dd4bf">와이드 발코니 확장 구간 (+21.5㎡)</text>

        <!-- Wide Living Room (4.2m) -->
        <rect x="25" y="60" width="220" height="150" class="blueprint-room" />
        <text x="135" y="125" class="blueprint-text">4.2m 와이드 파노라마 거실</text>
        <text x="135" y="142" class="blueprint-area">OPEN LIVING (30평형급 공간감)</text>

        <!-- Master Bedroom (Right) -->
        <rect x="250" y="60" width="145" height="150" class="blueprint-room" />
        <text x="322" y="125" class="blueprint-text">침실 1 (안방)</text>
        <text x="322" y="142" class="blueprint-area">MASTER BEDROOM</text>
        
        <rect x="250" y="60" width="145" height="45" fill="rgba(212,175,55,0.12)" stroke="#d4af37" stroke-width="1"/>
        <text x="322" y="85" class="blueprint-text" fill="#d4af37">초대형 드레스룸 & 부부욕실</text>

        <!-- Kitchen & Dining (Left Bottom) -->
        <rect x="25" y="215" width="125" height="60" class="blueprint-room" />
        <text x="87" y="245" class="blueprint-text">대형 아일랜드 다이닝</text>

        <!-- Bedroom 2 (Center Bottom) -->
        <rect x="155" y="215" width="90" height="60" class="blueprint-room" />
        <text x="200" y="245" class="blueprint-text">침실 2</text>

        <!-- Common Bath -->
        <rect x="250" y="215" width="65" height="60" class="blueprint-room" />
        <text x="282" y="245" class="blueprint-text">공용욕실</text>

        <!-- Entrance & Pantry -->
        <rect x="320" y="215" width="75" height="60" fill="rgba(255,255,255,0.08)" stroke="#475569" stroke-width="1"/>
        <text x="357" y="245" class="blueprint-text">현관/팬트리</text>
      </svg>
    `
  },
  type49old: {
    badge: '1996년 기존 초원세경 49㎡ 복도식 구조',
    ratio: '전용률 72.1%',
    code: 'CURRENT OLD 49 TYPE (BEFORE)',
    title: '기존 49.68㎡ 복도식 구조 (1996년 준공)',
    desc: '30년 전 시공된 전형적인 복도식 소형 평면. 욕실이 1개뿐이며, 복도 창문으로 인한 프라이버시 침해와 소음, 좁은 주방 및 수납 부족의 한계를 안고 있었습니다.',
    specOld: '현재 전용면적 49.68㎡ (공급 19평형)',
    specNew: '리모델링 전 기존 상태',
    specIncrease: '복도식 2Bay 구조 (개선 시급)',
    specBalcony: '노후 비확장 단일 발코니 (약 6.5㎡)',
    features: [
      '외부 복도로 사람 통행 소음 및 겨울철 외풍 노출',
      '단 1개의 욕실로 아침 출근·등교 시간 혼잡',
      '드레스룸 및 수납공간 부재로 방 하나를 옷방으로 낭비',
      '주방과 거실의 구분이 모호한 일자형 좁은 조리 공간'
    ],
    svg: `
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-lg opacity-80" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#151b26" stroke="#ef4444" stroke-width="2"/>
        
        <!-- Outside Corridor (Top) -->
        <rect x="22" y="22" width="376" height="30" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="210" y="40" class="blueprint-text" fill="#f87171">공용 복도 (통행 소음 노출 및 사생활 간섭)</text>

        <!-- Old Living / Room 1 -->
        <rect x="25" y="55" width="180" height="155" fill="rgba(255,255,255,0.03)" stroke="#64748b" stroke-width="1"/>
        <text x="115" y="130" class="blueprint-text" fill="#94a3b8">거실 겸 침실 (2Bay)</text>
        <text x="115" y="148" class="blueprint-area">공간 분리 미흡</text>

        <!-- Old Master Bedroom -->
        <rect x="210" y="55" width="185" height="155" fill="rgba(255,255,255,0.03)" stroke="#64748b" stroke-width="1"/>
        <text x="302" y="130" class="blueprint-text" fill="#94a3b8">안방 (침실)</text>
        <text x="302" y="148" class="blueprint-area">드레스룸 없음</text>

        <!-- Old Kitchen (Narrow) -->
        <rect x="25" y="215" width="180" height="60" fill="rgba(255,255,255,0.03)" stroke="#64748b" stroke-width="1"/>
        <text x="115" y="245" class="blueprint-text" fill="#94a3b8">좁은 일자형 주방 / 현관</text>

        <!-- Single Bathroom -->
        <rect x="210" y="215" width="185" height="60" fill="rgba(239,68,68,0.08)" stroke="#ef4444" stroke-width="1"/>
        <text x="302" y="245" class="blueprint-text" fill="#f87171">단일 욕실 1개 (비좁은 세탁공간)</text>
      </svg>
    `
  }
};

function initFloorPlans() {
  selectFloorPlan('type59A');
}

window.selectFloorPlan = function(type) {
  const data = floorPlanData[type];
  if (!data) return;

  // Tabs style update
  document.querySelectorAll('.plan-tab').forEach(btn => {
    btn.classList.remove('active', 'bg-brand-gold', 'text-brand-dark');
    btn.classList.add('bg-brand-card/50', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`tab-${type}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-brand-gold', 'text-brand-dark');
    activeBtn.classList.remove('bg-brand-card/50', 'text-slate-300');
  }

  // Update DOM details
  const badge = document.getElementById('plan-badge');
  const code = document.getElementById('plan-code');
  const title = document.getElementById('plan-title');
  const desc = document.getElementById('plan-desc');
  const specOld = document.getElementById('spec-old');
  const specNew = document.getElementById('spec-new');
  const specIncrease = document.getElementById('spec-increase');
  const specBalcony = document.getElementById('spec-balcony');
  const graphic = document.getElementById('floorplan-graphic');
  const featuresList = document.getElementById('plan-features');

  if (badge) badge.textContent = data.badge;
  if (code) code.textContent = data.code;
  if (title) title.textContent = data.title;
  if (desc) desc.textContent = data.desc;
  if (specOld) specOld.textContent = data.specOld;
  if (specNew) specNew.textContent = data.specNew;
  if (specIncrease) specIncrease.textContent = data.specIncrease;
  if (specBalcony) specBalcony.textContent = data.specBalcony;
  if (graphic) graphic.innerHTML = data.svg;

  if (featuresList) {
    featuresList.innerHTML = data.features.map(f => `
      <li class="flex items-center gap-2">
        <i data-lucide="check-circle" class="w-4 h-4 text-brand-tealLight shrink-0"></i>
        <span>${f}</span>
      </li>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
  }
};


/* ==========================================================================
   5. INTERACTIVE MAP FILTER
   ========================================================================== */
window.filterMap = function(category, e) {
  const filters = document.querySelectorAll('.map-filter');
  filters.forEach(btn => {
    btn.classList.remove('active', 'bg-brand-gold', 'text-brand-dark', 'font-bold');
    btn.classList.add('bg-white/10', 'text-slate-300');
  });

  const evt = e || window.event;
  const activeBtn = evt ? (evt.currentTarget || evt.target) : null;
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-brand-gold', 'text-brand-dark', 'font-bold');
    activeBtn.classList.remove('bg-white/10', 'text-slate-300');
  }

  const points = document.querySelectorAll('.map-point');
  points.forEach(point => {
    if (category === 'all' || point.classList.contains(category)) {
      point.style.display = 'flex';
    } else {
      point.style.display = 'none';
    }
  });
};

/* ==========================================================================
   6. SMART VALUE & EXPANSION CALCULATOR (전용 59㎡ 단일 평형 전용)
   ========================================================================== */
let calcState = {
  type: '59A',          // '59A' (3Bay 판상형) or '59B' (와이드 거실형)
  balcony: 'expanded',  // 'expanded' (+21.5㎡) or 'standard' (0㎡)
  floor: 'royal'        // 'royal' (로얄층 10~25F) or 'mid' (중저층 2~9F)
};

function initCalculator() {
  updateCalculatorResult();
}

window.setCalcPlanType = function(type) {
  calcState.type = type;
  document.querySelectorAll('.calc-type-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`calc-type-${type}`);
  if (btn) btn.classList.add('active');
  updateCalculatorResult();
};

window.setCalcBalcony = function(mode) {
  calcState.balcony = mode;
  document.querySelectorAll('.calc-balcony-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`calc-balcony-${mode}`);
  if (btn) btn.classList.add('active');
  updateCalculatorResult();
};

window.setCalcFloor = function(tier) {
  calcState.floor = tier;
  document.querySelectorAll('.calc-floor-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`calc-floor-${tier}`);
  if (btn) btn.classList.add('active');
  updateCalculatorResult();
};

function updateCalculatorResult() {
  const currentArea = 49.68;
  const newArea = 59.90;
  const diffArea = (newArea - currentArea).toFixed(2);
  const diffPyung = (diffArea / 3.30578).toFixed(1);

  const balconyArea = calcState.balcony === 'expanded' ? 21.50 : 0.00;
  const totalUsable = (newArea + balconyArea).toFixed(2);
  const totalUsablePyung = (totalUsable / 3.30578).toFixed(1);

  let planDesc = '3Bay 맞통풍 판상형 (침실3/욕실2/안방 드레스룸)';
  if (calcState.type === '59B') {
    planDesc = '4.2m 와이드 거실 & LDK 대면형 다이닝 특화';
  }

  let valueDesc = '평촌 신축 25평형 최고 시세(평당 3,800만~4,200만원대 형성 예상)';
  if (calcState.floor === 'royal') {
    valueDesc = '25층 최고층 & 중앙공원 파노라마 조망 프리미엄 반영 최고가 형성';
  }

  const resAreaDiff = document.getElementById('res-area-diff');
  const resBalconyDiff = document.getElementById('res-balcony-diff');
  const resUsable = document.getElementById('res-usable');
  const resValue = document.getElementById('res-value');
  const resPlanType = document.getElementById('res-plan-type');

  if (resAreaDiff) resAreaDiff.textContent = `+${diffArea} ㎡ (+${diffPyung}평 순증가)`;
  if (resBalconyDiff) resBalconyDiff.textContent = calcState.balcony === 'expanded' ? '+21.50 ㎡ (전면 서비스 확장)' : '0.00 ㎡ (비확장 기본형)';
  if (resUsable) resUsable.textContent = `약 ${totalUsable} ㎡ (${totalUsablePyung}평형 체감 공간)`;
  if (resValue) resValue.textContent = valueDesc;
  if (resPlanType) resPlanType.textContent = planDesc;
}

/* ==========================================================================
   7. FAQ ACCORDION
   ========================================================================== */
window.toggleFaq = function(button) {
  const item = button.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const icon = button.querySelector('i');

  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  } else {
    answer.classList.add('hidden');
    if (icon) icon.style.transform = 'rotate(0deg)';
  }
};

/* ==========================================================================
   8. MODALS & IMAGE LIGHTBOX
   ========================================================================== */
window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
};

window.openLightbox = function(imgSrc, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  const downloadLink = document.getElementById('lightbox-download');

  if (!modal || !img) return;

  img.src = imgSrc;
  if (titleEl) titleEl.textContent = title || '더샵 파크에비뉴 138 공식 이미지';
  if (descEl) descEl.textContent = desc || '';
  if (downloadLink) {
    downloadLink.href = imgSrc;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeLightbox = function(e) {
  if (e && e.target && e.target.id !== 'lightboxModal' && !e.target.closest('button')) {
    return;
  }
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeLightbox();
  }
});

function showToast(title, desc) {
  const toast = document.getElementById('toast');
  const tTitle = document.getElementById('toast-title');
  const tDesc = document.getElementById('toast-desc');

  if (!toast) return;

  if (tTitle) tTitle.textContent = title;
  if (tDesc) tDesc.textContent = desc;

  toast.classList.remove('hidden');
  toast.classList.add('flex');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 4500);
}
