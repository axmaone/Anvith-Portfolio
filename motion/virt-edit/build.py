"""Generates index.html for the virtualisation portfolio edit from the cut list below.
Run: python build.py   (then npx hyperframes check)"""
import json, os

RATE = 1.15          # playback speed of the deck footage
INTRO = 3.2          # intro card length
OUTRO = 3.6          # end card length
SEAM = 0.32          # transition overlap length

# (source in, source out, chip label, key idea or None, kind)
CUTS = [
    (0.5, 4.5, 'Introduction', None, 'title'),
    (5.5, 9.8, 'Learning objectives', None, ''),
    (10.5, 14.8, 'The basics', 'Hardware, separated from software', ''),
    (15.5, 19.8, 'How it works', 'A hypervisor runs many virtual machines on one computer', ''),
    (29.0, 34.6, 'Sixty years', None, ''),
    (36.0, 41.6, '1960s · ORIGINS', 'IBM CP-67 let many users share one mainframe', 's1'),
    (43.0, 48.6, '1970s–80s · DECLINE', 'Cheap PCs arrived; research slowed', 's2'),
    (50.0, 55.6, 'LATE 1990s · REVIVAL', 'VMware brought it to everyday x86 servers', 's3'),
    (57.5, 62.6, '2000s · MAINSTREAM', 'Fewer servers, same work, less energy', 's4'),
    (64.0, 69.6, '2010s · CLOUD ERA', 'AWS, Azure and Google Cloud run on it', 's5'),
    (71.0, 76.6, 'The timeline', None, ''),
    (77.0, 81.8, 'Four forms', 'Network · server · storage · desktop', ''),
    (82.0, 86.8, 'Why it matters', 'Lower cost, better use, faster recovery', ''),
    (87.5, 91.8, 'Summary', None, ''),
]
BADGE = {'good': ('✓ Best call', 'Pause and investigate: filter fixed, wafers saved.'),
         'bad': ('✕ Costly call', 'Defects found late. Rework, waste and delays.')}

segs, t = [], INTRO - SEAM
for i, (a, b, chip, key, kind) in enumerate(CUTS):
    d = round((b - a) / RATE, 3)
    segs.append(dict(i=i, a=a, start=round(t, 3), dur=d, chip=chip, key=key, kind=kind))
    t += d - SEAM
content_end = t + SEAM
TOTAL = round(content_end - SEAM + OUTRO, 2)

videos, wraps, overlays = [], [], []
for s in segs:
    n = s['i']
    videos.append(
        f'<div class="vw" id="vw{n}"><video id="v{n}" class="clip" src="assets/deck.mp4" muted playsinline '
        f'data-start="{s["start"]}" data-duration="{s["dur"]}" data-media-start="{s["a"]}" '
        f'data-playback-rate="{RATE}" data-track-index="1" style="z-index:{n + 1}"></video></div>')
    if s['chip'] and s['kind'] != 'title':
        overlays.append(f'<div id="chip{n}" class="clip chip" data-start="{s["start"] + 0.35}" data-duration="{round(s["dur"] - 0.6, 3)}" data-track-index="2"><span>{s["chip"]}</span></div>')
    if s['key']:
        overlays.append(f'<div id="key{n}" class="clip key" data-start="{s["start"] + 1.0}" data-duration="{round(s["dur"] - 1.3, 3)}" data-track-index="3"><b>KEY IDEA</b><span>{s["key"]}</span></div>')
    if s['kind'] in BADGE:
        h, p = BADGE[s['kind']]
        overlays.append(f'<div id="badge{n}" class="clip badge badge--{s["kind"]}" data-start="{s["start"] + 0.9}" data-duration="{round(s["dur"] - 1.2, 3)}" data-track-index="4"><b>{h}</b><span>{p}</span></div>')
    if s['kind'] == 'choose':
        overlays.append(f'<div id="cursorWrap" class="clip" data-start="{s["start"]}" data-duration="{s["dur"]}" data-track-index="5" data-layout-allow-overlap>'
                        f'<div id="ring"></div><div id="ripple"></div>'
                        f'<svg id="cursor" viewBox="0 0 24 24" width="64" height="64"><path d="M4 2l15 10-6.5 1.5L16 21l-3 1.5-3.4-7.6L4 19z" fill="#15202d" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>')

