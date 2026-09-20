/**
 * THE SHARP PARK AVENUE 138 // NEXT-GEN CYBERNETIC ARCHITECTURE
 * Interactive Application Engine (Tesla Robotics x GPT Astra Paradigm)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Init Components
  initAmbientLight();
  initCardGlow();
  initMobileMenu();
  initHeaderScroll();
  initComparisonSlider();
  initFloorPlans();
  initCalculator();
});

/* ==========================================================================
   0. AMBIENT CURSOR LIGHT & CARD SPOTLIGHT (ASTRA / TESLA AESTHETIC)
   ========================================================================== */
function initAmbientLight() {
  let glow = document.getElementById('ambient-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'ambient-glow';
    document.body.appendChild(glow);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderLight() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderLight);
  }
  requestAnimationFrame(renderLight);
}

function initCardGlow() {
  const cards = document.querySelectorAll('.cyber-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

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
      header.classList.add('shadow-2xl', 'bg-[#020408]/95', 'border-cyan-500/20');
      header.classList.remove('bg-[#020408]/80', 'border-white/10');
    } else {
      header.classList.remove('shadow-2xl', 'bg-[#020408]/95', 'border-cyan-500/20');
      header.classList.add('bg-[#020408]/80', 'border-white/10');
    }
  });
}

/* ==========================================================================
   2. BEFORE & AFTER INTERACTIVE LASER SCANNER SLIDER
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

    if (x < rect.width * 0.05) x = rect.width * 0.05;
    if (x > rect.width * 0.95) x = rect.width * 0.95;

    const percentage = (x / rect.width) * 100;
    beforeWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;

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

  syncBeforeImageWidth();
  window.addEventListener('resize', syncBeforeImageWidth);

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
   3. HOLOGRAPHIC BLUEPRINT CAD (59㎡ FLOOR PLAN ENGINE)
   ========================================================================== */
