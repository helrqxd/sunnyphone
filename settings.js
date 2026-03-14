/* ================================================================
 *  SunnyPhone — 设置面板 (API 配置 + 数据管理)
 * ================================================================ */
(function () {
  'use strict';

  /* ── 存储常量 ── */
  var SETTINGS_KEY  = 'sunnyphone_settings';
  var BACKUP_KEYS   = ['sunnyphone_v4', 'sunnyphone_presets', 'sunnyphone_settings', 'sunnyphone_contacts'];

  /* ── 默认配置结构 ── */
  function defaults() {
    return {
      chatMain:         { url: '', key: '', model: '' },
      chatSub:          { url: '', key: '', model: '' },
      voiceMinimax:     { key: '', groupId: '', model: 'speech-2.8-hd' },
      imageNovelai:     { key: '' },
      imagePollinations: { baseUrl: '' }
    };
  }

  /* ── 深合并：确保新字段也能兜底 ── */
  function deepMerge(target, source) {
    for (var k in source) {
      if (!source.hasOwnProperty(k)) continue;
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        if (typeof target[k] !== 'object' || target[k] === null) target[k] = {};
        deepMerge(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
    }
    return target;
  }

  /* ── CRUD ── */
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (s) return deepMerge(defaults(), s);
    } catch (_) {}
    return defaults();
  }

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  var settings = load();

  /* ── DOM 引用 ── */
  var overlay   = document.getElementById('settingsOverlay');
  var body      = document.getElementById('settingsBody');
  var backBtn   = document.getElementById('settingsBack');
  var fileInput = document.getElementById('backupFileInput');
  var isOpen    = false;

  /* ── 分节定义（数据驱动渲染） ── */
  var SECTIONS = [
    {
      icon: '💬', c1: '#3b82f6', c2: '#2563eb',
      title: '聊天 API — 主（用于聊天）',
      fields: [
        { label: 'API 地址', path: 'chatMain.url', ph: 'https://api.openai.com', hint: '调用时自动拼接 /v1/chat/completions' },
        { label: 'API 密钥', path: 'chatMain.key', ph: 'sk-...', secret: true },
        { label: '模型名称', path: 'chatMain.model', ph: 'gpt-4o-mini',
          fetchModels: { urlPath: 'chatMain.url', keyPath: 'chatMain.key' } }
      ]
    },
    {
      icon: '💬', c1: '#8b5cf6', c2: '#7c3aed',
      title: '聊天 API — 副（聊天总结或其他玩法等可选备用，不需要可以不配置）',
      fields: [
        { label: 'API 地址', path: 'chatSub.url', ph: 'https://api.openai.com', hint: '调用时自动拼接 /v1/chat/completions' },
        { label: 'API 密钥', path: 'chatSub.key', ph: 'sk-...', secret: true },
        { label: '模型名称', path: 'chatSub.model', ph: 'gpt-4o-mini',
          fetchModels: { urlPath: 'chatSub.url', keyPath: 'chatSub.key' } }
      ]
    },
    {
      icon: '🎙️', c1: '#f59e0b', c2: '#d97706',
      title: '语音 API — Minimax',
      fields: [
        { label: 'API 密钥', path: 'voiceMinimax.key',     ph: 'eyJhbG...', secret: true },
        { label: 'Group ID', path: 'voiceMinimax.groupId', ph: '17xxx...' },
        { label: '模型', path: 'voiceMinimax.model', select: [
          { value: 'speech-2.8-hd',    label: 'speech-2.8-hd（最新HD，精准还原语气）' },
          { value: 'speech-2.8-turbo', label: 'speech-2.8-turbo（最新Turbo，精准还原）' },
          { value: 'speech-2.6-hd',    label: 'speech-2.6-hd（HD，韵律表现出色）' },
          { value: 'speech-2.6-turbo', label: 'speech-2.6-turbo（Turbo，超低时延）' },
          { value: 'speech-02-hd',     label: 'speech-02-hd（出色韵律与复刻相似度）' },
          { value: 'speech-02-turbo',  label: 'speech-02-turbo（小语种能力加强）' },
          { value: 'speech-01-hd',     label: 'speech-01-hd' },
          { value: 'speech-01-turbo',  label: 'speech-01-turbo' }
        ]}
      ]
    },
    {
      icon: '🎨', c1: '#ec4899', c2: '#db2777',
      title: '生图 API — NovalAI',
      fields: [
        { label: 'API 密钥', path: 'imageNovelai.key', ph: 'pst-...', secret: true }
      ]
    },
    {
      icon: '🖼️', c1: '#06b6d4', c2: '#0891b2',
      title: '生图 API — Pollinations',
      fields: [
        { label: 'API 地址', path: 'imagePollinations.baseUrl', ph: 'https://image.pollinations.ai/prompt/' }
      ]
    }
  ];

  /* ── 路径读写工具 ── */
  function getByPath(obj, path) {
    var parts = path.split('.'), cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return '';
      cur = cur[parts[i]];
    }
    return cur || '';
  }

  function setByPath(obj, path, val) {
    var parts = path.split('.'), cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
                      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ================================================================
   *  渲染设置主体
   * ================================================================ */
  function renderBody() {
    settings = load();
    var h = '';

    SECTIONS.forEach(function (sec) {
      h += '<div class="stg-section"><div class="stg-sec-head">' +
           '<span class="stg-sec-icon" style="background:linear-gradient(135deg,' + sec.c1 + ',' + sec.c2 + ')">' + sec.icon + '</span>' +
           '<span class="stg-sec-title">' + sec.title + '</span></div><div class="stg-group">';

      sec.fields.forEach(function (f, fi) {
        var val = getByPath(settings, f.path);
        var border = fi < sec.fields.length - 1 ? ' stg-item-border' : '';
        h += '<div class="stg-item' + border + '"><label class="stg-label">' + f.label + '</label>';

        if (f.fetchModels) {
          h += '<div class="stg-model-wrap"><div class="stg-model-row">' +
               '<input class="stg-input stg-model-input" type="text" data-path="' + f.path + '" value="' + esc(val) + '" placeholder="' + esc(f.ph) + '">' +
               '<button class="stg-model-fetch" type="button" data-url-path="' + f.fetchModels.urlPath + '" data-key-path="' + f.fetchModels.keyPath + '" data-model-path="' + f.path + '">' +
               '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> 拉取</button>' +
               '</div><div class="stg-model-dropdown" data-for="' + f.path + '"></div></div>';
        } else if (f.select) {
          h += '<select class="stg-input stg-select ct-select" data-path="' + f.path + '">';
          f.select.forEach(function (opt) {
            h += '<option value="' + esc(opt.value) + '"' + (val === opt.value ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
          });
          h += '</select>';
        } else if (f.secret) {
          h += '<div class="stg-key-wrap">' +
               '<input class="stg-input stg-key-input" type="password" data-path="' + f.path + '" value="' + esc(val) + '" placeholder="' + esc(f.ph) + '">' +
               '<button class="stg-key-toggle" type="button" data-path="' + f.path + '">' +
               '<svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(93,64,55,0.4)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' +
               '</button></div>';
        } else {
          h += '<input class="stg-input" type="text" data-path="' + f.path + '" value="' + esc(val) + '" placeholder="' + esc(f.ph) + '">';
        }

        if (f.hint) {
          h += '<div class="stg-hint">' + f.hint + '</div>';
        }
        h += '</div>';
      });

      h += '</div></div>';
    });

    /* 数据管理 */
    h += '<div class="stg-section"><div class="stg-sec-head">' +
         '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#22c55e,#16a34a)">💾</span>' +
         '<span class="stg-sec-title">数据管理</span></div>' +
         '<div class="stg-group stg-actions">' +
         '<button class="stg-action-btn" id="btnExport"><span class="stg-act-icon">📤</span>导出备份</button>' +
         '<button class="stg-action-btn" id="btnImport"><span class="stg-act-icon">📥</span>导入备份</button>' +
         '<button class="stg-action-btn stg-danger" id="btnClearAll"><span class="stg-act-icon">🗑️</span>清除所有数据</button>' +
         '</div></div>';

    h += '<div style="height:40px"></div>';
    body.innerHTML = h;
    bindEvents();
  }

  /* ================================================================
   *  事件绑定
   * ================================================================ */
  function bindEvents() {
    /* 输入框自动保存 */
    var inputs = body.querySelectorAll('.stg-input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', function () {
        setByPath(settings, this.dataset.path, this.value);
        save();
      });
    }

    /* 下拉选择自动保存 */
    var selects = body.querySelectorAll('.stg-select');
    for (var si = 0; si < selects.length; si++) {
      selects[si].addEventListener('change', function () {
        setByPath(settings, this.dataset.path, this.value);
        save();
      });
    }

    /* 密钥可见切换 */
    var toggles = body.querySelectorAll('.stg-key-toggle');
    for (var j = 0; j < toggles.length; j++) {
      toggles[j].addEventListener('click', function (e) {
        e.stopPropagation();
        var inp = body.querySelector('.stg-key-input[data-path="' + this.dataset.path + '"]');
        if (!inp) return;
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        this.innerHTML = show
          ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(93,64,55,0.4)"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>'
          : '<svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(93,64,55,0.4)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
      });
    }

    /* 拉取模型按钮 */
    var fetchBtns = body.querySelectorAll('.stg-model-fetch');
    for (var k = 0; k < fetchBtns.length; k++) {
      fetchBtns[k].addEventListener('click', handleFetchModels);
    }

    /* 点击空白处关闭下拉 */
    body.addEventListener('click', function () {
      closeAllDropdowns();
    });

    /* 操作按钮 */
    var be = document.getElementById('btnExport');
    var bi = document.getElementById('btnImport');
    var bc = document.getElementById('btnClearAll');
    if (be) be.addEventListener('click', exportBackup);
    if (bi) bi.addEventListener('click', function () { fileInput.click(); });
    if (bc) bc.addEventListener('click', clearAllData);
  }

  /* ================================================================
   *  拉取模型列表
   * ================================================================ */
  function handleFetchModels(e) {
    e.stopPropagation();
    var btn       = this;
    var urlPath   = btn.dataset.urlPath;
    var keyPath   = btn.dataset.keyPath;
    var modelPath = btn.dataset.modelPath;
    var baseUrl   = getByPath(settings, urlPath);
    var apiKey    = getByPath(settings, keyPath);

    if (!baseUrl) { toast('请先填写 API 地址'); return; }
    if (!apiKey)  { toast('请先填写 API 密钥'); return; }

    var fetchUrl = baseUrl.replace(/\/+$/, '') + '/v1/models';

    btn.disabled = true;
    var origHtml = btn.innerHTML;
    btn.innerHTML = '<svg class="stg-spin" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg> 拉取中';

    fetch(fetchUrl, {
      headers: { 'Authorization': 'Bearer ' + apiKey }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (json) {
      var models = [];
      if (json.data && Array.isArray(json.data)) {
        models = json.data.map(function (m) { return m.id; }).sort();
      }
      if (models.length === 0) { toast('未获取到可用模型'); return; }
      showModelDropdown(modelPath, models);
    })
    .catch(function (err) {
      toast('拉取失败: ' + err.message);
    })
    .then(function () {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    });
  }

  function showModelDropdown(modelPath, models) {
    closeAllDropdowns();
    var dd = body.querySelector('.stg-model-dropdown[data-for="' + modelPath + '"]');
    if (!dd) return;

    var h = '';
    models.forEach(function (m) {
      h += '<div class="stg-model-opt" data-model="' + esc(m) + '">' + esc(m) + '</div>';
    });
    dd.innerHTML = h;
    dd.classList.add('show');

    var opts = dd.querySelectorAll('.stg-model-opt');
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var model = this.dataset.model;
        var inp = body.querySelector('.stg-model-input[data-path="' + modelPath + '"]');
        if (inp) { inp.value = model; }
        setByPath(settings, modelPath, model);
        save();
        dd.classList.remove('show');
      });
    }
  }

  function closeAllDropdowns() {
    var dds = body.querySelectorAll('.stg-model-dropdown.show');
    for (var i = 0; i < dds.length; i++) dds[i].classList.remove('show');
  }

  /* ================================================================
   *  备份导出
   * ================================================================ */
  function exportBackup() {
    var data = { _backup: true, _version: 1, _time: new Date().toISOString() };
    BACKUP_KEYS.forEach(function (key) {
      var raw = localStorage.getItem(key);
      if (raw !== null) {
        try { data[key] = JSON.parse(raw); } catch (_) { data[key] = raw; }
      }
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = 'sunnyphone_backup_' + fmtDate(new Date()) + '.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('备份文件已导出');
  }

  function fmtDate(d) {
    return d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '_' +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0');
  }

  /* ================================================================
   *  备份导入
   * ================================================================ */
  fileInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    this.value = '';

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data._backup) { toast('无效的备份文件'); return; }

        confirm('确认导入？当前数据将被覆盖。', function () {
          BACKUP_KEYS.forEach(function (key) {
            if (data[key] !== undefined) {
              localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
            }
          });
          settings = load();
          renderBody();
          if (typeof window.reloadLauncherState === 'function') window.reloadLauncherState();
          toast('备份已成功导入');
        });
      } catch (_) {
        toast('文件解析失败');
      }
    };
    reader.readAsText(file);
  });

  /* ================================================================
   *  清除所有数据
   * ================================================================ */
  function clearAllData() {
    confirm('确认清除所有数据？此操作不可恢复！', function () {
      BACKUP_KEYS.forEach(function (key) { localStorage.removeItem(key); });
      settings = defaults();
      save();
      renderBody();
      if (typeof window.reloadLauncherState === 'function') window.reloadLauncherState();
      toast('所有数据已清除');
    });
  }

  /* ================================================================
   *  Toast 提示
   * ================================================================ */
  function toast(msg) {
    var old = overlay.querySelector('.stg-toast');
    if (old) old.remove();

    var el = document.createElement('div');
    el.className = 'stg-toast';
    el.textContent = msg;
    overlay.appendChild(el);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('show'); });
    });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 300);
    }, 1800);
  }

  /* ================================================================
   *  确认弹窗
   * ================================================================ */
  function confirm(msg, onOk) {
    var mask = document.createElement('div');
    mask.className = 'stg-confirm-mask';
    mask.innerHTML =
      '<div class="stg-confirm-box">' +
        '<div class="stg-confirm-msg">' + esc(msg) + '</div>' +
        '<div class="stg-confirm-actions">' +
          '<button class="stg-confirm-btn stg-confirm-no">取消</button>' +
          '<button class="stg-confirm-btn stg-confirm-yes">确认</button>' +
        '</div>' +
      '</div>';
    overlay.appendChild(mask);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { mask.classList.add('visible'); });
    });

    function dismiss() {
      mask.classList.remove('visible');
      setTimeout(function () { if (mask.parentNode) mask.remove(); }, 260);
    }

    mask.querySelector('.stg-confirm-no').addEventListener('click', dismiss);
    mask.querySelector('.stg-confirm-yes').addEventListener('click', function () {
      dismiss();
      if (onOk) onOk();
    });
    mask.addEventListener('click', function (e) {
      if (e.target === mask) dismiss();
    });
  }

  /* ================================================================
   *  面板开 / 关
   * ================================================================ */
  function open() {
    if (isOpen) return;
    isOpen = true;
    renderBody();
    overlay.classList.add('visible');
  }

  function close() {
    if (!isOpen) return;
    overlay.classList.remove('visible');
    isOpen = false;
  }

  backBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });

  overlay.addEventListener('pointerdown',  function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointermove',  function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointerup',    function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointercancel', function (e) { e.stopPropagation(); });

  /* ── 全局钩子 ── */
  window.openApp = function (appId) {
    if (appId === 'apisetting') open();
  };

  window.SunnySettings = {
    get: function () { return load(); },
    open: open,
    close: close
  };

})();
