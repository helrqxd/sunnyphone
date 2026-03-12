/* ================================================================
 *  图标 URL 工具 — 可替换为真实图片 URL
 * ================================================================ */
function makeIconUrl(emoji, c1, c2) {
  return 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="120" height="120" rx="26" fill="url(#g)"/>' +
    '<text x="60" y="78" text-anchor="middle" font-size="56">' + emoji + '</text></svg>'
  );
}

function makeTextIconUrl(text, c1, c2) {
  var size = text.length <= 2 ? 42 : (text.length <= 3 ? 34 : 26);
  return 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="120" height="120" rx="26" fill="url(#g)"/>' +
    '<text x="60" y="' + (60 + size * 0.36) + '" text-anchor="middle" font-size="' + size + '" ' +
    'fill="white" font-weight="bold" font-family="sans-serif">' + text + '</text></svg>'
  );
}

/* ================================================================
 *  应用注册表
 * ================================================================ */
var APPS = {
  qq:         { name: 'QQ',       iconUrl: makeTextIconUrl('QQ', '#12b7f5', '#0d8ecf') },
  worldbook:  { name: '世界书',   iconUrl: makeIconUrl('📖', '#8b5cf6', '#6d28d9') },
  apisetting: { name: 'API设置',  iconUrl: makeIconUrl('🔌', '#64748b', '#475569') },
  theme:      { name: '外观设置', iconUrl: makeIconUrl('🎨', '#f472b6', '#db2777') },
  calendar:   { name: '日历',     iconUrl: makeIconUrl('📅', '#f59e0b', '#d97706') },
  taphone:    { name: 'ta的手机', iconUrl: makeIconUrl('📱', '#fb923c', '#ea580c') },
  weibo:      { name: '微博',     iconUrl: makeTextIconUrl('微博', '#e60012', '#c4000f') },
  couple:     { name: '情侣空间', iconUrl: makeIconUrl('💕', '#f43f5e', '#e11d48') },
  gamehall:   { name: '游戏大厅', iconUrl: makeIconUrl('🎮', '#8b5cf6', '#6d28d9') },
  taobao:     { name: '淘宝',     iconUrl: makeTextIconUrl('淘', '#ff5000', '#e04200') },
  eleme:      { name: '饿了么',   iconUrl: makeTextIconUrl('饿', '#0097ff', '#006acc') },
  qunaer:     { name: '去哪儿',   iconUrl: makeIconUrl('✈️', '#06b6d4', '#0891b2') },
  ledger:     { name: '记账',     iconUrl: makeIconUrl('💰', '#eab308', '#ca8a04') },
  alipay:     { name: '支付宝',   iconUrl: makeTextIconUrl('支', '#1677ff', '#0958d9') },
  monitor:    { name: '智能监控', iconUrl: makeIconUrl('📹', '#64748b', '#475569') },
  theater:    { name: '小剧场',   iconUrl: makeIconUrl('🎬', '#a855f7', '#9333ea') },
  redbook:    { name: '小红书',   iconUrl: makeTextIconUrl('红', '#fe2c55', '#d91a40') },
  lofter:     { name: 'LOFTER',   iconUrl: makeTextIconUrl('Lo', '#00c853', '#009624') },
  map:        { name: '地图',     iconUrl: makeIconUrl('🗺️', '#22c55e', '#16a34a') },
};

/* ================================================================
 *  网格 / 页面常量 — 每页 4×6，共 2 页，底部栏最多 4 个
 * ================================================================ */
var COLS = 4, ROWS = 6, TOTAL_PAGES = 2, DOCK_MAX = 4;

/* ================================================================
 *  状态 + 持久化存储
 * ================================================================ */
var STORAGE_KEY = 'sunnyphone_v4';
var PRESETS_KEY = 'sunnyphone_presets';

