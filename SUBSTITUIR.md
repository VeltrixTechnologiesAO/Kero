# Kero — o que ainda tens de trocar

Cores: `static/css/base.css` (`--kero-green`, `--kero-green-dark`, `--kero-yellow`) e `static/admin/admin.css` (`--brand-*`).
Para mudar o tom de verde basta alterar estas variáveis (o resto do CSS usa-as; alguns gradientes de página têm hex #00873A/#006229/#004A1F — pesquisa e substitui).

## Imagens (static/assets) — ainda são da Shoprite
logo.png, image_logo.png, image_*.png (heros), mercado_cartao_kero.png, lovies_*, talho_*, etc.

## Dados a confirmar
- Telefone, WhatsApp, Facebook e Instagram (`kero_angola` é um palpite) em `templates/index.html` e `static/js/pages/contacto.js`
- Email `geral@kero.co.ao` (palpite)
- Textos "25+ lojas", "desde 2003", "+20 anos", "1000+ colaboradores", história em `sobre.js`
- `seed.py`: lojas, moradas e emails de exemplo são da Shoprite
- Termos e Privacidade: marcadores `[RAZÃO SOCIAL DA KERO]`, `[MORADA…]`, `[EMAIL DE PRIVACIDADE…]` — precisam de revisão jurídica
- Páginas específicas da Shoprite (Lovies, Mercado Monetário/Money Market, Sixty60, Money Transfer): adaptar ou remover
- `.env`: `DATABASE_URL` agora aponta para a base `kero`; muda a SECRET_KEY e a password
