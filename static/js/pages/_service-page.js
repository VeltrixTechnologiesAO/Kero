const ICONS = {
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
};

export function createServicePage(config) {
  const {
    title,
    h1,
    hero,
    heroImage = '/static/assets/image_logo.png',
    intro,
    features = [],
    ctaTitle,
    ctaText,
  } = config;

  return {
    title,

    render() {
      return `
        <section class="page-hero page-hero-service">
          <div class="page-hero-bg">
            <img src="${heroImage}"
                 onerror="this.src='/static/assets/logo.png'"
                 alt="" aria-hidden="true" />
          </div>
          <div class="container page-hero-inner">
            <div class="page-hero-copy">
              <span class="badge badge-light">Serviço Kero</span>
              <h1>${escapeHtml(h1)}</h1>
              <p>${escapeHtml(hero)}</p>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="service-intro">
              <span class="badge">O que oferecemos</span>
              <h2>${escapeHtml(h1)} na sua Kero</h2>
              <p>${escapeHtml(intro)}</p>
            </div>

            ${features.length ? `
              <div class="service-features">
                ${features.map((f) => `
                  <article class="service-feature">
                    <span class="service-feature-icon icon">${ICONS.check}</span>
                    <div>
                      <h3>${escapeHtml(f.titulo)}</h3>
                      <p>${escapeHtml(f.desc)}</p>
                    </div>
                  </article>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="service-cta">
              <div class="service-cta-copy">
                <span class="badge badge-light">Visite-nos</span>
                <h2>${escapeHtml(ctaTitle)}</h2>
                <p>${escapeHtml(ctaText)}</p>
                <div class="service-cta-actions">
                  <a href="#/lojas" class="btn btn-yellow">
                    Encontrar loja
                    <span class="icon">${ICONS.arrowRight}</span>
                  </a>
                  <a href="#/ofertas" class="btn btn-ghost btn-ghost-light">Ver folhetos</a>
                </div>
              </div>
              <div class="service-cta-visual" aria-hidden="true">
                <span class="icon">${ICONS.pin}</span>
              </div>
            </div>
          </div>
        </section>
      `;
    },
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}
