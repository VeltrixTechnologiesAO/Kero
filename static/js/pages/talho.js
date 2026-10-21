const ICONS = {
  meat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3a6 6 0 0 0 0 12h6a6 6 0 0 0 0-12Z"/><path d="M12 9h6a6 6 0 0 1 0 12h-6"/><circle cx="6" cy="9" r="1"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  knife: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v7"/><path d="M14 11 4 21"/><path d="M14 4a6 6 0 0 1 6 6v1h-6V4z"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
};

const HERO_IMAGE = '/static/assets/image_talho.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';
const IMG_FALLBACK = '/static/assets/image_talho.png';

export default {
  title: 'Talho — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-talho">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Talho</span>
            <h1>No nosso supermercado temos carne de qualidade a bom preço</h1>
            <p>Quer se trate de bifes suculentos de grau A cortados grossamente para uma suculência extra, costeletas de porco tenras aparadas à mão até à perfeição ou saboroso borrego feito para assar — o que quer que goste, os nossos especialistas sabem melhor!</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="section talho-block">
        <div class="container">
          <div class="talho-block-head">
            <span class="badge">Especialidade</span>
            <h2>Cortes suculentos perfeitos para qualquer ocasião</h2>
            <p>Do churrasco de fim de semana ao jantar especial, temos o corte certo para cada momento. Cortado, limpo e preparado à mão pelos nossos especialistas.</p>
          </div>

          <div class="talho-image-h media-box">
            ${mediaImages('/static/assets/talho_cortes.png', 'Cortes suculentos', IMG_FALLBACK)}
          </div>
        </div>
      </section>

      <section class="section section-alt talho-triple">
        <div class="container">
          <div class="section-head section-head-center">
            <div>
              <span class="badge">Os nossos melhores</span>
              <h2>Uma seleção pensada para si</h2>
              <p class="section-sub">Três cortes que fazem a diferença à mesa.</p>
            </div>
          </div>

          <div class="talho-triple-grid">
            <article class="talho-triple-card">
              <div class="talho-triple-media media-box">
                ${mediaImages('/static/assets/talho_im1.png')}
              </div>
            </article>

            <article class="talho-triple-card">
              <div class="talho-triple-media media-box">
                ${mediaImages('/static/assets/talho_im2.png')}
              </div>
            </article>

            <article class="talho-triple-card">
              <div class="talho-triple-media media-box">
                ${mediaImages('/static/assets/talho_im3.png')}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section talho-cta-section">
        <div class="container">
          <div class="talho-cta">
            <div class="talho-cta-copy">
              <span class="badge badge-light">Visite-nos</span>
              <h2>Fale com o nosso talhante</h2>
              <p>A nossa equipa está disponível para o aconselhar sobre o melhor corte e a melhor forma de o preparar. Peça o corte à sua medida .</p>
              <div class="talho-cta-actions">
                <a href="#/lojas" class="btn btn-yellow">
                  Encontrar loja
                  <span class="icon">${ICONS.arrowRight}</span>
                </a>
                <a href="#/receitas" class="btn btn-ghost btn-ghost-light">Ver receitas</a>
              </div>
            </div>
            <div class="talho-cta-visual" aria-hidden="true">
              <span class="icon">${ICONS.knife}</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  mount() {
    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));
    document.addEventListener('error', onImgError, true);
    return () => {
      stopHero();
      document.removeEventListener('error', onImgError, true);
    };
  },
};

// Imagem completa: a principal (contain) + cópia desfocada a preencher a moldura.
// Opcionalmente aceita uma imagem de recurso caso a principal falhe.
function mediaImages(src, alt, fallback = '') {
  const url = escapeAttr(src);
  const fb = fallback ? ` data-fallback="${escapeAttr(fallback)}"` : '';
  return `
    <img class="media-box-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="media-box-img" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"${fb} />
  `;
}

// Os erros de imagem não "sobem" no DOM, por isso ouvimos na fase de captura.
// Se houver data-fallback, tenta uma vez; caso contrário mostra o estado neutro.
function onImgError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;

  const box = img.closest('.media-box');
  if (!box) return;

  const fallback = img.dataset.fallback;
  if (fallback && !img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = '1';
    img.src = fallback;
    const bg = box.querySelector('.media-box-bg');
    if (bg) bg.src = fallback;
    return;
  }

  box.classList.add('is-broken');
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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}