function defaultState() {
  return {
    v: 4,
    pages: [
      {
        grid: [
          [null,     null,       null,      null],
          [null,     null,       null,      null],
          ['qq',     'worldbook','taphone', 'weibo'],
          ['couple', 'gamehall', 'taobao',  'eleme'],
          ['qunaer', 'ledger',  'phone',   'sms'],
          ['browser','camera',   null,      null]
        ],
        clockRow: 0
      },
      {
        grid: [
          ['alipay', 'monitor', 'theater', 'redbook'],
          ['lofter', 'map',     null,      null],
          [null,     null,       null,      null],
          [null,     null,       null,      null],
          [null,     null,       null,      null],
          [null,     null,       null,      null]
        ],
        clockRow: -1
      }
    ],
    dock: ['apisetting', 'theme', 'calendar'],
    currentPage: 0
  };
}

function loadState() {
  try {
    var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && s.v === 4 && Array.isArray(s.pages) && Array.isArray(s.dock)) return s;
  } catch (_) {}
  return defaultState();
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

var state = loadState();

/* ================================================================
 *  预设管理 — 保存 / 加载 / 删除布局快照
 * ================================================================ */
function loadPresets() {
  try {
    var p = JSON.parse(localStorage.getItem(PRESETS_KEY));
    if (Array.isArray(p)) return p;
  } catch (_) {}
  return [];
}
function savePresets(arr) { localStorage.setItem(PRESETS_KEY, JSON.stringify(arr)); }

function snapshotState() {
  return JSON.parse(JSON.stringify({
    pages: state.pages,
    dock: state.dock,
    currentPage: state.currentPage
  }));
}

function applySnapshot(snap) {
  state.pages = JSON.parse(JSON.stringify(snap.pages));
  state.dock  = JSON.parse(JSON.stringify(snap.dock));
  state.currentPage = snap.currentPage || 0;
  curPage = state.currentPage;
  saveState();
  renderAll();
}

/* ================================================================
 *  DOM 引用
 * ================================================================ */
var screenEl    = document.getElementById('screen');
var mainArea    = document.getElementById('mainArea');
var pagesTrack  = document.getElementById('pagesTrack');
var pageEls     = [document.getElementById('page0'), document.getElementById('page1')];
var pageDots    = document.getElementById('pageDots');
var dockEl      = document.getElementById('dock');
var dockWrap    = document.getElementById('dockWrap');
var highlightEl = document.getElementById('highlight');
var doneBtn     = document.getElementById('doneBtn');

var elements = new Map();
var cellW = 0, cellH = 0, dockCellW = 0;
var curPage = state.currentPage || 0;

/* ================================================================
 *  电池 API
 * ================================================================ */
function initBattery() {
  var pctEl  = document.getElementById('batteryPct');
  var fillEl = document.getElementById('batteryFill');
  if (!pctEl || !fillEl) return;

  function update(batt) {
    var pct = Math.round(batt.level * 100);
    pctEl.textContent = pct + '%';
    fillEl.style.width = pct + '%';
    fillEl.style.background = pct <= 20 ? '#ef4444' : '#4ade80';
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(function (batt) {
      update(batt);
      batt.addEventListener('levelchange', function () { update(batt); });
    });
  } else {
    pctEl.textContent = '100%';
    fillEl.style.width = '100%';
  }
}

/* ================================================================
 *  元素工厂
 * ================================================================ */
function createClockEl(pageIdx) {
  var el = document.createElement('div');
  el.className = 'grid-item clock-widget';
  el.dataset.id = 'clock_' + pageIdx;
  el.dataset.pageIdx = pageIdx;
  el.innerHTML =
    '<div class="clock-inner">' +
    '<div class="clock-time ctime">--:--</div>' +
    '<div class="clock-date cdate">-</div>' +
    '</div>';
  return el;
}

function createAppEl(id) {
  var app = APPS[id];
  if (!app) return null;
  var el = document.createElement('div');
  el.className = 'grid-item app-item';
  el.dataset.id = id;
  el.innerHTML =
    '<div class="app-icon-wrap">' +
    '<img src="' + app.iconUrl + '" alt="' + app.name + '" draggable="false">' +
    '</div>' +
    '<span class="app-name">' + app.name + '</span>';
  return el;
}

/* ================================================================
 *  渲染
 * ================================================================ */
