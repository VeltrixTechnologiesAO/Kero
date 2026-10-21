const ICONS = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  recycle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5l4.1 1.1"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  servings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
};

// Imagens do destaque. A moldura adapta-se ao formato da 1.ª imagem
// (ver fitFrameToImage), por isso nenhuma é cortada.
const HERO_SLIDES = [
  { src: '/static/assets/image_logo.png',   alt: 'Kero Angola' },
  { src: '/static/assets/image_compra.png', alt: 'Compras na Kero Angola' },
];

export default {
  title: 'Kero Angola — Preços baixos todos os dias',

  render() {
    const provas = [
      { icon: 'leaf', titulo: 'Frescos todos os dias', desc: 'Fruta, legumes, talho e padaria' },
      { icon: 'tag', titulo: 'Preços baixos garantidos', desc: 'Poupança em tudo o que precisa' },
      { icon: 'pin', titulo: '12 lojas em Angola', desc: 'De Cabinda ao Namibe' },
      { icon: 'award', titulo: 'Ao seu lado desde 2010', desc: 'Mais de 16 anos em Angola' },
    ];

    const atalhos = [
      { rota: '#/ofertas', icon: 'news', titulo: 'Folhetos', desc: 'Ofertas por loja' },
      { rota: '#/receitas', icon: 'chef', titulo: 'Receitas', desc: 'Ideias para a família' },
      { rota: '#/lojas', icon: 'map', titulo: 'Lojas', desc: 'Localizador nacional' },
      { rota: '#/sobre', icon: 'building', titulo: 'Quem somos', desc: 'A nossa história' },
    ];

    const compromissos = [
      { icon: 'tag', titulo: 'Preços baixos', desc: 'Trabalhamos todos os dias para lhe oferecer o melhor preço em cada produto.' },
      { icon: 'leaf', titulo: 'Frescura garantida', desc: 'Produtos frescos selecionados diariamente nas nossas lojas.' },
      { icon: 'users', titulo: 'Comunidade', desc: 'Apoiamos produtores locais e criamos emprego em Angola.' },
      { icon: 'recycle', titulo: 'Sustentabilidade', desc: 'Reduzimos desperdício e apostamos em embalagens mais responsáveis.' },
    ];

    return `
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <span class="badge badge-light">Kero Angola</span>
            <h1>Poupe tempo,<br>poupe dinheiro.</h1>
            <p>12 lojas em Angola com preços baixos todos os dias. Consulte o folheto da sua loja e descubra as ofertas da semana.</p>
            <div class="hero-actions">
              <a href="#/ofertas" class="btn btn-primary">Ver folhetos</a>
              <a href="#/lojas" class="btn btn-ghost btn-ghost-light">Encontrar loja</a>
            </div>

            <ul class="hero-stats" aria-hidden="true">
              <li><strong>12</strong><span>lojas em Angola</span></li>
              <li><strong>+16</strong><span>anos a servir</span></li>
              <li><strong>1000+</strong><span>colaboradores</span></li>
            </ul>
          </div>

          <div class="hero-stage">
            <div class="hero-frame" data-slider role="group" aria-roledescription="carrossel" aria-label="Destaques">
              ${HERO_SLIDES.map((s, i) => `
                <figure class="hero-slide${i === 0 ? ' is-active' : ''}" aria-hidden="${i === 0 ? 'false' : 'true'}">
                  <img class="media-box-bg" src="${s.src}" alt="" aria-hidden="true" decoding="async" />
                  <img class="media-box-img" src="${s.src}" alt="${s.alt}" decoding="async"${i === 0 ? ' fetchpriority="high"' : ''} />
                </figure>
              `).join('')}
            </div>

            ${HERO_SLIDES.length > 1 ? `
              <div class="hero-dots" role="group" aria-label="Escolher destaque">
                ${HERO_SLIDES.map((_, i) => `
                  <button type="button"${i === 0 ? ' class="is-active" aria-current="true"' : ''} aria-label="Destaque ${i + 1}"></button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </section>

      <section class="trust-bar">
        <div class="container trust-row">
          ${provas.map((p) => `
            <div class="trust-item">
              <span class="trust-icon icon" aria-hidden="true">${ICONS[p.icon]}</span>
              <div>
                <strong>${p.titulo}</strong>
                <span>${p.desc}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="shortcuts">
        <div class="container">
          <div class="shortcuts-row">
            ${atalhos.map((a) => `
              <a href="${a.rota}" class="shortcut">
                <span class="shortcut-icon icon" aria-hidden="true">${ICONS[a.icon]}</span>
                <span class="shortcut-title">${a.titulo}</span>
                <span class="shortcut-desc">${a.desc}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="badge">Folhetos</span>
              <h2>Ofertas ativas nas lojas</h2>
              <p class="section-sub">Consulte o folheto da sua loja e aproveite antes que termine.</p>
            </div>
            <a href="#/ofertas" class="link-more">Ver todas ${ICONS.arrowRight}</a>
          </div>

          <div id="flyers-list" class="grid grid-3">
            <div class="section-loading" data-state="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container">
          <div class="section-head section-head-center">
            <div>
              <span class="badge">Compromissos</span>
              <h2>Porquê escolher a Kero</h2>
              <p class="section-sub">Trabalhamos todos os dias para lhe oferecer mais valor em cada visita.</p>
            </div>
          </div>

          <div class="grid grid-4">
            ${compromissos.map((c) => `
              <article class="value-card">
                <span class="value-icon icon" aria-hidden="true">${ICONS[c.icon]}</span>
                <h3>${c.titulo}</h3>
                <p>${c.desc}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="badge">Receitas</span>
              <h2>Ideias para a sua cozinha</h2>
              <p class="section-sub">Receitas tradicionais angolanas com ingredientes frescos da Kero.</p>
            </div>
            <a href="#/receitas" class="link-more">Ver todas ${ICONS.arrowRight}</a>
          </div>

          <div id="recipes-list" class="grid grid-3">
            <div class="section-loading" data-state="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container about-grid">
          <div class="about-copy">
            <span class="badge">Quem somos</span>
            <h2>Desde 2010 a poupar para Angola</h2>
            <p>Desde a abertura da nossa primeira loja em Luanda em 2010, abrimos 12 lojas em Angola, oferecendo-lhe consistentemente poupanças em tudo o que precisa.</p>
            <p>Hoje somos parte do dia-a-dia de milhares de famílias angolanas, com uma missão simples: <strong>poupar todos os dias, para todos.</strong></p>
            <a href="#/sobre" class="btn btn-primary">Conhecer a nossa história</a>
          </div>

          <div class="about-visual" aria-hidden="true">
            <div class="stat"><strong>12</strong><span>lojas em Angola</span></div>
            <div class="stat"><strong>2010</strong><span>primeira loja em Luanda</span></div>
            <div class="stat"><strong>+20</strong><span>anos de história</span></div>
            <div class="stat"><strong>1000+</strong><span>colaboradores</span></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="store-finder">
            <div class="store-finder-copy">
              <span class="badge badge-light">Localizador</span>
              <h2>Encontre a loja Kero mais próxima</h2>
              <p>Morada, horário, contactos e folheto de todas as lojas em Angola. A sua poupança está sempre por perto.</p>
              <a href="#/lojas" class="btn btn-yellow">Abrir localizador</a>
            </div>
            <div class="store-finder-visual" aria-hidden="true">
              <span class="icon">${ICONS.pin}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container atendimento">
          <div class="atendimento-copy">
            <span class="badge">Atendimento</span>
            <h2>Precisa de ajuda?</h2>
            <p>A nossa equipa está disponível para responder a todas as suas questões.</p>
          </div>

          <div class="atendimento-actions">
            <a href="tel:+244942355747" class="contact-card">
              <span class="contact-icon icon" aria-hidden="true">${ICONS.phone}</span>
              <div>
                <strong>+244 94 235 5747</strong>
                <span>Segunda a sábado, 8h — 18h</span>
              </div>
            </a>
            <a href="#/contacto" class="contact-card">
              <span class="contact-icon icon" aria-hidden="true">${ICONS.mail}</span>
              <div>
                <strong>Formulário de contacto</strong>
                <span>Respondemos em 24 horas</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
  },

  mount() {
    const sliderCleanup = this._mountSlider();
    const flyersCleanup = this._mountFlyers();
    const recipesCleanup = this._mountRecipes();

    return () => {
      sliderCleanup();
      if (flyersCleanup) flyersCleanup();
      if (recipesCleanup) recipesCleanup();
    };
  },

  _mountSlider() {
    const frame = document.querySelector('[data-slider]');
    if (!frame) return () => {};

    const slides = Array.from(frame.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dots button'));
    const total = slides.length;
    const INTERVAL = 5500;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    watchImages(frame);
    fitFrameToImage(frame, frame.querySelector('.media-box-img'));

    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + total) % total;

      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (total < 2 || reduceMotion) return;
      timer = setInterval(() => show(current + 1), INTERVAL);
    };

    const goTo = (index) => {
      show(index);
      start();
    };

    const dotHandlers = dots.map((dot, i) => {
      const handler = () => goTo(i);
      dot.addEventListener('click', handler);
      return [dot, handler];
    });

    // Pausa só com rato (em toque, o "hover" emulado pararia o carrossel para sempre)
    const onEnter = (e) => { if (e.pointerType === 'mouse') stop(); };
    const onLeave = (e) => { if (e.pointerType === 'mouse') start(); };

    // Deslizar o dedo para mudar de destaque
    let startX = null;
    const onDown = (e) => { startX = e.clientX; };
    const onUp = (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    };
    const onCancel = () => { startX = null; };

    const onVisibility = () => (document.hidden ? stop() : start());

    frame.addEventListener('pointerenter', onEnter);
    frame.addEventListener('pointerleave', onLeave);
    frame.addEventListener('pointerdown', onDown);
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onCancel);
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      dotHandlers.forEach(([el, fn]) => el.removeEventListener('click', fn));
      frame.removeEventListener('pointerenter', onEnter);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  },

  _mountFlyers() {
    const container = document.getElementById('flyers-list');
    if (!container) return null;

    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch('/api/flyers', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderFlyers(container, data.items || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[home] flyers:', err);
        renderEmpty(container, 'Não foi possível carregar os folhetos.');
      }
    };

    load();
    return () => controller.abort();
  },

  _mountRecipes() {
    const container = document.getElementById('recipes-list');
    if (!container) return null;

    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch('/api/recipes', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderRecipes(container, (data.items || []).slice(0, 3));
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[home] recipes:', err);
        renderEmpty(container, 'Não foi possível carregar as receitas.');
      }
    };

    load();
    return () => controller.abort();
  },
};

function renderEmpty(container, message) {
  container.innerHTML = `
    <div class="section-empty">
      <span class="section-empty-icon icon">${ICONS.inbox}</span>
      <p>${message}</p>
    </div>
  `;
}

// Imagem completa: a principal (contain) + cópia desfocada a preencher a moldura.
function mediaImages(src, alt) {
  const url = escapeHtml(src);
  return `
    <img class="media-box-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="media-box-img" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
  `;
}

// Se uma imagem falhar, mostra um fundo neutro em vez do ícone de imagem partida.
function watchImages(root) {
  root.querySelectorAll('img.media-box-img').forEach((img) => {
    const markBroken = () => img.parentElement?.classList.add('is-broken');
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markBroken();
    else img.addEventListener('error', markBroken, { once: true });
  });
}

// A moldura do hero passa a ter o formato real da imagem (limitado a 1.2–2.4),
// por isso a imagem ocupa-a toda, sem cortes e sem espaço vazio.
function fitFrameToImage(frame, img) {
  if (!frame || !img) return;

  const apply = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = Math.min(2.4, Math.max(1.2, img.naturalWidth / img.naturalHeight));
    frame.style.setProperty('--ratio', ratio.toFixed(4));
  };

  if (img.complete) apply();
  else img.addEventListener('load', apply, { once: true });
}

