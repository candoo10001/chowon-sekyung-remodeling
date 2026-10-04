(() => {
  const shell = document.getElementById('tour-shell');
  if (!shell) return;
  const byId = id => document.getElementById(id);
  let tour = null, loading = false, mode = 'overview', room = 'living', palette = 'warm';
  let timer = null, inView = true, attempts = 0;
  const roomOrder = [...shell.querySelectorAll('[data-room]')].map(button => button.dataset.room);
  function showStage() {
    if (window.innerWidth < 1024) byId('tour-stage').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  function stopGuide() {
    clearInterval(timer); timer = null;
    byId('tour-guide').setAttribute('aria-pressed', 'false');
    byId('tour-guide').textContent = '▷ 자동으로 둘러보기';
    byId('tour-guide-status').textContent = '공간을 선택하면 해당 위치로 이동합니다.';
  }
  function updateView() {
    byId('tour-mode-overview').setAttribute('aria-pressed', String(mode === 'overview'));
    byId('tour-mode-interior').setAttribute('aria-pressed', String(mode === 'interior'));
    shell.querySelectorAll('[data-room]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.room === room)));
    const data = tour.rooms[room];
    byId('tour-room-kicker').textContent = data.kicker;
    byId('tour-room-title').textContent = data.title;
    byId('tour-room-description').textContent = data.description;
    byId('tour-view-name').textContent = mode === 'overview' ? '전체 모형' : data.name;
    byId('tour-view-detail').textContent = mode === 'overview' ? '공용 코어를 제외한 수평증축 검토안 · 미확정' : '가상 인테리어 · 창밖 풍경은 실제 조망 아님';
    byId('tour-instructions').textContent = mode === 'overview' ? '드래그: 회전 · 두 손가락: 확대/축소 · 방을 선택하면 실내로 이동' : '드래그: 시선 이동 · 다른 방은 공간 버튼으로 선택 · 화면 밖에서 페이지 스크롤';
    tour.setView(mode, room);
  }
  function fail() {
    stopGuide(); loading = false;
    if (tour) { tour.dispose(); tour = null; }
    byId('tour-canvas-host').replaceChildren();
    shell.dataset.state = 'error';
    byId('tour-start-overlay').hidden = false; byId('tour-poster').hidden = false; byId('tour-view-caption').hidden = true;
    byId('tour-load-message').textContent = '3D 화면을 열지 못했습니다. 브라우저의 그래픽 지원을 확인하거나 2D 평면으로 살펴보세요. 파일을 직접 열었다면 로컬 웹 서버에서 실행해 주세요.';
    byId('tour-start').disabled = false; byId('tour-start').textContent = '다시 시도';
    shell.querySelectorAll('[data-tour-control]').forEach(button => { button.disabled = true; });
  }
  byId('tour-start').addEventListener('click', async () => {
    if (loading || tour) return;
    loading = true; shell.dataset.state = 'loading';
    byId('tour-start').disabled = true; byId('tour-start').textContent = '공간을 불러오는 중…';
    byId('tour-load-message').textContent = '가구와 조명을 준비하고 있습니다.';
    try {
      const module = await import(`./tour-scene.js?attempt=${attempts++}`);
      tour = await module.createTour(byId('tour-canvas-host'), stopGuide, fail);
      tour.setPalette(palette); mode = 'overview'; updateView();
      shell.dataset.state = 'ready'; loading = false;
      byId('tour-start-overlay').hidden = true; byId('tour-poster').hidden = true; byId('tour-view-caption').hidden = false;
      shell.querySelectorAll('[data-tour-control]').forEach(button => { button.disabled = false; });
      byId('tour-mode-overview').focus({ preventScroll: true });
    } catch (error) { console.warn('3D tour unavailable:', error.message); fail(); }
  });
  for (const view of ['overview', 'interior']) byId(`tour-mode-${view}`).addEventListener('click', () => {
    if (!tour) return; stopGuide(); mode = view; updateView();
  });
  shell.querySelectorAll('[data-room]').forEach(button => button.addEventListener('click', () => {
    if (!tour) return; stopGuide(); mode = 'interior'; room = button.dataset.room; updateView(); showStage();
  }));
  shell.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
    if (!tour) return; palette = button.dataset.palette;
    shell.querySelectorAll('[data-palette]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    tour.setPalette(palette);
  }));
  for (const [id, action] of Object.entries({
    'tour-left': () => tour.rotate(-.25), 'tour-right': () => tour.rotate(.25),
    'tour-zoom-in': () => tour.zoom(.85), 'tour-zoom-out': () => tour.zoom(1.15),
    'tour-reset': () => { mode = 'overview'; room = 'living'; updateView(); }
  })) byId(id).addEventListener('click', () => { if (tour) { stopGuide(); action(); } });
  byId('tour-guide').addEventListener('click', () => {
    if (!tour) return;
    if (timer) { stopGuide(); return; }
    mode = 'interior'; room = roomOrder[0]; updateView(); showStage();
    byId('tour-guide').setAttribute('aria-pressed', 'true'); byId('tour-guide').textContent = 'Ⅱ 자동 투어 멈추기';
    const showProgress = () => { byId('tour-guide-status').textContent = `${roomOrder.indexOf(room) + 1} / ${roomOrder.length} · ${tour.rooms[room].name} · 7초마다 다음 공간으로 이동`; };
    showProgress();
    timer = setInterval(() => {
      const next = roomOrder.indexOf(room) + 1;
      if (next === roomOrder.length) { stopGuide(); byId('tour-guide-status').textContent = '모든 공간을 둘러보았습니다. 원하는 방을 다시 선택해 보세요.'; return; }
      room = roomOrder[next]; updateView(); showProgress();
    }, 7000);
  });
  function visibility() {
    const active = inView && !document.hidden;
    if (tour) tour.setActive(active);
    if (!active) stopGuide();
  }
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; visibility(); }, { threshold: 0 });
  observer.observe(shell);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', () => { stopGuide(); if (tour) tour.setActive(false); });
  window.addEventListener('pageshow', visibility);
})();
