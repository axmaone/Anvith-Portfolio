import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s) as NodeListOf<T>);

let lenis: Lenis | null = null;
const scrollToEl = (el: HTMLElement) => (lenis ? lenis.scrollTo(el, { offset: -20 }) : el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }));

export function initMotion() {
  setupCompanion();
  setupCardVideos();
  setupCopy();
  setupThread();
  setupEggs();
  if (reduced()) return;

  // Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  const l = new Lenis({ lerp: 0.11 });
  lenis = l;
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$<HTMLAnchorElement>('a[href*="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.hash; if (!id || a.pathname !== location.pathname) return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault(); l.scrollTo(el as HTMLElement, { offset: -20 });
  }));

  heroIn();
  splitReveal();
  batchReveal();
  parallax();
  counters();
  timeline();
  poems();
}

function heroIn() {
  const lines = $$('.hero__line > span');
  if (!lines.length) return;
  const delay = document.documentElement.classList.contains('intro-on') ? 2.75 : 0.15;
  const tl = gsap.timeline({ delay, defaults: { ease: 'expo.out' } });
  tl.from(lines, { yPercent: 110, rotate: 4, duration: 1.3, stagger: 0.09 })
    .from('.hero__me', { y: 120, rotate: 14, opacity: 0, duration: 1.4 }, 0.15)
    .from('.hero__tag', { scale: 0, rotate: -30, duration: 0.9, ease: 'back.out(2)' }, 0.8)
    .from('[data-hero-in]', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.5)
    .from('.hero__stamp', { scale: 0, duration: 0.8, ease: 'back.out(2)' }, 0.9);
}

function splitReveal() {
  $$('[data-split]').forEach((el) => {
    const words = (el.textContent ?? '').trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent?.trim() ?? '');
    el.innerHTML = words.map((w) => `<span class="split-line" aria-hidden="true" style="display:inline-block"><span>${w}</span></span>`).join(' ');
    gsap.from($$('.split-line > span', el), {
      yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.025,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

function batchReveal() {
  const show = (els: Element[]) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true });
  // onLeave/onEnterBack cover jumps straight past a section (e.g. opening /#contact)
  ScrollTrigger.batch('[data-reveal]', { start: 'top 88%', onEnter: show, onLeave: show, onEnterBack: show });
}

function parallax() {
  $$('[data-parallax]').forEach((el) => {
    const k = parseFloat(el.dataset.parallax ?? '0');
    gsap.to(el, { yPercent: k * 100, ease: 'none', scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function counters() {
  $$('[data-count]').forEach((el) => {
    const raw = el.dataset.count ?? '';
    const n = parseInt(raw, 10); const suffix = raw.replace(/^\d+/, '');
    if (Number.isNaN(n)) return;
    const o = { v: 0 };
    gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
  });
}

function timeline() {
  const line = document.querySelector<HTMLElement>('.timeline__line > span');
  if (!line) return;
  gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
}

function icadSteps() {
  $$('.icad__step').forEach((step) => {
    ScrollTrigger.create({ trigger: step, start: 'top 65%', end: 'bottom 45%', toggleClass: 'is-active' });
  });
}

function poems() {
  $$('.poem').forEach((p) => {
    gsap.from($$('[data-line]', p), { x: -30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: p, start: 'top 80%' } });
  });
}

/* ── Pull the thread ── */
function setupThread() {
  const box = document.querySelector<HTMLElement>('[data-thread]');
  if (!box) return;
  const knob = box.querySelector<HTMLElement>('.thread__knob')!;
  const path = box.querySelector<SVGPathElement>('.thread__line')!;
  const target = document.getElementById(box.dataset.thread ?? '');
  const REST = 160;
  const set = (y: number, sway = 0) => {
    knob.style.top = `${y}px`;
    path.setAttribute('d', `M30 0 Q${30 + sway} ${y * 0.6} 30 ${y}`);
  };
  const snap = () => {
    const o = { y: parseFloat(knob.style.top) || REST };
    gsap.to(o, { y: REST + 120, duration: 0.25, ease: 'power2.in', onUpdate: () => set(o.y), onComplete: () => {
      if (target) scrollToEl(target);
      gsap.to(o, { y: REST, duration: 1.2, ease: 'elastic.out(1, 0.3)', delay: 0.3, onUpdate: () => set(o.y) });
    } });
  };
  let startY = 0, dy = 0, dragging = false, moved = false;
  knob.addEventListener('pointerdown', (e) => { dragging = true; moved = false; startY = e.clientY; knob.setPointerCapture(e.pointerId); });
  knob.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dy = Math.max(0, Math.min(160, e.clientY - startY)); if (dy > 4) moved = true;
    set(REST + dy, Math.sin(dy / 20) * 6);
  });
  const release = () => {
    if (!dragging) return; dragging = false;
    if (dy > 60 || !moved) { snap(); }
    else { const o = { y: REST + dy }; gsap.to(o, { y: REST, duration: 1, ease: 'elastic.out(1, 0.3)', onUpdate: () => set(o.y) }); }
    dy = 0;
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  knob.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); snap(); } });
  // pointerup already handles mouse/touch clicks; block the synthetic click
  knob.addEventListener('click', (e) => e.preventDefault());
}

/* ── Easter eggs ── */
function setupEggs() {
  const eggs = $$<HTMLButtonElement>('[data-egg]');
  if (!eggs.length) return;
  let found: string[] = [];
  try { found = JSON.parse(sessionStorage.getItem('eggs') ?? '[]'); } catch {}
  const mark = () => eggs.forEach((e) => e.classList.toggle('is-found', found.includes(e.dataset.egg!)));
  mark();
  const find = (e: HTMLElement) => {
    const id = e.dataset.egg!;
    if (found.includes(id)) return;
    found.push(id);
    try { sessionStorage.setItem('eggs', JSON.stringify(found)); } catch {}
    mark();
    say(found.length === eggs.length
      ? `All ${eggs.length} easter eggs found! You clearly pay attention. Mention "easter egg" when you email me.`
      : `${e.dataset.found} (${found.length}/${eggs.length} found)`);
  };
  eggs.forEach((e) => {
    let t = 0;
    e.addEventListener('mouseenter', () => { t = window.setTimeout(() => find(e), 450); });
    e.addEventListener('mouseleave', () => clearTimeout(t));
    e.addEventListener('focus', () => find(e));
    // touch: tap opens the translation, a second tap (or a tap anywhere else) closes it
    e.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const box = e.parentElement!, open = !box.classList.contains('is-open');
      eggs.forEach((o) => o.parentElement?.classList.remove('is-open'));
      box.classList.toggle('is-open', open);
      if (!open) e.blur();
      find(e);
    });
  });
  document.addEventListener('click', () => eggs.forEach((o) => o.parentElement?.classList.remove('is-open')));
}

