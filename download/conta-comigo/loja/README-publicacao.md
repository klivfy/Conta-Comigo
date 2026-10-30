# Conta Comigo v2.8.0 — Material de publicação nas lojas

Tudo o que é preciso para publicar nas 6 lojas, com **português (Brasil) como idioma padrão** e inglês e espanhol como traduções.

| Loja | Roteiro e textos (pt, en, es) | Pacote a enviar |
|---|---|---|
| Chrome Web Store | [`lojas/chrome-web-store.md`](lojas/chrome-web-store.md) | `download/conta-comigo-chrome-2.8.0.zip` |
| Microsoft Edge Add-ons | [`lojas/microsoft-edge.md`](lojas/microsoft-edge.md) | o mesmo zip do Chrome |
| Firefox Add-ons (AMO) | [`firefox-amo/listagem-firefox-amo.md`](firefox-amo/listagem-firefox-amo.md) e [`firefox-amo/LEIAME-envio-firefox.md`](firefox-amo/LEIAME-envio-firefox.md) | `download/conta-comigo-firefox-2.8.0.zip` |
| Microsoft Store (Windows 10/11) | [`lojas/microsoft-store-windows.md`](lojas/microsoft-store-windows.md) | `.appx` do workflow *Windows (Electron)* |
| Google Play (Android) | [`lojas/google-play.md`](lojas/google-play.md) | `.aab` do workflow *Android* |
| Apple App Store (iPhone e iPad) | [`lojas/apple-app-store.md`](lojas/apple-app-store.md) | *Archive* do Xcode (`native/ios`); **há bloqueios, leia o topo do roteiro** |

## Pastas

- `lojas/` — um roteiro por loja: campos, limites de caracteres, respostas de privacidade e classificação, notas para a revisão e checklist.
- `imagens/<idioma>/<formato>/` — capturas de tela reais do jogo (pt, en, es): `desktop-1280x800` (Chrome, Edge, Firefox), `desktop-1920x1080` (Microsoft Store), `celular-1080x1920`, `tablet7-1200x1920` e `tablet10-1600x2560` (Google Play).
- `graficos/<idioma>/` — tiles, banner (marquee), gráfico de recursos do Play e pôster/caixa/destaque da Microsoft Store; `graficos/icones/` — ícones nos tamanhos pedidos.
- `politica-de-privacidade.md` — política em pt, en e es. Publicada em https://klivfy.github.io/Conta-Comigo/politica-de-privacidade.html (gerada por `python scripts/fase1_privacidade_html.py` e publicada pelo workflow *Site*).
- `capturas/` — capturas antigas 1440×900 usadas no README do repositório (não enviar às lojas; use `imagens/`).
- `firefox-amo/` — pacote específico do Firefox (textos, capturas e anúncios).

## Como refazer as imagens

```bash
python scripts/build_pwa.py
node scripts/loja_capturas.cjs [pt|en|es]   # capturas
node scripts/loja_graficos.cjs              # tiles, banners, pôster e ícones
```

Refaça as duas coisas quando a tela do jogo mudar. Os limites de caracteres de cada campo estão escritos ao lado dele nos roteiros; ao editar um texto, confira o limite.

## O que só você pode fazer

1. **E-mail de suporte**: Google Play exige um e-mail público de contato (preencher no painel). Os demais usam a página de issues do GitHub como suporte.
2. **Contas de desenvolvedor** e taxas: Chrome (US$ 5, única), Edge (grátis), Firefox (grátis), Microsoft Store (conta individual ou empresa), Google Play (US$ 25, única).
3. **Identidade da Microsoft Store**: copiar nome/publisher da Partner Center para as variáveis `APPX_*` antes de gerar o `.appx`.
4. **Chave do Android**: gerar a chave de upload nova (fase A do `PLANO-DE-ACAO.md`) e assinar o AAB (`scripts/assinar_aab.ps1` no Windows). O app leva o jogo dentro do pacote, então não há `assetlinks.json` a atualizar.
5. **Teste fechado no Google Play** (12 testadores por 14 dias) se a conta pessoal for recente.
6. **Verificar a URL da política** abrindo-a depois que o workflow *Site* publicar (ela só existe após o merge na `main`).
7. **Revisar as respostas** dos questionários de classificação e de segurança dos dados: elas valem como declaração sua perante as lojas.