audios = [f'<audio id="music" class="clip" src="assets/audio/music-tech-corporate.mp3" data-start="0" data-duration="{TOTAL}" data-volume="0.32" data-fade-in="1.2" data-fade-out="2.5" data-track-index="8"></audio>']
for s in segs[1:]:
    audios.append(f'<audio id="wh{s["i"]}" class="clip" src="assets/audio/whoosh.mp3" data-start="{round(s["start"] - 0.12, 3)}" data-duration="0.57" data-volume="0.45" data-track-index="9"></audio>')
audios.append(f'<audio id="whOut" class="clip" src="assets/audio/whoosh.mp3" data-start="{round(content_end - SEAM - 0.1, 3)}" data-duration="0.57" data-volume="0.45" data-track-index="9"></audio>')
for s in segs:
    if s['kind'] == 'choose':
        audios.append(f'<audio id="clk" class="clip" src="assets/audio/click.mp3" data-start="{round(s["start"] + 3.1, 3)}" data-duration="0.36" data-volume="0.9" data-track-index="10"></audio>')
    if s['kind'] == 'good':
        audios.append(f'<audio id="ok{s["i"]}" class="clip" src="assets/audio/success.mp3" data-start="{round(s["start"] + 0.9, 3)}" data-duration="1.38" data-volume="0.6" data-track-index="10"></audio>')
    if s['kind'] == 'bad':
        audios.append(f'<audio id="er{s["i"]}" class="clip" src="assets/audio/error.mp3" data-start="{round(s["start"] + 0.9, 3)}" data-duration="1.9" data-volume="0.35" data-track-index="10"></audio>')