let say: (text: string, ms?: number) => void = () => {};

/* ── The talking sticker ── */
function setupCompanion() {
  const box = document.getElementById('companion');
  const bubble = document.getElementById('companion-bubble');
  // phones: no pop-up bubbles over what people are reading
  if (!box || !bubble || matchMedia('(max-width: 760px), (hover: none)').matches) return;
  const lines: Record<string, string> = JSON.parse(box.dataset.lines ?? '{}');
  const introOn = document.documentElement.classList.contains('intro-on');
  setTimeout(() => box.classList.add('is-on'), introOn ? 3600 : 900);

  let current = '', hideT = 0, quiet = false;
  // speak: show the bubble, tilt like talking, then go quiet after a few seconds
  say = (text: string, ms = 5200) => {
    box.classList.add('is-on', 'is-talking'); box.classList.remove('is-peek', 'is-mute');
    bubble.textContent = text;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    clearTimeout(hideT);
    hideT = window.setTimeout(() => { box.classList.remove('is-talking'); box.classList.add('is-mute'); if (quiet) box.classList.add('is-peek'); }, ms);
  };
  // tap the face to hear the current line again
  box.querySelector('button')?.addEventListener('click', () => say(lines[current] ?? bubble.textContent ?? ''));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const key = el.dataset.companion ?? '';
      if (key === current || !lines[key]) return;
      current = key;
      // quiet zones (games, reading): say the line briefly, then tuck away to the edge
      quiet = el.hasAttribute('data-quiet');
      say(lines[key], quiet ? 2600 : 5200);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  $$('[data-companion]').forEach((s) => io.observe(s));
}

function setupCardVideos() {
  const cards = $$<HTMLAnchorElement>('.card').filter((c) => c.querySelector('video'));
  const play = (c: HTMLElement) => { const v = c.querySelector('video')!; v.play().then(() => c.classList.add('is-playing')).catch(() => {}); };
  const stop = (c: HTMLElement) => { c.querySelector('video')!.pause(); c.classList.remove('is-playing'); };
  // previews play only when a mouse asks for them; on phones nothing starts by itself (it reads like an ad)
  if (reduced() || !matchMedia('(hover: hover)').matches) return;
  cards.forEach((c) => { c.addEventListener('mouseenter', () => play(c)); c.addEventListener('mouseleave', () => stop(c)); c.addEventListener('focus', () => play(c)); c.addEventListener('blur', () => stop(c)); });
}

function setupCopy() {
  $$<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy ?? ''); b.textContent = 'Copied ✓'; }
    catch { b.textContent = 'Press Ctrl+C'; }
    setTimeout(() => (b.textContent = 'Copy email'), 2000);
  }));
}
