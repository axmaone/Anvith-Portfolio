// Stage scene template for the semiconductor summary (soft-paper Vox collage + glass lens micro view).
// Load after motion.js:  $.evalFile(new File("stage.js"));  buildStage({...});
var PAL = { NAVY: "#14213D", COR: "#E8553F", YEL: "#FFD23F", MINT: "#2EE6A6", CRM: "#F7EDD6", VIO: "#5B3DF5" };
var LABELS = ["PURIFY", "WAFER", "PATTERN", "LAYERS", "WIRE", "PACKAGE"];

function TT(l) { return l.property("ADBE Transform Group"); }

// Group-level animation helpers for shapes inside the micro view (time is layer-relative).
function gAnim(g, prop, expr) { var grp = g.property("ADBE Vector Transform Group") ? g : g.parentProperty; grp.property("ADBE Vector Transform Group").property(prop).expression = expr; }
function popIn(at) { return "var t=time-inPoint-(" + at + ");var k=t<0?0:100*(1-Math.exp(-7*t)*Math.cos(14*t));[k,k]"; }
function growX(at, dur) { return "var t=time-inPoint-(" + at + ");var k=t<0?0:Math.min(100,100*t/" + dur + ");[k,100]"; }
function fadeOut(at, dur) { return "var t=time-inPoint-(" + at + ");t<0?100:Math.max(0,100-100*t/" + dur + ")"; }

