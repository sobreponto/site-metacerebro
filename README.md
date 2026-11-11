# MetaCérebro — Site institucional

Site estático (HTML + CSS + JavaScript puro), sem build e sem dependências.
Implementado a partir do Figma "MetaCérebro Site" (frame `início`, 1167px).

## Como abrir
- Dê dois cliques em `index.html`, ou
- rode um servidor local: `python3 -m http.server 8000` e acesse http://localhost:8000

## Estrutura
```
index.html          páginas e conteúdo (todas as seções)
css/styles.css      estilos (tokens de cor/fonte no topo, medidas do Figma)
js/script.js        menu mobile, slider, animações, formulário
assets/fonts/       Nunito, Gabarito e Plus Jakarta Sans (hospedadas aqui)
assets/img/         fotos (WebP) e logos (PNG)
assets/icons/       ícones de redes sociais
_source/            imagens originais exportadas do Figma (não precisam subir)
```

## Pontos para ajustar antes de publicar
1. **Formulário**: sem back-end, ele abre o e-mail do visitante já preenchido (`mailto:`).
   Para envio direto, troque o trecho marcado em `js/script.js` por um `fetch()` para o seu serviço de formulários.
2. **Links de redes sociais**: usei `facebook.com/metacerebro`, `instagram.com/metacerebro` e
   `linkedin.com/company/metacerebro`. Confirme os endereços reais em `index.html`.
3. **WhatsApp**: o link usa o número do design (+55 11 98781-0349).
4. **Ícones**: os ícones dos cards de Resultados, as setas do slider e os checks vêm do Lucide
   (embutidos no topo do `index.html`). Os 3 ícones de redes sociais vêm do Figma, pois o Lucide não tem logos de marcas.
