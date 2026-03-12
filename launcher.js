/* ================================================================
 *  ICON URL HELPER  —  replace any iconUrl with a real image URL
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

/* ================================================================
 *  APP REGISTRY
 * ================================================================ */
var APPS = {
  messages: { name: '消息',    iconUrl: makeIconUrl('💬', '#22c55e', '#16a34a') },
  camera:   { name: '相机',    iconUrl: makeIconUrl('📷', '#3b82f6', '#2563eb') },
  music:    { name: '音乐',    iconUrl: makeIconUrl('🎵', '#ef4444', '#dc2626') },
  ai:       { name: 'AI 助手', iconUrl: makeIconUrl('🤖', '#a855f7', '#7c3aed') },
  settings: { name: '设置',    iconUrl: makeIconUrl('⚙️', '#f97316', '#ea580c') },
  gallery:  { name: '相册',    iconUrl: makeIconUrl('🖼️', '#ec4899', '#db2777') },
  weather:  { name: '天气',    iconUrl: makeIconUrl('🌤', '#06b6d4', '#0891b2') },
  notes:    { name: '备忘录',  iconUrl: makeIconUrl('📝', '#eab308', '#ca8a04') },
  calendar: { name: '日历',    iconUrl: makeIconUrl('📅', '#14b8a6', '#0d9488') },
  files:    { name: '文件',    iconUrl: makeIconUrl('📂', '#6366f1', '#4f46e5') },
  games:    { name: '游戏',    iconUrl: makeIconUrl('🎮', '#f43f5e', '#e11d48') },
  browser:  { name: '浏览器',  iconUrl: makeIconUrl('🌐', '#0ea5e9', '#0284c7') },
  phone:    { name: '电话',    iconUrl: makeIconUrl('📞', '#22c55e', '#16a34a') },
  sms:      { name: '短信',    iconUrl: makeIconUrl('✉️', '#3b82f6', '#1d4ed8') },
};

/* ================================================================
 *  GRID CONSTANTS  —  4 cols × 6 rows (main)  +  4×1 dock
 * ================================================================ */
var COLS = 4, ROWS = 6, DOCK_MAX = 4;

/* ================================================================
 *  STATE  +  PERSISTENCE
 * ================================================================ */
var STORAGE_KEY = 'sunnyphone_v2';

function defaultState() {
  return {
    v: 2,
    grid: [
      [null,       null,      null,    null],
      [null,       null,      null,    null],
      ['messages', 'music',   'ai',    'gallery'],
      ['settings', 'weather', 'notes', 'calendar'],
      ['files',    'games',   null,    null],
      [null,       null,      null,    null]
    ],
    clockRow: 0,
    dock: ['phone', 'sms', 'browser', 'camera']
  };
}

function loadState() {
  try {
    var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && s.v === 2 && Array.isArray(s.grid) && Array.isArray(s.dock)) return s;
  } catch (_) {}
  return defaultState();
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

var state = loadState();

/* ================================================================
 *  DOM REFS
 * ================================================================ */
var screenEl    = document.getElementById('screen');
var mainArea    = document.getElementById('mainArea');
var dockEl      = document.getElementById('dock');
var dockWrap    = document.getElementById('dockWrap');
var highlightEl = document.getElementById('highlight');
var doneBtn     = document.getElementById('doneBtn');

var elements = new Map();
var cellW = 0, cellH = 0, dockCellW = 0;

/* ================================================================
 *  ELEMENT FACTORIES
 * ================================================================ */
function createClockEl() {
  var el = document.createElement('div');
  el.className = 'grid-item clock-widget';
  el.dataset.id = 'clock';
  el.innerHTML =
    '<div class="clock-inner">' +
    '<div class="clock-time" id="clockTime">--:--</div>' +
    '<div class="clock-date" id="clockDate">-</div>' +
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
 *  RENDERING
 * ================================================================ */
function renderAll() {
  elements.forEach(function (el) { el.remove(); });
  elements.clear();
  mainArea.innerHTML = '';
  dockEl.innerHTML = '';

  var ck = createClockEl();
  mainArea.appendChild(ck);
  elements.set('clock', ck);

  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++) {
      var id = state.grid[r][c];
      if (!id) continue;
      var el = createAppEl(id);
      if (!el) continue;
      mainArea.appendChild(el);
      elements.set(id, el);
    }

  state.dock.forEach(function (id) {
    var el = createAppEl(id);
    if (!el) return;
    dockEl.appendChild(el);
    elements.set(id, el);
  });

  layoutAll();
  updateClock();
}

