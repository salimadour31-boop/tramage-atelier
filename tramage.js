/**
 * tramage.js — Classic AM (amplitude-modulated) halftone / tramage screening.
 * Pure Canvas 2D, no dependencies. MIT © 2026 Amirouche Amwanes.
 *
 * For each cell on a rotated sampling grid, read luminance and draw a shape
 * sized by that luminance (dots, squares, lines, diamonds).
 */
(function (global) {
  'use strict';

  /** Luminance from sRGB (0–255 channels → 0–1). */
  function luminance(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  /** Clamp helper. */
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  /**
   * Apply contrast around mid-grey, then threshold bias, then optional invert.
   * @param {number} L 0–1 luminance
   * @param {{contrast:number, bias:number, invert:boolean}} adj
   * @returns {number} coverage 0–1 (how much ink fills the cell)
   */
  function adjustLuma(L, adj) {
    var c = adj.contrast != null ? adj.contrast : 1;
    var bias = adj.bias != null ? adj.bias : 0;
    var t = (L - 0.5) * c + 0.5 + bias;
    t = clamp(t, 0, 1);
    // Dark areas → larger dots (more ink). Invert flips that.
    var coverage = adj.invert ? t : 1 - t;
    return clamp(coverage, 0, 1);
  }

  /**
   * Sample source image into a rotated cell grid and return cell descriptors.
   * @param {HTMLCanvasElement|OffscreenCanvas} srcCanvas
   * @param {object} opts
   * @returns {{cells:Array, cols:number, rows:number, cell:number, angle:number, w:number, h:number}}
   */
  function sampleGrid(srcCanvas, opts) {
    var cell = Math.max(2, opts.cellSize | 0);
    var angleDeg = opts.angle != null ? opts.angle : 45;
    var angle = (angleDeg * Math.PI) / 180;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var w = srcCanvas.width;
    var h = srcCanvas.height;

    var ctx = srcCanvas.getContext('2d', { willReadFrequently: true });
    var img = ctx.getImageData(0, 0, w, h);
    var data = img.data;

    // Bounding box of rotated image → how many cells we need
    var diag = Math.ceil(Math.sqrt(w * w + h * h));
    var cols = Math.ceil(diag / cell) + 2;
    var rows = Math.ceil(diag / cell) + 2;
    var ox = w / 2;
    var oy = h / 2;
    var halfCols = cols / 2;
    var halfRows = rows / 2;

    var cells = [];
    var adj = {
      contrast: opts.contrast != null ? opts.contrast : 1,
      bias: opts.bias != null ? opts.bias : 0,
      invert: !!opts.invert
    };

    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        // Cell centre in rotated space, then map back to image space
        var rx = (i - halfCols + 0.5) * cell;
        var ry = (j - halfRows + 0.5) * cell;
        var sx = rx * cos - ry * sin + ox;
        var sy = rx * sin + ry * cos + oy;
        var ix = Math.round(sx);
        var iy = Math.round(sy);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;

        var idx = (iy * w + ix) * 4;
        var L = luminance(data[idx], data[idx + 1], data[idx + 2]);
        var a = data[idx + 3] / 255;
        if (a < 0.05) continue; // skip near-transparent
        // Blend toward paper (white) for partial alpha
        L = L * a + (1 - a);
        var cov = adjustLuma(L, adj);
        if (cov < 0.02) continue; // skip empty cells for performance

        cells.push({
          x: sx,
          y: sy,
          cov: cov,
          i: i,
          j: j
        });
      }
    }

    return { cells: cells, cols: cols, rows: rows, cell: cell, angle: angle, angleDeg: angleDeg, w: w, h: h };
  }

  /**
   * Draw a single halftone shape at (x,y) sized by coverage.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} pattern 'dots'|'squares'|'lines'|'lines-h'|'diamonds'
   * @param {number} x
   * @param {number} y
   * @param {number} cell
   * @param {number} cov 0–1
   * @param {number} angle radians (for line orientation relative to screen)
   */
  function drawShape(ctx, pattern, x, y, cell, cov, angle) {
    var size = cov * cell;
    if (size < 0.4) return;

    ctx.beginPath();
    switch (pattern) {
      case 'squares': {
        var half = size / 2;
        ctx.rect(x - half, y - half, size, size);
        break;
      }
      case 'diamonds': {
        var h2 = size / 2;
        ctx.moveTo(x, y - h2);
        ctx.lineTo(x + h2, y);
        ctx.lineTo(x, y + h2);
        ctx.lineTo(x - h2, y);
        ctx.closePath();
        break;
      }
      case 'lines':
      case 'lines-h': {
        // Line thickness from coverage; length ≈ cell
        var thick = Math.max(0.5, cov * cell);
        var len = cell * 0.95;
        var a = pattern === 'lines-h' ? 0 : angle;
        // Draw perpendicular to screen angle for classic line screen,
        // or horizontal when lines-h
        var dx = Math.cos(a) * (len / 2);
        var dy = Math.sin(a) * (len / 2);
        // Perpendicular for thickness direction handled via lineWidth
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.lineWidth = thick;
        ctx.lineCap = 'butt';
        ctx.stroke();
        return; // stroked, not filled
      }
      case 'dots':
      default: {
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        break;
      }
    }
    ctx.fill();
  }

  /**
   * Render halftone onto a destination canvas.
   * @param {HTMLCanvasElement} dest
   * @param {HTMLCanvasElement|OffscreenCanvas} src
   * @param {object} opts
   */
  function render(dest, src, opts) {
    opts = opts || {};
    var pattern = opts.pattern || 'dots';
    var ink = opts.ink || '#1a1a1a';
    var paper = opts.paper || '#f5f0e8';
    var duotone = opts.duotone || false;
    var ink2 = opts.ink2 || '#c45c26';

    var grid = sampleGrid(src, opts);
    var w = grid.w;
    var h = grid.h;

    dest.width = w;
    dest.height = h;
    var ctx = dest.getContext('2d');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);

    // Optional second-colour duotone: dark cells use ink, midtones use ink2
    if (duotone) {
      ctx.fillStyle = ink2;
      ctx.strokeStyle = ink2;
      for (var k = 0; k < grid.cells.length; k++) {
        var c = grid.cells[k];
        if (c.cov < 0.35 || c.cov > 0.75) continue;
        drawShape(ctx, pattern, c.x, c.y, grid.cell, c.cov * 0.85, grid.angle);
      }
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      for (var k2 = 0; k2 < grid.cells.length; k2++) {
        var c2 = grid.cells[k2];
        if (c2.cov < 0.35) continue;
        // Darker shapes on top for blacks
        var cov2 = c2.cov > 0.75 ? c2.cov : c2.cov * 0.55;
        if (c2.cov <= 0.75 && cov2 < 0.15) continue;
        drawShape(ctx, pattern, c2.x, c2.y, grid.cell, c2.cov > 0.75 ? c2.cov : Math.max(0.2, c2.cov * 0.5), grid.angle);
      }
    } else {
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      for (var i = 0; i < grid.cells.length; i++) {
        var cell = grid.cells[i];
        drawShape(ctx, pattern, cell.x, cell.y, grid.cell, cell.cov, grid.angle);
      }
    }

    return grid;
  }

  /**
   * Build an SVG string of the tramage (vector shapes for Illustrator).
   * Caps cell count by raising cell size if needed.
   * @param {HTMLCanvasElement|OffscreenCanvas} src
   * @param {object} opts
   * @param {number} [maxCells=12000]
   * @returns {string} SVG markup
   */
  function toSVG(src, opts, maxCells) {
    opts = Object.assign({}, opts);
    maxCells = maxCells || 12000;
    var cell = Math.max(2, opts.cellSize | 0);
    // Estimate cells: roughly (diag/cell)^2
    var w = src.width;
    var h = src.height;
    var diag = Math.sqrt(w * w + h * h);
    var est = Math.pow(diag / cell + 2, 2);
    if (est > maxCells) {
      cell = Math.ceil(diag / (Math.sqrt(maxCells) - 2));
      opts.cellSize = cell;
    }

    var grid = sampleGrid(src, opts);
    var pattern = opts.pattern || 'dots';
    var ink = opts.ink || '#1a1a1a';
    var paper = opts.paper || '#f5f0e8';
    var angleDeg = grid.angleDeg;

    var parts = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        w +
        '" height="' +
        h +
        '" viewBox="0 0 ' +
        w +
        ' ' +
        h +
        '" fill="' +
        ink +
        '">'
    );
    parts.push('<!-- tramage-atelier — AM halftone export -->');
    parts.push('<rect width="100%" height="100%" fill="' + paper + '"/>');
    parts.push('<g id="tramage">');

    for (var i = 0; i < grid.cells.length; i++) {
      var c = grid.cells[i];
      var size = c.cov * grid.cell;
      if (size < 0.5) continue;
      var x = +c.x.toFixed(2);
      var y = +c.y.toFixed(2);

      switch (pattern) {
        case 'squares': {
          var half = size / 2;
          parts.push(
            '<rect x="' +
              (x - half).toFixed(2) +
              '" y="' +
              (y - half).toFixed(2) +
              '" width="' +
              size.toFixed(2) +
              '" height="' +
              size.toFixed(2) +
              '"/>'
          );
          break;
        }
        case 'diamonds': {
          var h2 = size / 2;
          parts.push(
            '<polygon points="' +
              x +
              ',' +
              (y - h2).toFixed(2) +
              ' ' +
              (x + h2).toFixed(2) +
              ',' +
              y +
              ' ' +
              x +
              ',' +
              (y + h2).toFixed(2) +
              ' ' +
              (x - h2).toFixed(2) +
              ',' +
              y +
              '"/>'
          );
          break;
        }
        case 'lines':
        case 'lines-h': {
          var thick = Math.max(0.5, c.cov * grid.cell);
          var len = grid.cell * 0.95;
          var a = pattern === 'lines-h' ? 0 : grid.angle;
          var dx = Math.cos(a) * (len / 2);
          var dy = Math.sin(a) * (len / 2);
          parts.push(
            '<line x1="' +
              (x - dx).toFixed(2) +
              '" y1="' +
              (y - dy).toFixed(2) +
              '" x2="' +
              (x + dx).toFixed(2) +
              '" y2="' +
              (y + dy).toFixed(2) +
              '" stroke="' +
              ink +
              '" stroke-width="' +
              thick.toFixed(2) +
              '" stroke-linecap="butt"/>'
          );
          break;
        }
        default: {
          parts.push(
            '<circle cx="' + x + '" cy="' + y + '" r="' + (size / 2).toFixed(2) + '"/>'
          );
        }
      }
    }

    parts.push('</g></svg>');
    return parts.join('\n');
  }

  /**
   * Procedural demo image: abstract portrait-like gradient + shapes.
   * So the page is never empty.
   * @param {number} [w=640]
   * @param {number} [h=800]
   * @returns {HTMLCanvasElement}
   */
  function makeDemoImage(w, h) {
    w = w || 640;
    h = h || 800;
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');

    // Soft paper background
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#d8cfc0');
    g.addColorStop(0.45, '#a89b88');
    g.addColorStop(1, '#3a342c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft radial “face” blob
    var rg = ctx.createRadialGradient(w * 0.48, h * 0.38, 20, w * 0.5, h * 0.42, w * 0.42);
    rg.addColorStop(0, 'rgba(255,230,200,0.95)');
    rg.addColorStop(0.5, 'rgba(180,140,110,0.7)');
    rg.addColorStop(1, 'rgba(40,30,25,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);

    // Geometric poster blocks
    ctx.fillStyle = 'rgba(20,40,70,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    ctx.lineTo(w * 0.55, h * 0.4);
    ctx.lineTo(w * 0.7, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(160,40,30,0.5)';
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.28, w * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(240,220,180,0.35)';
    ctx.fillRect(w * 0.1, h * 0.72, w * 0.35, h * 0.08);

    // Fine noise for tonal variety
    var id = ctx.getImageData(0, 0, w, h);
    var d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * 28;
      d[i] = clamp(d[i] + n, 0, 255);
      d[i + 1] = clamp(d[i + 1] + n, 0, 255);
      d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    }
    ctx.putImageData(id, 0, 0);
    return c;
  }

  global.Tramage = {
    sampleGrid: sampleGrid,
    render: render,
    toSVG: toSVG,
    makeDemoImage: makeDemoImage,
    luminance: luminance,
    adjustLuma: adjustLuma
  };
})(typeof window !== 'undefined' ? window : globalThis);