stage_segs = [s for s in segs if s['kind'].startswith('s')]
prog_start, prog_end = stage_segs[0]['start'] + 0.3, stage_segs[-1]['start'] + stage_segs[-1]['dur'] - 0.3

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face {{ font-family: 'Bricolage'; src: url('assets/fonts/bricolage.woff2') format('woff2'); font-weight: 200 800; font-stretch: 75% 100%; }}
@font-face {{ font-family: 'FrauncesItalic'; src: url('assets/fonts/fraunces-italic.woff2') format('woff2'); font-style: italic; font-weight: 100 900; }}
@font-face {{ font-family: 'JBM'; src: url('assets/fonts/jbm.woff2') format('woff2'); }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: #efe8da; }}
#root {{ position: relative; width: 100%; height: 100%; font-family: 'Bricolage', sans-serif; }}
#bg {{ position: absolute; inset: 0; background: #15202d; }}
.vw {{ position: absolute; inset: 0; }}
.vw video {{ position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }}
.chip {{ position: absolute; right: 56px; top: 40px; z-index: 50; }}
.chip span {{ display: inline-block; padding: 12px 22px; border-radius: 999px; background: #15202d; color: #efe8da; font: 22px 'JBM'; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 5px 5px 0 #e2432a; }}
#prog {{ position: absolute; right: 56px; top: 108px; width: 360px; height: 8px; border-radius: 4px; background: rgba(21,32,45,.18); z-index: 50; overflow: hidden; }}
#progFill {{ width: 100%; height: 100%; background: #e2432a; transform-origin: left; transform: scaleX(0); }}
#chip6 {{ top: auto; bottom: 56px; }} #key8 {{ left: auto; right: 56px; }}
.key {{ position: absolute; left: 56px; bottom: 56px; z-index: 50; display: flex; align-items: stretch; border-radius: 16px; overflow: hidden; box-shadow: 0 14px 40px rgba(0,0,0,.25); }}
.key b {{ background: #e2432a; color: #fff; font: 20px 'JBM'; letter-spacing: .1em; padding: 18px 18px; display: grid; place-items: center; }}
.key span {{ background: #fbf8f2; color: #15202d; font-weight: 650; font-stretch: 88%; font-size: 36px; padding: 14px 26px; }}
.badge {{ position: absolute; right: 56px; bottom: 56px; z-index: 50; width: 520px; padding: 22px 26px; border-radius: 18px; color: #fff; display: grid; gap: 6px; box-shadow: 0 14px 40px rgba(0,0,0,.25); }}
.badge b {{ font-size: 40px; font-weight: 760; font-stretch: 82%; }}
.badge span {{ font-size: 24px; line-height: 1.3; opacity: .92; }}
.badge--good {{ background: #2f8a58; }} .badge--bad {{ background: #c2321c; }}
#cursorWrap {{ position: absolute; inset: 0; z-index: 60; pointer-events: none; }}
#cursor {{ position: absolute; left: 0; top: 0; filter: drop-shadow(3px 4px 0 rgba(0,0,0,.25)); }}
#ring {{ position: absolute; left: 732px; top: 462px; width: 436px; height: 532px; border-radius: 34px; border: 8px solid #2f8a58; opacity: 0; }}
#ripple {{ position: absolute; left: 950px; top: 760px; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 5px solid #e2432a; opacity: 0; }}
.card {{ position: absolute; inset: 0; z-index: 70; background: #efe8da; display: grid; place-content: center; text-align: center; color: #15202d; }}
.card .sig {{ font-family: 'FrauncesItalic'; font-style: italic; font-size: 64px; color: #e2432a; }}
.card h1 {{ font-weight: 760; font-stretch: 78%; font-size: 120px; line-height: .92; letter-spacing: -.03em; margin: 18px 0 26px; }}
.card .m {{ font: 24px 'JBM'; letter-spacing: .12em; text-transform: uppercase; color: #3b4655; }}
.card .pill {{ display: inline-block; margin-top: 28px; padding: 12px 22px; border-radius: 999px; background: #15202d; color: #efe8da; font: 22px 'JBM'; letter-spacing: .08em; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1920" data-height="1080">
  <div id="bg" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0"></div>
  {chr(10).join('  ' + v for v in videos)}
  <div id="progWrap" class="clip" data-start="{round(prog_start, 3)}" data-duration="{round(prog_end - prog_start, 3)}" data-track-index="2"><div id="prog"><div id="progFill"></div></div></div>
  {chr(10).join('  ' + o for o in overlays)}
  {chr(10).join('  ' + x for x in audios)}
  <div id="intro" class="clip card" data-start="0" data-duration="{INTRO}" data-track-index="6">
    <div class="m" id="i1">E-learning sample · Cloud computing</div>
    <h1 id="i2">Virtualisation:<br/>mainframes to cloud</h1>
    <div class="sig" id="i3">Anvith M Acharya</div>
  </div>
  <div id="outro" class="clip card" data-start="{round(content_end - SEAM, 3)}" data-duration="{OUTRO}" data-track-index="6">
    <div class="m" id="o1">Storyboard & motion by</div>
    <h1 id="o2">Anvith M Acharya</h1>
    <div class="m" id="o3">Learning & Experience Designer</div>
    <div><span class="pill" id="o4">anvith-portfolio-rose.vercel.app</span></div>
  </div>
</div>
<script>
const SEGS = {json.dumps(segs)};
const SEAM = {SEAM}, INTRO = {INTRO};
const tl = gsap.timeline({{ paused: true }});

// intro + outro cards
tl.fromTo('#i1', {{ opacity: 0 }}, {{ opacity: 1, duration: .4 }}, .2);
tl.fromTo('#i2', {{ opacity: 0, filter: 'blur(12px)' }}, {{ opacity: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out' }}, .35);
tl.fromTo('#i3', {{ opacity: 0, y: 12 }}, {{ opacity: 1, y: 0, duration: .6, ease: 'expo.out' }}, .9);
tl.to('#intro', {{ opacity: 0, duration: SEAM, ease: 'power2.in' }}, INTRO - SEAM);
const oS = {round(content_end - SEAM, 3)};
tl.fromTo('#outro', {{ opacity: 0 }}, {{ opacity: 1, duration: SEAM }}, oS);
tl.fromTo('#o2', {{ opacity: 0, filter: 'blur(12px)' }}, {{ opacity: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out' }}, oS + .25);
tl.fromTo(['#o1', '#o3', '#o4'], {{ opacity: 0, y: 10 }}, {{ opacity: 1, y: 0, duration: .5, stagger: .12, ease: 'expo.out' }}, oS + .45);

// seams: alternate a zoom-through and a horizontal whip, both with blur, on each footage wrapper
SEGS.forEach((s, k) => {{
  const el = '#vw' + s.i, whip = k % 2 === 1;
  if (k > 0) tl.fromTo(el, whip ? {{ x: 220, filter: 'blur(18px)' }} : {{ scale: 1.08, filter: 'blur(16px)' }},
    {{ x: 0, scale: 1, filter: 'blur(0px)', duration: SEAM + .12, ease: 'expo.out' }}, s.start);
  if (k < SEGS.length - 1) {{
    const nxtWhip = (k + 1) % 2 === 1;
    tl.to(el, nxtWhip ? {{ x: -220, filter: 'blur(18px)', duration: SEAM, ease: 'power3.in' }} : {{ scale: .94, filter: 'blur(16px)', duration: SEAM, ease: 'power3.in' }}, s.start + s.dur - SEAM);
  }}
  // a slow push-in during long holds keeps the slide alive
  tl.fromTo('#v' + s.i, {{ scale: 1 }}, {{ scale: 1.035, duration: s.dur, ease: 'none' }}, s.start);
}});

// chips, key ideas, badges
document.querySelectorAll('.chip span').forEach((c) => {{
  const host = c.parentElement, st = parseFloat(host.dataset.start), d = parseFloat(host.dataset.duration);
  tl.fromTo(c, {{ y: -30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: .5, ease: 'back.out(1.6)' }}, st);
  tl.to(c, {{ y: -20, opacity: 0, duration: .2, ease: 'power2.in' }}, st + d - .22);
}});
document.querySelectorAll('.key').forEach((k) => {{
  const st = parseFloat(k.dataset.start), d = parseFloat(k.dataset.duration);
  tl.fromTo(k.querySelector('b'), {{ scaleX: 0, transformOrigin: 'left' }}, {{ scaleX: 1, duration: .35, ease: 'expo.out' }}, st);
  tl.fromTo(k.querySelector('span'), {{ clipPath: 'inset(0 100% 0 0)' }}, {{ clipPath: 'inset(0 0% 0 0)', duration: .6, ease: 'expo.out' }}, st + .15);
  tl.to([k.querySelector('b'), k.querySelector('span')], {{ opacity: 0, y: 16, duration: .2, ease: 'power2.in' }}, st + d - .22);
}});
document.querySelectorAll('.badge').forEach((b) => {{
  const st = parseFloat(b.dataset.start), d = parseFloat(b.dataset.duration);
  tl.fromTo(b.children, {{ opacity: 0, x: 40 }}, {{ opacity: 1, x: 0, duration: .5, stagger: .1, ease: 'expo.out' }}, st);
  tl.to(b.children, {{ opacity: 0, duration: .2 }}, st + d - .22);
}});
// background panels of badges appear with their text
document.querySelectorAll('.badge').forEach((b) => {{
  const st = parseFloat(b.dataset.start), d = parseFloat(b.dataset.duration);
  tl.fromTo(b, {{ clipPath: 'inset(0 0 0 100% round 18px)' }}, {{ clipPath: 'inset(0 0 0 0% round 18px)', duration: .45, ease: 'expo.out' }}, st - .05);
  tl.to(b, {{ clipPath: 'inset(0 0 0 100% round 18px)', duration: .25, ease: 'power3.in' }}, st + d - .25);
}});

// stage progress bar
const stages = SEGS.filter((s) => s.kind.startsWith('s'));
stages.forEach((s, i) => tl.to('#progFill', {{ scaleX: (i + 1) / 5, duration: .6, ease: 'power2.inOut' }}, s.start + .5));

// the cursor picks Option B
const ch = SEGS.find((s) => s.kind === 'choose');
if (ch) {{
  const T = ch.start;
  tl.fromTo('#cursor', {{ x: 1700, y: 1100 }}, {{ x: 470, y: 760, duration: .9, ease: 'power3.out' }}, T + .5);
  tl.to('#cursor', {{ x: 1500, y: 740, duration: .7, ease: 'power2.inOut' }}, T + 1.6);
  tl.to('#cursor', {{ x: 960, y: 770, duration: .6, ease: 'power3.inOut' }}, T + 2.45);
  tl.to('#cursor', {{ scale: .82, duration: .08, yoyo: true, repeat: 1, transformOrigin: '10% 10%' }}, T + 3.1);
  tl.fromTo('#ripple', {{ scale: .4, opacity: 1 }}, {{ scale: 5, opacity: 0, duration: .6, ease: 'expo.out' }}, T + 3.12);
  tl.fromTo('#ring', {{ opacity: 0, scale: 1.06 }}, {{ opacity: 1, scale: 1, duration: .35, ease: 'expo.out' }}, T + 3.15);
}}

tl.set({{}}, {{}}, {TOTAL});
window.__timelines['main'] = tl;
tl.seek(0);
</script>
</body>
</html>
'''
open(os.path.join(os.path.dirname(__file__), 'index.html'), 'w', encoding='utf-8').write(html)
print('total', TOTAL, 'segments', len(segs))
print(json.dumps([(s['i'], s['start'], s['dur'], s['kind']) for s in segs]))
