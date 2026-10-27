# Conta Comigo v2.6.0 — Material de publicação nas lojas (S35)

Este diretório reúne tudo o que é necessário para publicar a extensão na
Chrome Web Store e no Firefox Add-ons (AMO).

## 1. Arquivos prontos

| Arquivo | Uso |
|---|---|
| `listagem-lojas.md` | Títulos, descrições e textos de listagem (copiar e colar) |
| `politica-de-privacidade.md` | Política de privacidade (hospedar em URL pública ou anexar) |
| `capturas/captura-1..6.png` | Capturas de tela 1440×900 para a listagem |

## 2. Checklist antes do envio

1. **Pacotes separados por navegador** (obrigatório no MV3):
   - **Chrome Web Store**: use o zip `conta-comigo-chrome-2.6.0.zip` (background
     declarado apenas como `service_worker` — o Chrome rejeita
     `background.scripts`, que é exclusivo do Firefox);
   - **Firefox Add-ons (AMO)**: use o zip `conta-comigo-firefox-2.6.0.zip`
     (background declarado como `scripts`, event page, + id gecko).
   - Em ambos, o `manifest.json` fica na raiz do ZIP e as pastas
     `demo.html`, `web/` e `loja/` ficam de fora do pacote de instalação.
2. **Chrome Web Store** (<https://chrome.google.com/webstore/devconsole>):
   - Categoria: *Education*;
   - Idioma principal: português (Brasil); descrições em inglês e espanhol opcionais;
   - Campo "Permission justification": `storage` — usado apenas para salvar o
     progresso no próprio navegador, sem servidores;
   - Como a extensão altera a nova aba (S33), descreva isso na listagem e
     explique como desligar o desafio rápido;
   - Distribuição: pública ou oculta por link.
3. **Firefox Add-ons** (<https://addons.mozilla.org/developers/>):
   - Enviar o zip `conta-comigo-firefox-2.6.0.zip` ("Carregar uma nova versão");
   - Notas de revisão destacando o id `conta-comigo@klivfy.com`;
   - A nova aba pode ser revertida pelo usuário nas configurações de início do Firefox;
   - O background é uma event page (`background.scripts`) do MV3, estável a partir
     do Firefox 121; o pacote declara **Firefox 128+ (ESR)** como mínimo
     (desktop e Android) e a declaração `data_collection_permissions: none`;
   - Passo a passo completo, textos e anúncios do Firefox:
     `firefox-amo/LEIAME-envio-firefox.md`.
4. **Revisão de conteúdo infantil**: nenhum dado é coletado, não há publicidade,
   compras ou links externos dentro do jogo.
5. **Contas de desenvolvedor**: taxas únicas/diárias das lojas são de
   responsabilidade do publicador.

## 3. Textos-resumo

- **Nome (≤45 caracteres):** Conta Comigo — Matemática para Crianças
- **Resumo (≤132):** 12 modos lúdicos de matemática para crianças de 4 anos+,
  com narração em 3 idiomas, funcionando 100% offline.
- **Categoria:** Educação
- **Idiomas:** português (Brasil), inglês, espanhol
