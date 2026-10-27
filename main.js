/* Schreinerei Brandl – gemeinsames Skript für alle Seiten */
(function () {
  "use strict";
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var PREVIEW = !!window.DEMO_PREVIEW;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ============ Bildwelten: gezeichnete Platzhalter, bis echte Fotos da sind ============ */
  var PAL = {
    oak: ["#c99a63", "#b3824b", "#8e6034"],
    oakLight: ["#dcb888", "#cba16d", "#ab7f4a"],
    walnut: ["#71503a", "#5a3b27", "#3e2819"],
    ash: ["#e4d4b6", "#d2bc95", "#b49c75"],
    maple: ["#ecdcc2", "#dfcba9", "#c7ae88"],
    pine: ["#dcbd7c", "#c9a562", "#a98646"]
  };
  function rng(s) { s = s % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function fill(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function grad(c, x, y, w, h, stops, horiz) {
    var g = horiz ? c.createLinearGradient(x, y, x + w, y) : c.createLinearGradient(x, y, x, y + h);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    c.fillStyle = g; c.fillRect(x, y, w, h);
  }
  function shade(c, x, y, w, h, a0, a1, horiz) { grad(c, x, y, w, h, [[0, "rgba(0,0,0," + a0 + ")"], [1, "rgba(0,0,0," + a1 + ")"]], horiz); }
  function light(c, x, y, w, h, a0, a1, horiz) { grad(c, x, y, w, h, [[0, "rgba(255,255,255," + a0 + ")"], [1, "rgba(255,255,255," + a1 + ")"]], horiz); }
  function glow(c, x, y, r, inner, outer) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer);
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function grain(c, x, y, w, h, key, seed, dir) {
    var p = PAL[key] || PAL.oak, r = rng(seed || 7), v = dir === "v";
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    var g = v ? c.createLinearGradient(x, y, x + w, y) : c.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, p[0]); g.addColorStop(.5, p[1]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(x, y, w, h);
    var cross = v ? w : h, along = v ? h : w;
    var n = Math.max(8, Math.round(cross / 7)), step = Math.max(4, along / 140);
    for (var i = 0; i < n; i++) {
      var c0 = (i / n) * cross * 1.15 - cross * .075;
      var amp = 1 + r() * Math.min(11, cross * .05);
      var f = (.004 + r() * .01) * (700 / Math.max(along, 200)), ph = r() * 6.28;
      c.beginPath();
      for (var a = 0; a <= along + step; a += step) {
        var o = c0 + Math.sin(a * f + ph) * amp + Math.sin(a * f * 2.7 + ph * 1.3) * amp * .35;
        if (v) { if (a === 0) c.moveTo(x + o, y + a); else c.lineTo(x + o, y + a); }
        else { if (a === 0) c.moveTo(x + a, y + o); else c.lineTo(x + a, y + o); }
      }
      c.strokeStyle = r() > .72 ? p[2] : p[1];
      c.globalAlpha = .16 + r() * .42; c.lineWidth = .5 + r() * 1.9; c.stroke();
    }
    c.globalAlpha = 1; c.restore();
  }
  function room(c, W, H, o) {
    var fy = o.fy;
    grad(c, 0, 0, W, fy, [[0, o.wall0 || "#e9e9e4"], [1, o.wall1 || "#d4d5ce"]]);
    glow(c, W * .14, H * .02, W * .8, "rgba(255,255,255,.45)", "rgba(255,255,255,0)");
    grain(c, 0, fy, W, H - fy, o.floor || "oakLight", 3, "h");
    c.strokeStyle = "rgba(70,45,20,.2)"; c.lineWidth = 1;
    var rows = 4, rh = (H - fy) / rows, r = rng(9);
    for (var i = 0; i < rows; i++) {
      var y = fy + i * rh; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      for (var x = r() * W * .3; x < W; x += W * .34) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + rh); c.stroke(); }
    }
    shade(c, 0, fy, W, H - fy, .1, .3);
    fill(c, o.base || "#f2f1ec", 0, fy - H * .018, W, H * .018);
    fill(c, "rgba(0,0,0,.1)", 0, fy, W, 2);
  }
  function plant(c, x, fy, s) {
    fill(c, "#d1ccc2", x, fy - s * .42, s * .36, s * .42);
    shade(c, x, fy - s * .42, s * .36, s * .42, 0, .18, true);
    var r = rng(5), cx = x + s * .18, cy = fy - s * .42;
    for (var i = 0; i < 11; i++) {
      c.save(); c.translate(cx, cy); c.rotate(-1.1 + i * .22 + (r() - .5) * .2);
      c.beginPath(); c.ellipse(0, -s * .32, s * .06, s * .32, 0, 0, Math.PI * 2);
      c.fillStyle = ["#4c6a55", "#3e5947", "#5c7a63"][i % 3]; c.fill(); c.restore();
    }
  }

  function wardrobe(c, W, H) {
    var fy = H * .84, x0 = W * .27, x1 = W * .71, yl = H * .46, yr = H * .1;
    function ys(x) { return yl + (yr - yl) * (x - x0) / (x1 - x0); }
    room(c, W, H, { fy: fy });
    c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, ys(W)); c.lineTo(0, ys(0)); c.closePath();
    var g = c.createLinearGradient(0, 0, 0, ys(0)); g.addColorStop(0, "#f3f3ef"); g.addColorStop(1, "#e1e1da"); c.fillStyle = g; c.fill();
    c.strokeStyle = "rgba(0,0,0,.07)"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, ys(0)); c.lineTo(W, ys(W)); c.stroke();
    shade(c, x1, ys(x1), W * .06, fy - ys(x1), .2, 0, true);
    var n = 4, dw = (x1 - x0) / n, top = yr - 4, plinth = H * .035;
    c.save(); c.beginPath(); c.moveTo(x0, ys(x0)); c.lineTo(x1, ys(x1)); c.lineTo(x1, fy); c.lineTo(x0, fy); c.closePath(); c.clip();
    for (var i = 0; i < n; i++) grain(c, x0 + i * dw, top, dw, fy - top, "oak", 11 + i * 7, "v");
    for (i = 1; i < n; i++) fill(c, "rgba(40,24,10,.5)", x0 + i * dw - 1.5, top, 3, fy - top);
    fill(c, "#2a241f", x0, fy - plinth, x1 - x0, plinth);
    light(c, x0, top, x1 - x0, fy - top, .14, 0, true);
    shade(c, x0, top, x1 - x0, fy - top, 0, .16, true);
    c.strokeStyle = "rgba(30,18,8,.3)"; c.lineWidth = H * .025; c.beginPath(); c.moveTo(x0, ys(x0)); c.lineTo(x1, ys(x1)); c.stroke();
    c.restore();
    [x0 + dw - 16, x0 + dw + 12, x0 + 3 * dw - 16, x0 + 3 * dw + 12].forEach(function (x) { fill(c, "#2b2520", x, H * .5, 4, H * .14); });
    shade(c, x0 - W * .01, fy, x1 - x0 + W * .05, H * .06, .3, 0);
    plant(c, W * .12, fy, Math.min(W, H) * .3);
  }

  function wardrobePlan(c, W, H) {
    var ink = "#1d3a2e", x, y, i;
    fill(c, "#f7f8f5", 0, 0, W, H);
    c.lineWidth = 1;
    for (x = 0; x <= W; x += 24) { c.strokeStyle = x % 120 === 0 ? "#d5dcd6" : "#e8ece7"; c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, H); c.stroke(); }
    for (y = 0; y <= H; y += 24) { c.strokeStyle = y % 120 === 0 ? "#d5dcd6" : "#e8ece7"; c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W, y + .5); c.stroke(); }
    var fy = H * .74, x0 = W * .27, x1 = W * .71, yl = H * .42, yr = H * .1, n = 4, dw = (x1 - x0) / n, plinth = H * .035;
    function ys(px) { return yl + (yr - yl) * (px - x0) / (x1 - x0); }
    var scale = (x1 - x0) / 3400;
    function mm(px) { return Math.round(px / scale / 10) * 10; }
    function fmt(v) { return v.toLocaleString("de-DE"); }
    c.strokeStyle = ink; c.fillStyle = ink; c.lineCap = "round";
    c.lineWidth = 2.5; c.beginPath(); c.moveTo(W * .05, fy); c.lineTo(W * .95, fy); c.stroke();
    c.lineWidth = 1; for (x = W * .05; x < W * .95; x += 14) { c.beginPath(); c.moveTo(x, fy + 10); c.lineTo(x + 10, fy); c.stroke(); }
    c.setLineDash([14, 9]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(W * .05, ys(W * .05)); c.lineTo(W * .95, ys(W * .95)); c.stroke(); c.setLineDash([]);
    c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, ys(x0)); c.lineTo(x1, ys(x1)); c.lineTo(x1, fy); c.lineTo(x0, fy); c.closePath(); c.stroke();
    c.lineWidth = 1.5;
    for (i = 1; i < n; i++) { x = x0 + i * dw; c.beginPath(); c.moveTo(x, ys(x)); c.lineTo(x, fy - plinth); c.stroke(); }
    c.beginPath(); c.moveTo(x0, fy - plinth); c.lineTo(x1, fy - plinth); c.stroke();
    [x0 + dw - 16, x0 + dw + 12, x0 + 3 * dw - 16, x0 + 3 * dw + 12].forEach(function (hx) { c.strokeRect(hx, H * .48, 4, H * .12); });
    var fs = Math.max(13, Math.round(H * .022));
    c.font = "500 " + fs + "px 'JetBrains Mono', ui-monospace, monospace";
    c.textAlign = "center"; c.textBaseline = "bottom";
    function tick(tx, ty) { c.beginPath(); c.moveTo(tx - 6, ty + 6); c.lineTo(tx + 6, ty - 6); c.stroke(); }
    function line(ax, ay, bx, by) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
    function dimH(a, b, dy, label) { c.lineWidth = 1.2; line(a - 10, dy, b + 10, dy); tick(a, dy); tick(b, dy); c.fillText(label, (a + b) / 2, dy - 6); }
    function dimV(dx, top, bottom, label) {
      c.lineWidth = 1.2; line(dx, top - 10, dx, bottom + 10); tick(dx, top); tick(dx, bottom);
      c.save(); c.translate(dx - 8, (top + bottom) / 2); c.rotate(-Math.PI / 2); c.fillText(label, 0, 0); c.restore();
    }
    var d1 = fy + H * .07, d2 = fy + H * .14;
    c.lineWidth = 1;
    for (i = 0; i <= n; i++) line(x0 + i * dw, fy + 14, x0 + i * dw, d1 + 8);
    line(x0, d1, x0, d2 + 8); line(x1, d1, x1, d2 + 8);
    for (i = 0; i < n; i++) dimH(x0 + i * dw, x0 + (i + 1) * dw, d1, fmt(mm(dw)));
    dimH(x0, x1, d2, fmt(3400));
    var rx = x1 + W * .05, lx = x0 - W * .05;
    c.lineWidth = 1; line(x1 + 8, ys(x1), rx + 8, ys(x1)); line(x1 + 8, fy, rx + 8, fy);
    line(x0 - 8, ys(x0), lx - 8, ys(x0)); line(x0 - 8, fy, lx - 8, fy);
    dimV(rx, ys(x1), fy, fmt(mm(fy - ys(x1))));
    dimV(lx, ys(x0), fy, fmt(mm(fy - ys(x0))));
    var bx = W * .14, by = H * .06, bw = W * .22, lh = fs * 1.55, bh = lh * 4 + 16;
    fill(c, "#f7f8f5", bx, by, bw, bh);
    c.lineWidth = 1.5; c.strokeRect(bx, by, bw, bh); line(bx, by + lh + 8, bx + bw, by + lh + 8);
    c.textAlign = "left"; c.textBaseline = "middle";
    c.font = "600 " + fs + "px 'JetBrains Mono', ui-monospace, monospace";
    c.fillText("Schreinerei Brandl", bx + 14, by + 4 + lh / 2);
    c.font = "400 " + fs + "px 'JetBrains Mono', ui-monospace, monospace";
    ["Einbauschrank Dachgeschoss", "Eiche massiv, geölt", "M 1:20 · Maße in mm"].forEach(function (t, k) { c.fillText(t, bx + 14, by + 12 + lh * (k + 1.5)); });
  }

  function kitchen(c, W, H) {
    var fy = H * .8, i;
    room(c, W, H, { fy: fy, wall0: "#e6e7e2", wall1: "#d1d3cc" });
    grain(c, W * .08, H * .3, W * .5, H * .018, "oak", 5, "h");
    shade(c, W * .08, H * .318, W * .5, H * .03, .14, 0);
    var jars = [["#cbc4b6", .04], ["#8a9a8c", .065], ["#e0dbd1", .05], ["#6d7b70", .075], ["#b9a588", .045]];
    jars.forEach(function (j, k) { fill(c, j[0], W * (.11 + k * .09), H * (.3 - j[1]), W * .05, H * j[1]); });
    var by = H * .53, bh = fy - by, n = 5, fw = W * .92 / n;
    for (i = 0; i < n; i++) grain(c, W * .04 + i * fw, by, fw, bh - H * .025, "walnut", 21 + i, "v");
    for (i = 1; i < n; i++) fill(c, "rgba(0,0,0,.45)", W * .04 + i * fw - 1, by, 2, bh);
    for (i = 0; i < n; i++) fill(c, "#c9b28c", W * .04 + i * fw + fw * .3, by + H * .02, fw * .4, 3);
    fill(c, "#1f1a16", W * .04, fy - H * .025, W * .92, H * .025);
    fill(c, "#efeeea", W * .035, by - H * .022, W * .93, H * .022);
    fill(c, "rgba(0,0,0,.14)", W * .035, by - 3, W * .93, 3);
    [.36, .64].forEach(function (px) {
      c.strokeStyle = "#2a2a2a"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W * px, 0); c.lineTo(W * px, H * .26); c.stroke();
      glow(c, W * px, H * .3, W * .16, "rgba(255,214,160,.4)", "rgba(255,214,160,0)");
      c.beginPath(); c.arc(W * px, H * .29, W * .045, Math.PI, 0); c.fillStyle = "#1e2420"; c.fill();
    });
    var iy = H * .63, ib = H * .98, ix = W * .12, iw = W * .76;
    grain(c, ix + W * .01, iy + H * .035, iw - W * .02, ib - iy - H * .035, "walnut", 77, "v");
    for (var sx = ix + W * .01; sx < ix + iw - W * .01; sx += W * .022) fill(c, "rgba(0,0,0,.22)", sx, iy + H * .035, 1.5, ib - iy);
    light(c, ix, iy, iw, ib - iy, .1, 0, true); shade(c, ix, iy, iw, ib - iy, 0, .2, true);
    fill(c, "#f3f2ee", ix, iy, iw, H * .035);
    fill(c, "#d8d6cf", ix, iy + H * .035 - 4, iw, 4);
    shade(c, ix - W * .02, ib, iw + W * .04, H - ib, .35, 0);
  }

  function stair(c, W, H, worn) {
    var fy = H * .86, i, x, y;
    room(c, W, H, worn ? { fy: fy, wall0: "#e6dfcd", wall1: "#cec4ac", floor: "pine", base: "#e9e0c9" } : { fy: fy });
    var N = 7, x0 = W * .1, sw = (W * .8) / N, sh = (fy - H * .16) / N, t = Math.max(8, H * .022), key = worn ? "pine" : "oak";
    if (worn) {
      var bxEnd = x0 + N * sw, byEnd = fy - N * sh, band = H * .1;
      c.save(); c.beginPath();
      c.moveTo(x0, fy); c.lineTo(bxEnd, byEnd); c.lineTo(bxEnd, byEnd + band); c.lineTo(x0 + band * sw / sh, fy); c.closePath(); c.clip();
      grain(c, x0, byEnd, N * sw, N * sh, "pine", 88, "h"); shade(c, x0, byEnd, N * sw, N * sh, .05, .25);
      c.restore();
    }
    for (i = 0; i < N; i++) {
      x = x0 + i * sw; y = fy - (i + 1) * sh;
      if (!worn) shade(c, x + t, y + t, sw - t, H * .08, .22, 0);
      var tw = sw + (i === N - 1 ? W * .1 : 0);
      grain(c, x, y, tw, t, key, 40 + i * 3, "h");
      grain(c, x, y, t, sh, key, 60 + i * 3, "v");
      fill(c, "rgba(255,255,255,.2)", x, y, tw, 2);
      if (worn) {
        c.save(); c.beginPath(); c.rect(x, y, sw, t); c.clip();
        glow(c, x + sw * .55, y + t * .5, sw * .4, "rgba(80,55,25,.5)", "rgba(80,55,25,0)"); c.restore();
      }
    }
    function L(px) { return fy - sh - (px - x0) * (sh / sw); }
    var xa = x0 + sw * .1, xb = x0 + N * sw, gh = H * .26;
    if (worn) {
      for (i = 0; i < N; i++) { x = x0 + i * sw + sw * .5; y = fy - (i + 1) * sh; fill(c, "#9c7a49", x - 2.5, y - gh, 5, gh); }
      c.strokeStyle = "#7f5e34"; c.lineWidth = H * .018; c.lineCap = "round";
      c.beginPath(); c.moveTo(x0 + sw * .3, L(x0 + sw * .3) - gh + sh * .4); c.lineTo(xb - sw * .3, L(xb - sw * .3) - gh + sh * .4); c.stroke();
      fill(c, "rgba(205,180,110,.16)", 0, 0, W, H);
    } else {
      c.beginPath(); c.moveTo(xa, L(xa) + t); c.lineTo(xb, L(xb) + t); c.lineTo(xb, L(xb) - gh); c.lineTo(xa, L(xa) - gh); c.closePath();
      c.fillStyle = "rgba(205,225,230,.24)"; c.fill();
      c.save(); c.clip();
      c.strokeStyle = "rgba(255,255,255,.22)"; c.lineWidth = W * .02;
      for (x = xa; x < xb; x += W * .16) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + W * .18, 0); c.stroke(); }
      c.restore();
      c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xa, L(xa) - gh); c.lineTo(xb, L(xb) - gh); c.stroke();
      c.strokeStyle = "rgba(70,90,95,.35)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xa, L(xa) - gh); c.lineTo(xa, L(xa) + t); c.stroke();
    }
  }

  function reception(c, W, H) {
    var fy = H * .84;
    room(c, W, H, { fy: fy, wall0: "#d9dfda", wall1: "#c3cbc5", floor: "maple" });
    fill(c, "#eef0ec", W * .38, H * .14, W * .24, H * .1); shade(c, W * .38, H * .24, W * .24, H * .015, .12, 0);
    c.beginPath(); c.arc(W * .44, H * .19, H * .025, 0, Math.PI * 2); c.fillStyle = "#b06d2c"; c.fill();
    fill(c, "#9aa69e", W * .48, H * .175, W * .1, H * .012); fill(c, "#b8c1bb", W * .48, H * .195, W * .07, H * .01);
    var cx0 = W * .12, cx1 = W * .88, ty = H * .52;
    grain(c, cx0, ty + H * .02, cx1 - cx0, fy - ty - H * .02, "oak", 91, "v");
    for (var sx = cx0; sx < cx1; sx += W * .018) fill(c, "rgba(60,35,15,.3)", sx, ty + H * .02, 1.5, fy - ty);
    light(c, cx0, ty, cx1 - cx0, fy - ty, .12, 0, true); shade(c, cx0, ty, cx1 - cx0, fy - ty, 0, .2, true);
    grain(c, W * .54, ty - H * .08, cx1 - W * .54, H * .08, "oak", 93, "v");
    fill(c, "#f4f3ef", W * .53, ty - H * .095, cx1 - W * .53 + W * .01, H * .018);
    fill(c, "#f4f3ef", cx0 - W * .01, ty, cx1 - cx0 + W * .02, H * .022);
    fill(c, "rgba(0,0,0,.12)", cx0 - W * .01, ty + H * .022, cx1 - cx0 + W * .02, 3);
    fill(c, "#2a241f", cx0, fy - H * .03, cx1 - cx0, H * .03);
    shade(c, cx0 - W * .02, fy, cx1 - cx0 + W * .04, H * .06, .28, 0);
    plant(c, W * .9, fy, Math.min(W, H) * .3);
  }

  function door(c, W, H) {
    var fy = H * .86;
    room(c, W, H, { fy: fy, wall0: "#ebeae5", wall1: "#d6d5ce" });
    fill(c, "#f7f7f4", W * .3, H * .1, W * .4, fy - H * .1);
    shade(c, W * .3, H * .1, W * .4, fy - H * .1, .02, .1, true);
    grain(c, W * .335, H * .13, W * .33, fy - H * .13, "oak", 33, "v");
    light(c, W * .335, H * .13, W * .33, fy - H * .13, .14, 0, true); shade(c, W * .335, H * .13, W * .33, fy - H * .13, 0, .18, true);
    fill(c, "rgba(0,0,0,.25)", W * .335, H * .13, W * .33, 2);
    c.beginPath(); c.arc(W * .615, H * .53, H * .014, 0, Math.PI * 2); c.fillStyle = "#2b2622"; c.fill();
    fill(c, "#2b2622", W * .59, H * .524, W * .035, H * .012);
    fill(c, "#f3f2ee", W * .07, H * .26, W * .15, H * .2); fill(c, "#a9b5ad", W * .085, H * .28, W * .12, H * .16);
    fill(c, "#8b9c90", W * .085, H * .37, W * .12, H * .07);
    shade(c, W * .3, fy, W * .4, H * .05, .25, 0);
  }

  function bench(c, W, H) {
    var fy = H * .86, i;
    room(c, W, H, { fy: fy });
    grain(c, W * .18, H * .14, W * .64, H * .42, "oakLight", 51, "v");
    for (i = 1; i < 4; i++) fill(c, "rgba(60,35,15,.3)", W * .18 + i * W * .16, H * .14, 1.5, H * .42);
    shade(c, W * .18, H * .14, W * .64, H * .42, 0, .14, true);
    for (i = 0; i < 5; i++) { c.beginPath(); c.arc(W * (.25 + i * .125), H * .25, H * .011, 0, Math.PI * 2); c.fillStyle = "#2b2622"; c.fill(); }
    c.beginPath(); c.moveTo(W * .375, H * .26); c.lineTo(W * .33, H * .5); c.lineTo(W * .42, H * .5); c.closePath(); c.fillStyle = "#5b6d63"; c.fill();
    fill(c, "#b8794a", W * .617, H * .26, W * .016, H * .2);
    grain(c, W * .16, H * .6, W * .68, H * .03, "oak", 52, "h");
    var dw = W * .68 / 3;
    for (i = 0; i < 3; i++) {
      grain(c, W * .16 + i * dw, H * .63, dw, H * .11, "oak", 53 + i, "h");
      c.beginPath(); c.ellipse(W * .16 + i * dw + dw / 2, H * .655, dw * .15, H * .01, 0, 0, Math.PI * 2); c.fillStyle = "rgba(30,18,8,.6)"; c.fill();
    }
    for (i = 1; i < 3; i++) fill(c, "rgba(30,18,8,.45)", W * .16 + i * dw - 1, H * .63, 2, H * .11);
    fill(c, "#d9d5cb", W * .18, H * .575, W * .3, H * .028);
    shade(c, W * .16, H * .74, W * .68, fy - H * .74, .35, .15);
    fill(c, "#2f2a26", W * .26, fy - H * .035, W * .07, H * .035); fill(c, "#6b4a33", W * .36, fy - H * .03, W * .07, H * .03);
    shade(c, W * .14, fy, W * .72, H * .05, .25, 0);
  }

  function workshop(c, W, H) {
    var fy = H * .82, i;
    grad(c, 0, 0, W, fy, [[0, "#3c423e"], [1, "#2a2f2c"]]);
    fill(c, "rgba(220,230,222,.28)", W * .06, H * .08, W * .22, H * .26);
    c.save(); c.globalAlpha = .07; c.fillStyle = "#fff4dc";
    c.beginPath(); c.moveTo(W * .06, H * .08); c.lineTo(W * .28, H * .08); c.lineTo(W * .7, fy); c.lineTo(W * .3, fy); c.closePath(); c.fill(); c.restore();
    grad(c, 0, fy, W, H - fy, [[0, "#585c5b"], [1, "#3b3f3f"]]);
    var keys = ["oak", "walnut", "ash", "oakLight", "maple", "oak", "walnut", "pine"];
    for (i = 0; i < 8; i++) {
      var y = H * .14 + i * H * .068;
      grain(c, W * .66, y, W * .3, H * .045, keys[i], 100 + i, "h");
      shade(c, W * .66, y + H * .045, W * .3, H * .02, .35, 0);
    }
    fill(c, "#4a504c", W * .32, H * .16, W * .26, H * .3);
    c.fillStyle = "rgba(0,0,0,.25)";
    for (var px = W * .34; px < W * .57; px += W * .025) for (var py = H * .18; py < H * .45; py += H * .04) { c.beginPath(); c.arc(px, py, 2, 0, Math.PI * 2); c.fill(); }
    fill(c, "#c9c9c3", W * .36, H * .2, W * .012, H * .16); fill(c, "#c9c9c3", W * .36, H * .348, W * .07, H * .012);
    for (i = 0; i < 4; i++) fill(c, "#b05a2a", W * (.46 + i * .025), H * .2, W * .008, H * .17);
    fill(c, "#7a5a3a", W * .54, H * .22, W * .01, H * .12); fill(c, "#888c8a", W * .525, H * .2, W * .04, H * .03);
    grain(c, W * .06, H * .56, W * .56, H * .065, "oakLight", 71, "h");
    fill(c, "rgba(0,0,0,.3)", W * .06, H * .625, W * .56, 3);
    [W * .09, W * .56].forEach(function (lx) { grain(c, lx, H * .625, W * .035, fy - H * .625, "oak", 72, "v"); });
    fill(c, "#2c2420", W * .1, H * .72, W * .5, H * .025);
    grain(c, W * .22, H * .53, W * .22, H * .03, "walnut", 73, "h");
    fill(c, "#5d4632", W * .48, H * .535, W * .07, H * .025); fill(c, "#1e1a17", W * .5, H * .52, W * .02, H * .016);
    shade(c, W * .04, fy, W * .6, H * .06, .35, 0);
  }

  /* Lageskizze für die Anfahrt */
  function sitemap(c, W, H) {
    var i, r = rng(17);
    fill(c, "#eef0ea", 0, 0, W, H);
    for (i = 0; i < 16; i++) fill(c, r() > .5 ? "#e1e8da" : "#e7eade", r() * W, r() * H, W * (.08 + r() * .14), H * (.08 + r() * .16));
    c.strokeStyle = "#bcd3db"; c.lineWidth = H * .05; c.lineCap = "round";
    c.beginPath(); c.moveTo(-20, H * .16); c.bezierCurveTo(W * .3, H * .02, W * .55, H * .3, W + 20, H * .1); c.stroke();
    for (i = 0; i < 46; i++) fill(c, "#dcdcd5", W * .36 + r() * W * .4, H * .34 + r() * H * .42, W * (.014 + r() * .026), H * (.022 + r() * .04));
    function path(p) { c.beginPath(); c.moveTo(p[0][0] * W, p[0][1] * H); for (var k = 1; k < p.length; k++) c.lineTo(p[k][0] * W, p[k][1] * H); }
    function road(p, w, col, casing) {
      c.lineJoin = "round"; c.lineCap = "round";
      c.strokeStyle = casing; c.lineWidth = w + 5; path(p); c.stroke();
      c.strokeStyle = col; c.lineWidth = w; path(p); c.stroke();
    }
    road([[-.05, .92], [.3, .83], [.6, .87], [1.05, .74]], H * .03, "#f0c36a", "#c9a14f");
    road([[.24, .845], [.36, .64], [.56, .5], [.82, .3], [1.05, .22]], H * .02, "#ffffff", "#cdd1c9");
    road([[.4, .28], [.56, .5], [.6, .8]], H * .012, "#ffffff", "#d5d8d0");
    road([[.28, .48], [.56, .5], [.88, .56]], H * .012, "#ffffff", "#d5d8d0");
    road([[.56, .5], [.6, .6], [.64, .66]], H * .012, "#ffffff", "#d5d8d0");
    var fs = Math.round(H * .03);
    c.textBaseline = "middle"; c.textAlign = "left";
    c.font = "700 " + fs + "px 'Hanken Grotesk', system-ui, sans-serif";
    var ax = W * .4, ay = H * .845, tw = c.measureText("A3").width + 16;
    fill(c, "#2f5da8", ax, ay - fs * .75, tw, fs * 1.5); c.fillStyle = "#ffffff"; c.fillText("A3", ax + 8, ay);
    c.font = "500 " + Math.round(fs * .85) + "px 'Hanken Grotesk', system-ui, sans-serif"; c.fillStyle = "#5a635e";
    c.fillText("Ausfahrt Musterhofen", W * .1, H * .76);
    c.fillText("Ortsmitte", W * .44, H * .43);
    c.save(); c.translate(W * .7, H * .35); c.rotate(-.62); c.fillText("Hauptstraße", 0, 0); c.restore();
    c.save(); c.translate(W * .525, H * .6); c.rotate(1.1); c.fillText("Holzweg", 0, 0); c.restore();
    var mx = W * .64, my = H * .66;
    c.beginPath(); c.arc(mx, my, H * .07, 0, Math.PI * 2); c.fillStyle = "rgba(176,109,44,.16)"; c.fill();
    c.beginPath(); c.arc(mx, my, H * .03, 0, Math.PI * 2); c.fillStyle = "#b06d2c"; c.fill();
    c.lineWidth = 4; c.strokeStyle = "#ffffff"; c.stroke();
    c.beginPath(); c.arc(mx, my, H * .009, 0, Math.PI * 2); c.fillStyle = "#ffffff"; c.fill();
    c.font = "700 " + fs + "px 'Hanken Grotesk', system-ui, sans-serif";
    var label = "Schreinerei Brandl", lw = c.measureText(label).width + 32, lx = mx - lw / 2, lyy = my - H * .17;
    c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 18; c.shadowOffsetY = 6;
    fill(c, "#ffffff", lx, lyy, lw, fs * 2.2); c.restore();
    c.fillStyle = "#121614"; c.fillText(label, lx + 16, lyy + fs * 1.1);
  }

  function swatch(c, W, H, key) {
    var seed = 0; for (var i = 0; i < key.length; i++) seed += key.charCodeAt(i) * (i + 3);
    grain(c, 0, 0, W, H, key, seed, "v");
    glow(c, W * .25, H * .15, W * .95, "rgba(255,255,255,.22)", "rgba(255,255,255,0)");
    shade(c, 0, 0, W, H, 0, .16);
  }

  var SCENES = {
    wardrobe: wardrobe, kitchen: kitchen, reception: reception, door: door, bench: bench, workshop: workshop,
    stair: function (c, W, H) { stair(c, W, H, false); },
    stairOld: function (c, W, H) { stair(c, W, H, true); },
    plan: wardrobePlan, sitemap: sitemap
  };
  var LATE = { plan: 1, sitemap: 1 }; /* brauchen Schriften, darum erst nach dem Laden der Fonts */
  var cache = {};
  function render(name, W, H) {
    var k = name + ":" + W + "x" + H;
    if (cache[k]) return cache[k];
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var c = cv.getContext && cv.getContext("2d"); if (!c) return "";
    try {
      if (name.indexOf("sw-") === 0) swatch(c, W, H, name.slice(3));
      else (SCENES[name] || wardrobe)(c, W, H);
    } catch (e) {}
    var url = "";
    try { url = cv.toDataURL("image/jpeg", .86); } catch (e) {}
    cache[k] = url; return url;
  }
  window.BrandlRender = render;
  function paint(img) {
    var s = render(img.getAttribute("data-scene"), +img.getAttribute("data-w") || 800, +img.getAttribute("data-h") || 600);
    if (s) img.src = s;
  }
  $$("img[data-scene]").forEach(function (img) { if (!LATE[img.getAttribute("data-scene")]) paint(img); });
  var lateDone = false;
  function late() { if (lateDone) return; lateDone = true; $$("img[data-scene]").forEach(function (img) { if (LATE[img.getAttribute("data-scene")]) paint(img); }); }
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("500 20px 'JetBrains Mono'"), document.fonts.load("700 20px 'Hanken Grotesk'")]).then(late, late);
    setTimeout(late, 2500);
  } else late();

  /* ============ Ansicht / Werkzeichnung ============ */
  $$(".view-toggle").forEach(function (tg) {
    var media = tg.closest(".hero-media"), btns = $$("[data-view]", tg);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        late();
        media.classList.toggle("plan-on", b.getAttribute("data-view") === "plan");
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
  });

  /* ============ Kopfzeile und Ablauf-Fortschritt ============ */
  var head = $("#head"), steps = $("#steps"), items = steps ? $$("li", steps) : [];
  function progress() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight || 800;
    var p = Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height));
    steps.style.setProperty("--p", p.toFixed(3));
    items.forEach(function (li, i) { li.classList.toggle("on", p >= (i + .2) / items.length); });
  }
  function onScroll() { if (head) head.classList.toggle("scrolled", window.scrollY > 24); progress(); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", progress);
  onScroll();

  /* ============ Mobiles Menü ============ */
  var menu = $("#menu"), menuBtn = $("#menu-btn"), menuClose = $("#menu-close");
  if (menu && menuBtn && menuClose) {
    var setMenu = function (open, refocus) {
      menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open));
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) menuClose.focus(); else if (refocus) menuBtn.focus();
    };
    menuBtn.addEventListener("click", function () { setMenu(true); });
    menuClose.addEventListener("click", function () { setMenu(false, true); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false, true); });
  }

  /* ============ Leistungen: Bildvorschau am Mauszeiger ============ */
  var list = $("#svc-list"), prev = $("#svc-preview");
  if (list && prev && mq("(hover: hover) and (pointer: fine)") && !reduce) {
    var pimg = $("img", prev), tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var loop = function () {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      var w = prev.offsetWidth || 320, x = cx + 28;
      if (x + w > window.innerWidth - 16) x = cx - w - 28;
      prev.style.transform = "translate3d(" + x + "px," + (cy - (prev.offsetHeight || 240) / 2) + "px,0)";
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .5) ? requestAnimationFrame(loop) : 0;
    };
    list.addEventListener("mouseenter", function (e) { cx = tx = e.clientX; cy = ty = e.clientY; loop(); });
    list.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    list.addEventListener("mouseleave", function () { prev.classList.remove("on"); });
    $$(".svc", list).forEach(function (row) {
      row.addEventListener("mouseenter", function () { pimg.src = render(row.getAttribute("data-scene"), 800, 600); prev.classList.add("on"); });
    });
  }

  /* ============ Thema fürs Kontaktformular vormerken ============ */
  $$("[data-topic]").forEach(function (a) {
    a.addEventListener("click", function () { try { sessionStorage.setItem("brandl-topic", a.getAttribute("data-topic")); } catch (e) {} });
  });
  var form = $("#anfrage");
  if (form) {
    try {
      var t = sessionStorage.getItem("brandl-topic");
      if (t) { var radio = document.getElementById(t); if (radio) radio.checked = true; sessionStorage.removeItem("brandl-topic"); }
    } catch (e) {}
    form.addEventListener("submit", function (e) { e.preventDefault(); var msg = $("#form-msg"); if (msg) msg.hidden = false; });
  }

  /* ============ Vorher / Nachher ============ */
  var ba = $("#ba"), range = $("#ba-range");
  if (ba && range) {
    var setPos = function () { ba.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", setPos); setPos();
  }

  /* ============ Projektfilter ============ */
  var filters = $$(".filter"), cards = $$(".proj[data-cat]");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-cat");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); });
      cards.forEach(function (card) {
        var show = cat === "alle" || card.getAttribute("data-cat") === cat;
        card.hidden = !show;
        if (show && !reduce) { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
      });
    });
  });

  /* ============ Holzarten ============ */
  var MAT = {
    eiche: { name: "Eiche", key: "oak", dichte: "ca. 690 kg/m³", farbe: "Hell- bis mittelbraun, lebhafte Maserung", eig: "Hart, sehr dauerhaft, lässt sich gut ölen", fuer: "Treppen, Tische, Böden, Einbaumöbel", h: 4 },
    nuss: { name: "Nussbaum", key: "walnut", dichte: "ca. 650 kg/m³", farbe: "Schokoladenbraun mit dunklen Adern", eig: "Mittelhart, formstabil, edle Wirkung", fuer: "Küchenfronten, Wohnmöbel, Furniere", h: 3 },
    esche: { name: "Esche", key: "ash", dichte: "ca. 690 kg/m³", farbe: "Hell, fast weiß, markante Jahresringe", eig: "Hart, zäh und elastisch", fuer: "Treppen, Sitzmöbel, Griffe", h: 4 },
    ahorn: { name: "Ahorn", key: "maple", dichte: "ca. 630 kg/m³", farbe: "Cremeweiß, sehr feinporig", eig: "Mittelhart, glatte, ruhige Oberfläche", fuer: "Arbeitsplatten, Kinderzimmer, Fronten", h: 3 }
  };
  var tabs = $$(".mat-tab"), matImg = $("#mat-img");
  if (tabs.length && matImg) {
    var matLbl = $("#mat-label"), meter = $("#m-meter"), bars = $$("i", meter);
    var selectMat = function (id) {
      var m = MAT[id];
      tabs.forEach(function (tb) { tb.setAttribute("aria-pressed", String(tb.getAttribute("data-mat") === id)); });
      var s = render("sw-" + m.key, 900, 900); if (s) matImg.src = s;
      matImg.alt = m.name + ", Holzoberfläche im Längsschnitt";
      if (!reduce) { matImg.classList.remove("fade"); void matImg.offsetWidth; matImg.classList.add("fade"); }
      matLbl.textContent = m.name + " · Längsschnitt";
      $("#m-dichte").textContent = m.dichte; $("#m-farbe").textContent = m.farbe;
      $("#m-eig").textContent = m.eig; $("#m-fuer").textContent = m.fuer;
      bars.forEach(function (b, i) { b.classList.toggle("on", i < m.h); });
      meter.setAttribute("aria-label", "Härte " + m.h + " von 5");
    };
    tabs.forEach(function (tb) {
      var m = MAT[tb.getAttribute("data-mat")], s = render("sw-" + m.key, 300, 200);
      if (s) $(".sw", tb).style.backgroundImage = "url(" + s + ")";
      tb.addEventListener("click", function () { selectMat(tb.getAttribute("data-mat")); });
    });
    selectMat("eiche");
  }

  /* ============ Kundenstimmen ============ */
  var slides = $$(".q-slide"), qCount = $("#q-count");
  if (slides.length && qCount) {
    var qi = 0;
    var showQ = function (i) {
      qi = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== qi; });
      qCount.textContent = (qi + 1) + " / " + slides.length;
    };
    $("#q-prev").addEventListener("click", function () { showQ(qi - 1); });
    $("#q-next").addEventListener("click", function () { showQ(qi + 1); });
  }

  /* ============ Zahlen hochzählen ============ */
  var counters = $$("[data-count]");
  function fmtNum(v) { return v.toLocaleString("de-DE"); }
  counters.forEach(function (el) { el.textContent = fmtNum(+el.getAttribute("data-count")); });
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = +el.getAttribute("data-count"), t0 = 0;
        var tick = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmtNum(Math.round(end * e));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ============ Projekt-Großansicht ============ */
  var lb = $("#lightbox"), DATA = window.PROJECTS || [];
  if (lb && typeof lb.showModal === "function") {
    var lbImg = $("#lb-img"), lbThumbs = $("#lb-thumbs"), lbCount = $("#lb-count"), lbCta = $("#lb-cta");
    var order = [], pos = 0, opener = null;
    var byId = function (id) { for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) return DATA[i]; return null; };
    var showView = function (scene, label, title) {
      late();
      var s = render(scene, 1600, 1000); if (s) lbImg.src = s;
      lbImg.alt = title + ", " + label;
      if (!reduce) { lbImg.classList.remove("fade"); void lbImg.offsetWidth; lbImg.classList.add("fade"); }
      $$(".lb-thumb", lbThumbs).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-scene") === scene)); });
    };
    var fillLb = function () {
      var p = byId(order[pos]); if (!p) return;
      $("#lb-meta").textContent = p.meta;
      $("#lb-title").textContent = p.title;
      $("#lb-desc").textContent = p.desc;
      var dl = $("#lb-spec"); dl.innerHTML = "";
      p.specs.forEach(function (sp) {
        var dt = document.createElement("dt"); dt.textContent = sp[0];
        var dd = document.createElement("dd"); dd.textContent = sp[1];
        dl.appendChild(dt); dl.appendChild(dd);
      });
      lbThumbs.innerHTML = "";
      p.gallery.forEach(function (g) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "lb-thumb"; b.setAttribute("data-scene", g[0]);
        var im = document.createElement("img"); im.alt = ""; im.src = render(g[0], 320, 240);
        var sp = document.createElement("span"); sp.textContent = g[1];
        b.appendChild(im); b.appendChild(sp);
        b.addEventListener("click", function () { showView(g[0], g[1], p.title); });
        lbThumbs.appendChild(b);
      });
      lbThumbs.hidden = p.gallery.length < 2;
      showView(p.gallery[0][0], p.gallery[0][1], p.title);
      lbCta.setAttribute("data-topic", p.topic);
      lbCount.textContent = (pos + 1) + " / " + order.length;
      $("#lb-prev").hidden = $("#lb-next").hidden = lbCount.hidden = order.length < 2;
    };
    var openLb = function (id, btn) {
      opener = btn;
      order = $$(".proj-open").filter(function (b) { return !b.closest(".proj").hidden; }).map(function (b) { return b.getAttribute("data-project"); });
      pos = Math.max(0, order.indexOf(id));
      fillLb();
      document.documentElement.classList.add("lb-lock");
      lb.showModal();
    };
    $$(".proj-open").forEach(function (b) { b.addEventListener("click", function () { openLb(b.getAttribute("data-project"), b); }); });
    $("#lb-close").addEventListener("click", function () { lb.close(); });
    $("#lb-prev").addEventListener("click", function () { pos = (pos - 1 + order.length) % order.length; fillLb(); });
    $("#lb-next").addEventListener("click", function () { pos = (pos + 1) % order.length; fillLb(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") $("#lb-next").click();
      if (e.key === "ArrowLeft") $("#lb-prev").click();
    });
    lb.addEventListener("close", function () { document.documentElement.classList.remove("lb-lock"); if (opener) opener.focus(); });
    lbCta.addEventListener("click", function () {
      try { sessionStorage.setItem("brandl-topic", lbCta.getAttribute("data-topic")); } catch (e) {}
      lb.close();
      var r = document.getElementById(lbCta.getAttribute("data-topic")); if (r) r.checked = true;
    });
  }

  /* ============ Karte erst nach Klick laden (Datenschutz) ============ */
  $$("[data-map]").forEach(function (wrap) {
    var btn = $("[data-map-load]", wrap), box = $(".map-box", wrap), consent = $(".map-consent", wrap);
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (PREVIEW) {
        $("h3", consent).textContent = "Hier erscheint die Karte";
        $("p", consent).textContent = "In dieser Vorschau lassen sich keine Karten einbetten. Auf der fertigen Website lädt an dieser Stelle jetzt die Google-Karte.";
        btn.hidden = true;
        return;
      }
      var f = document.createElement("iframe");
      f.src = wrap.getAttribute("data-map");
      f.title = "Karte: Lage der Schreinerei";
      f.loading = "lazy";
      f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      f.setAttribute("allowfullscreen", "");
      box.appendChild(f);
      consent.hidden = true;
    });
  });
})();
