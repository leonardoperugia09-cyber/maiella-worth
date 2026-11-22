document.documentElement.classList.add('js');

/* Fit the wordmark to the width between the margins */
const wm = document.querySelector('.wordmark [aria-hidden]');
wm.innerHTML = [...wm.textContent].map((ch, i) => ch === ' ' ? ' ' : `<span class="wm-l" style="--i:${i}">${ch}</span>`).join('');
function fit() {
  if (matchMedia('(max-width: 680px)').matches) { wm.parentElement.style.fontSize = ''; return; }
  const box = wm.parentElement; box.style.fontSize = '';
  const avail = box.clientWidth, w = wm.getBoundingClientRect().width;
  box.style.fontSize = (parseFloat(getComputedStyle(box).fontSize) * avail / w * 0.995) + 'px';
}
document.fonts.ready.then(fit); addEventListener('resize', fit);

/* Menu tabs */
const tabs = [...document.querySelectorAll('[role="tab"]')];
function select(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t));
  t.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    const n = tabs[(i + k + tabs.length) % tabs.length];
    select(n); n.focus();
  });
});

/* Arrosticini counter: £1.75 a skewer, eight at least */
const PRICE = 1.75, MIN = 8, MAX = 40;
let n = 12;
const out = document.getElementById('count');
const total = document.getElementById('total');
const svg = document.getElementById('bundle');
const minus = document.querySelector('.step[data-d="-1"]');
const plus = document.querySelector('.step[data-d="1"]');
function draw() {
  out.textContent = n;
  total.textContent = '£' + (n * PRICE).toFixed(2);
  minus.disabled = n <= MIN; plus.disabled = n >= MAX;
  const per = 20, gap = 220 / per;
  let s = '';
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / per), col = i % per;
    const x = gap / 2 + col * gap, top = 6 + row * 2;
    s += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + 100}"/>`;
    for (let c = 0; c < 4; c++) s += `<rect x="${x - 3.2}" y="${top + 6 + c * 12 + row * 4}" width="6.4" height="9" rx="1.5"/>`;
  }
  svg.innerHTML = s;
}
document.querySelectorAll('.step').forEach(b => b.addEventListener('click', () => {
  n = Math.min(MAX, Math.max(MIN, n + +b.dataset.d)); draw();
}));
draw();

/* Open now, in London time */
(function () {
  const el = document.getElementById('open-now');
  const now = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  const hrs = d === 0 ? [11, 21] : d >= 1 && d <= 4 ? [17, 22] : [11, 23];
  const open = h >= hrs[0] && h < hrs[1];
  const fmt = x => x > 12 ? (x - 12) + 'pm' : x + (x === 12 ? 'pm' : 'am');
  el.textContent = open ? `Open now until ${fmt(hrs[1])}. Dine in or take away.` : `Closed right now. Dine in or take away from ${fmt(hrs[0])}${h < hrs[0] ? ' today' : ''}.`;
})();

/* Entrances: heading, then text, then picture */
const groups = document.querySelectorAll('.intro, .menu, .skewers-text, .week .head, .row, .made-note, .card, .foot-side');
groups.forEach(g => {
  const parts = g.matches('.week .head') ? [g] : [...g.querySelectorAll(':scope > *, .menu-body > *')].filter(el => !el.classList.contains('menu-body'));
  parts.forEach((p, i) => { p.classList.add('rise'); p.style.setProperty('--d', i * 80 + 'ms'); });
});
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rise').forEach(el => io.observe(el));

/* Screenshot mode: ?shot=<id> shows everything and scrolls to that section */
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  document.querySelectorAll('.rise').forEach(el => el.classList.add('in'));
  document.documentElement.style.scrollBehavior = 'auto';
  addEventListener('load', () => { const t = document.getElementById(shot); if (t) t.scrollIntoView(); });
}
