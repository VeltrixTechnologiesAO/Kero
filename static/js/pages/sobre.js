const ICONS = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  recycle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5l4.1 1.1"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_logo.png';
const HERO_FALLBACK = '/static/assets/logo.png';

export default {
  title: 'Quem somos — Kero Angola',

  render() {
    const valores = [
      {
        icon: 'tag',
        titulo: 'Preços baixos',
        desc: 'Trabalhamos todos os dias para lhe oferecer o melhor preço em cada produto, sem comprometer a qualidade.',
      },
      {
        icon: 'leaf',
        titulo: 'Frescura garantida',
        desc: 'Produtos frescos selecionados diariamente nas nossas lojas, do campo à sua mesa.',
      },
      {
        icon: 'users',
        titulo: 'Comunidade',
        desc: 'Apoiamos produtores locais e criamos emprego em Angola desde 2010.',
      },
      {
        icon: 'recycle',
        titulo: 'Sustentabilidade',
        desc: 'Reduzimos desperdício e apostamos em embalagens mais responsáveis.',
      },
      {
        icon: 'heart',
        titulo: 'Família no centro',
        desc: 'Pensamos em cada família angolana e no que precisa para o dia-a-dia.',
      },
      {
        icon: 'award',
        titulo: 'Qualidade',
        desc: 'Selecionamos rigorosamente cada produto para lhe dar a melhor experiência.',
      },
    ];

    const marcos = [
      { ano: '2010', titulo: 'Primeira loja', desc: 'Abrimos a nossa primeira loja em Luanda, com uma promessa: poupar todos os dias.' },
      { ano: '2010', titulo: 'Expansão nacional', desc: 'Começámos a abrir lojas em várias províncias, levando a Kero a mais famílias.' },
      { ano: '2020', titulo: '12 lojas em Angola', desc: 'Celebrámos 12 lojas em todo o país, tornando-nos referência em retalho alimentar.' },
      { ano: 'Hoje', titulo: 'Um futuro com todos', desc: 'Continuamos a investir em Angola, nos nossos colaboradores e nos nossos clientes.' },
    ];

    return `
      <section class="page-hero page-hero-about">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Quem somos</span>
            <h1>Ao seu lado desde 2010</h1>
            <p>Desde a abertura da nossa primeira loja em Luanda, abrimos 12 lojas em Angola, oferecendo-lhe consistentemente poupanças em tudo o que precisa.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="about-stats-bar">
        <div class="container">
          <div class="about-stats-grid">
            <div class="about-stat">
              <strong>12</strong>
              <span>Lojas em Angola</span>
            </div>
            <div class="about-stat">
              <strong>2010</strong>
              <span>Ano de fundação</span>
            </div>
            <div class="about-stat">
              <strong>+16</strong>
              <span>Anos de história</span>
            </div>
            <div class="about-stat">
              <strong>1000+</strong>
              <span>Colaboradores</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section about-intro">
        <div class="container">
          <div class="about-intro-grid">
            <div class="about-intro-copy">
              <span class="badge">A nossa história</span>
              <h2>Poupar todos os dias, para todos.</h2>
              <p>Nascemos em 2010 com a abertura da nossa primeira loja em Luanda. Desde então, o nosso compromisso tem sido simples: oferecer produtos de qualidade a preços acessíveis a todas as famílias angolanas.</p>
              <p>Hoje somos parte do dia-a-dia de milhares de clientes em todo o país. Mais de 12 lojas, milhares de produtos, mas uma só missão: <strong>a sua poupança.</strong></p>

              <div class="about-mission">
                <span class="about-mission-icon icon">${ICONS.target}</span>
                <div>
                  <strong>A nossa missão</strong>
                  <p>Poupar tempo e dinheiro aos angolanos, todos os dias, com qualidade e proximidade.</p>
                </div>
              </div>
            </div>

            <div class="about-intro-visual" aria-hidden="true">
              <div class="about-intro-card">
                <span class="icon">${ICONS.building}</span>
                <strong>12</strong>
                <span>lojas em Angola</span>
              </div>
              <div class="about-intro-card about-intro-card-accent">
                <span class="icon">${ICONS.award}</span>
                <strong>+16</strong>
                <span>anos a servir</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-alt about-timeline-section">
        <div class="container">
          <div class="section-head section-head-center">
            <div>
              <span class="badge">Marcos</span>
              <h2>Uma história com 16 anos</h2>
              <p class="section-sub">Os momentos que marcaram a nossa presença em Angola.</p>
            </div>
          </div>

          <ol class="about-timeline">
            ${marcos.map((m) => `
              <li class="about-timeline-item">
                <span class="about-timeline-year">${escapeHtml(m.ano)}</span>
                <div class="about-timeline-body">
                  <h3>${escapeHtml(m.titulo)}</h3>
                  <p>${escapeHtml(m.desc)}</p>
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head section-head-center">
            <div>
              <span class="badge">Compromissos</span>
              <h2>No que acreditamos</h2>
              <p class="section-sub">Os valores que guiam cada decisão e cada gesto dentro das nossas lojas.</p>
            </div>
          </div>

          <div class="about-values-grid">
            ${valores.map((v) => `
              <article class="about-value-card">
                <span class="about-value-icon icon">${ICONS[v.icon]}</span>
                <h3>${escapeHtml(v.titulo)}</h3>
                <p>${escapeHtml(v.desc)}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="about-cta">
            <div class="about-cta-copy">
              <span class="badge badge-light">Visite-nos</span>
              <h2>A sua loja Kero mais próxima</h2>
              <p>Estamos presentes em várias províncias de Angola. Encontre a loja mais próxima e venha conhecer-nos.</p>
              <div class="about-cta-actions">
                <a href="#/lojas" class="btn btn-yellow">
                  Encontrar loja
                  <span class="icon">${ICONS.arrowRight}</span>
                </a>
                <a href="#/ofertas" class="btn btn-ghost btn-ghost-light">Ver folhetos</a>
              </div>
            </div>
            <div class="about-cta-visual" aria-hidden="true">
              <span class="icon">${ICONS.pin}</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  mount() {
    return setupHeroMedia(document.querySelector('[data-hero-media]'));
  },
};

// Hero: a moldura passa a ter o formato real da imagem (limitado a 1.2–2.4).
// Se a imagem não existir, usa a alternativa uma única vez.
function setupHeroMedia(box) {
  if (!box) return () => {};

  const main = box.querySelector('.media-box-img');
  const bg = box.querySelector('.media-box-bg');
  if (!main) return () => {};

  const applyRatio = () => {
    if (!main.naturalWidth || !main.naturalHeight) return;
    const ratio = Math.min(2.4, Math.max(1.2, main.naturalWidth / main.naturalHeight));
    box.style.setProperty('--ratio', ratio.toFixed(4));
  };

  let usedFallback = false;
  const onError = () => {
    if (usedFallback) {
      box.classList.add('is-broken');
      return;
    }
    usedFallback = true;
    main.src = HERO_FALLBACK;
    if (bg) bg.src = HERO_FALLBACK;
  };

  main.addEventListener('load', applyRatio);
  main.addEventListener('error', onError);
  if (main.complete) applyRatio();

  return () => {
    main.removeEventListener('load', applyRatio);
    main.removeEventListener('error', onError);
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}
