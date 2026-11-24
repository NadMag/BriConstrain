// BriConstrain project page: lazy viewers, explorer auto-height, BibTeX copy.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // embedded viewers load when they approach the viewport (each holds WebGL contexts)
  const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { const f = e.target, fr = $('iframe', f); fr.src = fr.dataset.src; fr.addEventListener('load', () => f.classList.add('loaded'), { once: true }); io.unobserve(f); } }, { rootMargin: '400px 0px' });
  $$('.frame').forEach(f => io.observe(f));
  // viewers render only while their frame is on screen (same-origin iframes are not throttled by the browser; off-screen WebGL made the method animation choppy)
  const onScr = new Map(), tell = fr => fr.contentWindow && fr.src && fr.contentWindow.postMessage({ vis: !!onScr.get(fr) }, '*');
  const vo = new IntersectionObserver(es => es.forEach(e => { const fr = $('iframe', e.target); onScr.set(fr, e.isIntersecting); tell(fr); }), { rootMargin: '100px 0px' });
  $$('.frame').forEach(f => { vo.observe(f); $('iframe', f).addEventListener('load', e => tell(e.target)); });
  // embedded viewers report their own height; the explorer is asked to fill ~90% of the screen (at least 700px)
  addEventListener('message', e => { if (!e.data || !e.data.h) return; for (const fr of $$('.frame iframe')) if (e.source === fr.contentWindow) fr.style.height = e.data.h + 'px'; });
  const ex = $('.frame-explore iframe'), askFit = () => { if (ex.contentWindow && ex.src) ex.contentWindow.postMessage({ fitH: Math.max(700, Math.round(innerHeight * 0.9)) }, '*'); };
  ex.addEventListener('load', () => { askFit(); setTimeout(askFit, 1500); }); addEventListener('resize', askFit);
  const cp = $('.copy'); cp.onclick = async () => { try { await navigator.clipboard.writeText($('.bib code').textContent); cp.textContent = 'Copied'; } catch (e) { cp.textContent = 'Select & copy'; } setTimeout(() => cp.textContent = 'Copy', 1600); };
})();
// section navigation (shown by themes that style .secnav): appears once the header is scrolled past; marks the section in view.
// Sections also get .in when they first scroll into view (themes may animate it).
(() => {
  const nav = document.querySelector('.secnav'), hero = document.querySelector('.hero'), secs = [...document.querySelectorAll('main>section[id]')];
  if (nav && hero) new IntersectionObserver(es => nav.classList.toggle('show', !es[0].isIntersecting), { rootMargin: '-40px 0px 0px 0px' }).observe(hero);
  const links = nav ? [...nav.querySelectorAll('div a')] : [];
  const vis = new Map();
  const io = new IntersectionObserver(es => {
    for (const e of es) vis.set(e.target.id, e.intersectionRatio);
    let best = null, br = 0; for (const s of secs) { const r = vis.get(s.id) || 0; if (r > br) { br = r; best = s.id; } }
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + best));
  }, { threshold: [0, .1, .25, .5, .75, 1] });
  secs.forEach(s => io.observe(s));
  // reveal: once a section's top is ~20% up into the screen (so the rise is seen, not done below the fold)
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { rootMargin: '0px 0px -20% 0px' });
  secs.forEach(s => rv.observe(s));
})();