function renderAll() {
  elements.forEach(function (el) { el.remove(); });
  elements.clear();
  pageEls.forEach(function (p) { p.innerHTML = ''; });
  dockEl.innerHTML = '';

  for (var pi = 0; pi < TOTAL_PAGES; pi++) {
    var pg = state.pages[pi];
    if (pg.clockRow >= 0) {
      var ck = createClockEl(pi);
      pageEls[pi].appendChild(ck);
      elements.set('clock_' + pi, ck);
    }
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++) {
        var id = pg.grid[r][c];
        if (!id) continue;
        var el = createAppEl(id);
        if (!el) continue;
        pageEls[pi].appendChild(el);
        elements.set(id, el);
      }
  }

  state.dock.forEach(function (id) {
    var el = createAppEl(id);
    if (!el) return;
    dockEl.appendChild(el);
    elements.set(id, el);
  });

  goToPage(curPage, false);
  layoutAll();
  updateClock();
}

/* ================================================================
 *  页面 — 滑动翻页与指示点
 * ================================================================ */
function goToPage(idx, animate) {
  curPage = Math.max(0, Math.min(idx, TOTAL_PAGES - 1));
  state.currentPage = curPage;
  if (animate === false) pagesTrack.classList.add('no-anim');
  pagesTrack.style.transform = 'translateX(' + (-curPage * 50) + '%)';
  if (animate === false) {
    pagesTrack.getBoundingClientRect();
    pagesTrack.classList.remove('no-anim');
  }
  var dots = pageDots.querySelectorAll('.dot');
  dots.forEach(function (d, i) { d.classList.toggle('active', i === curPage); });
}

var swipe = { active: false, startX: 0, startY: 0, startTx: 0, locked: false, axis: null };

mainArea.addEventListener('pointerdown', function (e) {
  if (editMode) return;
  if (e.target.closest('.grid-item')) return;
  swipe.active = true;
  swipe.startX = e.clientX;
  swipe.startY = e.clientY;
  swipe.startTx = -curPage * mainArea.clientWidth;
  swipe.axis = null;
  pagesTrack.classList.add('no-anim');
});

document.addEventListener('pointermove', function (e) {
  if (!swipe.active) return;
  var dx = e.clientX - swipe.startX;
  var dy = e.clientY - swipe.startY;
  if (!swipe.axis) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    swipe.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    if (swipe.axis === 'y') { swipe.active = false; return; }
  }
  var tx = swipe.startTx + dx;
  var maxTx = -(TOTAL_PAGES - 1) * mainArea.clientWidth;
  tx = Math.max(maxTx - 60, Math.min(60, tx));
  pagesTrack.style.transform = 'translateX(' + tx + 'px)';
});

document.addEventListener('pointerup', function (e) {
  if (!swipe.active) return;
  swipe.active = false;
  pagesTrack.classList.remove('no-anim');
  var dx = e.clientX - swipe.startX;
  var threshold = mainArea.clientWidth * 0.2;
  if (dx < -threshold && curPage < TOTAL_PAGES - 1) goToPage(curPage + 1, true);
  else if (dx > threshold && curPage > 0) goToPage(curPage - 1, true);
  else goToPage(curPage, true);
  saveState();
});

/* ================================================================
 *  布局 — 基于单元格的绝对定位
 * ================================================================ */
function measure() {
  var pageW = pageEls[0].clientWidth;
  var pageH = pageEls[0].clientHeight;
  cellW = pageW / COLS;
  cellH = pageH / ROWS;
  var ws = getComputedStyle(dockWrap);
  var avail = dockWrap.clientWidth - parseFloat(ws.paddingLeft) - parseFloat(ws.paddingRight);
  dockCellW = avail / DOCK_MAX;
}

function layoutAll() {
  measure();
  for (var pi = 0; pi < TOTAL_PAGES; pi++) layoutPage(pi);
  layoutDock();
}

