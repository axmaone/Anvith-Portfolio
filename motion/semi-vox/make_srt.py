"""Build semiconductor-summary.srt from the voiceover clips and where they sit in the SUMMARY comp."""
import os, textwrap, wave

W = os.path.dirname(os.path.abspath(__file__))
STARTS = {'a0': 0.8, 'a1': 6.7, 'b1': 14.0, 'b2': 21.0, 'b3': 28.0, 'b4': 35.0, 'b5': 42.0, 'b6': 49.0,
          'c1': 56.1, 'c2': 62.6, 'd1': 68.3}


def dur(k):
    w = wave.open(os.path.join(W, 'vo2', k + '.wav'))
    return w.getnframes() / w.getframerate()


def ts(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return ('%02d:%02d:%06.3f' % (h, m, s)).replace('.', ',')


out, n = [], 1
for k, st in STARTS.items():
    txt = open(os.path.join(W, 'vo2', k + '.txt'), encoding='utf-8').read().strip().replace('U V', 'UV')
    parts, cur = [], ''
    for s in txt.replace('? ', '?|').replace('. ', '.|').split('|'):  # sentence chunks, max two 42-char lines
        if len(cur) + len(s) + 1 <= 84:
            cur = (cur + ' ' + s).strip()
        else:
            parts.append(cur)
            cur = s
    parts.append(cur)
    d, total, t = dur(k), sum(len(p) for p in parts), st
    for p in parts:
        seg = d * len(p) / total
        out.append('%d\n%s --> %s\n%s\n' % (n, ts(t), ts(t + seg), '\n'.join(textwrap.wrap(p, 42))))
        n, t = n + 1, t + seg
open(os.path.join(W, 'semiconductor-summary.srt'), 'w', encoding='utf-8').write('\n'.join(out))
print(n - 1, 'captions')
