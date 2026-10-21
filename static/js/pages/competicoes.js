const ICONS = {
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_competicao.png';
const HERO_FALLBACK = '/static/assets/image_competition.png';

export default {
  title: 'Competições — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-competitions">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Competições</span>
            <h1>Grandes prémios, grandes momentos</h1>
            <p>Como o maior supermercado da África, trazemos-lhe os preços mais baixos e as <strong>maiores concorrências</strong>! Adoramos recompensar os nossos clientes fiéis com prémios incríveis. Fique atento à próxima competição.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="competitions-toolbar">
            <div>
              <span class="badge">Histórico</span>
              <h2>Competições Kero Angola</h2>
              <p class="section-sub">Fique atento — novas competições são anunciadas regularmente.</p>
            </div>
          </div>

          <div id="competitions-grid" class="competitions-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  mount() {
    const grid = document.getElementById('competitions-grid');
    if (!grid) return null;

    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));
    const controller = new AbortController();

    grid.addEventListener('error', onImgError, true);

    (async () => {
      try {
        const res = await fetch('/api/competitions', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderCompetitions(grid, data.items || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[competicoes]', err);
        grid.innerHTML = '<p class="competitions-empty">Não foi possível carregar as competições.</p>';
      }
    })();

    return () => {
      controller.abort();
      stopHero();
      grid.removeEventListener('error', onImgError, true);
    };
  },
};

function renderCompetitions(container, competitions) {
  if (!competitions.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <h3>Sem competições publicadas</h3>
        <p>Volte em breve — estamos a preparar novidades.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = competitions.map((c) => {
    const status = c.is_active
      ? { label: 'A decorrer', class: 'is-active' }
      : { label: 'Concurso encerrado', class: 'is-closed' };

    return `
      <article class="competition-card ${c.is_featured ? 'is-featured' : ''}">
        <div class="competition-media media-box">
          ${mediaImages(c.thumbnail_url, c.title)}

          <span class="competition-status ${status.class}">
            ${status.label}
          </span>

          ${c.is_featured ? `
            <span class="competition-featured-badge">${ICONS.trophy} Destaque</span>
          ` : ''}
        </div>

        <div class="competition-body">
          ${c.category ? `<span class="competition-category">${escapeHtml(c.category)}</span>` : ''}
          <h3>${escapeHtml(c.title)}</h3>
          <p class="competition-desc">${escapeHtml(c.description)}</p>

          <div class="competition-dates">
            <span class="competition-dates-icon icon">${ICONS.calendar}</span>
            <div>
              <span class="competition-dates-label">${c.is_closed ? 'Encerrado' : 'Termina'}</span>
              <span class="competition-dates-range">${formatDate(c.valid_until)}</span>
            </div>
          </div>
        </div>

        <footer class="competition-foot">
          ${c.has_winners ? `
            <a href="${escapeAttr(c.winners_url)}"
               target="_blank" rel="noopener"
               class="competition-btn">
              <span class="icon">${ICONS.award}</span>
              <span>Ver vencedores</span>
            </a>
          ` : `
            <span class="competition-foot-note">
              <span class="icon">${ICONS.gift}</span>
              Vencedores anunciados em breve
            </span>
          `}
        </footer>
      </article>
    `;
  }).join('');
}

// Imagem completa: a principal (contain) + cópia desfocada a preencher a moldura.
function mediaImages(src, alt) {
  const url = escapeHtml(src);
  return `
    <img class="media-box-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="media-box-img" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
  `;
}

// Os erros de imagem não "sobem" no DOM, por isso ouvimos na fase de captura.
function onImgError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.closest('.media-box')?.classList.add('is-broken');
}

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

function formatDate(iso) {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}
