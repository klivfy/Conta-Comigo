# Conta Comigo v2.1 — Material de publicação nas lojas (S35)

Este diretório reúne tudo o que é necessário para publicar a extensão na
Chrome Web Store e no Firefox Add-ons (AMO).

## 1. Arquivos prontos

| Arquivo | Uso |
|---|---|
| `listagem-lojas.md` | Títulos, descrições e textos de listagem (copiar e colar) |
| `politica-de-privacidade.md` | Política de privacidade (hospedar em URL pública ou anexar) |
| `capturas/captura-1..6.png` | Capturas de tela 1440×900 para a listagem |

## 2. Checklist antes do envio

1. **Pacote**: compacte o conteúdo da pasta `conta-comigo` (o `manifest.json`
   precisa ficar na raiz do ZIP).
2. **Chrome Web Store** (<https://chrome.google.com/webstore/devconsole>):
   - Categoria: *Education*;
   - Idioma principal: português (Brasil); descrições em inglês e espanhol opcionais;
   - Campo "Permission justification": `storage` — usado apenas para salvar o
     progresso no próprio navegador, sem servidores;
   - Como a extensão altera a nova aba (S33), descreva isso na listagem e
     explique como desligar o desafio rápido;
   - Distribuição: pública ou oculta por link.
3. **Firefox Add-ons** (<https://addons.mozilla.org/developers/>):
   - Enviar o mesmo ZIP ("Carregar uma nova versão");
   - Notas de revisão destacando o id `conta-comigo@kidmath.app`;
   - A nova aba pode ser revertida pelo usuário nas configurações de início do Firefox;
   - O atalho global (S34) funciona no Firefox 121+; nos 109–120 o jogo abre pelo ícone.
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