// Draw the stage's micro diagram into shape layer `dg` (coords centred on 0,0, radius ~200). t0 = reveal time.
function micro(M, dg, kind, t0) {
  var N = PAL.NAVY, g;
  if (kind == 1) { // purification: lattice stays, impurities fly out
    for (var r = 0; r < 5; r++) for (var q = 0; q < 5; q++) { g = M.grp(dg, -120 + q * 60, -120 + r * 60); M.ell(g, 26, 26); M.fill(g, "#9FD8E8"); }
    var imp = [[-90, -60], [30, 0], [90, -90], [-30, 90], [60, 60]];
    for (var i = 0; i < imp.length; i++) { g = M.grp(dg, imp[i][0], imp[i][1]); M.ell(g, 30, 30); M.fill(g, PAL.COR);
      gAnim(g, "ADBE Vector Group Opacity", fadeOut(t0 + 0.8 + i * 0.15, 0.3)); }
  } else if (kind == 2) { // ingot -> slices
    g = M.grp(dg, -70, 0); M.rect(g, 90, 280, 40); M.fill(g, "#C9CED6");
    for (var i = 0; i < 3; i++) { g = M.grp(dg, 80, -70 + i * 70); M.ell(g, 120, 34); M.fill(g, "#E4E8EE"); M.stroke(g, "#8E98A4", 3);
      gAnim(g, "ADBE Vector Position", "var t=time-inPoint-(" + (t0 + 0.4 + i * 0.25) + ");var e=t<0?0:1-Math.exp(-6*t);[" + 80 + "-110*(1-e)," + (-70 + i * 70) + "]");
      gAnim(g, "ADBE Vector Group Opacity", "var t=time-inPoint-(" + (t0 + 0.4 + i * 0.25) + ");t<0?0:Math.min(100,t*300)"); }
  } else if (kind == 3) { // UV through a mask prints the pattern
    for (var i = 0; i < 4; i++) { var gx = -90 + i * 60;
      g = M.grp(dg, gx, -95); M.rect(g, 22, 22); M.fill(g, N);
      g = M.grp(dg, gx, -25); M.rect(g, 14, 120); M.fill(g, "#B57CFF", 85); gAnim(g, "ADBE Vector Scale", growX(t0 + 0.3 + i * 0.1, 0.25).replace("[k,100]", "[100,k]"));
      g = M.grp(dg, gx, 62); M.rect(g, 22, 18, 2); M.fill(g, PAL.YEL); gAnim(g, "ADBE Vector Scale", popIn(t0 + 0.7 + i * 0.1)); }
    g = M.grp(dg, 0, -95); M.rect(g, 250, 22, 3); M.fill(g, "#C9CED6");
    g = M.grp(dg, 0, 80); M.rect(g, 280, 20, 4); M.fill(g, "#8E98A4");
  } else if (kind == 4) { // stacked layers
    var cols = ["#8E98A4", "#FFD23F", "#E8553F", "#B57CFF"], names = 4;
    for (var i = 0; i < 4; i++) { g = M.grp(dg, 0, 90 - i * 56); M.rect(g, 260, 46, 4); M.fill(g, cols[i]);
      gAnim(g, "ADBE Vector Scale", growX(t0 + 0.2 + i * 0.35, 0.3)); }
  } else if (kind == 5) { // metal wiring between components, a defect flagged then cleared
    var nodes = [[-110, -80], [0, -110], [110, -60], [-90, 70], [30, 40], [110, 100]];
    var links = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [4, 5]];
    for (var i = 0; i < links.length; i++) { var a = nodes[links[i][0]], b = nodes[links[i][1]];
      var p = dg.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"); p.name = "w" + i;
      var v = p.property("ADBE Vectors Group"); var sh = v.addProperty("ADBE Vector Shape - Group"); var s = new Shape(); s.vertices = [a, b]; s.closed = false; sh.property("ADBE Vector Shape").setValue(s);
      M.stroke(v, PAL.YEL, 9); var tr = v.addProperty("ADBE Vector Filter - Trim"); tr.property("ADBE Vector Trim End").expression = "var t=time-inPoint-(" + (t0 + 0.2 + i * 0.15) + ");t<0?0:Math.min(100,100*t/0.3)"; }
    for (var i = 0; i < nodes.length; i++) { g = M.grp(dg, nodes[i][0], nodes[i][1]); M.ell(g, 36, 36); M.fill(g, "#E4E8EE"); }
    g = M.grp(dg, 30, 40); M.ell(g, 70, 70); var st = M.stroke(g, PAL.COR, 6);
    st.property("ADBE Vector Stroke Color").expression = "time-inPoint<" + (t0 + 2.2) + "?[0.91,0.33,0.25,1]:[0.18,0.75,0.45,1]";
    gAnim(g, "ADBE Vector Scale", popIn(t0 + 1.3));
  } else if (kind == 6) { // sealed chip + pass tick (tick first so it sits on top)
    var tk = dg.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"), tv = tk.property("ADBE Vectors Group");
    var tp = tv.addProperty("ADBE Vector Shape - Group"), ts = new Shape(); ts.vertices = [[-18, 0], [-5, 14], [20, -14]]; ts.closed = false; tp.property("ADBE Vector Shape").setValue(ts);
    M.stroke(tv, "#FFFFFF", 9); M.ell(tv, 90, 90); M.fill(tv, "#2FA866");
    tk.property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue([70, 85]); gAnim(tk, "ADBE Vector Scale", popIn(t0 + 1.2));
    g = M.grp(dg, 0, 0); M.rect(g, 190, 230, 14); M.fill(g, "#0B0F1A"); gAnim(g, "ADBE Vector Scale", popIn(t0 + 0.1));
    for (var i = 0; i < 5; i++) { g = M.grp(dg, -110, -80 + i * 40); M.rect(g, 30, 14); M.fill(g, "#C9CED6"); g = M.grp(dg, 110, -80 + i * 40); M.rect(g, 30, 14); M.fill(g, "#C9CED6"); }
  }
  g = M.grp(dg, 0, 0); M.ell(g, 400, 400); M.fill(g, N); // background disc: created last = drawn underneath
}

