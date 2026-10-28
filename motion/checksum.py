"""Print errors/warnings from the newest HyperFrames check report in the given project dir."""
import glob, json, os, sys
proj = sys.argv[1]
f = max(glob.glob(os.path.join(proj, '.hyperframes', 'artifacts', 'checks', '*.json')), key=os.path.getmtime)
d = json.load(open(f, encoding='utf-8'))
def walk(o):
    if isinstance(o, dict):
        if o.get('severity') in ('error', 'warning'):
            print(o['severity'], o.get('rule') or o.get('code'), '|', (o.get('message') or '')[:150])
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(d)
print('ok:', d.get('ok'))
