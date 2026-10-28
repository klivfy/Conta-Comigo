# Identificadores do Conta Comigo — regra única para todas as plataformas

Última revisão: 28/10/2026 · versão 2.6.3

## A regra

1. **Um só identificador de app:** `com.klivfy.conta.comigo.matematica`.
   Ele vale para todo lugar que pede um identificador reverso de domínio (Android, iPhone, iPad, Mac, Windows e Linux). Nenhuma plataforma ganha nome próprio.
2. **Itens filhos acrescentam sufixo**, nunca outra raiz. Exemplos: extensão do Safari `com.klivfy.conta.comigo.matematica.extensao`, widget `com.klivfy.conta.comigo.matematica.widget`.
3. **Quando a loja gera ou fixa o ID, vale o da loja.** Esses casos estão na tabela de exceções abaixo. Eles não podem ser escolhidos por nós, ou não podem mais mudar.
4. **Onde não se aceitam pontos**, use a forma com hífens: `conta-comigo-matematica` (Snap, nomes de pacote npm, slugs de URL).
5. **Arquivos gerados** seguem `conta-comigo-<plataforma>-<versão>[-<arquitetura>][-<variante>].<ext>`. Exemplos: `conta-comigo-chrome-2.6.3.zip`, `conta-comigo-windows-2.6.3-x64-instalador.exe`.
6. **Nomes exibidos** vêm dos idiomas do jogo (no Android, `values/`, `values-en/` e `values-es/strings.xml` seguem o idioma do aparelho):

   | Idioma | Nome completo | Nome curto (ícone, lançador) |
   |---|---|---|
   | pt-BR (padrão) | Conta Comigo — Matemática para Crianças | Conta Comigo |
   | en | Count With Me — Math for Kids | Count With Me |
   | es | Cuenta Conmigo — Matemática para Niños | Cuenta Conmigo |

7. **O publicador é sempre Klivfy Tecnologia.** O copyright é `© <ano> Klivfy Tecnologia`.

O `node scripts/sync_check.cjs`, que roda no CI, falha se algum arquivo da tabela abaixo fugir da regra.

## Onde a regra está aplicada

| Plataforma | Campo | Arquivo | Valor |
|---|---|---|---|
| Android (Google Play, Capacitor) | `applicationId` e `namespace` | `native/android/android/app/build.gradle` | `com.klivfy.conta.comigo.matematica` |
| Android | `appId` | `native/android/capacitor.config.json` | idem |
| Android | `package_name` e pacote Java da `MainActivity` | `native/android/android/app/src/main/res/values/strings.xml` e `…/java/com/klivfy/conta/comigo/matematica/MainActivity.java` | idem |
| iPhone e iPad (iOS/iPadOS) | `PRODUCT_BUNDLE_IDENTIFIER` | `native/ios/ios/App/App.xcodeproj/project.pbxproj` | idem (`TARGETED_DEVICE_FAMILY = 1,2`: iPhone e iPad no mesmo app) |
| iPhone e iPad | `appId` | `native/ios/capacitor.config.json` | idem |
| Mac (Apple silicon) | o mesmo App ID do iPad | App Store Connect → *Disponibilidade no Mac* | idem (o app de iPad roda no Mac sem build separado) |
| Mac (futuro: Mac Catalyst) | `PRODUCT_BUNDLE_IDENTIFIER` | mesmo projeto Xcode | idem, com *Universal Purchase* (uma compra serve para todos os aparelhos Apple) |
| Windows 10/11 (Electron) | `build.appId` (AppUserModelID) | `native/windows/package.json` | idem |
| Linux (futuro: Flatpak, Flathub) | ID do app, arquivo `.desktop` e Metainfo | — | `com.klivfy.conta.comigo.matematica` |
| Linux (futuro: Snap) | `name` | — | `conta-comigo-matematica` |

## Exceções: IDs que a loja define ou que já não podem mudar

| Plataforma | ID | Por quê |
|---|---|---|
| Firefox (AMO) | `conta-comigo@klivfy.com` (em `scripts/build_packages.py`) | A versão 2.6.1 já foi enviada com esse ID. Trocar cria **outro** add-on: quem instalou não recebe mais atualização e as avaliações se perdem. O formato `nome@domínio` é o recomendado pela Mozilla. |
| Chrome Web Store | gerado pela loja (32 letras) | O ID sai da chave do pacote no primeiro envio; não há campo para escolher. |
| Edge Add-ons | gerado pela Microsoft (outro, diferente do Chrome) | Idem. |
| Microsoft Store (MSIX) | `Package/Identity/Name` e `Publisher` da Partner Center | A Partner Center gera esses valores ao reservar o nome. Eles entram pelas variáveis `APPX_IDENTITY_NAME`, `APPX_PUBLISHER` e `APPX_PUBLISHER_DISPLAY_NAME` do workflow. O valor de exemplo `Klivfy.ContaComigo` em `package.json` só serve para testar o pacote. |
| Microsoft Store (MSIX) | `Application Id` = `ContaComigo` | Identificador interno do aplicativo dentro do pacote; o MSIX não aceita esse campo no formato de domínio reverso. |
| PWA (web) | `id: "conta-comigo-pwa"` no `manifest.webmanifest` | A identidade de uma PWA é a URL. Trocar o `id` faz o navegador tratar o jogo instalado como outro app. |
| Play Console (app antigo) | `com.conta.comigo.matematica.klivfy.com` | Esse app ficou preso a esse pacote e não é mais usado. O app novo no Play Console deve receber `com.klivfy.conta.comigo.matematica`. |
| Chave de upload Android | alias `contacomigo-upload` | Nome interno da chave dentro do `.jks`; não aparece em loja nenhuma. Trocar exigiria gerar a chave de novo. |

## Efeitos da troca para quem já tem o jogo

- **Android:** o app novo é outro app para o Google Play. Ninguém tinha a versão antiga instalada pela loja. A troca da TWA pelo Capacitor (28/10/2026) mantém o mesmo identificador.
- **iPhone e iPad:** o app não foi publicado. O progresso fica em *Preferences*, que é ligado ao bundle ID, mas não há usuários ainda.
- **Windows:** o progresso fica na pasta definida pelo `productName` ("Conta Comigo"), que não mudou, então o progresso não se perde. O instalador NSIS usa o `appId` para se identificar: quem instalou a 2.6.x antiga vê duas entradas "Conta Comigo" em *Aplicativos instalados* e deve desinstalar a antiga.
- **Extensões e web:** nada muda.

## Lista de verificação para uma plataforma nova

1. Use `com.klivfy.conta.comigo.matematica`, ou `conta-comigo-matematica` se a plataforma não aceitar pontos.
2. Nome exibido: tabela da regra 6, nos 3 idiomas.
3. Arquivo gerado: regra 5.
4. Acrescente o arquivo novo à lista `ids` em `scripts/sync_check.cjs` e a esta página.
5. Se a loja gerar o ID, registre-o na tabela de exceções.