function layoutPage(pi) {
  var pg = state.pages[pi];
  var container = pageEls[pi];

  if (pg.clockRow >= 0) {
    var ck = elements.get('clock_' + pi);
    if (ck && !ck.classList.contains('dragging')) {
      ensureParent(ck, container);
      ck.style.left   = '0px';
      ck.style.top    = (pg.clockRow * cellH) + 'px';
      ck.style.width  = (COLS * cellW) + 'px';
      ck.style.height = (2 * cellH) + 'px';
    }
    var ct = ck && ck.querySelector('.ctime');
    if (ct) ct.style.fontSize = Math.min(cellH * 1.05, 72) + 'px';
  }

  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++) {
      var id = pg.grid[r][c];
      if (!id) continue;
      var el = elements.get(id);
      if (!el || el.classList.contains('dragging')) continue;
      transferTo(el, container, c * cellW, r * cellH, cellW, cellH);
    }
}

function layoutDock() {
  var n = state.dock.length;
  dockEl.style.width   = (n > 0 ? n * dockCellW : 0) + 'px';
  dockEl.style.opacity = n > 0 ? '1' : '0';

  state.dock.forEach(function (id, i) {
    var el = elements.get(id);
    if (!el || el.classList.contains('dragging')) return;
    transferTo(el, dockEl, i * dockCellW, 0, dockCellW, 88);
  });
}

function ensureParent(el, p) { if (el.parentElement !== p) p.appendChild(el); }

function transferTo(el, container, l, t, w, h) {
  if (el.parentElement !== container) {
    var rect  = el.getBoundingClientRect();
    var cRect = container.getBoundingClientRect();
    container.appendChild(el);
    el.classList.add('no-anim');
    el.style.left   = (rect.left - cRect.left) + 'px';
    el.style.top    = (rect.top  - cRect.top)  + 'px';
    el.style.width  = rect.width  + 'px';
    el.style.height = rect.height + 'px';
    el.getBoundingClientRect();
    el.classList.remove('no-anim');
    el.getBoundingClientRect();
  }
  el.style.left   = l + 'px';
  el.style.top    = t + 'px';
  el.style.width  = w + 'px';
  el.style.height = h + 'px';
}

/* ================================================================
 *  网格辅助函数 — 支持多页
 * ================================================================ */
function isClockCell(pi, r) {
  var cr = state.pages[pi].clockRow;
  return cr >= 0 && r >= cr && r < cr + 2;
}

function findGrid(id) {
  for (var pi = 0; pi < TOTAL_PAGES; pi++)
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++)
        if (state.pages[pi].grid[r][c] === id) return { pi: pi, r: r, c: c };
  return null;
}

function moveClockToRow(pi, newRow) {
  var pg = state.pages[pi];
  var old = pg.clockRow;
  if (newRow === old) return;
  newRow = Math.max(0, Math.min(newRow, ROWS - 2));
  if (old < 0) { pg.clockRow = newRow; return; }
  var lo = Math.min(old, newRow), hi = Math.max(old + 1, newRow + 1);
  var apps = [];
  for (var r = lo; r <= hi; r++)
    for (var c = 0; c < COLS; c++) {
      if (pg.grid[r][c]) { apps.push(pg.grid[r][c]); pg.grid[r][c] = null; }
    }
  var s = 0;
  for (var r = lo; r <= hi; r++) {
    if (r >= newRow && r < newRow + 2) continue;
    for (var c = 0; c < COLS; c++)
      pg.grid[r][c] = s < apps.length ? apps[s++] : null;
  }
  pg.clockRow = newRow;
}

/* ================================================================
 *  拖拽
 * ================================================================ */
var editMode = false, drag = null, longPressTimer = null;

screenEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });

pageEls.forEach(function (pe, pi) {
  pe.addEventListener('pointerdown', function (e) {
    var it = e.target.closest('.grid-item');
    if (!it) { if (editMode) exitEditMode(); return; }
    beginDown(e, it, 'main', pi);
  });
});
dockEl.addEventListener('pointerdown', function (e) {
  var it = e.target.closest('.grid-item');
  if (it) beginDown(e, it, 'dock', -1);
});
document.addEventListener('pointermove', onMove);
document.addEventListener('pointerup', onUp);
document.addEventListener('pointercancel', onUp);

