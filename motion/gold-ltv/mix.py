"""Original score (synthesized marimba / shaker / bass / glockenspiel) + foley from events.json → out/mix.wav."""
import json, os, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ['LIB']
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, noise, lp, hp, bp, norm, click, whoosh, thump, step, ding, pop, brown, add, limit  # noqa: E402

ev = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8'))
DUR = ev['dur']; EV = ev['ev']
N = int(DUR * SR) + SR
music = np.zeros((N, 2)); fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
BPM = 96; B = 60 / BPM; BAR = 4 * B
rng = np.random.default_rng(7)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def marimba(m, v=1.0, d=1.2):
    tt = t_(d); f = hz(m)
    x = np.sin(2*np.pi*f*tt)*env_exp(d, .45) + .35*np.sin(2*np.pi*f*4*tt)*env_exp(d, .06) + .12*np.sin(2*np.pi*f*9.9*tt)*env_exp(d, .015)
    x[:96] *= np.linspace(0, 1, 96); return x * v
def glock(m, v=1.0, d=2.2):
    tt = t_(d); f = hz(m)
    x = np.sin(2*np.pi*f*tt)*env_exp(d, .9) + .3*np.sin(2*np.pi*f*2.76*tt)*env_exp(d, .25) + .15*np.sin(2*np.pi*f*5.4*tt)*env_exp(d, .08)
    x[:48] *= np.linspace(0, 1, 48); return x * v
def bass(m, v=1.0, d=.55):
    tt = t_(d); f = hz(m)
    x = np.sin(2*np.pi*f*tt) + .45*np.sin(2*np.pi*2*f*tt) + .2*np.sin(2*np.pi*3*f*tt)
    e = np.minimum(1, tt/.01) * np.exp(-tt/.35); return x * e * v
def shaker(v=1.0):
    d = .09; return hp(noise(d), 5000) * env_exp(d, .02) * v

# progression per bar (D major): D  Bm  G  A
PROG = [(50, [62, 66, 69]), (47, [59, 62, 66]), (43, [55, 59, 62]), (45, [57, 61, 64])]
MOTIF = [69, 71, 74]                     # subject motif: A4 B4 D5, three notes up
nbars = int(np.ceil(DUR / BAR))

def section(t):
    if t < 5: return 'intro'
    if t < 12.5: return 'scale'
    if t < 20: return 'rate'
    if t < 30: return 'cap'
    if t < 41: return 'counter'
    if t < 52.5: return 'dip'
    return 'reveal'

for bar in range(nbars):
    t0 = bar * BAR; root, chord = PROG[bar % 4]; sec = section(t0)
    for b8 in range(8):                       # eighth-note grid
        t = t0 + b8 * B / 2
        if t >= DUR - .3: break
        s = section(t)
        # marimba ostinato (arpeggio) — not in the dip, sparse in the intro
        if s in ('scale', 'rate', 'cap', 'counter', 'reveal') or (s == 'intro' and b8 % 4 == 0):
            note = chord[[0, 1, 2, 1, 0, 2, 1, 2][b8]] + (12 if s in ('rate', 'reveal') and b8 % 2 else 0)
            add(music, marimba(note, .22 if b8 % 2 else .3), t, 1, pan=-.25)
        # shaker on eighths from the scale on
        if s in ('scale', 'rate', 'cap', 'reveal'): add(music, shaker(.9 if b8 % 2 else .5), t, .5, pan=.35)
        # bass on beats 1 and 3 from the rate desk; pulse only in the dip
        if s in ('rate', 'cap', 'counter', 'reveal', 'dip') and b8 in (0, 4): add(music, bass(root - (12 if root > 48 else 0) + 12, .32), t, 1)
    if sec == 'dip':                          # low drone under the price dip
        tt = t_(BAR); add(music, (np.sin(2*np.pi*hz(38)*tt) + .3*np.sin(2*np.pi*hz(50)*tt)) * .06, t0, 1)

# subject motif: on the landing, when Priya's block lifts (glock), on the final chord
for i, m in enumerate(MOTIF): add(music, marimba(m, .55), 3.75 + i * B / 2, 1)
for i, m in enumerate(MOTIF): add(music, glock(m + 12, .35), 35.0 + i * B / 2, 1, pan=.2)
for m in [62, 66, 69, 74]: add(music, marimba(m, .5, 2.5), 58.75, 1)
for m in [74, 78, 81]: add(music, glock(m, .25, 2.8), 58.75, 1)

# low-pass the music during focus + context, and two real silences
def lp_section(a, b, f):
    s, e = int(a * SR), int(b * SR)
    for c in range(2): music[s:e, c] = lp(music[s:e, c], f, 2)
lp_section(35.6, 41.0, 900)
for a, d in [(25.0, .6), (47.0, .6)]:
    s, e = int(a * SR), int((a + d) * SR); music[s:e] = 0; amb[s:e] = 0

# ambience: soft room tone
room = lp(brown(DUR + 1), 600) * .02
amb[:len(room), 0] += room[:N]; amb[:len(room), 1] += np.roll(room, 2400)[:N]

# foley from the picture's events
def tick(): return click(2.2, 1) * .25
def coin(): d = .25; tt = t_(d); x = sum(a*np.sin(2*np.pi*f*tt)*env_exp(d, tau) for f, a, tau in [(3200, 1, .05), (4700, .6, .03), (6100, .4, .02)]); return norm(x) * .5
def tear(): d = .32; return norm(bp(noise(d), 1200, 5000) * (np.abs(np.sin(np.linspace(0, 38, int(d*SR)))) ** 3) * env_exp(d, .12)) * .6
def scratch(): d = .3; return norm(bp(noise(d), 2500, 6000) * env_exp(d, .2)) * .25
def jingle(): out = np.zeros(int(.5*SR))
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'land': add(fx, thump(.8, 85), t, .9)
    elif ty == 'jingle':
        for i in range(5): add(fx, coin() * .5, t + i * .035, .6, pan=-.2 + i * .1)
    elif ty == 'tick': add(fx, tick(), t, .8, pan=.3)
    elif ty == 'whoosh': add(fx, whoosh(.4, .6), t - .15, .7)
    elif ty == 'coin': add(fx, coin(), t, .7, pan=.25)
    elif ty == 'thud': add(fx, thump(1, 60), t, 1)
    elif ty == 'plate': add(fx, pop(.5), t, .6, pan=.4)
    elif ty == 'scratch': add(fx, scratch(), t, .8)
    elif ty == 'tear': add(fx, tear(), t, 1)
    elif ty == 'step': add(fx, step(.35), t, .6, pan=-.4)
    elif ty == 'pop': add(fx, pop(.6), t, .8)
    elif ty == 'servo':
        d = e.get('d', 3); tt = t_(d); f = 520 - 260 * tt / d
        add(fx, np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*tt/d) ** 2 * .12, t, 1)
    elif ty == 'ding': add(fx, ding(.7), t, .9)
    elif ty == 'bell': add(fx, glock([69, 71, 74, 76, 78][e['n']], .5), t, .8)
    elif ty == 'card': add(fx, click(1.4, 1) * .12, t, .6)

mix = music * .9 + fx + amb
for c in range(2): mix[:, c] = limit(mix[:, c], .55)
mix = mix[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR)
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
