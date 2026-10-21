const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_contact.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

export default {
  title: 'Contacte-nos — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-contact">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Contacte-nos</span>
            <h1>Estamos aqui para ajudar</h1>
            <p>Envie-nos a sua mensagem e responderemos o mais rápido possível. Também pode contactar-nos por telefone ou pelas redes sociais.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container contact-layout">
          <aside class="contact-sidebar">
            <h2>Canais diretos</h2>

            <a href="tel:+244942355747" class="contact-channel">
              <span class="contact-channel-icon icon">${ICONS.phone}</span>
              <div>
                <strong>+244 94 235 5747</strong>
                <span>Segunda a sábado, 8h — 18h</span>
              </div>
            </a>

            <a href="mailto:geral@kero.co.ao" class="contact-channel">
              <span class="contact-channel-icon icon">${ICONS.mail}</span>
              <div>
                <strong>geral@kero.co.ao</strong>
                <span>Resposta em 24 horas úteis</span>
              </div>
            </a>

            <div class="contact-socials">
              <a href="https://www.instagram.com/kero_angola" target="_blank" rel="noopener" class="social-btn social-instagram" aria-label="Instagram">
                <span class="icon">${ICONS.instagram}</span>
                <span>Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener" class="social-btn social-facebook" aria-label="Facebook">
                <span class="icon">${ICONS.facebook}</span>
                <span>Facebook</span>
              </a>
              <a href="mailto:geral@kero.co.ao" class="social-btn social-mail" aria-label="Email">
                <span class="icon">${ICONS.mail}</span>
                <span>Email</span>
              </a>
            </div>

            <div class="contact-note">
              <span class="icon">${ICONS.pin}</span>
              <p>Para assuntos relacionados com uma loja específica, selecione-a no formulário — a mensagem será encaminhada para o gerente responsável.</p>
            </div>
          </aside>

          <div class="contact-form-wrap">
            <div class="section-head">
              <div>
                <span class="badge">Formulário</span>
                <h2>Como podemos ajudar?</h2>
                <p class="section-sub">Preencha os campos abaixo. Todos os campos marcados com * são obrigatórios.</p>
              </div>
            </div>

            <form id="contact-form" class="contact-form" novalidate>
              <div class="form-row">
                <div class="form-field">
                  <label for="department">Área de contacto *</label>
                  <select id="department" name="department" required>
                    <option value="">Seleccione</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="message_type">Tipo de mensagem *</label>
                  <select id="message_type" name="message_type" required>
                    <option value="">Seleccione</option>
                  </select>
                </div>
              </div>

              <div class="form-field" id="department_other_wrap" hidden>
                <label for="department_other">Especifique a área *</label>
                <input id="department_other" name="department_other" type="text" maxlength="80" placeholder="Ex: Fornecedores, Imprensa…" />
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label for="first_name">Nome *</label>
                  <input id="first_name" name="first_name" type="text" required maxlength="80" autocomplete="given-name" />
                </div>

                <div class="form-field">
                  <label for="last_name">Apelido *</label>
                  <input id="last_name" name="last_name" type="text" required maxlength="80" autocomplete="family-name" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label for="email">Endereço de e-mail *</label>
                  <input id="email" name="email" type="email" required maxlength="160" autocomplete="email" />
                </div>

                <div class="form-field">
                  <label for="phone">Contacto telefónico *</label>
                  <input id="phone" name="phone" type="tel" required maxlength="40" autocomplete="tel" placeholder="+244 9XX XXX XXX" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label for="province">Província *</label>
                  <select id="province" name="province" required>
                    <option value="">Seleccione</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="store_id">Loja relevante</label>
                  <select id="store_id" name="store_id">
                    <option value="">Nenhuma em específico</option>
                  </select>
                </div>
              </div>

              <div class="form-field">
                <label for="subject">Assunto *</label>
                <input id="subject" name="subject" type="text" required maxlength="160" />
              </div>

              <div class="form-field">
                <label for="message">Mensagem *</label>
                <textarea id="message" name="message" rows="6" required maxlength="4000"></textarea>
              </div>

              <div class="form-privacy">
                <p>Sua privacidade é importante para nós. Por favor, não nos envie nenhuma informação que não tenhamos solicitado. Consulte a nossa declaração de privacidade de dados para obter mais informações. Ao enviar as suas informações, confirma que os detalhes fornecidos são verdadeiros e corretos e que tem autoridade para o fazer.</p>

                <label class="checkbox">
                  <input type="checkbox" id="privacy_accepted" name="privacy_accepted" required />
                  <span>Confirmo e entendo que as informações enviadas são necessárias para processar esta solicitação. *</span>
                </label>
              </div>

              <div id="form-feedback" class="form-feedback" hidden></div>

              <button type="submit" class="btn btn-primary btn-submit" id="form-submit">
                Enviar mensagem
              </button>
            </form>
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container careers">
          <div class="careers-copy">
            <span class="badge">Carreiras</span>
            <h2>Candidaturas a vagas</h2>
            <p>Para se candidatar a uma vaga na Kero, siga estas etapas simples:</p>

            <ol class="careers-steps">
              <li>
                <span class="careers-step-icon icon">${ICONS.pin}</span>
                <div>
                  <strong>Visite a loja Kero mais próxima</strong>
                  <span>Leve consigo o seu CV atualizado.</span>
                </div>
              </li>
              <li>
                <span class="careers-step-icon icon">${ICONS.file}</span>
                <div>
                  <strong>Enderece a sua carta de candidatura</strong>
                  <span>Ao gerente da loja, especificando a vaga e a loja desejadas.</span>
                </div>
              </li>
              <li>
                <span class="careers-step-icon icon">${ICONS.briefcase}</span>
                <div>
                  <strong>Entregue a candidatura na loja</strong>
                  <span>Será encaminhada para o departamento de Recursos Humanos.</span>
                </div>
              </li>
            </ol>

            <p class="careers-note">
              Se nenhum feedback for recebido dentro de um mês, a candidatura não foi bem-sucedida, mas o CV será mantido em arquivo para oportunidades futuras.
            </p>
          </div>

          <div class="careers-visual" aria-hidden="true">
            <span class="icon">${ICONS.briefcase}</span>
          </div>
        </div>
      </section>
    `;
  },

  async mount() {
    const form = document.getElementById('contact-form');
    if (!form) return null;

    const controller = new AbortController();
    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));

    const departmentSelect = document.getElementById('department');
    const departmentOtherWrap = document.getElementById('department_other_wrap');
    const departmentOtherInput = document.getElementById('department_other');

    const toggleDepartmentOther = () => {
      const isOther = departmentSelect.value.trim().toLowerCase() === 'outro';
      departmentOtherWrap.hidden = !isOther;
      departmentOtherInput.required = isOther;
      if (!isOther) departmentOtherInput.value = '';
    };

    departmentSelect.addEventListener('change', toggleDepartmentOther);

    try {
      const [optionsRes, storesRes] = await Promise.all([
        fetch('/api/contact/options', { signal: controller.signal }),
        fetch('/api/stores', { signal: controller.signal }),
      ]);

      if (!optionsRes.ok) throw new Error(`HTTP ${optionsRes.status} (options)`);
      if (!storesRes.ok) throw new Error(`HTTP ${storesRes.status} (stores)`);

      const options = await optionsRes.json();
      const stores = await storesRes.json();

      fillSelect('department', options.departments);
      fillSelect('message_type', options.message_types);
      fillSelect('province', options.provinces);
      fillStores('store_id', stores.items || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[contacto] options:', err);
        showFeedback('error', 'Não foi possível carregar as opções do formulário.');
      }
    }

    const onSubmit = async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'A enviar…';
      hideFeedback();

      const data = Object.fromEntries(new FormData(form).entries());

      delete data.department_other;
      data.privacy_accepted = form.privacy_accepted.checked;
      data.store_id = data.store_id ? Number(data.store_id) : null;

      if (departmentSelect.value.trim().toLowerCase() === 'outro') {
        const custom = departmentOtherInput.value.trim();
        if (custom) data.department = custom;
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!res.ok) {
          let detail = 'Não foi possível enviar. Verifique os dados e tente novamente.';
          try {
            const err = await res.json();
            if (typeof err.detail === 'string') {
              detail = err.detail;
            } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
              detail = err.detail[0].msg;
            }
          } catch (_) {}
          showFeedback('error', detail);
          return;
        }

        const payload = await res.json();
        showFeedback(
          'success',
          `${payload.message} Referência: ${payload.reference || '—'}`,
        );
        form.reset();
        toggleDepartmentOther();
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[contacto] submit:', err);
        showFeedback('error', 'Erro de rede. Tente novamente.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensagem';
      }
    };

    form.addEventListener('submit', onSubmit);

    return () => {
      controller.abort();
      stopHero();
      form.removeEventListener('submit', onSubmit);
      departmentSelect.removeEventListener('change', toggleDepartmentOther);
    };
  },
};

function fillSelect(id, values) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(values)) return;
  const first = el.querySelector('option');
  el.innerHTML = first.outerHTML + values.map((v) =>
    `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`
  ).join('');
}

function fillStores(id, stores) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(stores)) return;
  const first = el.querySelector('option');
  el.innerHTML = first.outerHTML + stores.map((s) =>
    `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.region)}</option>`
  ).join('');
}

function showFeedback(kind, message) {
  const box = document.getElementById('form-feedback');
  if (!box) return;
  box.hidden = false;
  box.className = `form-feedback is-${kind}`;
  const icon = kind === 'success' ? ICONS.check : ICONS.alert;
  box.innerHTML = `<span class="icon">${icon}</span><span>${escapeHtml(message)}</span>`;
}

function hideFeedback() {
  const box = document.getElementById('form-feedback');
  if (box) box.hidden = true;
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