/* ================================================================
 *  LAYOUT  —  cell-based absolute positioning
 * ================================================================ */
function measure() {
  cellW = mainArea.clientWidth / COLS;
  cellH = mainArea.clientHeight / ROWS;
  var ws = getComputedStyle(dockWrap);
  var avail = dockWrap.clientWidth - parseFloat(ws.paddingLeft) - parseFloat(ws.paddingRight);
  dockCellW = avail / DOCK_MAX;
}

function layoutAll() {
  measure();
  layoutMain();
  layoutDock();
}

function layoutMain() {
  var ck = elements.get('clock');
  if (ck && !ck.classList.contains('dragging')) {
    ensureParent(ck, mainArea);
    ck.style.left   = '0px';
    ck.style.top    = (state.clockRow * cellH) + 'px';
    ck.style.width  = (COLS * cellW) + 'px';
    ck.style.height = (2 * cellH) + 'px';
  }
  var ct = document.getElementById('clockTime');
  if (ct) ct.style.fontSize = Math.min(cellH * 1.05, 72) + 'px';

  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++) {
      var id = state.grid[r][c];
      if (!id) continue;
      var el = elements.get(id);
      if (!el || el.classList.contains('dragging')) continue;
      transferTo(el, mainArea, c * cellW, r * cellH, cellW, cellH);
    }
}