function beginDown(e, el, zone, pi) {
  if (e.button !== 0) return;
  e.preventDefault();
  var id = el.dataset.id;
  var sr = screenEl.getBoundingClientRect();
  var er = el.getBoundingClientRect();

  var isClock = id.startsWith('clock_');
  drag = {
    id: id, el: el, zone: zone, isClock: isClock,
    pageIdx: isClock ? parseInt(id.split('_')[1]) : pi,
    sr: sr, offsetX: e.clientX - er.left, offsetY: e.clientY - er.top,
    origRect: er, startX: e.clientX, startY: e.clientY,
    moved: false, active: false, pending: false,
    srcGrid: (zone === 'main' && !isClock) ? findGrid(id) : null,
    srcDock: (zone === 'dock') ? state.dock.indexOf(id) : -1,
    target: null
  };

  if (editMode) drag.pending = true;
  else longPressTimer = setTimeout(function () {
    if (drag && !drag.moved) { enterEditMode(); liftItem(); }
  }, 500);
}

function liftItem() {
  if (!drag) return;
  drag.active = true;
  var el = drag.el, sr = drag.sr, er = drag.origRect;
  screenEl.appendChild(el);
  el.classList.add('dragging');
  el.style.left   = (er.left - sr.left) + 'px';
  el.style.top    = (er.top  - sr.top)  + 'px';
  el.style.width  = er.width  + 'px';
  el.style.height = er.height + 'px';
  if (navigator.vibrate) navigator.vibrate(30);
}

function onMove(e) {
  if (!drag) return;
  var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
  if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 6) {
    drag.moved = true;
    if (drag.pending && !drag.active) liftItem();
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; if (!drag.active) { drag = null; return; } }
  }
  if (!drag || !drag.active) return;

  drag.el.style.left = (e.clientX - drag.sr.left - drag.offsetX) + 'px';
  drag.el.style.top  = (e.clientY - drag.sr.top  - drag.offsetY) + 'px';

  var mr = mainArea.getBoundingClientRect();
  var pr = pageEls[curPage].getBoundingClientRect();
  var wr = dockWrap.getBoundingClientRect();
  var dr = dockEl.getBoundingClientRect();
  var target = null;

  if (e.clientY >= mr.top && e.clientY <= mr.bottom && e.clientX >= pr.left && e.clientX <= pr.right) {
    var col = Math.max(0, Math.min(Math.floor((e.clientX - pr.left) / cellW), COLS - 1));
    var row = Math.max(0, Math.min(Math.floor((e.clientY - pr.top) / cellH), ROWS - 1));
    if (drag.isClock) {
      target = { zone: 'main', type: 'clock', row: Math.max(0, Math.min(row, ROWS - 2)), pi: curPage };
    } else if (!isClockCell(curPage, row)) {
      target = { zone: 'main', type: 'cell', row: row, col: col, pi: curPage };
    }
  } else if (e.clientY >= wr.top && e.clientY <= wr.bottom && !drag.isClock) {
    var n = state.dock.length;
    var maxI = (drag.zone === 'dock') ? n - 1 : (n < DOCK_MAX ? n : n - 1);
    var idx = Math.max(0, Math.min(Math.floor((e.clientX - dr.left) / dockCellW), maxI));
    target = { zone: 'dock', type: 'dock', idx: idx };
    var showN = (drag.zone !== 'dock' && n < DOCK_MAX) ? n + 1 : n;
    dockEl.style.width = (showN * dockCellW) + 'px';
  }

  if (!target || target.zone !== 'dock') {
    dockEl.style.width = (state.dock.length * dockCellW) + 'px';
  }

  drag.target = target;
  showHighlight(target);
}

