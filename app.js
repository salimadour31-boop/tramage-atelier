/**
 * app.js — UI, presets, load/export for Tramage Atelier.
 * MIT © 2026 Amirouche Amwanes / salimadour31-boop
 */
(function () {
  'use strict';

  var MAX_PREVIEW = 900; // max edge for live preview performance
  var MAX_EXPORT = 2400;

  var DEFAULTS = {
    pattern: 'dots',
    cellSize: 8,
    angle: 45,
    contrast: 1.2,
    bias: 0,
    invert: false,
    ink: '#1a1a1a',
    paper: '#f5f0e8',
    duotone: false,
    ink2: '#c45c26'
  };

  /** Artistic presets for print / poster / packaging look. */
  var PRESETS = [
    {
      id: 'affiche',
      sw: '#c45c26',
      settings: {
        pattern: 'dots',
        cellSize: 10,
        angle: 22,
        contrast: 1.35,
        bias: -0.04,
        invert: false,
        ink: '#2a1810',
        paper: '#f2e6d4',
        duotone: true,
        ink2: '#c45c26'
      }
    },
    {
      id: 'journal',
      sw: '#888',
      settings: {
        pattern: 'dots',
        cellSize: 5,
        angle: 45,
        contrast: 1.1,
        bias: 0.02,
        invert: false,
        ink: '#111111',
        paper: '#ece8e0',
        duotone: false,
        ink2: '#666666'
      }
    },
    {
      id: 'serigraphie',
      sw: '#1a5c3a',
      settings: {
        pattern: 'dots',
        cellSize: 12,
        angle: 15,
        contrast: 1.6,
        bias: -0.08,
        invert: false,
        ink: '#0d3d28',
        paper: '#f7f2e8',
        duotone: false,
        ink2: '#c45c26'
      }
    },
    {
      id: 'comics',
      sw: '#1a3a8a',
      settings: {
        pattern: 'dots',
        cellSize: 9,
        angle: 30,
        contrast: 1.45,
        bias: -0.06,
        invert: false,
        ink: '#0a1a4a',
        paper: '#fff8f0',
        duotone: true,
        ink2: '#c82020'
      }
    },
    {
      id: 'packaging',
      sw: '#5a3a1a',
      settings: {
        pattern: 'squares',
        cellSize: 7,
        angle: 0,
        contrast: 1.25,
        bias: 0,
        invert: false,
        ink: '#3a2818',
        paper: '#f5efe4',
        duotone: false,
        ink2: '#8a6030'
      }
    },
    {
      id: 'nb',
      sw: '#e8e8e8',
      settings: {
        pattern: 'dots',
        cellSize: 6,
        angle: 45,
        contrast: 1.3,
        bias: 0,
        invert: false,
        ink: '#0a0a0a',
        paper: '#ffffff',
        duotone: false,
        ink2: '#888888'
      }
    },
    {
      id: 'cyanotype',
      sw: '#1a4a8a',
      settings: {
        pattern: 'dots',
        cellSize: 8,
        angle: 45,
        contrast: 1.4,
        bias: -0.05,
        invert: false,
        ink: '#0a2a5a',
        paper: '#d8e4f0',
        duotone: false,
        ink2: '#3a6aaa'
      }
    },
    {
      id: 'neon',
      sw: '#ff2a9a',
      settings: {
        pattern: 'diamonds',
        cellSize: 11,
        angle: 30,
        contrast: 1.55,
        bias: -0.1,
        invert: false,
        ink: '#ff2a9a',
        paper: '#0a0812',
        duotone: true,
        ink2: '#2affd0'
      }
    },
    {
      id: 'poster',
      sw: '#e8a020',
      settings: {
        pattern: 'lines',
        cellSize: 10,
        angle: 60,
        contrast: 1.5,
        bias: -0.06,
        invert: false,
        ink: '#1a1020',
        paper: '#ffe8c8',
        duotone: true,
        ink2: '#e04020'
      }
    },
    {
      id: 'offset',
      sw: '#2a2a2a',
      settings: {
        pattern: 'dots',
        cellSize: 4,
        angle: 15,
        contrast: 1.15,
        bias: 0,
        invert: false,
        ink: '#1c1c1c',
        paper: '#f8f4ec',
        duotone: false,
        ink2: '#886644'
      }
    }
  ];

  // DOM
  var view = document.getElementById('view');
  var drop = document.getElementById('drop');
  var fileImg = document.getElementById('fileImg');
  var fileJson = document.getElementById('fileJson');
  var presetsEl = document.getElementById('presets');
  var toastEl = document.getElementById('toast');
  var langSel = document.getElementById('lang');

  var els = {
    pattern: document.getElementById('pattern'),
    cellSize: document.getElementById('cellSize'),
    angle: document.getElementById('angle'),
    contrast: document.getElementById('contrast'),
    bias: document.getElementById('bias'),
    invert: document.getElementById('invert'),
    ink: document.getElementById('ink'),
    paper: document.getElementById('paper'),
    duotone: document.getElementById('duotone'),
    ink2: document.getElementById('ink2'),
    ink2Row: document.getElementById('ink2Row'),
    outCell: document.getElementById('outCell'),
    outAngle: document.getElementById('outAngle'),
    outContrast: document.getElementById('outContrast'),
    outBias: document.getElementById('outBias')
  };

  var state = Object.assign({}, DEFAULTS);
  var sourceCanvas = null; // full-res working source
  var previewCanvas = null; // downscaled for live preview
  var activePreset = null;
  var lang = 'fr';
  var raf = 0;
  var debounceTimer = 0;
  var offscreen = document.createElement('canvas');

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  function readSettingsFromUI() {
    state.pattern = els.pattern.value;
    state.cellSize = +els.cellSize.value;
    state.angle = +els.angle.value;
    state.contrast = +els.contrast.value;
    state.bias = +els.bias.value;
    state.invert = !!els.invert.checked;
    state.ink = els.ink.value;
    state.paper = els.paper.value;
    state.duotone = !!els.duotone.checked;
    state.ink2 = els.ink2.value;
    updateOutputs();
    els.ink2Row.style.opacity = state.duotone ? '1' : '0.4';
    els.ink2.disabled = !state.duotone;
  }

  function writeSettingsToUI(s) {
    els.pattern.value = s.pattern;
    els.cellSize.value = s.cellSize;
    els.angle.value = s.angle;
    els.contrast.value = s.contrast;
    els.bias.value = s.bias;
    els.invert.checked = !!s.invert;
    els.ink.value = s.ink;
    els.paper.value = s.paper;
    els.duotone.checked = !!s.duotone;
    els.ink2.value = s.ink2;
    Object.assign(state, s);
    updateOutputs();
    els.ink2Row.style.opacity = state.duotone ? '1' : '0.4';
    els.ink2.disabled = !state.duotone;
  }

  function updateOutputs() {
    els.outCell.textContent = String(state.cellSize);
    els.outAngle.textContent = state.angle + '°';
    els.outContrast.textContent = (+state.contrast).toFixed(2);
    els.outBias.textContent = (state.bias >= 0 ? '+' : '') + (+state.bias).toFixed(2);
  }

  function scaleCanvas(src, maxEdge) {
    var w = src.width;
    var h = src.height;
    var scale = Math.min(1, maxEdge / Math.max(w, h));
    var dw = Math.max(1, Math.round(w * scale));
    var dh = Math.max(1, Math.round(h * scale));
    var c = document.createElement('canvas');
    c.width = dw;
    c.height = dh;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, dw, dh);
    return c;
  }

  function setSourceFromCanvas(c) {
    sourceCanvas = c;
    previewCanvas = scaleCanvas(c, MAX_PREVIEW);
    scheduleRender(true);
  }

  function scheduleRender(immediate) {
    clearTimeout(debounceTimer);
    if (immediate) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(doRender);
      return;
    }
    debounceTimer = setTimeout(function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(doRender);
    }, 40);
  }

  function doRender() {
    raf = 0;
    if (!previewCanvas) return;
    readSettingsFromUI();
    // Scale cell size proportionally if preview is smaller than source
    var opts = Object.assign({}, state);
    if (sourceCanvas && previewCanvas.width < sourceCanvas.width) {
      var ratio = previewCanvas.width / sourceCanvas.width;
      opts.cellSize = Math.max(2, Math.round(state.cellSize * ratio));
    }
    Tramage.render(offscreen, previewCanvas, opts);
    // Draw to visible canvas (fit CSS via max-width)
    view.width = offscreen.width;
    view.height = offscreen.height;
    var vctx = view.getContext('2d');
    vctx.drawImage(offscreen, 0, 0);
  }

  function loadImageFile(file) {
    if (!file || !file.type || file.type.indexOf('image') !== 0) {
      toast(t('loadError'));
      return;
    }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      var c = document.createElement('canvas');
      // Cap very large photos for memory
      var max = 3200;
      var sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      c.width = Math.round(img.naturalWidth * sc);
      c.height = Math.round(img.naturalHeight * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      setSourceFromCanvas(c);
      toast(t('loaded'));
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      toast(t('loadError'));
    };
    img.src = url;
  }

  function loadDemo() {
    var demo = Tramage.makeDemoImage(640, 800);
    setSourceFromCanvas(demo);
  }

  function buildPresets() {
    presetsEl.innerHTML = '';
    PRESETS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset' + (activePreset === p.id ? ' on' : '');
      btn.dataset.id = p.id;
      var sw = document.createElement('span');
      sw.className = 'sw';
      sw.style.setProperty('--sw', p.sw);
      var label = document.createElement('span');
      label.setAttribute('data-i18n', 'p_' + p.id);
      label.textContent = t('p_' + p.id);
      btn.appendChild(sw);
      btn.appendChild(label);
      btn.addEventListener('click', function () {
        activePreset = p.id;
        writeSettingsToUI(Object.assign({}, DEFAULTS, p.settings));
        highlightPreset();
        scheduleRender(true);
      });
      presetsEl.appendChild(btn);
    });
  }

  function highlightPreset() {
    presetsEl.querySelectorAll('.preset').forEach(function (b) {
      b.classList.toggle('on', b.dataset.id === activePreset);
    });
  }

  function exportPNG() {
    if (!sourceCanvas) return;
    toast(t('rendering'));
    readSettingsFromUI();
    var src = scaleCanvas(sourceCanvas, MAX_EXPORT);
    var out = document.createElement('canvas');
    var opts = Object.assign({}, state);
    // Keep cell size relative to original intent on export canvas
    if (src.width !== sourceCanvas.width) {
      opts.cellSize = Math.max(2, Math.round(state.cellSize * (src.width / sourceCanvas.width)));
    }
    Tramage.render(out, src, opts);
    out.toBlob(function (blob) {
      downloadBlob(blob, 'tramage.png');
      toast(t('exported') + 'tramage.png');
    }, 'image/png');
  }

  function exportSVG() {
    if (!sourceCanvas) return;
    toast(t('rendering'));
    readSettingsFromUI();
    var src = scaleCanvas(sourceCanvas, 1600);
    var opts = Object.assign({}, state);
    if (src.width !== sourceCanvas.width) {
      opts.cellSize = Math.max(3, Math.round(state.cellSize * (src.width / sourceCanvas.width)));
    }
    // Prefer slightly larger cells for SVG file size
    opts.cellSize = Math.max(opts.cellSize, 6);
    var svg = Tramage.toSVG(src, opts, 10000);
    var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'tramage.svg');
    toast(t('exported') + 'tramage.svg');
  }

  function exportJSON() {
    readSettingsFromUI();
    var data = {
      app: 'tramage-atelier',
      version: 1,
      settings: Object.assign({}, state)
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'tramage-settings.json');
    toast(t('exported') + 'tramage-settings.json');
  }

  function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var s = data.settings || data;
        writeSettingsToUI(Object.assign({}, DEFAULTS, {
          pattern: s.pattern,
          cellSize: s.cellSize,
          angle: s.angle,
          contrast: s.contrast,
          bias: s.bias,
          invert: s.invert,
          ink: s.ink,
          paper: s.paper,
          duotone: s.duotone,
          ink2: s.ink2
        }));
        activePreset = null;
        highlightPreset();
        scheduleRender(true);
        toast(t('imported'));
      } catch (e) {
        toast(t('importError'));
      }
    };
    reader.readAsText(file);
  }

  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
  }

  function t(key) {
    return window.t(key, lang);
  }

  function setLang(l) {
    lang = l;
    langSel.value = l;
    window.applyI18n(l);
    try {
      localStorage.setItem('tramage-lang', l);
    } catch (e) {}
  }

  // Events
  function onControlChange() {
    activePreset = null;
    highlightPreset();
    readSettingsFromUI();
    scheduleRender(false);
  }

  ['pattern', 'cellSize', 'angle', 'contrast', 'bias', 'ink', 'paper', 'ink2'].forEach(function (id) {
    els[id].addEventListener('input', onControlChange);
    els[id].addEventListener('change', onControlChange);
  });
  els.invert.addEventListener('change', onControlChange);
  els.duotone.addEventListener('change', onControlChange);

  fileImg.addEventListener('change', function () {
    if (fileImg.files && fileImg.files[0]) loadImageFile(fileImg.files[0]);
    fileImg.value = '';
  });
  fileJson.addEventListener('change', function () {
    if (fileJson.files && fileJson.files[0]) importJSON(fileJson.files[0]);
    fileJson.value = '';
  });

  document.getElementById('btnSample').addEventListener('click', loadDemo);
  document.getElementById('btnPng').addEventListener('click', exportPNG);
  document.getElementById('btnSvg').addEventListener('click', exportSVG);
  document.getElementById('btnJson').addEventListener('click', exportJSON);
  document.getElementById('btnReset').addEventListener('click', function () {
    activePreset = null;
    writeSettingsToUI(Object.assign({}, DEFAULTS));
    highlightPreset();
    scheduleRender(true);
  });

  langSel.addEventListener('change', function () {
    setLang(langSel.value);
  });

  // Drag & drop
  ;['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      drop.classList.add('drag');
    });
  });
  ;['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      drop.classList.remove('drag');
    });
  });
  drop.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadImageFile(f);
  });
  // Also allow drop on whole stage
  document.body.addEventListener('dragover', function (e) {
    if (e.dataTransfer && e.dataTransfer.types.indexOf('Files') !== -1) e.preventDefault();
  });
  document.body.addEventListener('drop', function (e) {
    if (e.target.closest && e.target.closest('#drop')) return;
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && f.type && f.type.indexOf('image') === 0) {
      e.preventDefault();
      loadImageFile(f);
    }
  });

  // Init
  try {
    var saved = localStorage.getItem('tramage-lang');
    if (saved && window.I18N[saved]) lang = saved;
  } catch (e) {}
  writeSettingsToUI(DEFAULTS);
  buildPresets();
  setLang(lang);
  loadDemo();
})();