function renderFlyers(container, flyers) {
  if (!flyers.length) {
    renderEmpty(container, 'Sem folhetos ativos neste momento. Volte em breve.');
    return;
  }

  container.innerHTML = flyers.slice(0, 3).map((f) => `
    <article class="flyer-card">
      <div class="flyer-thumb media-box">
        ${mediaImages(f.thumbnail_url, `Folheto ${f.store.name}`)}
        <span class="flyer-status">Ativo</span>
      </div>

      <div class="flyer-body">
        <h3>${escapeHtml(f.store.name)}</h3>
        <span class="flyer-region">${escapeHtml(f.store.region)}</span>

        <div class="flyer-dates">
          <span class="flyer-dates-icon icon">${ICONS.calendar}</span>
          <div>
            <span class="flyer-dates-label">Válido</span>
            <span class="flyer-dates-range">
              ${formatDate(f.valid_from)} — ${formatDate(f.valid_until)}
            </span>
          </div>
        </div>

        <span class="flyer-days-left">
          ${f.days_remaining <= 0
            ? 'Termina hoje'
            : `${f.days_remaining} ${f.days_remaining === 1 ? 'dia restante' : 'dias restantes'}`}
        </span>

        <a href="#/ofertas" class="btn btn-ghost">Ver folheto</a>
      </div>
    </article>
  `).join('');

  watchImages(container);
}

function renderRecipes(container, recipes) {
  if (!recipes.length) {
    renderEmpty(container, 'Sem receitas publicadas neste momento.');
    return;
  }

  container.innerHTML = recipes.map((r) => `
    <article class="recipe-card">
      <div class="recipe-thumb media-box">
        ${mediaImages(r.thumbnail_url, r.title)}
      </div>
      <div class="recipe-body">
        ${r.category ? `<span class="recipe-category">${escapeHtml(r.category)}</span>` : ''}
        <h3>${escapeHtml(r.title)}</h3>

        <ul class="recipe-meta">
          <li><span class="icon">${ICONS.clock}</span> ${r.prep_time_minutes} min</li>
          <li><span class="icon">${ICONS.servings}</span> ${escapeHtml(r.servings)}</li>
        </ul>

        <p class="recipe-desc">${escapeHtml(r.description)}</p>
        <a href="#/receitas/${encodeURIComponent(r.slug)}" class="link-more">Ver receita ${ICONS.arrowRight}</a>
      </div>
    </article>
  `).join('');

  watchImages(container);
}

function formatDate(iso) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[ch]);
}