const floorPlanData = {
  type59A: {
    badge: '3Bay 맞통풍 판상형 시그니처',
    ratio: '전용률 78.8%',
    code: 'POSCO THE SHARP 59A // CAD BLUEPRINT V2.4',
    title: '59㎡ A-TYPE (3Bay 맞통풍 판상형)',
    desc: '초원세경 709세대 전 조합원을 위한 주력 평면. 1996년 2Bay 복도식 구조에서 침실 3개, 욕실 2개, 안방 워크인 드레스룸 및 파우더룸을 갖춘 최신 3Bay 계단식 맞통풍 판상형으로 완벽 탈바꿈합니다.',
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
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#040914" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.8"/>
        <rect x="22" y="22" width="376" height="35" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="210" y="44" class="blueprint-text" fill="#34d399">발코니 서비스 면적 확장 구간 (+21.5㎡ 실사용 확보)</text>
        
        <rect x="25" y="60" width="100" height="150" class="blueprint-room" />
        <text x="75" y="125" class="blueprint-text">침실 2 (자녀방)</text>
        <text x="75" y="142" class="blueprint-area">3.0m x 3.3m</text>

        <rect x="130" y="60" width="155" height="150" class="blueprint-room" />
        <text x="207" y="125" class="blueprint-text">거 실 (3.8m 광폭)</text>
        <text x="207" y="142" class="blueprint-area">LIVING ROOM // 3-BAY AIRFLOW</text>

        <rect x="290" y="60" width="105" height="150" class="blueprint-room" />
        <text x="342" y="125" class="blueprint-text">침실 1 (안방)</text>
        <text x="342" y="142" class="blueprint-area">MASTER BEDROOM</text>
        
        <rect x="290" y="60" width="105" height="45" fill="rgba(0, 240, 255, 0.1)" stroke="#00f0ff" stroke-width="1"/>
        <text x="342" y="85" class="blueprint-text" fill="#00f0ff">드레스룸 / 부부욕실</text>

        <rect x="25" y="215" width="100" height="60" class="blueprint-room" />
        <text x="75" y="245" class="blueprint-text">침실 3 (서재/다목적)</text>

        <rect x="130" y="215" width="95" height="60" class="blueprint-room" />
        <text x="177" y="245" class="blueprint-text">주방 / 식당 (ㄷ자형)</text>
        <text x="177" y="260" class="blueprint-area">대면형 아일랜드</text>

        <rect x="230" y="215" width="55" height="60" class="blueprint-room" />
        <text x="257" y="245" class="blueprint-text">욕실 2 (욕조)</text>
        
        <rect x="290" y="215" width="105" height="60" fill="rgba(255,255,255,0.06)" stroke="#38bdf8" stroke-width="1"/>
        <text x="342" y="245" class="blueprint-text" fill="#38bdf8">현관 / 클린팬트리</text>
      </svg>
    `
  },
  type59B: {
    badge: '와이드 거실 & LDK 오픈 다이닝 특화',
    ratio: '전용률 78.5%',
    code: 'POSCO THE SHARP 59B // CAD BLUEPRINT V2.4',
    title: '59㎡ B-TYPE (와이드 거실 특화형)',
    desc: '거실과 주방의 개방감을 극대화한 젊은 감각의 59㎡ 혁신 평면. 4.2m 광폭 거실과 대형 아일랜드 식탁, 대용량 수납 팬트리를 배치하여 30평형대 이상의 압도적인 공간감을 실현했습니다.',
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
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#040914" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.8"/>
        <rect x="22" y="22" width="376" height="35" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="210" y="44" class="blueprint-text" fill="#34d399">와이드 발코니 확장 구간 (+21.5㎡)</text>

        <rect x="25" y="60" width="220" height="150" class="blueprint-room" />
        <text x="135" y="125" class="blueprint-text">4.2m 와이드 파노라마 거실</text>
        <text x="135" y="142" class="blueprint-area">OPEN LIVING // 30평형급 공간감</text>

        <rect x="250" y="60" width="145" height="150" class="blueprint-room" />
        <text x="322" y="125" class="blueprint-text">침실 1 (안방)</text>
        <text x="322" y="142" class="blueprint-area">MASTER BEDROOM</text>
        
        <rect x="250" y="60" width="145" height="45" fill="rgba(0, 240, 255, 0.1)" stroke="#00f0ff" stroke-width="1"/>
        <text x="322" y="85" class="blueprint-text" fill="#00f0ff">초대형 드레스룸 & 부부욕실</text>

        <rect x="25" y="215" width="125" height="60" class="blueprint-room" />
        <text x="87" y="245" class="blueprint-text">대형 아일랜드 다이닝</text>

        <rect x="155" y="215" width="90" height="60" class="blueprint-room" />
        <text x="200" y="245" class="blueprint-text">침실 2</text>

        <rect x="250" y="215" width="65" height="60" class="blueprint-room" />
        <text x="282" y="245" class="blueprint-text">공용욕실</text>

        <rect x="320" y="215" width="75" height="60" fill="rgba(255,255,255,0.06)" stroke="#38bdf8" stroke-width="1"/>
        <text x="357" y="245" class="blueprint-text" fill="#38bdf8">현관/팬트리</text>
      </svg>
    `
  },
  type49old: {
    badge: '1996년 기존 초원세경 49㎡ 복도식 구조',
    ratio: '전용률 72.1%',
    code: 'LEGACY CHASSIS 49 TYPE (1996 OBSOLETE)',
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
      <svg viewBox="0 0 420 300" class="w-full h-auto drop-shadow-2xl opacity-75" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="380" height="260" rx="6" fill="#120c14" stroke="#f43f5e" stroke-width="1.5"/>
        
        <rect x="22" y="22" width="376" height="30" fill="rgba(244,63,94,0.12)" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="210" y="40" class="blueprint-text" fill="#fb7185">공용 복도 (통행 소음 노출 및 사생활 간섭)</text>

        <rect x="25" y="55" width="180" height="155" fill="rgba(255,255,255,0.03)" stroke="#475569" stroke-width="1"/>
        <text x="115" y="130" class="blueprint-text" fill="#94a3b8">거실 겸 침실 (2Bay)</text>
        <text x="115" y="148" class="blueprint-area">공간 분리 미흡</text>

        <rect x="210" y="55" width="185" height="155" fill="rgba(255,255,255,0.03)" stroke="#475569" stroke-width="1"/>
        <text x="302" y="130" class="blueprint-text" fill="#94a3b8">안방 (침실)</text>
        <text x="302" y="148" class="blueprint-area">드레스룸 없음</text>

        <rect x="25" y="215" width="200" height="60" fill="rgba(255,255,255,0.03)" stroke="#475569" stroke-width="1"/>
        <text x="125" y="245" class="blueprint-text" fill="#94a3b8">일자형 주방 / 현관</text>

        <rect x="230" y="215" width="165" height="60" fill="rgba(244,63,94,0.1)" stroke="#f43f5e" stroke-width="1"/>
        <text x="312" y="245" class="blueprint-text" fill="#fb7185">욕실 단 1개 (비좁음)</text>
      </svg>
    `
  }
};

function initFloorPlans() {
  window.switchPlan('type59A');
}

window.switchPlan = function(type) {
  const data = floorPlanData[type];
  if (!data) return;

  const tabs = document.querySelectorAll('.plan-tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  const activeTab = document.getElementById(`tab-${type}`);
  if (activeTab) {
    activeTab.classList.add('active');
  }

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
  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.desc;
  if (specOldEl) specOldEl.textContent = data.specOld;
  if (specNewEl) specNewEl.textContent = data.specNew;
  if (specIncreaseEl) specIncreaseEl.textContent = data.specIncrease;
  if (specBalconyEl) specBalconyEl.textContent = data.specBalcony;

  if (svgContainer) {
    svgContainer.innerHTML = data.svg;
  }

  if (featuresList) {
    featuresList.innerHTML = data.features.map(f => `
      <li class="flex items-start gap-2 text-slate-300 text-xs sm:text-sm font-mono-tech">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0"></i>
        <span>${f}</span>
      </li>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
  }
};

/* ==========================================================================
   4. INTERACTIVE MAP FILTER
   ========================================================================== */
window.filterMap = function(category, e) {
  const filters = document.querySelectorAll('.map-filter');
  filters.forEach(btn => {
    btn.classList.remove('active', 'bg-cyan-400', 'text-slate-950', 'font-bold');
    btn.classList.add('bg-white/5', 'text-slate-400');
  });

  const evt = e || window.event;
  const activeBtn = evt ? (evt.currentTarget || evt.target) : null;
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-cyan-400', 'text-slate-950', 'font-bold');
    activeBtn.classList.remove('bg-white/5', 'text-slate-400');
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
   5. RESIDENTIAL VALUATION TERMINAL (59㎡ 단일 평형 전용)
   ========================================================================== */
let calcState = {
  type: '59A',
  balcony: 'expanded',
  floor: 'royal'
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
   6. LIGHTBOX MODAL VIEWER
   ========================================================================== */
window.openLightbox = function(src, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');

  if (!modal || !modalImg) return;

  modalImg.src = src;
  if (modalTitle) modalTitle.textContent = title || '더샵 파크에비뉴 138';
  if (modalDesc) modalDesc.textContent = desc || '';

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  document.body.style.overflow = '';
};

// Keyboard escape to close modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});