function showHighlight(t) {
  if (!t) { highlightEl.style.display = 'none'; return; }
  var sr = screenEl.getBoundingClientRect();
  highlightEl.style.display = 'block';

  if (t.zone === 'main') {
    var pr = pageEls[t.pi].getBoundingClientRect();
    var ox = pr.left - sr.left, oy = pr.top - sr.top;
    if (t.type === 'clock') {
      highlightEl.style.left   = ox + 'px';
      highlightEl.style.top    = (oy + t.row * cellH) + 'px';
      highlightEl.style.width  = (COLS * cellW) + 'px';
      highlightEl.style.height = (2 * cellH) + 'px';
    } else {
      highlightEl.style.left   = (ox + t.col * cellW) + 'px';
      highlightEl.style.top    = (oy + t.row * cellH) + 'px';
      highlightEl.style.width  = cellW + 'px';
      highlightEl.style.height = cellH + 'px';
    }
  } else {
    var dr = dockEl.getBoundingClientRect();
    highlightEl.style.left   = (dr.left - sr.left + t.idx * dockCellW) + 'px';
    highlightEl.style.top    = (dr.top  - sr.top) + 'px';
    highlightEl.style.width  = dockCellW + 'px';
    highlightEl.style.height = dr.height + 'px';
  }
}

function onUp() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
  if (!drag) return;
  if (drag.active) {
    highlightEl.style.display = 'none';
    if (drag.target) executeDrop(drag.target);
    else snapBack();
    saveState();
  }
  drag = null;
}

function executeDrop(t) {
  var el = drag.el, id = drag.id;

  /* 时钟 → 新行 */
  if (drag.isClock && t.type === 'clock') {
    moveClockToRow(drag.pageIdx, t.row);
    landElement(el, pageEls[drag.pageIdx]);
    layoutAll();
    return;
  }

  /* 主屏格子 → 主屏格子 */
  if (drag.zone === 'main' && t.zone === 'main' && t.type === 'cell') {
    var s = drag.srcGrid;
    var srcPg = state.pages[s.pi];
    var dstPg = state.pages[t.pi];
    if (s.pi === t.pi && s.r === t.row && s.c === t.col) { snapBack(); return; }
    var other = dstPg.grid[t.row][t.col];
    srcPg.grid[s.r][s.c] = other;
    dstPg.grid[t.row][t.col] = id;
    landElement(el, pageEls[t.pi]);
    layoutAll();
    return;
  }

  /* 主屏格子 → 底部栏 */
  if (drag.zone === 'main' && t.zone === 'dock') {
    var s = drag.srcGrid;
    var srcPg = state.pages[s.pi];
    if (t.idx < state.dock.length) {
      var did = state.dock[t.idx];
      srcPg.grid[s.r][s.c] = did;
      state.dock[t.idx] = id;
    } else if (state.dock.length < DOCK_MAX) {
      srcPg.grid[s.r][s.c] = null;
      state.dock.splice(t.idx, 0, id);
    } else { snapBack(); return; }
    landElement(el, dockEl);
    layoutAll();
    return;
  }

  /* 底部栏 → 主屏格子 */
  if (drag.zone === 'dock' && t.zone === 'main' && t.type === 'cell') {
    var di = drag.srcDock;
    var dstPg = state.pages[t.pi];
    var other = dstPg.grid[t.row][t.col];
    if (other) {
      state.dock[di] = other;
    } else {
      state.dock.splice(di, 1);
    }
    dstPg.grid[t.row][t.col] = id;
    landElement(el, pageEls[t.pi]);
    layoutAll();
    return;
  }

  /* 底部栏 → 底部栏 */
  if (drag.zone === 'dock' && t.zone === 'dock') {
    var di = drag.srcDock, ti = t.idx;
    if (ti < state.dock.length && ti !== di) {
      var tmp = state.dock[di];
      state.dock[di] = state.dock[ti];
      state.dock[ti] = tmp;
    } else if (ti >= state.dock.length) {
      state.dock.splice(di, 1);
      state.dock.push(id);
    }
    landElement(el, dockEl);
    layoutAll();
    return;
  }

  snapBack();
}

function landElement(el, container) {
  var rect  = el.getBoundingClientRect();
  var cRect = container.getBoundingClientRect();
  container.appendChild(el);
  el.classList.remove('dragging');
  el.classList.add('no-anim');
  el.style.left   = (rect.left - cRect.left) + 'px';
  el.style.top    = (rect.top  - cRect.top)  + 'px';
  el.getBoundingClientRect();
  el.classList.remove('no-anim');
  el.classList.add('snapping');
  el.getBoundingClientRect();
  setTimeout(function () { el.classList.remove('snapping'); }, 350);
}