function layoutDock() {
  var n = state.dock.length;
  dockEl.style.width   = (n > 0 ? n * dockCellW : 0) + 'px';
  dockEl.style.opacity = n > 0 ? '1' : '0';

  state.dock.forEach(function (id, i) {
    var el = elements.get(id);
    if (!el || el.classList.contains('dragging')) return;
    transferTo(el, dockEl, i * dockCellW, 0, dockCellW, 72);
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
 *  GRID HELPERS
 * ================================================================ */
function isClockCell(r) { return r >= state.clockRow && r < state.clockRow + 2; }

function findGrid(id) {
  for (var r = 0; r < ROWS; r++)
    for (var c = 0; c < COLS; c++)
      if (state.grid[r][c] === id) return { r: r, c: c };
  return null;
}

function moveClockToRow(newRow) {
  var old = state.clockRow;
  if (newRow === old) return;
  newRow = Math.max(0, Math.min(newRow, ROWS - 2));
  var lo = Math.min(old, newRow), hi = Math.max(old + 1, newRow + 1);
  var apps = [];
  for (var r = lo; r <= hi; r++)
    for (var c = 0; c < COLS; c++) {
      if (state.grid[r][c]) { apps.push(state.grid[r][c]); state.grid[r][c] = null; }
    }
  var s = 0;
  for (var r = lo; r <= hi; r++) {
    if (r >= newRow && r < newRow + 2) continue;
    for (var c = 0; c < COLS; c++)
      state.grid[r][c] = s < apps.length ? apps[s++] : null;
  }
  state.clockRow = newRow;
}

/* ================================================================
 *  DRAG  &  DROP
 * ================================================================ */
var editMode = false, drag = null, longPressTimer = null;

screenEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });

mainArea.addEventListener('pointerdown', function (e) {
  var it = e.target.closest('.grid-item');
  if (!it) { if (editMode) exitEditMode(); return; }
  beginDown(e, it, 'main');
});
dockEl.addEventListener('pointerdown', function (e) {
  var it = e.target.closest('.grid-item');
  if (it) beginDown(e, it, 'dock');
});
document.addEventListener('pointermove', onMove);
document.addEventListener('pointerup', onUp);
document.addEventListener('pointercancel', onUp);

function beginDown(e, el, zone) {
  if (e.button !== 0) return;
  e.preventDefault();
  var id = el.dataset.id;
  var sr = screenEl.getBoundingClientRect();
  var er = el.getBoundingClientRect();

  drag = {
    id: id, el: el, zone: zone, isClock: id === 'clock',
    sr: sr, offsetX: e.clientX - er.left, offsetY: e.clientY - er.top,
    origRect: er, startX: e.clientX, startY: e.clientY,
    moved: false, active: false, pending: false,
    srcGrid: (zone === 'main' && id !== 'clock') ? findGrid(id) : null,
    srcDock: (zone === 'dock') ? state.dock.indexOf(id) : -1,
    target: null
  };

  if (editMode) drag.pending = true;
  else longPressTimer = setTimeout(function () {
    if (drag && !drag.moved) { enterEditMode(); liftItem(e); }
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
  var wr = dockWrap.getBoundingClientRect();
  var dr = dockEl.getBoundingClientRect();
  var target = null;

  if (e.clientY >= mr.top && e.clientY <= mr.bottom && e.clientX >= mr.left && e.clientX <= mr.right) {
    var col = Math.max(0, Math.min(Math.floor((e.clientX - mr.left) / cellW), COLS - 1));
    var row = Math.max(0, Math.min(Math.floor((e.clientY - mr.top) / cellH), ROWS - 1));
    if (drag.isClock) {
      target = { zone: 'main', type: 'clock', row: Math.max(0, Math.min(row, ROWS - 2)) };
    } else if (!isClockCell(row)) {
      target = { zone: 'main', type: 'cell', row: row, col: col };
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
    var mr = mainArea.getBoundingClientRect();
    var ox = mr.left - sr.left, oy = mr.top - sr.top;
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

  /* Clock → new row */
  if (drag.isClock && t.type === 'clock') {
    moveClockToRow(t.row);
    landElement(el, mainArea);
    layoutAll();
    return;
  }

  /* Main cell → Main cell */
  if (drag.zone === 'main' && t.zone === 'main' && t.type === 'cell') {
    var s = drag.srcGrid;
    if (s.r === t.row && s.c === t.col) { snapBack(); return; }
    var other = state.grid[t.row][t.col];
    state.grid[s.r][s.c] = other;
    state.grid[t.row][t.col] = id;
    landElement(el, mainArea);
    layoutAll();
    return;
  }

  /* Main cell → Dock */
  if (drag.zone === 'main' && t.zone === 'dock') {
    var s = drag.srcGrid;
    if (t.idx < state.dock.length) {
      var did = state.dock[t.idx];
      state.grid[s.r][s.c] = did;
      state.dock[t.idx] = id;
    } else if (state.dock.length < DOCK_MAX) {
      state.grid[s.r][s.c] = null;
      state.dock.splice(t.idx, 0, id);
    } else { snapBack(); return; }
    landElement(el, dockEl);
    layoutAll();
    return;
  }

  /* Dock → Main cell */
  if (drag.zone === 'dock' && t.zone === 'main' && t.type === 'cell') {
    var di = drag.srcDock;
    var other = state.grid[t.row][t.col];
    if (other) {
      state.dock[di] = other;
    } else {
      state.dock.splice(di, 1);
    }
    state.grid[t.row][t.col] = id;
    landElement(el, mainArea);
    layoutAll();
    return;
  }

  /* Dock → Dock */
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
  var container = (drag.zone === 'main') ? mainArea : dockEl;
  landElement(drag.el, container);
  layoutAll();
}

/* ── Edit Mode ── */
function enterEditMode() { editMode = true; screenEl.classList.add('edit-mode'); }
function exitEditMode()  { editMode = false; screenEl.classList.remove('edit-mode'); saveState(); }
doneBtn.addEventListener('click', function (e) { e.stopPropagation(); exitEditMode(); });

/* ================================================================
 *  CLOCK
 * ================================================================ */
function updateClock() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var time = h + ':' + m;
  var ct = document.getElementById('clockTime');
  var cd = document.getElementById('clockDate');
  var st = document.getElementById('statusTime');
  if (ct) ct.textContent = time;
  if (st) st.textContent = time;
  if (cd) {
    var days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    cd.textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + days[now.getDay()];
  }
}

/* ================================================================
 *  RESIZE  +  INIT
 * ================================================================ */
window.addEventListener('resize', function () {
  if (drag) drag.sr = screenEl.getBoundingClientRect();
  layoutAll();
});

renderAll();
setInterval(updateClock, 1000);
