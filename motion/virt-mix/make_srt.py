"""Build virtualisation-summary.srt from timing.json (written by build.py) and the voiceover scripts in vo/."""
import json, os, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))


def ts(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return ('%02d:%02d:%06.3f' % (h, m, s)).replace('.', ',')


timing = json.load(open(os.path.join(HERE, 'timing.json')))
out, n = [], 1
for k, st, dur in timing['vo']:
    txt = open(os.path.join(HERE, 'vo', k + '.txt'), encoding='utf-8').read().strip()
    txt = txt.replace('I B M', 'IBM').replace('C P sixty seven', 'CP-67').replace('VM ware', 'VMware').replace('A W S', 'AWS') \
             .replace('nineteen sixties', '1960s').replace('two thousands', '2000s').replace('twenty tens', '2010s')
    parts, cur = [], ''
    for s in txt.replace('? ', '?|').replace('. ', '.|').split('|'):
        if len(cur) + len(s) + 1 <= 84:
            cur = (cur + ' ' + s).strip()
        else:
            parts.append(cur)
            cur = s
    parts.append(cur)
    total, t = sum(len(p) for p in parts), st
    for p in parts:
        seg = dur * len(p) / total
        out.append('%d\n%s --> %s\n%s\n' % (n, ts(t), ts(t + seg), '\n'.join(textwrap.wrap(p, 42))))
        n, t = n + 1, t + seg
open(os.path.join(HERE, 'virtualisation-summary.srt'), 'w', encoding='utf-8').write('\n'.join(out))
print(n - 1, 'captions')