function snapBack() {
  var container = (drag.zone === 'main') ? pageEls[drag.pageIdx >= 0 ? drag.pageIdx : curPage] : dockEl;
  landElement(drag.el, container);
  layoutAll();
}

/* ── 编辑模式 ── */
function enterEditMode() { editMode = true; screenEl.classList.add('edit-mode'); }
function exitEditMode()  { editMode = false; screenEl.classList.remove('edit-mode'); saveState(); }
doneBtn.addEventListener('click', function (e) { e.stopPropagation(); exitEditMode(); });

/* ── 恢复默认 ── */
document.getElementById('btnResetDefault').addEventListener('click', function (e) {
  e.stopPropagation();
  var ds = defaultState();
  state.pages = ds.pages;
  state.dock  = ds.dock;
  state.currentPage = ds.currentPage;
  curPage = 0;
  saveState();
  renderAll();
});

/* ── 保存预设 ── */
var presetModal   = document.getElementById('presetModal');
var presetInput   = document.getElementById('presetNameInput');
var presetConfirm = document.getElementById('presetConfirm');
var presetCancel  = document.getElementById('presetCancel');

document.getElementById('btnSavePreset').addEventListener('click', function (e) {
  e.stopPropagation();
  presetInput.value = '';
  presetModal.classList.add('visible');
  setTimeout(function () { presetInput.focus(); }, 100);
});

presetCancel.addEventListener('click', function (e) {
  e.stopPropagation();
  presetModal.classList.remove('visible');
});

presetConfirm.addEventListener('click', function (e) {
  e.stopPropagation();
  var name = presetInput.value.trim();
  if (!name) return;
  var presets = loadPresets();
  presets.push({ name: name, time: Date.now(), snap: snapshotState() });
  savePresets(presets);
  presetModal.classList.remove('visible');
});

/* ── 加载预设 ── */
var loadModal  = document.getElementById('loadModal');
var presetList = document.getElementById('presetList');
var loadCancel = document.getElementById('loadCancel');

document.getElementById('btnLoadPreset').addEventListener('click', function (e) {
  e.stopPropagation();
  renderPresetList();
  loadModal.classList.add('visible');
});

loadCancel.addEventListener('click', function (e) {
  e.stopPropagation();
  loadModal.classList.remove('visible');
});

function renderPresetList() {
  var presets = loadPresets();
  presetList.innerHTML = '';
  presets.forEach(function (p, i) {
    var row = document.createElement('div');
    row.className = 'preset-item';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'preset-item-name';
    nameSpan.textContent = p.name;

    var delBtn = document.createElement('button');
    delBtn.className = 'preset-item-del';
    delBtn.textContent = '\u00D7';
    delBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var arr = loadPresets();
      arr.splice(i, 1);
      savePresets(arr);
      renderPresetList();
    });

    row.appendChild(nameSpan);
    row.appendChild(delBtn);

    row.addEventListener('click', function (ev) {
      ev.stopPropagation();
      applySnapshot(p.snap);
      loadModal.classList.remove('visible');
    });

    presetList.appendChild(row);
  });
}

/* ================================================================
 *  时钟
 * ================================================================ */
function updateClock() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var time = h + ':' + m;
  var st = document.getElementById('statusTime');
  if (st) st.textContent = time;

  document.querySelectorAll('.ctime').forEach(function (el) { el.textContent = time; });
  var days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  var dateStr = (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + days[now.getDay()];
  document.querySelectorAll('.cdate').forEach(function (el) { el.textContent = dateStr; });
}

/* ================================================================
 *  窗口缩放 + 初始化
 * ================================================================ */
window.addEventListener('resize', function () {
  if (drag) drag.sr = screenEl.getBoundingClientRect();
  goToPage(curPage, false);
  layoutAll();
});

initBattery();
renderAll();
setInterval(updateClock, 1000);
