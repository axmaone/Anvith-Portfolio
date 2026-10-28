// EffectCraft motion kit. Prepend this file's text to a run_script call, then:
//   var M = MK(comp);            // comp = a CompItem
//   M.solid("#FF3D7F","bg",0,4);
//   M.txt("HELLO",200,"#FFFFFF",540,400,0,4,0.1,M.PS.black,"stomp");
//   Fonts given as PostScript strings (M.PS.*) apply immediately; [family,style] arrays land in M.FONTS for layer.setText.
// Coordinates are comp pixels; times are comp seconds; "d" = delay after the layer's inPoint.
// Layers stack in creation order (last created = on top), so build back to front.

function MK(c) {
  var P = app.project, W = c.width, Hh = c.height, M = { c: c, FONTS: [] };
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function H(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
  function A(h) { var x = H(h); x.push(1); return x; }
  function T(l) { return l.property("ADBE Transform Group"); }
  function ROT(l) { return T(l).property("ADBE Rotate Z"); }
  function span(l, a, b) { l.inPoint = a; l.outPoint = b; }
  function item(n) { for (var i = 1; i <= P.numItems; i++) if (P.item(i).name == n) return P.item(i); return null; }
  M.H = H; M.A = A; M.T = T; M.ROT = ROT; M.span = span; M.item = item; M.rnd = rnd;
  M.seed = function (s) { seed = s; };

  // ---------- expression builders (strings) ----------
  // POP: elastic scale-in from 0 with a slow 2.5%/s push-in.
  M.POP = function (d, s) { return "var t=time-inPoint-(" + d + ");var s=" + s + ";if(t<0){[0,0]}else{var k=s*(1-Math.exp(-7*t)*Math.cos(16*t))*(1+0.025*t);[k,k]}"; };
  // STOMP: slams in oversized and settles â€” headline words.
  M.STOMP = function (d, s) { return "var t=time-inPoint-(" + d + ");var s=" + s + ";if(t<0){[0,0]}else{var k=s*(1+1.6*Math.exp(-16*t)*Math.cos(10*t));[k,k]}"; };
  // EASE_IN: calm fade+rise for learning-module text (pair with OPACITY_IN).
  M.RISE = function (d, x, y, dy) { return "var t=time-inPoint-(" + d + ");var e=t<0?1:Math.exp(-9*t);[" + x + "," + y + "+(" + (dy || 40) + ")*e]"; };
  M.OPACITY_IN = function (d, dur) { return "var t=time-inPoint-(" + d + ");t<0?0:Math.min(100,100*t/" + (dur || 0.3) + ")"; };
  // OPACITY_OUT: fade out over the last dur seconds of the layer.
  M.OPACITY_INOUT = function (d, dur) { return "var t=time-inPoint-(" + d + ");var u=outPoint-time;t<0?0:Math.min(100,100*t/" + (dur || 0.3) + ",100*u/" + (dur || 0.3) + ")"; };
  // SLIDE: springs in from an offset to (x,y).
  M.SLIDE = function (d, x, y, dx, dy) { return "var t=time-inPoint-(" + d + ");var e=t<0?1:Math.exp(-6*t)*Math.cos(9*t);[" + x + "+(" + dx + ")*e," + y + "+(" + dy + ")*e]"; };
  // DRIFT: gentle rotation wobble around r degrees.
  M.DRIFT = function (r, amp) { return r + "+Math.sin(time*1.7+" + (rnd() * 10).toFixed(2) + ")*" + amp; };

  // ---------- shape primitives ----------
  M.shapeLayer = function (name, a, b) { var s = c.layers.addShape(); s.name = name; span(s, a, b); return s; };
  M.grp = function (s, x, y, rot) {
    var g = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var tr = g.property("ADBE Vector Transform Group");
    if (x != null) tr.property("ADBE Vector Position").setValue([x, y]);
    if (rot) tr.property("ADBE Vector Rotation").setValue(rot);
    return g.property("ADBE Vectors Group");
  };
  M.fill = function (v, col, op) { var f = v.addProperty("ADBE Vector Graphic - Fill"); f.property("ADBE Vector Fill Color").setValue(A(col)); if (op != null) f.property("ADBE Vector Fill Opacity").setValue(op); return f; };
  M.stroke = function (v, col, w) { var s = v.addProperty("ADBE Vector Graphic - Stroke"); s.property("ADBE Vector Stroke Color").setValue(A(col)); s.property("ADBE Vector Stroke Width").setValue(w); return s; };
  M.rect = function (v, w, h, r) { var q = v.addProperty("ADBE Vector Shape - Rect"); q.property("ADBE Vector Rect Size").setValue([w, h]); if (r) q.property("ADBE Vector Rect Roundness").setValue(r); return q; };
  M.ell = function (v, w, h) { var e = v.addProperty("ADBE Vector Shape - Ellipse"); e.property("ADBE Vector Ellipse Size").setValue([w, h]); return e; };
  M.poly = function (v, pts) { var p = v.addProperty("ADBE Vector Shape - Group"); var sh = new Shape(); sh.vertices = pts; sh.closed = true; p.property("ADBE Vector Shape").setValue(sh); return p; };
  // Repeater repeats everything above it in the group â€” add fills BEFORE the repeater.
  M.rep = function (v, n, dx, dy, rot) {
    var r = v.addProperty("ADBE Vector Filter - Repeater"); r.property("ADBE Vector Repeater Copies").setValue(n);
    var tr = r.property("ADBE Vector Repeater Transform"); tr.property("ADBE Vector Position").setValue([dx, dy]);
    if (rot) tr.property("ADBE Vector Rotation").setValue(rot); return r;
  };
  M.solid = function (col, name, a, b) { var s = c.layers.addSolid(H(col), name, W, Hh, 1); span(s, a, b); return s; };

  // ---------- decorative elements ----------
  M.dots = function (col, op, a, b, size, gap) {
    gap = gap || 40; size = size || 14;
    var s = M.shapeLayer("dots", a, b), v = M.grp(s, -W / 2 - 20, -Hh / 2 - 40);
    M.ell(v, size, size); M.fill(v, col);
    M.rep(v, Math.ceil(W / gap) + 2, gap, 0); M.rep(v, Math.ceil(Hh / gap) + 3, 0, gap);
    T(s).property("ADBE Position").expression = "[" + W / 2 + "+(time*12)%" + gap + "," + Hh / 2 + "+(time*12)%" + gap + "]";
    T(s).property("ADBE Opacity").setValue(op); return s;
  };
  M.rays = function (col, op, x, y, a, b, speed, n) {
    n = n || 12; var s = M.shapeLayer("rays", a, b), v = M.grp(s, 0, 0);
    M.rect(v, 70, Math.max(W, Hh) * 1.4); M.fill(v, col); M.rep(v, n, 0, 0, 180 / n);
    T(s).property("ADBE Position").setValue([x, y]); ROT(s).expression = "time*" + (speed || 15);
    T(s).property("ADBE Opacity").setValue(op); return s;
  };
  M.bolt = function (col, x, y, sc, a, b, d) {
    var s = M.shapeLayer("bolt", a, b), v = M.grp(s, 0, 0);
    M.poly(v, [[20, -160], [-70, 20], [0, 20], [-30, 160], [80, -30], [10, -30], [50, -160]]); M.fill(v, col);
    T(s).property("ADBE Position").setValue([x, y]); T(s).property("ADBE Scale").expression = M.STOMP(d, sc);
    T(s).property("ADBE Opacity").expression = "Math.sin(time*40)>-0.3?100:20"; return s;
  };
  M.heart = function (col, x, y, sc, a, b, d) {
    var s = M.shapeLayer("heart", a, b);
    var v = M.grp(s, 0, 25, 45); M.rect(v, 130, 130); M.fill(v, col);
    var v2 = M.grp(s, -46, -21); M.ell(v2, 130, 130); M.fill(v2, col);
    var v3 = M.grp(s, 46, -21); M.ell(v3, 130, 130); M.fill(v3, col);
    T(s).property("ADBE Position").setValue([x, y]);
    T(s).property("ADBE Scale").expression = "var t=time-inPoint-(" + d + ");if(t<0){[0,0]}else{var k=" + sc + "*(1-Math.exp(-7*t)*Math.cos(16*t))*(1+0.08*Math.sin(time*9));[k,k]}";
    return s;
  };
  M.sparkle = function (col, x, y, sc, a, b, d) {
    var s = M.shapeLayer("sparkle", a, b), v = M.grp(s, 0, 0);
    M.poly(v, [[0, -70], [14, -14], [70, 0], [14, 14], [0, 70], [-14, 14], [-70, 0], [-14, -14]]); M.fill(v, col);
    T(s).property("ADBE Position").setValue([x, y]); T(s).property("ADBE Scale").expression = M.POP(d, sc);
    ROT(s).expression = "time*60"; return s;
  };

  // ---------- text ----------
  // Verified PostScript names on this PC (set directly in-script, no second step). See fonts-and-palettes.md.
  M.PS = {
    black: "HelveticaNowDisplay-Black", bold: "HelveticaNowDisplay-Bold", regular: "HelveticaNowDisplay-Regular",
    mono: "CourierNewPS-BoldMT", impact: "Impact", script: "BrushScriptMT", hand: "InkFree", handBold: "SegoePrint-Bold",
    serifItalic: "BodoniMTBlack-Italic", poster: "BodoniMTPosterCompressed", grunge: "Haettenschweiler",
    slab: "Rockwell-ExtraBold", retro: "CooperBlack", georgiaItalic: "Georgia-BoldItalic", gothic: "FranklinGothic-Heavy",
    inter: "Inter-Bold"
  };
  var TN = 0;
  // anim: "stomp" | "pop" | "shake" | "rise" (calm fade-up) | "none"
  // font: a PostScript name string (applied immediately â€” preferred), or [family, style]
  //       (recorded in M.FONTS; apply afterwards with layer.setText via command_batch).
  M.txt = function (s, size, col, x, y, a, b, d, font, anim, stroke, rot) {
    var t = c.layers.addText(s); TN++; t.name = "T" + TN + " " + s.substr(0, 18); span(t, a, b);
    var td = t.property("ADBE Text Properties").property("ADBE Text Document"); var v = td.value;
    v.fontSize = size; v.fillColor = H(col);
    if (typeof font == "string") v.font = font;
    try { v.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e) { }
    if (stroke) { try { v.applyStroke = true; v.strokeColor = H(stroke[0]); v.strokeWidth = stroke[1]; v.strokeOverFill = false; } catch (e) { } }
    td.setValue(v);
    T(t).property("ADBE Position").setValue([x, y]);
    if (rot) ROT(t).expression = M.DRIFT(rot, 0.8);
    if (anim == "stomp") T(t).property("ADBE Scale").expression = M.STOMP(d, 100);
    else if (anim == "pop") T(t).property("ADBE Scale").expression = M.POP(d, 100);
    else if (anim == "shake") { T(t).property("ADBE Scale").expression = M.STOMP(d, 100); T(t).property("ADBE Position").expression = "wiggle(16,10)"; }
    else if (anim == "rise") { T(t).property("ADBE Position").expression = M.RISE(d, x, y, 40); T(t).property("ADBE Opacity").expression = M.OPACITY_INOUT(d, 0.3); }
    if (typeof font != "string" && font) M.FONTS.push([t.name, font[0], font[1]]);
    return t;
  };
  // Sticker/label: coloured rectangle with text, pops in. Width estimated from character count.
  M.tag = function (txtS, col, tcol, x, y, rot, a, b, d, size, font) {
    size = size || 48; var s = M.shapeLayer("tag", a, b);
    var w = txtS.length * size * 0.66 + 70, v = M.grp(s, 0, 0); M.rect(v, w, size * 1.75, 4); M.fill(v, col);
    T(s).property("ADBE Position").setValue([x, y]); ROT(s).setValue(rot); T(s).property("ADBE Scale").expression = M.POP(d, 100);
    var t = M.txt(txtS, size, tcol, 0, size * 0.36, a, b, d, font || M.PS.mono, "none");
    t.parent = s; T(t).property("ADBE Position").setValue([0, size * 0.36]); ROT(t).setValue(0); return s;
  };

  // ---------- photos / footage ----------
  M.torn = function (x1, y1, x2, y2, j) {
    var pts = [], st = 55, x, y;
    for (x = x1; x < x2; x += st) pts.push([x, y1 + (rnd() - .5) * j]);
    for (y = y1; y < y2; y += st) pts.push([x2 + (rnd() - .5) * j, y]);
    for (x = x2; x > x1; x -= st) pts.push([x, y2 + (rnd() - .5) * j]);
    for (y = y2; y > y1; y -= st) pts.push([x1 + (rnd() - .5) * j, y]);
    return pts;
  };
  M.circ = function (cx, cy, r, j) { var pts = []; for (var i = 0; i < 72; i++) { var an = i / 72 * Math.PI * 2, rr = r + (rnd() - .5) * j; pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); } return pts; };
  M.rectPts = function (x1, y1, x2, y2) { return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]; };
  // n = project item name; pts = mask in SOURCE pixels; mc = mask centre (becomes anchor) -> placed at (x,y), scale sc%.
  // anim "slide" (needs from=[dx,dy]) | "pop" | "rise" | "none". opts: {roughen:true, shadow:true}
  M.photo = function (n, pts, mc, x, y, sc, rot, a, b, d, anim, from, opts) {
    opts = opts || {}; var it = item(n); if (!it) throw new Error("no project item " + n);
    var l = c.layers.add(it); l.name = "P " + n; span(l, a, b);
    if (pts) { var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"); var ms = new Shape(); ms.vertices = pts; ms.closed = true; m.property("ADBE Mask Shape").setValue(ms); }
    if (mc) T(l).property("ADBE Anchor Point").setValue(mc);
    if (anim == "slide") { T(l).property("ADBE Position").expression = M.SLIDE(d, x, y, from[0], from[1]); T(l).property("ADBE Scale").expression = "var t=Math.max(0,time-inPoint);var k=" + sc + "*(1+0.03*t);[k,k]"; }
    else if (anim == "pop") { T(l).property("ADBE Position").setValue([x, y]); T(l).property("ADBE Scale").expression = M.POP(d, sc); }
    else if (anim == "rise") { T(l).property("ADBE Position").expression = M.RISE(d, x, y, 60); T(l).property("ADBE Scale").setValue([sc, sc]); T(l).property("ADBE Opacity").expression = M.OPACITY_IN(d, 0.4); }
    else { T(l).property("ADBE Position").setValue([x, y]); T(l).property("ADBE Scale").setValue([sc, sc]); }
    if (rot != null && rot !== 0) ROT(l).expression = M.DRIFT(rot, 1.2);
    var fx = l.property("ADBE Effect Parade");
    if (opts.roughen !== false && pts) { var re = fx.addProperty("ADBE Roughen Edges"); re.property("ADBE Roughen Edges-0001").setValue(3); re.property("ADBE Roughen Edges-0003").setValue(5); }
    if (opts.shadow !== false) { var ds = fx.addProperty("ADBE Drop Shadow"); ds.property("ADBE Drop Shadow-0002").setValue(55); ds.property("ADBE Drop Shadow-0004").setValue(16); ds.property("ADBE Drop Shadow-0005").setValue(22); }
    return l;
  };
  // Icon PNG (rendered by scripts/icon.py and imported): place at (x,y) with on-screen size px.
  // anim "pop" | "rise" | "none"; d = delay after inPoint.
  M.iconPng = function (n, x, y, px, a, b, d, anim) {
    var it = item(n); if (!it) throw new Error("no project item " + n);
    var sc = Math.round(px / Math.max(it.width, it.height) * 1000) / 10;
    var l = M.photo(n, null, null, x, y, sc, 0, a, b, d || 0, anim || "pop", null, { roughen: false, shadow: false });
    l.name = "ICON " + n; return l;
  };
  M.tape = function (ph, x, y, rot) {
    var s = M.shapeLayer("tape", ph.inPoint, ph.outPoint), v = M.grp(s, 0, 0); M.rect(v, 190, 58); M.fill(v, "#FFF6DA", 78);
    s.parent = ph; var ap = T(ph).property("ADBE Anchor Point").value;
    T(s).property("ADBE Position").setValue([ap[0] + x, ap[1] + y]); ROT(s).setValue(rot); return s;
  };
  // Footage clip: place a video item, trim to source range [srcIn, srcOut] starting at comp time t0.
  M.clip = function (n, t0, srcIn, srcOut, x, y, sc) {
    var it = item(n); if (!it) throw new Error("no project item " + n);
    var l = c.layers.add(it); l.name = "V " + n;
    l.startTime = t0 - srcIn; l.inPoint = t0; l.outPoint = t0 + (srcOut - srcIn);
    T(l).property("ADBE Position").setValue([x == null ? W / 2 : x, y == null ? Hh / 2 : y]);
    if (sc) T(l).property("ADBE Scale").setValue([sc, sc]);
    return l;
  };

  // ---------- transitions ----------
  // Torn-paper wipe: two rough-edged panels sweep up across cut time t0.
  M.sweep = function (t0, c1, c2) {
    var cols = [c1, c2], out = [];
    for (var i = 0; i < 2; i++) {
      var s = M.shapeLayer("wipe", t0 - 0.32 + i * 0.06, t0 + 0.32 + i * 0.06), v = M.grp(s, 0, 0);
      M.rect(v, W * 1.4, Hh * 1.3); M.fill(v, cols[i]);
      var re = s.property("ADBE Effect Parade").addProperty("ADBE Roughen Edges");
      re.property("ADBE Roughen Edges-0001").setValue(2); re.property("ADBE Roughen Edges-0003").setValue(45); re.property("ADBE Roughen Edges-0006").setValue(220);
      T(s).property("ADBE Position").expression = "var u=time-(" + (t0 + i * 0.06) + ");[" + W / 2 + "+u*300," + Hh / 2 + "-u*" + Math.round(Hh * 4.2) + "]";
      ROT(s).setValue(-6); out.push(s);
    }
    return out;
  };
  // Clean wipe for learning modules: a single brand-colour bar slides across.
  M.barWipe = function (t0, col) {
    var s = M.shapeLayer("barwipe", t0 - 0.25, t0 + 0.25), v = M.grp(s, 0, 0); M.rect(v, W * 1.2, Hh * 1.2); M.fill(v, col);
    T(s).property("ADBE Position").expression = "var u=(time-" + t0 + ")/0.25;[" + W / 2 + "+u*" + Math.round(W * 1.15) + "," + Hh / 2 + "]";
    return s;
  };

  // ---------- learning-module furniture ----------
  // Lower third: accent bar + name + role, rises in, fades out at b.
  M.lowerThird = function (name, role, a, b, opts) {
    opts = opts || {}; var acc = opts.accent || "#FF3D7F", bg = opts.bg || "#1B2A49", fg = opts.fg || "#FFFFFF";
    var x0 = opts.x || Math.round(W * 0.06), y0 = opts.y || Math.round(Hh * 0.80);
    var font = opts.font || M.PS.bold, font2 = opts.font2 || M.PS.regular;
    var w = Math.max(name.length * 30, role.length * 19) + 80;
    var s = M.shapeLayer("lt box", a, b), v = M.grp(s, w / 2, 0); M.rect(v, w, 130, 6); M.fill(v, bg, 92);
    var v2 = M.grp(s, 6, 0); M.rect(v2, 12, 130); M.fill(v2, acc);
    T(s).property("ADBE Position").expression = M.RISE(0, x0, y0, 30); T(s).property("ADBE Opacity").expression = M.OPACITY_INOUT(0, 0.3);
    var t1 = M.txt(name, 52, fg, 0, 0, a, b, 0.1, font, "none"), t2 = M.txt(role, 34, acc, 0, 0, a, b, 0.2, font2, "none");
    [t1, t2].forEach(function (t, i) {
      var td = t.property("ADBE Text Properties").property("ADBE Text Document"), vv = td.value;
      try { vv.justification = ParagraphJustification.LEFT_JUSTIFY; } catch (e) { } td.setValue(vv);
      T(t).property("ADBE Position").expression = M.RISE(0.1 + i * 0.1, x0 + 40, y0 + (i ? 42 : -8), 30);
      T(t).property("ADBE Opacity").expression = M.OPACITY_INOUT(0.1 + i * 0.1, 0.3);
    });
    return s;
  };
  // Chapter card: full-frame colour, number + title.
  M.chapterCard = function (num, title, a, b, opts) {
    opts = opts || {}; var bg = opts.bg || "#1B2A49", acc = opts.accent || "#FFC524", fg = opts.fg || "#FFFFFF";
    var font = opts.font || M.PS.black;
    M.solid(bg, "chapter bg", a, b);
    M.txt(String(num < 10 ? "0" + num : num), Math.round(Hh * 0.18), acc, W / 2, Hh * 0.45, a, b, 0.05, font, "rise");
    M.txt(title, Math.round(Math.min(Hh * 0.07, W * 1.6 / Math.max(8, title.length))), fg, W / 2, Hh * 0.58, a, b, 0.2, font, "rise");
  };
  // Captions from a vtools transcript JSON object ({segments:[{start,end,text}]}). offset = comp time of source 0.
  M.captions = function (doc, offset, opts) {
    opts = opts || {}; var size = opts.size || Math.round(Hh * 0.055), y = opts.y || Math.round(Hh * 0.88);
    var font = opts.font || M.PS.bold, out = [];
    for (var i = 0; i < doc.segments.length; i++) {
      var sg = doc.segments[i]; if (!sg.text) continue;
      var t = M.txt(sg.text, size, opts.fg || "#FFFFFF", W / 2, y, offset + sg.start, offset + sg.end, 0, font, "none", [opts.stroke || "#000000", Math.round(size / 8)]);
      t.name = "CAP " + i; out.push(t);
    }
    return out;
  };

  // ---------- finishing ----------
  M.paperTexture = function (a, b, op) {
    var tex = M.solid("#808080", "paper texture", a, b), fn = tex.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
    fn.property("ADBE Fractal Noise-0004").setValue(160); fn.property("ADBE Fractal Noise-0010").expression = "time*240";
    tex.blendingMode = BlendingMode.OVERLAY; T(tex).property("ADBE Opacity").setValue(op == null ? 28 : op); return tex;
  };
  M.grain = function (a, b, amt) {
    var gr = M.solid("#808080", "grain", a, b); try { gr.adjustmentLayer = true; } catch (e) { }
    var nz = gr.property("ADBE Effect Parade").addProperty("ADBE Noise"); try { nz.property(1).setValue(amt == null ? 6 : amt); } catch (e) { }
    return gr;
  };
  return M;
}