// o: {comp, n, img, P:[sx,sy], bg, h1, h2, facts:[a,b], microTag, dur}
function buildStage(o) {
  var c = app.project.items.addComp(o.comp, 1920, 1080, 1, o.dur, 30);
  var M = MK(c); M.seed(o.n * 17);
  var D = o.dur, N = PAL.NAVY;
  M.solid(o.bg, "bg soft", 0, D);
  var dots = M.dots(N, 100, 0, D); TT(c.layer(1)).property("ADBE Opacity").setValue(10);
  var ph = M.photo(o.img, M.torn(120, 60, 1800, 1020, 24), [960, 536], 640, 600, 60, (o.n % 2 ? 2 : -2), 0, D, 0.1, "slide", [o.n % 2 ? -900 : -700, o.n % 2 ? 0 : 160]);
  M.tape(ph, -700, -440, -10); M.tape(ph, 690, 430, 12);
  for (var i = 0; i < 6; i++) { var cur = (i == o.n - 1), done = (i < o.n - 1);
    M.tag((done ? "✓ " : (i + 1) + "  ") + LABELS[i], cur ? PAL.YEL : N, cur ? N : (done ? PAL.MINT : PAL.CRM), 230 + i * 292, 70, cur ? -3 : 0, 0, D, cur ? 0.25 : 0, cur ? 34 : 26); }
  M.tag("STAGE " + o.n + " OF 6", N, PAL.MINT, 1530, 178, 0, 0, D, 0.3, 28);
  var t1 = M.txt(o.h1, 100, N, 1530, 320, 0, D, 0.35, M.PS.black, "stomp", null, -2);
  // Vox highlighter swipe behind the key word
  var hw = Math.min(760, Math.round(o.h2.length * 62 + 40));
  var hl = M.shapeLayer("highlighter", 0, D), hv = M.grp(hl, 0, 0); M.rect(hv, hw, 70, 6); M.fill(hv, PAL.YEL, 85);
  ROT0(hl, -2);
  TT(hl).property("ADBE Scale").expression = "var t=time-inPoint-0.9;var k=t<0?0:Math.min(100,100*t/0.35);[k,100]";
  TT(hl).property("ADBE Anchor Point").setValue([-hw / 2, 0]); TT(hl).property("ADBE Position").setValue([1530 - hw / 2, 425]);
  var t2 = M.txt(o.h2, 112, PAL.COR, 1530, 455, 0, D, 0.55, M.PS.black, "stomp", null, -2);
  // frosted glass card with two facts typed on
  var cx = 1520, cy = 820, cw = 640, chh = 230;
  var blur = M.solid("#808080", "glass blur", 0, D); blur.adjustmentLayer = true;
  var bm = blur.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"); var bs = new Shape(); bs.vertices = M.rectPts(cx - cw / 2, cy - chh / 2, cx + cw / 2, cy + chh / 2); bs.closed = true; bm.property("ADBE Mask Shape").setValue(bs);
  blur.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2").property(1).setValue(40);
  TT(blur).property("ADBE Opacity").expression = M.OPACITY_IN(1.2, 0.4);
  var card = M.shapeLayer("glass card", 0, D), v = M.grp(card, 0, 0); M.rect(v, cw, chh, 26); M.fill(v, "#FFFFFF", 62); M.stroke(v, "#FFFFFF", 3);
  TT(card).property("ADBE Position").expression = M.RISE(1.2, cx, cy, 40); TT(card).property("ADBE Opacity").expression = M.OPACITY_IN(1.2, 0.4);
  for (var i = 0; i < o.facts.length; i++) { var y = cy - 45 + i * 95, d = (o.factAt || [1.6, 2.8])[i];
    M.txt(String(i + 1), 44, PAL.COR, cx - cw / 2 + 55, y + 16, 0, D, d, M.PS.black, "pop");
    var t = M.txt(o.facts[i], 40, N, cx - cw / 2 + 95, y + 14, 0, D, d, M.PS.bold, "none");
    var td = t.property("ADBE Text Properties").property("ADBE Text Document"), vv = td.value; vv.justification = ParagraphJustification.LEFT_JUSTIFY; td.setValue(vv);
    var lw = t.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe"); lw.property(2).setValue(270); lw.property(3).setValue(20);
    lw.property(1).expression = "var t=time-inPoint-(" + d + ");t<0?100:Math.max(0,100-100*t/0.6)"; }
  // hotspot -> leader -> glass lens (photo zoom), then the micro view
  var P = o.P, HP = [640 + (P[0] - 960) * 0.6, 600 + (P[1] - 536) * 0.6];
  var LC = [Math.min(900, Math.max(330, HP[0] + 230)), Math.max(400, HP[1] - 230)], R = 200, T0 = o.lensAt || 1.8, TM = T0 + 1.6;
  var ring = M.shapeLayer("hotspot", 0, D), rv = M.grp(ring, 0, 0); M.ell(rv, 70, 70); M.stroke(rv, PAL.YEL, 6);
  TT(ring).property("ADBE Position").setValue(HP); TT(ring).property("ADBE Scale").expression = M.POP(T0 - 0.4, 100);
  var lead = M.shapeLayer("leader", 0, D); TT(lead).property("ADBE Position").setValue([0, 0]); TT(lead).property("ADBE Anchor Point").setValue([0, 0]);
  var lv = M.grp(lead, 0, 0), dx = LC[0] - HP[0], dy = LC[1] - HP[1], dl = Math.sqrt(dx * dx + dy * dy);
  var lp = lv.addProperty("ADBE Vector Shape - Group"), ls = new Shape(); ls.vertices = [HP, [LC[0] - dx / dl * R, LC[1] - dy / dl * R]]; ls.closed = false; lp.property("ADBE Vector Shape").setValue(ls);
  M.stroke(lv, PAL.YEL, 5); lv.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End").expression = "var t=time-inPoint-(" + (T0 - 0.3) + ");t<0?0:Math.min(100,100*t/0.35)";
  var k = 0.6 * 3.0, l = c.layers.add(M.item(o.img)); l.name = "LENS photo"; M.span(l, 0, D);
  var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), sh = new Shape(), pts = [];
  for (var j = 0; j < 72; j++) { var an = j / 72 * Math.PI * 2; pts.push([P[0] + Math.cos(an) * R / k, P[1] + Math.sin(an) * R / k]); }
  sh.vertices = pts; sh.closed = true; mk.property("ADBE Mask Shape").setValue(sh);
  TT(l).property("ADBE Anchor Point").setValue(P); TT(l).property("ADBE Position").setValue(LC);
  TT(l).property("ADBE Scale").expression = "var t=time-inPoint-(" + T0 + ");var s=" + (k * 100) + ";var e=t<0?0:1-Math.exp(-5*t);[s*(0.35+0.65*e),s*(0.35+0.65*e)]";
  TT(l).property("ADBE Opacity").expression = "var t=time-inPoint;t<" + T0 + "?0:(t<" + TM + "?100:Math.max(0,100-(t-" + TM + ")*250))";
  var dg = M.shapeLayer("micro view", 0, D); micro(M, dg, o.n, TM);
  TT(dg).property("ADBE Position").setValue(LC); TT(dg).property("ADBE Opacity").expression = "var t=time-inPoint-(" + TM + ");t<0?0:Math.min(100,t*250)";
  TT(dg).property("ADBE Scale").expression = "var t=time-inPoint-(" + TM + ");var e=t<0?0:1-Math.exp(-6*t);[60+40*e,60+40*e]";
  var rim = M.shapeLayer("glass rim", 0, D), gv = M.grp(rim, 0, 0); M.ell(gv, R * 2, R * 2); M.fill(gv, "#FFFFFF", 6); M.stroke(gv, "#FFFFFF", 10);
  var hv2 = M.grp(rim, -R * 0.38, -R * 0.48, -20); M.ell(hv2, R * 0.6, R * 0.22); M.fill(hv2, "#FFFFFF", 22);
  TT(rim).property("ADBE Position").setValue(LC); TT(rim).property("ADBE Scale").expression = M.POP(T0, 100);
  var ds = rim.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow"); ds.property("ADBE Drop Shadow-0002").setValue(50); ds.property("ADBE Drop Shadow-0004").setValue(12); ds.property("ADBE Drop Shadow-0005").setValue(24);
  var zt = M.tag("ZOOM IN ×3", N, PAL.YEL, LC[0], LC[1] - R - 30, -4, 0, D, T0 + 0.2, 26); zt.outPoint = TM;
  M.tag(o.microTag, PAL.YEL, N, LC[0], LC[1] - R - 30, -3, TM, D, 0, 26);
  M.paperTexture(0, D, 14); M.grain(0, D, 5);
  return c;
}
function ROT0(l, r) { l.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(r); }
