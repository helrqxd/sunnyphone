/* ================================================================
 *  SunnyPhone — 联系人 (Contacts)
 * ================================================================ */
(function () {
  'use strict';

  /* ================================================================
   *  常量 & 配置
   * ================================================================ */
  var CONTACTS_KEY = 'sunnyphone_contacts';

  var LANG_OPTIONS = [
    { value: '',             label: '不增强' },
    { value: 'auto',         label: '自动识别' },
    { value: 'Chinese',      label: '中文' },
    { value: 'Chinese,Yue',  label: '粤语' },
    { value: 'English',      label: '英语' },
    { value: 'Japanese',     label: '日语' },
    { value: 'Korean',       label: '韩语' },
    { value: 'Spanish',      label: '西班牙语' },
    { value: 'French',       label: '法语' },
    { value: 'Russian',      label: '俄语' },
    { value: 'German',       label: '德语' },
    { value: 'Portuguese',   label: '葡萄牙语' },
    { value: 'Arabic',       label: '阿拉伯语' },
    { value: 'Italian',      label: '意大利语' },
    { value: 'Indonesian',   label: '印尼语' },
    { value: 'Vietnamese',   label: '越南语' },
    { value: 'Turkish',      label: '土耳其语' },
    { value: 'Dutch',        label: '荷兰语' },
    { value: 'Ukrainian',    label: '乌克兰语' },
    { value: 'Thai',         label: '泰语' },
    { value: 'Polish',       label: '波兰语' },
    { value: 'Romanian',     label: '罗马尼亚语' },
    { value: 'Greek',        label: '希腊语' },
    { value: 'Czech',        label: '捷克语' },
    { value: 'Finnish',      label: '芬兰语' },
    { value: 'Hindi',        label: '印地语' },
    { value: 'Bulgarian',    label: '保加利亚语' },
    { value: 'Danish',       label: '丹麦语' },
    { value: 'Hebrew',       label: '希伯来语' },
    { value: 'Malay',        label: '马来语' },
    { value: 'Persian',      label: '波斯语' },
    { value: 'Slovak',       label: '斯洛伐克语' },
    { value: 'Swedish',      label: '瑞典语' },
    { value: 'Croatian',     label: '克罗地亚语' },
    { value: 'Filipino',     label: '菲律宾语' },
    { value: 'Hungarian',    label: '匈牙利语' },
    { value: 'Norwegian',    label: '挪威语' },
    { value: 'Slovenian',    label: '斯洛文尼亚语' },
    { value: 'Catalan',      label: '加泰罗尼亚语' },
    { value: 'Nynorsk',      label: '尼诺斯克语' },
    { value: 'Tamil',        label: '泰米尔语' },
    { value: 'Afrikaans',    label: '阿非利卡语' }
  ];

  var EMOTION_OPTIONS = [
    { value: 'calm',      label: '平静（默认）' },
    { value: 'happy',     label: '高兴' },
    { value: 'sad',       label: '悲伤' },
    { value: 'angry',     label: '愤怒' },
    { value: 'fearful',   label: '害怕' },
    { value: 'disgusted', label: '厌恶' },
    { value: 'surprised', label: '惊讶' },
    { value: 'fluent',    label: '生动（仅2.6系列）' },
    { value: 'whisper',   label: '低语（仅2.6系列）' }
  ];

  /* ================================================================
   *  存储 CRUD
   * ================================================================ */
  function loadContacts() {
    try {
      var arr = JSON.parse(localStorage.getItem(CONTACTS_KEY));
      if (Array.isArray(arr)) return arr;
    } catch (_) {}
    return [];
  }

  function saveContacts(arr) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(arr));
  }

  function getContact(id) {
    var arr = loadContacts();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr[i];
    }
    return null;
  }

  function addContact(contact) {
    var arr = loadContacts();
    arr.unshift(contact);
    saveContacts(arr);
  }

  function updateContact(id, data) {
    var arr = loadContacts();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        for (var k in data) {
          if (data.hasOwnProperty(k)) arr[i][k] = data[k];
        }
        arr[i].updatedAt = Date.now();
        break;
      }
    }
    saveContacts(arr);
  }

  function deleteContact(id) {
    var arr = loadContacts().filter(function (c) { return c.id !== id; });
    saveContacts(arr);
  }

  /* ================================================================
   *  工具函数
   * ================================================================ */
  function genId() {
    return 'ct_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function defaultVoice() {
    return {
      minimaxId: '',
      languageBoost: '',
      speed: 1.0,
      pitch: 0,
      volume: 1,
      emotion: 'calm'
    };
  }

  function nameColor(name) {
    var colors = [
      '#f44336','#e91e63','#9c27b0','#673ab7',
      '#3f51b5','#2196f3','#03a9f4','#00bcd4',
      '#009688','#4caf50','#8bc34a','#ff9800',
      '#ff5722','#795548','#607d8b'
    ];
    var hash = 0;
    for (var i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
                      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function avatarHtml(contact, size) {
    size = size || 44;
    var fs = Math.round(size * 0.4);
    if (contact.avatar) {
      return '<div class="ct-avatar" style="width:' + size + 'px;height:' + size + 'px">' +
             '<img src="' + esc(contact.avatar) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
             '<span class="ct-avatar-fallback" style="display:none;background:' + nameColor(contact.name) + ';font-size:' + fs + 'px">' +
             esc((contact.name || '?')[0]) + '</span></div>';
    }
    var ch = (contact.name || '?')[0];
    var bg = nameColor(contact.name || '');
    return '<div class="ct-avatar" style="width:' + size + 'px;height:' + size + 'px">' +
           '<span class="ct-avatar-fallback" style="background:' + bg + ';font-size:' + fs + 'px">' +
           esc(ch) + '</span></div>';
  }

  function labelFor(options, val) {
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === val) return options[i].label;
    }
    return val || options[0].label;
  }

  /* ================================================================
   *  DOM 引用 & 状态
   * ================================================================ */
  var overlay     = document.getElementById('contactsOverlay');
  var root        = document.getElementById('contactsRoot');
  var avatarInput = document.getElementById('avatarFileInput');
  var importInput = document.getElementById('contactImportInput');
  var isOpen      = false;
  var nav         = { view: 'list', contactId: null, isEditing: false };
  var formState   = null;
  var menuVisible = false;

  /* ================================================================
   *  导航
   * ================================================================ */
  function showView(view, contactId, isEditing) {
    nav.view      = view;
    nav.contactId = contactId || null;
    nav.isEditing = !!isEditing;
    menuVisible   = false;

    switch (view) {
      case 'list':   renderListView();              break;
      case 'detail': renderDetailView(contactId);   break;
      case 'form':   renderFormView(contactId);     break;
    }
  }

  function goBack() {
    if (nav.view === 'detail') showView('list');
    else if (nav.view === 'form' && nav.isEditing) showView('detail', nav.contactId);
    else showView('list');
  }

  /* ================================================================
   *  列表视图
   * ================================================================ */
  function renderListView() {
    var contacts = loadContacts();
    var h = '';

    h += '<div class="ct-header">' +
         '<button class="ct-header-btn ct-back-btn" id="ctListBack">' +
         '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>' +
         ' 返回</button>' +
         '<span class="ct-header-title">联系人</span>' +
         '<button class="ct-header-btn ct-add-btn" id="ctAddBtn">' +
         '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>' +
         '</button>' +
         '<div class="ct-action-menu" id="ctActionMenu">' +
         '<div class="ct-action-item" data-action="create"><span>✏️</span> 新建联系人</div>' +
         '<div class="ct-action-item" data-action="import"><span>📥</span> 导入联系人</div>' +
         '</div>' +
         '</div>';

    h += '<div class="ct-body">';

    if (contacts.length === 0) {
      h += '<div class="ct-empty">' +
           '<div class="ct-empty-icon">👥</div>' +
           '<div class="ct-empty-text">暂无联系人</div>' +
           '<div class="ct-empty-hint">点击右上角 + 添加联系人</div>' +
           '</div>';
    } else {
      h += '<div class="ct-list">';
      contacts.forEach(function (c) {
        h += '<div class="ct-list-item" data-id="' + esc(c.id) + '">' +
             avatarHtml(c, 44) +
             '<div class="ct-list-info">' +
             '<div class="ct-list-name">' + esc(c.name || '未命名') + '</div>' +
             '</div>' +
             '<svg class="ct-list-chevron" viewBox="0 0 24 24" width="16" height="16">' +
             '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg>' +
             '</div>';
      });
      h += '</div>';
    }

    h += '</div>';
    root.innerHTML = h;
    bindListEvents();
  }

  function bindListEvents() {
    var backBtn = root.querySelector('#ctListBack');
    if (backBtn) backBtn.addEventListener('click', function () { close(); });

    var addBtn = root.querySelector('#ctAddBtn');
    var menu   = root.querySelector('#ctActionMenu');
    if (addBtn && menu) {
      addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        menuVisible = !menuVisible;
        menu.classList.toggle('visible', menuVisible);
      });
    }

    var actionItems = root.querySelectorAll('.ct-action-item');
    for (var i = 0; i < actionItems.length; i++) {
      actionItems[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var action = this.dataset.action;
        menuVisible = false;
        if (menu) menu.classList.remove('visible');
        if (action === 'create') showView('form', null, false);
        else if (action === 'import') importInput.click();
      });
    }

    var ctBody = root.querySelector('.ct-body');
    if (ctBody) {
      ctBody.addEventListener('click', function () {
        if (menuVisible && menu) {
          menuVisible = false;
          menu.classList.remove('visible');
        }
      });
    }

    var listItems = root.querySelectorAll('.ct-list-item');
    for (var j = 0; j < listItems.length; j++) {
      listItems[j].addEventListener('click', function () {
        showView('detail', this.dataset.id);
      });
    }
  }

  /* ================================================================
   *  详情视图
   * ================================================================ */
  function renderDetailView(id) {
    var c = getContact(id);
    if (!c) { showView('list'); return; }
    var voice = c.voice || defaultVoice();
    var h = '';

    h += '<div class="ct-header">' +
         '<button class="ct-header-btn ct-back-btn" id="ctDetailBack">' +
         '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>' +
         ' 返回</button>' +
         '<span class="ct-header-title">' + esc(c.name || '联系人') + '</span>' +
         '<button class="ct-header-btn ct-text-btn" id="ctEditBtn">编辑</button>' +
         '</div>';

    h += '<div class="ct-body">';

    h += '<div class="ct-detail-top">' +
         avatarHtml(c, 80) +
         '<div class="ct-detail-name">' + esc(c.name || '未命名') + '</div>' +
         '</div>';

    if (c.persona) {
      h += '<div class="stg-section"><div class="stg-sec-head">' +
           '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9)">📝</span>' +
           '<span class="stg-sec-title">人物设定</span></div>' +
           '<div class="stg-group"><div class="stg-item">' +
           '<div class="ct-detail-text">' + esc(c.persona).replace(/\n/g, '<br>') + '</div>' +
           '</div></div></div>';
    }

    if (c.portrait) {
      h += '<div class="stg-section"><div class="stg-sec-head">' +
           '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#ec4899,#db2777)">🎨</span>' +
           '<span class="stg-sec-title">角色立绘</span></div>' +
           '<div class="stg-group"><div class="stg-item">' +
           '<div class="ct-portrait-preview"><img src="' + esc(c.portrait) + '" alt="角色立绘"></div>' +
           '</div></div></div>';
    }

    h += '<div class="stg-section"><div class="stg-sec-head">' +
         '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🎙️</span>' +
         '<span class="stg-sec-title">语音设置</span></div>' +
         '<div class="stg-group">';
    h += infoRow('Minimax 语音ID', voice.minimaxId || '未设置', true);
    h += infoRow('语言增强', labelFor(LANG_OPTIONS, voice.languageBoost), true);
    h += infoRow('语音语速', Number(voice.speed).toFixed(2) + 'x', true);
    h += infoRow('音调', (voice.pitch >= 0 ? '+' : '') + voice.pitch, true);
    h += infoRow('音量', voice.volume + '', true);
    h += infoRow('语音情绪', labelFor(EMOTION_OPTIONS, voice.emotion), false);
    h += '</div></div>';

    h += '<div class="stg-section"><div class="stg-group stg-actions">' +
         '<button class="stg-action-btn" id="ctExportBtn"><span class="stg-act-icon">📤</span>导出联系人</button>' +
         '<button class="stg-action-btn stg-danger" id="ctDeleteBtn"><span class="stg-act-icon">🗑️</span>删除联系人</button>' +
         '</div></div>';

    h += '<div style="height:40px"></div></div>';

    root.innerHTML = h;
    bindDetailEvents(id);
  }

  function infoRow(label, value, border) {
    return '<div class="stg-item' + (border ? ' stg-item-border' : '') + '">' +
           '<div class="ct-info-row"><span class="ct-info-label">' + label +
           '</span><span class="ct-info-value">' + esc(value) + '</span></div></div>';
  }

  function bindDetailEvents(id) {
    root.querySelector('#ctDetailBack').addEventListener('click', function () { showView('list'); });
    root.querySelector('#ctEditBtn').addEventListener('click', function () { showView('form', id, true); });

    root.querySelector('#ctExportBtn').addEventListener('click', function () {
      exportContact(id);
    });

    root.querySelector('#ctDeleteBtn').addEventListener('click', function () {
      ctConfirm('确认删除该联系人？', function () {
        deleteContact(id);
        showView('list');
        toast('联系人已删除');
      });
    });
  }

  /* ================================================================
   *  表单视图（新建 / 编辑）
   * ================================================================ */
  function renderFormView(id) {
    var isEdit = !!id;
    var c = isEdit ? getContact(id) : null;

    formState = {
      name:     c ? c.name     || '' : '',
      avatar:   c ? c.avatar   || '' : '',
      persona:  c ? c.persona  || '' : '',
      portrait: c ? c.portrait || '' : '',
      voice:    c && c.voice ? JSON.parse(JSON.stringify(c.voice)) : defaultVoice()
    };

    var v = formState.voice;
    var h = '';

    h += '<div class="ct-header">' +
         '<button class="ct-header-btn ct-back-btn" id="ctFormCancel">取消</button>' +
         '<span class="ct-header-title">' + (isEdit ? '编辑联系人' : '新建联系人') + '</span>' +
         '<button class="ct-header-btn ct-text-btn ct-save-btn" id="ctFormSave">保存</button>' +
         '</div>';

    h += '<div class="ct-body">';

    /* ── 头像区 ── */
    h += '<div class="ct-form-avatar-section">' +
         '<div class="ct-form-avatar" id="ctFormAvatarPreview">' + formAvatarHtml() + '</div>' +
         '<div class="ct-form-avatar-hint">点击头像上传图片</div>' +
         '<div style="width:100%;padding:4px 0">' +
         '<label class="stg-label">头像URL（可选）</label>' +
         '<input class="stg-input" id="ctAvatarUrlInput" type="text" placeholder="输入图片URL" value="' + esc(formState.avatar) + '">' +
         '</div></div>';

    /* ── 基本信息 ── */
    h += '<div class="stg-section"><div class="stg-sec-head">' +
         '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#3b82f6,#2563eb)">👤</span>' +
         '<span class="stg-sec-title">基本信息</span></div>' +
         '<div class="stg-group"><div class="stg-item">' +
         '<label class="stg-label">姓名</label>' +
         '<input class="stg-input" id="ctNameInput" type="text" placeholder="输入姓名" value="' + esc(formState.name) + '">' +
         '</div></div></div>';

    /* ── 角色设定 ── */
    h += '<div class="stg-section"><div class="stg-sec-head">' +
         '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9)">📝</span>' +
         '<span class="stg-sec-title">角色设定</span></div>' +
         '<div class="stg-group">' +
         '<div class="stg-item stg-item-border">' +
         '<label class="stg-label">人物设定</label>' +
         '<textarea class="stg-input ct-textarea" id="ctPersonaInput" placeholder="输入人物设定（性格、背景等）">' + esc(formState.persona) + '</textarea>' +
         '</div>' +
         '<div class="stg-item">' +
         '<label class="stg-label">角色立绘URL（用于视频通话）</label>' +
         '<input class="stg-input" id="ctPortraitInput" type="text" placeholder="输入角色立绘图片URL" value="' + esc(formState.portrait) + '">' +
         '<div class="ct-portrait-preview" id="ctPortraitPreview" style="margin-top:10px;' + (formState.portrait ? '' : 'display:none') + '">' +
         '<img src="' + esc(formState.portrait) + '" alt=""></div>' +
         '</div></div></div>';

    /* ── 语音设置 ── */
    h += '<div class="stg-section"><div class="stg-sec-head">' +
         '<span class="stg-sec-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🎙️</span>' +
         '<span class="stg-sec-title">语音设置</span></div>' +
         '<div class="stg-group">';

    h += '<div class="stg-item stg-item-border">' +
         '<label class="stg-label">Minimax 语音ID</label>' +
         '<input class="stg-input" id="ctVoiceIdInput" type="text" placeholder="输入语音ID" value="' + esc(v.minimaxId) + '">' +
         '</div>';

    h += '<div class="stg-item stg-item-border">' +
         '<label class="stg-label">语言增强</label>' +
         '<select class="stg-input ct-select" id="ctLangSelect">';
    LANG_OPTIONS.forEach(function (opt) {
      h += '<option value="' + esc(opt.value) + '"' +
           (v.languageBoost === opt.value ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
    });
    h += '</select></div>';

    h += sliderField('语音语速', 'ctSpeed', v.speed, 0.5, 2.0, 0.05, 'x', true);
    h += sliderField('音调',     'ctPitch', v.pitch, -12, 12, 1, '', true);
    h += sliderField('音量',     'ctVol',   v.volume, 1, 10, 1, '', true);

    h += '<div class="stg-item">' +
         '<label class="stg-label">语音情绪</label>' +
         '<select class="stg-input ct-select" id="ctEmotionSelect">';
    EMOTION_OPTIONS.forEach(function (opt) {
      h += '<option value="' + esc(opt.value) + '"' +
           (v.emotion === opt.value ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
    });
    h += '</select></div>';

    h += '</div></div>';
    h += '<div style="height:40px"></div></div>';

    root.innerHTML = h;
    bindFormEvents(id);
  }

  function sliderField(label, inputId, value, min, max, step, suffix, border) {
    var disp = step < 1 ? Number(value).toFixed(2) : String(value);
    if (suffix) disp += suffix;
    return '<div class="stg-item' + (border ? ' stg-item-border' : '') + '">' +
           '<div class="ct-slider-header">' +
           '<label class="stg-label" style="margin-bottom:0">' + label + '</label>' +
           '<span class="ct-slider-value" id="' + inputId + 'Val">' + disp + '</span></div>' +
           '<input class="ct-range" id="' + inputId + 'Range" type="range" ' +
           'min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">' +
           '</div>';
  }

  function formAvatarHtml() {
    if (formState.avatar) {
      return '<img src="' + esc(formState.avatar) + '" alt="" onerror="this.style.display=\'none\'">';
    }
    var ch = (formState.name || '?')[0];
    var bg = nameColor(formState.name || '');
    return '<span class="ct-avatar-fallback" style="background:' + bg + ';font-size:32px">' + esc(ch) + '</span>';
  }

  function refreshAvatarPreview() {
    var el = root.querySelector('#ctFormAvatarPreview');
    if (el) el.innerHTML = formAvatarHtml();
  }

  function bindFormEvents(editId) {
    root.querySelector('#ctFormCancel').addEventListener('click', goBack);

    root.querySelector('#ctFormSave').addEventListener('click', function () {
      if (!formState.name.trim()) { toast('请输入姓名'); return; }

      if (editId) {
        updateContact(editId, {
          name:     formState.name.trim(),
          avatar:   formState.avatar,
          persona:  formState.persona,
          portrait: formState.portrait,
          voice:    formState.voice
        });
        toast('联系人已更新');
        showView('detail', editId);
      } else {
        addContact({
          id:        genId(),
          name:      formState.name.trim(),
          avatar:    formState.avatar,
          persona:   formState.persona,
          portrait:  formState.portrait,
          voice:     formState.voice,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast('联系人已创建');
        showView('list');
      }
    });

    /* 头像点击上传 */
    root.querySelector('#ctFormAvatarPreview').addEventListener('click', function () {
      avatarInput.click();
    });

    root.querySelector('#ctAvatarUrlInput').addEventListener('input', function () {
      formState.avatar = this.value.trim();
      refreshAvatarPreview();
    });

    root.querySelector('#ctNameInput').addEventListener('input', function () {
      formState.name = this.value;
      if (!formState.avatar) refreshAvatarPreview();
    });

    root.querySelector('#ctPersonaInput').addEventListener('input', function () {
      formState.persona = this.value;
    });

    var portraitInput   = root.querySelector('#ctPortraitInput');
    var portraitPreview = root.querySelector('#ctPortraitPreview');
    portraitInput.addEventListener('input', function () {
      formState.portrait = this.value.trim();
      if (formState.portrait) {
        portraitPreview.style.display = '';
        portraitPreview.querySelector('img').src = formState.portrait;
      } else {
        portraitPreview.style.display = 'none';
      }
    });

    root.querySelector('#ctVoiceIdInput').addEventListener('input', function () {
      formState.voice.minimaxId = this.value;
    });
    root.querySelector('#ctLangSelect').addEventListener('change', function () {
      formState.voice.languageBoost = this.value;
    });
    root.querySelector('#ctEmotionSelect').addEventListener('change', function () {
      formState.voice.emotion = this.value;
    });

    bindRangeSlider('ctSpeed', 'speed', 'x', true);
    bindRangeSlider('ctPitch', 'pitch', '', false);
    bindRangeSlider('ctVol',   'volume', '', false);

    avatarInput.onchange = function () {
      var file = this.files[0];
      if (!file) return;
      this.value = '';
      var reader = new FileReader();
      reader.onload = function (e) {
        formState.avatar = e.target.result;
        refreshAvatarPreview();
        var urlIn = root.querySelector('#ctAvatarUrlInput');
        if (urlIn) urlIn.value = '';
      };
      reader.readAsDataURL(file);
    };
  }

  function bindRangeSlider(inputId, voiceKey, suffix, isFloat) {
    var slider = root.querySelector('#' + inputId + 'Range');
    var valEl  = root.querySelector('#' + inputId + 'Val');
    if (!slider || !valEl) return;
    slider.addEventListener('input', function () {
      var v = isFloat ? parseFloat(this.value) : parseInt(this.value, 10);
      formState.voice[voiceKey] = v;
      var d = isFloat ? v.toFixed(2) : String(v);
      if (suffix) d += suffix;
      valEl.textContent = d;
    });
  }

  /* ================================================================
   *  导入 / 导出
   * ================================================================ */
  function exportContact(id) {
    var c = getContact(id);
    if (!c) return;
    var blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = (c.name || 'contact') + '.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('联系人已导出');
  }

  importInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    this.value = '';
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        var arr = Array.isArray(data) ? data : [data];
        var count = 0;
        arr.forEach(function (item) {
          if (!item.name) return;
          var v = defaultVoice();
          if (item.voice) {
            for (var k in item.voice) {
              if (item.voice.hasOwnProperty(k)) v[k] = item.voice[k];
            }
          }
          addContact({
            id:        genId(),
            name:      item.name || '',
            avatar:    item.avatar || '',
            persona:   item.persona || '',
            portrait:  item.portrait || '',
            voice:     v,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          count++;
        });
        if (count > 0) {
          toast('已导入 ' + count + ' 个联系人');
          if (isOpen) showView('list');
        } else {
          toast('未找到有效联系人数据');
        }
      } catch (_) {
        toast('文件解析失败');
      }
    };
    reader.readAsText(file);
  });

  /* ================================================================
   *  Toast & 确认弹窗
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

  function ctConfirm(msg, onOk) {
    var mask = document.createElement('div');
    mask.className = 'stg-confirm-mask';
    mask.innerHTML =
      '<div class="stg-confirm-box">' +
      '<div class="stg-confirm-msg">' + esc(msg) + '</div>' +
      '<div class="stg-confirm-actions">' +
      '<button class="stg-confirm-btn stg-confirm-no">取消</button>' +
      '<button class="stg-confirm-btn stg-confirm-yes">确认</button>' +
      '</div></div>';
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
      dismiss(); if (onOk) onOk();
    });
    mask.addEventListener('click', function (e) { if (e.target === mask) dismiss(); });
  }

  /* ================================================================
   *  面板 开 / 关
   * ================================================================ */
  function open() {
    if (isOpen) return;
    isOpen = true;
    showView('list');
    overlay.classList.add('visible');
  }

  function close() {
    if (!isOpen) return;
    overlay.classList.remove('visible');
    isOpen = false;
    menuVisible = false;
  }

  overlay.addEventListener('pointerdown',   function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointermove',   function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointerup',     function (e) { e.stopPropagation(); });
  overlay.addEventListener('pointercancel', function (e) { e.stopPropagation(); });

  /* ================================================================
   *  openApp 链式注册
   * ================================================================ */
  var _prevOpenApp = window.openApp;
  window.openApp = function (appId) {
    if (appId === 'contacts') { open(); return; }
    if (_prevOpenApp) _prevOpenApp(appId);
  };

  window.SunnyContacts = {
    open: open,
    close: close,
    list: loadContacts
  };

})();
