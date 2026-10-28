"""Virtualisation: one machine, many computers. A mixed-style learning summary.
Modern screencast + toy bricks for the concept; each history era switches style
(1960s silent film, 80s CRT terminal, late-90s retro OS, 2000s toy data centre, 2010s dark keynote).
Run: python build.py  -> index.html (scene lengths follow the voiceover clips in vo/)."""
import json, math, os, wave

HERE = os.path.dirname(os.path.abspath(__file__))
LEAD, TAIL = 0.45, 0.55


def vo_len(k):
    w = wave.open(os.path.join(HERE, 'vo', k + '.wav'))
    return w.getnframes() / w.getframerate()


# ---------- isometric toy bricks (static SVG) ----------
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))


def P(x, y, z):
    return ((x - y) * C30, (x + y) * S30 - z)


def poly(pts, fill, extra=''):
    return '<polygon points="%s" fill="%s" stroke="#14213D" stroke-width="2.5" stroke-linejoin="round"%s/>' % (
        ' '.join('%.1f,%.1f' % P(*p) for p in pts), fill, extra)


def shade(hexc, k):
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    f = lambda c: max(0, min(255, int(c * k)))
    return '#%02x%02x%02x' % (f(r), f(g), f(b))


def brick(x, y, z, w, d, h, col, studs=True, unit=40):
    top = [(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)]
    right = [(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)]
    front = [(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)]
    s = poly(right, shade(col, 0.72)) + poly(front, shade(col, 0.86)) + poly(top, col)
    if studs:
        for i in range(int(w // unit)):
            for j in range(int(d // unit)):
                cx, cy = P(x + unit * (i + 0.5), y + unit * (j + 0.5), z + h)
                s += '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" stroke="#14213D" stroke-width="2"/>' % (
                    cx, cy - 6, unit * 0.32, unit * 0.18, shade(col, 1.08))
    return s


def label_at(x, y, z, text, cls='blab'):
    px, py = P(x, y, z)
    return '<text x="%.1f" y="%.1f" class="%s">%s</text>' % (px, py, cls, text)


# ---------- scenes ----------
SCENES = [  # id, voice clips, extra seconds
    ('intro', ['v0'], 0.4), ('how', ['v1'], 0.3), ('split', ['v2'], 0.6),
    ('e60', ['v3'], 1.2), ('e80', ['v4'], 0.6), ('e90', ['v5'], 0.6),
    ('e00', ['v6'], 0.6), ('e10', ['v7'], 0.6), ('check', ['c1', 'PAUSE', 'c2'], 0.6), ('outro', ['e1'], 1.6),
]
PAUSE = 2.6
timeline, vos, t = [], [], 0.0
for sid, clips, extra in SCENES:
    start, cur = t, t + LEAD
    marks = {}
    for k in clips:
        if k == 'PAUSE':
            marks['pause'] = cur - start
            cur += PAUSE
            continue
        L = vo_len(k)
        vos.append((k, round(cur, 3), round(L, 3)))
        marks[k] = round(cur - start, 3)
        cur += L + 0.15
    dur = round(cur - start + TAIL + extra, 3)
    timeline.append({'id': sid, 'start': round(start, 3), 'dur': dur, 'marks': marks})
    t += dur
TOTAL = round(t, 3)
SC = {s['id']: s for s in timeline}

# ---------- brick layouts ----------
HW, HV = '#9AA5B4', '#E8553F'
stack = brick(0, 0, 0, 320, 200, 70, HW) + '<text x="-200" y="70" class="blab" text-anchor="end">HARDWARE</text>'
stack_hv = brick(0, 0, 70, 320, 200, 46, HV) + '<text x="-200" y="8" class="blab hv" text-anchor="end">HYPERVISOR</text>'
vmcols = [('#5B8DEF', 'VM 1'), ('#F2C230', 'VM 2'), ('#2EC4A0', 'VM 3')]
vm_bricks = ''.join('<g class="vm" id="vm%d">%s%s</g>' % (
    i, brick(10 + i * 102, 40, 116, 96, 120, 90, c), label_at(10 + i * 102 + 20, 160, 160, n, 'blab vmlab'))
                   for i, (c, n) in enumerate(vmcols))

servers = ''
for i in range(10):
    gx, gy = (i % 5) * 110, (i // 5) * 150
    servers += '<g class="srv" id="srv%d">%s</g>' % (i, brick(gx, gy, 0, 80, 80, 110, '#9AA5B4', studs=False))
big = ''
for i in range(2):
    big += '<g class="bigsrv" id="big%d">%s' % (i, brick(120 + i * 240, 60, 0, 140, 120, 150, '#14213D', studs=False))
    for j, (c, _) in enumerate(vmcols):
        big += '<g class="bvm">%s</g>' % brick(130 + i * 240 + j * 42, 80, 150, 36, 36, 40, c)
    big += '</g>'

# ---------- HTML ----------
D = json.dumps
html = '''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face { font-family: 'Bricolage'; src: url('assets/fonts/bricolage.woff2') format('woff2'); font-weight: 200 800; font-stretch: 75% 100%; }
@font-face { font-family: 'FrauncesItalic'; src: url('assets/fonts/fraunces-italic.woff2') format('woff2'); font-style: italic; font-weight: 100 900; }
@font-face { font-family: 'JBM'; src: url('assets/fonts/jbm.woff2') format('woff2'); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: #F3EEE4; }
#root { position: relative; width: 100%; height: 100%; font-family: 'Bricolage', sans-serif; color: #14213D; }
.scene { position: absolute; inset: 0; overflow: hidden; }
.paper { background: #F3EEE4; }
.dots::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(#14213D 2px, transparent 2.5px); background-size: 34px 34px; opacity: .07; }
.kicker { position: absolute; font: 24px 'JBM'; letter-spacing: .12em; text-transform: uppercase; padding: 10px 18px; border-radius: 6px; background: #14213D; color: #F7EDD6; }
.h { position: absolute; font-weight: 760; font-stretch: 80%; letter-spacing: -.025em; line-height: .95; }
.acc { color: #E8553F; }
.hl { position: absolute; height: 64px; background: #FFD23F; opacity: .85; border-radius: 6px; transform-origin: left center; }
.body { position: absolute; font-weight: 500; font-size: 38px; line-height: 1.3; color: #3B4655; }
.blab { font: 700 26px 'JBM'; fill: #14213D; letter-spacing: .08em; }
.blab.hv { fill: #E8553F; } .blab.vmlab { font-size: 20px; }
/* modern desktop */
.laptop { position: absolute; left: 360px; top: 150px; width: 1200px; height: 720px; border-radius: 28px; background: #14213D; padding: 26px; box-shadow: 0 40px 80px rgba(20,33,61,.25); }
.screen { position: relative; width: 100%; height: 100%; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg,#E9E5F5,#E2EEE8); }
.base { position: absolute; left: 280px; top: 868px; width: 1360px; height: 30px; border-radius: 0 0 26px 26px; background: #2A3550; }
.win { position: absolute; border-radius: 14px; background: #FBF8F2; box-shadow: 0 18px 40px rgba(20,33,61,.18); overflow: hidden; border: 2px solid #14213D; }
.win .bar { height: 42px; background: #14213D; color: #F7EDD6; font: 18px 'JBM'; padding: 10px 16px; letter-spacing: .06em; }
.win .bar i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 7px; background: #E8553F; vertical-align: middle; }
.win .bar i + i { background: #FFD23F; } .win .bar i + i + i { background: #2EE6A6; }
.win .in { padding: 22px; font: 600 26px 'Bricolage'; }
.cursor { position: absolute; width: 46px; height: 46px; }
/* 1960s silent film */
.film { background: #0d0d0d; }
.inter { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; color: #EDE6D6; background: #111; }
.inter .frame { border: 4px double #EDE6D6; padding: 60px 120px; }
.inter .t1 { font: italic 400 96px 'FrauncesItalic'; } .inter .t2 { font: 28px 'JBM'; letter-spacing: .3em; margin-top: 18px; }
.filmimg { position: absolute; inset: -40px; background: url('assets/img/era60.jpg') center/cover; }
.vig { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.75) 100%); }
.flick { position: absolute; inset: 0; background: #fff; mix-blend-mode: overlay; }
.scratch { position: absolute; top: 0; width: 2px; height: 100%; background: rgba(255,255,255,.35); }
.capcard { position: absolute; left: 50%; bottom: 80px; transform: translateX(-50%); background: #111; color: #EDE6D6; border: 3px double #EDE6D6; padding: 22px 46px; font: italic 44px 'FrauncesItalic'; white-space: nowrap; }
/* 1980s CRT */
.crt { background: #0A120B; }
.crtimg { position: absolute; right: 120px; top: 190px; width: 640px; height: 480px; border-radius: 36px; background: url('assets/img/era80.jpg') center/cover; border: 16px solid #D9CBB0; box-shadow: 0 30px 60px rgba(0,0,0,.5); }
.term { position: absolute; left: 140px; top: 220px; width: 900px; font: 40px/1.6 'JBM'; color: #6BFF8E; text-shadow: 0 0 12px rgba(107,255,142,.7); }
.term div { white-space: nowrap; overflow: hidden; }
.scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 5px); pointer-events: none; }
.year80 { position: absolute; left: 140px; top: 110px; font: 30px 'JBM'; color: #6BFF8E; border: 2px solid #6BFF8E; padding: 8px 18px; }
/* late 90s retro OS */
.r90 { background: #2B8C8C; }
.rwin { position: absolute; background: #C3C3C3; border: 3px solid; border-color: #fff #404040 #404040 #fff; }
.rwin .rbar { height: 52px; background: linear-gradient(90deg,#0A246A,#3A6EA5); color: #fff; font: 700 30px 'Inter', sans-serif; padding: 8px 14px; }
.rwin .rin { padding: 22px 26px; font: 34px 'Inter', sans-serif; color: #000; }
.os { position: absolute; width: 420px; height: 260px; background: #fff; border: 2px inset #808080; padding: 12px; font: 700 30px 'Inter', sans-serif; }
.os .ln { height: 12px; background: #CFE3F2; margin: 10px 0; border-radius: 2px; }
.prog { height: 18px; border: 2px inset #808080; background: #fff; margin-top: 12px; }
.prog b { display: block; height: 100%; background: #0A246A; transform-origin: left; }
.task { position: absolute; left: 0; right: 0; bottom: 0; height: 52px; background: #C3C3C3; border-top: 3px solid #fff; font: 700 22px 'Inter', sans-serif; padding: 11px 20px; }
/* 2010s keynote */
.key { background: #07080B; color: #fff; }
.cloudimg { position: absolute; left: 50%; top: 50%; width: 1000px; height: 560px; margin: -210px 0 0 -500px; background: url('assets/img/cloud.jpg') center/cover; border-radius: 40px; }
.cloudfade { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 30%, #07080B 72%); }
.pill { position: absolute; padding: 18px 36px; border-radius: 999px; background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.35); font: 600 34px 'Bricolage'; color: #fff; backdrop-filter: blur(10px); }
.glass { position: absolute; border-radius: 24px; background: rgba(255,255,255,.08); border: 1.5px solid rgba(255,255,255,.3); padding: 28px 34px; color: #fff; }
.glass b { display: inline-grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: #fff; color: #07080B; font: 760 30px 'Bricolage'; margin-right: 18px; vertical-align: middle; }
.glass span { font: 600 34px 'Bricolage'; vertical-align: middle; }
.yr { position: absolute; right: 70px; top: 60px; font: 26px 'JBM'; letter-spacing: .14em; }
.tl { position: absolute; left: 160px; right: 160px; bottom: 54px; height: 4px; background: rgba(127,127,127,.35); }
.tl i { position: absolute; top: -7px; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%; background: #E8553F; }
.tl em { position: absolute; top: 16px; font: 20px 'JBM'; font-style: normal; transform: translateX(-50%); opacity: .8; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="%(TOTAL)s" data-width="1920" data-height="1080">
'''.replace('%(TOTAL)s', str(TOTAL))


def scene(sid, cls, inner):
    s = SC[sid]
    return '<div id="%s" class="clip scene %s" data-start="%s" data-duration="%s" data-track-index="1">%s</div>\n' % (
        sid, cls, s['start'], s['dur'], inner)


def tl(active, dark=False):
    years = ['1960', '1970s', '1990s', '2000s', '2010s']
    col = '#F7EDD6' if dark else '#14213D'
    s = '<div class="tl" style="background:%s55">' % col
    for i, y in enumerate(years):
        x = i * 25
        s += '<em style="left:%d%%;color:%s">%s</em>' % (x, col, y)
    s += '<i style="left:%d%%"></i></div>' % (active * 25)
    return s


cursor_svg = '<svg class="cursor" id="%s" viewBox="0 0 24 24"><path d="M4 2l15 10-6.5 1.5L16 21l-3 1.5-3.4-7.6L4 19z" fill="#14213D" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'

html += scene('intro', 'paper dots', '''
  <div class="laptop" id="lap"><div class="screen">
    <div class="win" id="w0" style="left:330px;top:150px;width:480px;height:300px"><div class="bar"><i></i><i></i><i></i> THIS COMPUTER</div><div class="in">1 machine<br/><span style="color:#E8553F">1 operating system</span></div></div>
  </div></div><div class="base" id="lapbase"></div>
  %s
  <div class="kicker" style="left:96px;top:70px">Cloud computing · Learning summary</div>
  <div class="h" id="introH" style="left:0;right:0;top:930px;text-align:center;font-size:84px">How can one computer be <span class="acc">many?</span></div>
''' % (cursor_svg % 'cur0'))

html += scene('how', 'paper dots', '''
  <div class="kicker" style="left:96px;top:70px">How it works</div>
  <div class="h" style="left:96px;top:190px;font-size:104px">A thin layer<br/>called a</div>
  <div class="hl" id="hl1" style="left:90px;top:420px;width:560px"></div>
  <div class="h acc" style="left:96px;top:400px;font-size:112px">hypervisor.</div>
  <div class="body" id="howB" style="left:96px;top:580px;width:680px">It sits between the <b>hardware</b> and the <b>operating systems</b>.</div>
  <svg id="stackSvg" viewBox="-360 -260 800 620" style="position:absolute;left:880px;top:180px;width:920px;height:720px;overflow:visible">
    <g id="bHW">%s</g><g id="bHV">%s</g>
  </svg>
''' % (stack, stack_hv))

html += scene('split', 'paper dots', '''
  <div class="kicker" style="left:96px;top:70px">One machine, many computers</div>
  <div class="h" style="left:96px;top:190px;font-size:104px">Each one acts like</div>
  <div class="h acc" style="left:96px;top:300px;font-size:104px">a whole computer.</div>
  <div class="body" style="left:96px;top:470px;width:640px">Several <b>virtual machines</b> share the same physical hardware.</div>
  <svg viewBox="-360 -260 800 620" style="position:absolute;left:880px;top:180px;width:920px;height:720px;overflow:visible">
    %s%s<g id="vms">%s</g>
  </svg>
''' % (stack, stack_hv, vm_bricks))

html += scene('e60', 'film', '''
  <div class="filmimg" id="fimg"></div><div class="vig"></div>
  <div class="scratch" id="sc1" style="left:31%%"></div><div class="scratch" id="sc2" style="left:74%%"></div>
  <div class="flick" id="flick"></div>
  <div class="capcard" id="cap60">IBM's CP-67: many users, one mainframe.</div>
  <div class="yr" style="color:#EDE6D6">1960s · ORIGINS</div>
  %s
  <div class="inter" id="inter"><div class="frame"><div class="t1">The Mainframe Era</div><div class="t2">CHAPTER I · THE 1960s</div></div></div>
''' % tl(0, True))

term = ['&gt; 1975_ PERSONAL COMPUTERS ARRIVE', '&gt; ONE PERSON. ONE MACHINE.', '&gt; SHARED MAINFRAMES: NOT NEEDED', '&gt; VIRTUALISATION.......IDLE']
html += scene('e80', 'crt', '''
  <div class="year80">1970s–80s · THE QUIET YEARS</div>
  <div class="term">%s</div><div class="crtimg" id="crtimg"></div><div class="scan"></div>
  %s
''' % (''.join('<div id="tm%d">%s</div>' % (i, s) for i, s in enumerate(term)), tl(1, True)))

oses = ''.join('<div class="os" id="os%d" style="left:%dpx;top:300px"><div style="color:%s">%s</div><div class="ln"></div><div class="ln" style="width:70%%"></div><div class="prog"><b id="pg%d"></b></div></div>' % (
    i, 70 + i * 480, c, n, i) for i, (c, n) in enumerate([('#0A246A', 'OS #1 · Windows'), ('#8a5a00', 'OS #2 · Linux'), ('#0b6b4f', 'OS #3 · Server')]))
html += scene('e90', 'r90', '''
  <div class="rwin" id="rw" style="left:200px;top:120px;width:1520px;height:760px">
    <div class="rbar">Virtual Machine Manager &mdash; 1999</div>
    <div class="rin">One ordinary x86 server, running three operating systems at once:</div>
    %s
    <div class="rin" id="r90t" style="position:absolute;left:0;top:620px;font-weight:700;font-size:40px">VMware brings virtualisation back to business.</div>
  </div>
  <div class="task"><span style="border:3px solid;border-color:#fff #404040 #404040 #fff;padding:2px 12px">Start</span> &nbsp; LATE 1990s · REVIVAL</div>
''' % oses)

html += scene('e00', 'paper dots', '''
  <div class="kicker" style="left:96px;top:70px">2000s · Mainstream</div>
  <div class="h" style="left:96px;top:190px;font-size:100px">Fewer servers.</div>
  <div class="h acc" style="left:96px;top:300px;font-size:100px">Same work.</div>
  <div class="body" style="left:96px;top:440px;width:620px">Data centres were full of half-idle machines. Virtualisation consolidated them.</div>
  <div class="h" id="cnt" style="left:96px;top:640px;font-size:150px">10 <span class="acc">&rarr;</span> <span id="cntTo">10</span></div>
  <div class="body" style="left:96px;top:810px;font-size:30px">less power · less space · faster to deploy</div>
  <svg viewBox="-420 -260 900 700" style="position:absolute;left:820px;top:140px;width:1020px;height:800px;overflow:visible">
    <g id="srvs">%s</g><g id="bigs">%s</g>
  </svg>
  %s
''' % (servers, big, tl(3)))

html += scene('e10', 'key', '''
  <div class="cloudimg" id="cimg"></div><div class="cloudfade"></div>
  <div class="yr" style="color:#fff;opacity:.7">2010s · CLOUD ERA</div>
  <div class="h" id="cloudH" style="left:0;right:0;top:90px;text-align:center;font-size:150px;color:#fff">The cloud.</div>
  <div class="body" id="cloudB" style="left:0;right:0;top:250px;text-align:center;color:#c9d1dc">built on virtualisation</div>
  <div class="pill" id="p0" style="left:520px;top:905px">AWS</div>
  <div class="pill" id="p1" style="left:800px;top:905px">Microsoft Azure</div>
  <div class="pill" id="p2" style="left:1200px;top:905px">Google Cloud</div>
  %s
''' % tl(4, True))

html += scene('check', 'key', '''
  <div class="yr" style="color:#fff;opacity:.7">KNOWLEDGE CHECK</div>
  <div class="h" style="left:0;right:0;top:130px;text-align:center;font-size:96px;color:#fff">What does a hypervisor do?</div>
  <div class="glass" id="q0" style="left:220px;top:380px;width:1480px"><b>A</b><span>Makes the internet faster</span></div>
  <div class="glass" id="q1" style="left:220px;top:530px;width:1480px"><b>B</b><span>Shares one physical machine between many virtual ones</span></div>
  <div class="glass" id="q2" style="left:220px;top:680px;width:1480px"><b>C</b><span>Stores your files online</span></div>
  <div class="body" id="pausing" style="left:0;right:0;top:880px;text-align:center;color:#FFD23F;font-family:JBM;font-size:30px">PAUSE THE VIDEO AND PICK</div>
''')

wins = ''.join('<div class="win mw" id="mw%d" style="left:%dpx;top:%dpx;width:250px;height:150px"><div class="bar" style="font-size:14px;height:32px;padding:7px 12px"><i></i><i></i><i></i> VM %d</div></div>' % (
    i, 60 + (i % 4) * 268, 40 + (i // 4) * 200, i + 1) for i in range(12))
html += scene('outro', 'paper dots', '''
  <div class="laptop"><div class="screen">%s</div></div><div class="base"></div>
  <div class="h" id="endH" style="left:0;right:0;top:930px;text-align:center;font-size:76px">One machine. <span class="acc">Many computers.</span></div>
  <div class="kicker" id="credit" style="left:96px;top:70px">Learning summary · Anvith M Acharya</div>
''' % wins)

# audio
for k, st, L in vos:
    html += '<audio id="a_%s" class="clip" src="vo/%s.wav" data-start="%s" data-duration="%s" data-volume="1" data-track-index="5"></audio>\n' % (k, k, st, L)
for s in timeline[1:]:
    html += '<audio id="wh_%s" class="clip" src="assets/audio/whoosh.mp3" data-start="%s" data-duration="0.57" data-volume="0.35" data-track-index="6"></audio>\n' % (s['id'], round(s['start'] - 0.15, 3))
ck = SC['check']
html += '<audio id="ok" class="clip" src="assets/audio/success.mp3" data-start="%s" data-duration="1.38" data-volume="0.5" data-track-index="7"></audio>\n' % round(ck['start'] + ck['marks']['c2'] - 0.2, 3)
html += '<audio id="clk" class="clip" src="assets/audio/click.mp3" data-start="%s" data-duration="0.36" data-volume="0.7" data-track-index="7"></audio>\n' % round(SC['intro']['start'] + 3.0, 3)
html += '<audio id="music" class="clip" src="assets/audio/music-tech-corporate.mp3" data-start="0" data-duration="%s" data-volume="0.09" data-fade-in="1.2" data-fade-out="2.5" data-track-index="8"></audio>\n' % TOTAL

html += '''</div>
<script>
const SC = %(SC)s;
const tl = gsap.timeline({ paused: true });
const S = (id) => SC[id].start, M = (id, k) => SC[id].start + SC[id].marks[k];
const blurIn = (sel, t, d = .6) => tl.fromTo(sel, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: d, ease: 'expo.out' }, t);
const rise = (sel, t, d = .6) => tl.fromTo(sel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: d, ease: 'expo.out' }, t);
// scene entrances: a soft push so every cut lands with motion
Object.keys(SC).forEach((id) => tl.fromTo('#' + id + ' > *:first-child', { scale: 1.04 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, S(id)));

// INTRO: desktop, cursor clicks the window, question lands
rise('#lap', S('intro') + .1, .9); rise('#lapbase', S('intro') + .1, .9);
tl.fromTo('#w0', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .7, ease: 'back.out(1.6)' }, S('intro') + .8);
tl.fromTo('#cur0', { x: 1500, y: 900 }, { x: 980, y: 520, duration: 1.1, ease: 'power3.out' }, S('intro') + 1.6);
tl.to('#cur0', { scale: .8, duration: .08, yoyo: true, repeat: 1 }, S('intro') + 3.0);
tl.to('#w0', { scale: 1.06, duration: .15, yoyo: true, repeat: 1 }, S('intro') + 3.0);
blurIn('#introH', M('intro', 'v0') + .2);

// HOW: hardware brick drops, hypervisor snaps on
blurIn('#how .h', S('how') + .2); tl.fromTo('#hl1', { scaleX: 0 }, { scaleX: 1, duration: .4, ease: 'power3.out' }, S('how') + 1.0); rise('#howB', S('how') + 1.4);
tl.fromTo('#bHW', { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'bounce.out' }, S('how') + .5);
tl.fromTo('#bHV', { y: -320, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'bounce.out' }, M('how', 'v1') + 2.2);

// SPLIT: three VM bricks snap on top
blurIn('#split .h', S('split') + .2); rise('#split .body', S('split') + 1.0);
['#vm0', '#vm1', '#vm2'].forEach((v, i) => tl.fromTo(v, { y: -300, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'bounce.out' }, M('split', 'v2') + 1.4 + i * .45));

// 1960s: intertitle, then flickering film with scratches
tl.to('#inter', { opacity: 0, duration: .25 }, S('e60') + 2.0);
tl.fromTo('#fimg', { scale: 1.12 }, { scale: 1.0, duration: SC.e60.dur, ease: 'none' }, S('e60'));
tl.fromTo('#flick', { opacity: 0 }, { opacity: .08, duration: .06, yoyo: true, repeat: Math.floor(SC.e60.dur / .12), ease: 'none' }, S('e60'));
tl.fromTo('#sc1', { x: -40 }, { x: 60, duration: SC.e60.dur, ease: 'none' }, S('e60')); tl.fromTo('#sc2', { x: 30 }, { x: -50, duration: SC.e60.dur, ease: 'none' }, S('e60'));
tl.fromTo('#cap60', { opacity: 0 }, { opacity: 1, duration: .3 }, S('e60') + 2.6);

// 1980s: terminal lines type out
for (let i = 0; i < 4; i++) tl.fromTo('#tm' + i, { width: 0 }, { width: 900, duration: .9, ease: 'steps(28)' }, S('e80') + .6 + i * 1.6);
rise('#crtimg', S('e80') + .3, .8);

// late 90s: retro window opens, three OS boot
tl.fromTo('#rw', { scale: .2, opacity: 0, transformOrigin: '50%% 100%%' }, { scale: 1, opacity: 1, duration: .45, ease: 'power2.out' }, S('e90') + .2);
for (let i = 0; i < 3; i++) { tl.fromTo('#os' + i, { opacity: 0 }, { opacity: 1, duration: .05 }, S('e90') + 1.0 + i * .7); tl.fromTo('#pg' + i, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'steps(12)' }, S('e90') + 1.1 + i * .7); }
tl.fromTo('#r90t', { opacity: 0 }, { opacity: 1, duration: .05 }, S('e90') + 3.6);

// 2000s: ten servers collapse into two hosts full of VMs
blurIn('#e00 .h', S('e00') + .2); rise('#e00 .body', S('e00') + 1.0);
tl.fromTo('.srv', { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'bounce.out' }, S('e00') + .4);
tl.to('.srv', { scale: .2, opacity: 0, transformOrigin: '50%% 50%%', duration: .5, stagger: .05, ease: 'power3.in' }, M('e00', 'v6') + 4.2);
tl.fromTo('.bigsrv', { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .2, ease: 'bounce.out' }, M('e00', 'v6') + 4.9);
tl.fromTo('.bvm', { scale: 0, transformOrigin: '50%% 50%%' }, { scale: 1, duration: .4, stagger: .07, ease: 'back.out(2)' }, M('e00', 'v6') + 5.8);
tl.fromTo('#cnt', { opacity: 0 }, { opacity: 1, duration: .3 }, M('e00', 'v6') + 4.0);
const n = { v: 10 }; tl.to(n, { v: 2, duration: 1, ease: 'power2.out', onUpdate: () => { document.getElementById('cntTo').textContent = Math.round(n.v); } }, M('e00', 'v6') + 4.4);

// 2010s keynote: cloud glows up, title, providers
tl.fromTo('#cimg', { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, S('e10') + .2);
blurIn('#cloudH', S('e10') + .6, .8); rise('#cloudB', S('e10') + 1.2);
['#p0', '#p1', '#p2'].forEach((p, i) => rise(p, M('e10', 'v7') + 3.8 + i * .3));

// CHECK: options, pause prompt, reveal B
['#q0', '#q1', '#q2'].forEach((q, i) => rise(q, S('check') + .6 + i * .2));
tl.fromTo('#pausing', { opacity: 0 }, { opacity: 1, duration: .3, yoyo: true, repeat: 5 }, S('check') + SC.check.marks.pause);
tl.to('#q1', { background: 'rgba(46,230,166,.28)', borderColor: '#2EE6A6', scale: 1.03, duration: .4 }, M('check', 'c2') - .2);
tl.to(['#q0', '#q2'], { opacity: .35, duration: .4 }, M('check', 'c2') - .2);

// OUTRO: one window becomes twelve
tl.fromTo('.mw', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, stagger: .08, ease: 'back.out(1.7)' }, S('outro') + .3);
blurIn('#endH', M('outro', 'e1') + .3); rise('#credit', M('outro', 'e1') + 1.2);

tl.set({}, {}, %(TOTAL)s);
window.__timelines['main'] = tl;
tl.seek(0);
</script>
</body>
</html>
''' % {'SC': D(SC), 'TOTAL': TOTAL}

open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(html)
json.dump({'total': TOTAL, 'scenes': timeline, 'vo': vos}, open(os.path.join(HERE, 'timing.json'), 'w'), indent=1)
print('total', TOTAL)
for s in timeline:
    print(s['id'], s['start'], s['dur'])
