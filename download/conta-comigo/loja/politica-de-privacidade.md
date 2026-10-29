# Política de Privacidade — Conta Comigo

[Português](#pt) · [English](#en) · [Español](#es)

Última atualização: 28 de outubro de 2026 · Versão do aplicativo: 2.7.2

## Princípio geral

O Conta Comigo é um jogo educativo de matemática para crianças de 4 a 8 anos. Ele está disponível como extensão do Chrome, do Edge e do Firefox, como aplicativo para Windows 10/11 e como aplicativo para Android (e como versão web instalável). Em todas as versões ele foi construído com **privacidade por arquitetura**: nenhum dado pessoal é coletado, transmitido, vendido ou compartilhado. Não existem servidores do aplicativo, contas de usuário, anúncios, rastreadores, ferramentas de análise nem compras dentro do aplicativo.

## Dados guardados no seu dispositivo

Para funcionar, o jogo salva localmente (no navegador ou no aparelho) apenas:

- **Progresso do jogo**: estrelas, pontos, níveis por operação, acertos e erros, conquistas, figurinhas e itens da loja do jogo (comprados só com estrelas ganhas jogando);
- **Perfis de jogadores**: até 4 perfis locais, com um apelido e um avatar de emoji escolhidos por quem usa (não peça nem use o nome verdadeiro da criança, se preferir);
- **Preferências**: idioma, tema, som, voz, acessibilidade, dificuldade, metas e limite de sessão;
- **Uso local**: tempo de jogo e resultados das rodadas, usados só no painel dos responsáveis, dentro do próprio aplicativo.

Esses dados **nunca saem do dispositivo** e podem ser apagados na área dos responsáveis ("Apagar tudo"), limpando os dados do navegador ou do aplicativo, ou desinstalando o jogo.

## Sincronização opcional (extensões)

Nas extensões do Chrome, do Edge e do Firefox, os responsáveis podem ativar a sincronização do progresso entre computadores. Nesse caso o navegador usa a própria API `storage.sync`: os dados passam pela conta do navegador da pessoa, sob o controle do fornecedor dele (Google, Microsoft ou Mozilla), e continuam fora do alcance do Conta Comigo. A senha dos responsáveis (veja abaixo) **não** entra nessa sincronização. Os aplicativos para Windows e Android não têm sincronização.

## Backup em arquivo

A área dos responsáveis pode gerar um arquivo de backup do progresso, salvo onde o responsável escolher. O arquivo fica sob controle exclusivo da família e o Conta Comigo não o envia a lugar nenhum. O backup **não contém** a senha, o sal nem o lembrete da senha.

## Narração por voz

A narração usa somente a síntese de voz do próprio navegador ou sistema (`speechSynthesis`), com as vozes já instaladas no aparelho. O texto falado é sintetizado no dispositivo. Se o sistema oferecer uma voz que depende de conexão, quem a fornece é o fabricante do sistema, não o Conta Comigo.

## Senha dos responsáveis

A área dos responsáveis pode ser protegida por uma senha criada pelo próprio adulto.

- A senha é guardada **apenas neste dispositivo**, como resumo criptográfico **PBKDF2-HMAC-SHA-256** com sal aleatório e muitas repetições — nunca em texto legível. Senhas criadas em versões anteriores (resumo simples) são convertidas para o formato novo no primeiro acesso correto.
- O **lembrete** escolhido pelo adulto fica em texto no aparelho, para ser mostrado em "Esqueci a senha".
- Senha, resumo, sal e lembrete não são enviados a servidor algum e não vão para backup, cópia nem sincronização.
- Após tentativas erradas, o acesso é bloqueado por um tempo crescente. Como último recurso, "Redefinir apagando TODO o progresso" apaga os dados locais e permite criar outra senha.

## Permissões

- **Extensões (Chrome, Edge, Firefox)**: apenas `storage`, para guardar progresso e preferências. A extensão substitui a página de nova aba por um desafio rápido de matemática, que pode ser desligado no próprio jogo. Não há permissão de sites, abas, histórico ou rede.
- **Windows**: o aplicativo roda sem acesso à internet e sem permissões especiais.
- **Android**: o jogo vem dentro do aplicativo e funciona sem internet desde a primeira abertura; não pede câmera, microfone, localização, contatos nem armazenamento. O backup em arquivo sai pela folha de compartilhar do Android, para o lugar que o responsável escolher.

## Crianças

O jogo é feito para famílias e crianças. Não coleta dados de crianças, não tem publicidade, não tem compras e não leva a links externos durante o jogo. Como nada é coletado, não há dados para acessar, corrigir ou excluir em nossos servidores; tudo está no aparelho e é controlado pelos responsáveis.

## Alterações e contato

Mudanças nesta política terão nova data e serão citadas nas notas de versão da loja. Dúvidas sobre privacidade: abra uma conversa em <https://github.com/klivfy/Conta-Comigo/issues> (publicador: Klivfy Tecnologia).

# Privacy Policy — Count With Me

Last updated: October 28, 2026 · App version: 2.7.2

## Summary

Count With Me (the English name of Conta Comigo) is an educational math game for children aged 4 to 8. It is available as a Chrome, Edge and Firefox extension, a Windows 10/11 app, an Android app and an installable web version. In every version it is **private by design**: no personal data is collected, transmitted, sold or shared. There are no app servers, accounts, ads, trackers, analytics or in-app purchases.

## Data kept on your device

The game stores locally (in the browser or on the device) only: game progress (stars, points, levels, right and wrong answers, achievements, stickers and shop items bought with stars earned by playing); up to 4 local player profiles with a nickname and an emoji avatar; preferences (language, theme, sound, voice, accessibility, difficulty, goals, session limit); and local usage figures (play time and round results) shown only in the parents' area inside the app.

This data **never leaves the device**. It can be erased in the parents' area ("Erase all"), by clearing the browser or app data, or by uninstalling.

## Optional sync (extensions)

In the Chrome, Edge and Firefox extensions, parents may turn on progress sync between computers. The browser then uses its own `storage.sync` API: data goes through the person's browser account, controlled by that vendor (Google, Microsoft or Mozilla), out of reach of Count With Me. The parents' password is **not** synced. The Windows and Android apps have no sync.

## File backup

The parents' area can create a progress backup file saved wherever the parent chooses. The file stays under the family's control and is never sent anywhere. It **does not contain** the password, its salt or its hint.

## Voice narration

Narration uses only the browser's or system's own speech synthesis (`speechSynthesis`) with voices already installed on the device. If the system offers an online voice, it is provided by the system vendor, not by Count With Me.

## Parents' password

The parents' area can be protected by a password created by the adult. It is stored **only on this device** as a **PBKDF2-HMAC-SHA-256** hash with a random salt and many iterations, never as readable text; passwords created by earlier versions (plain hash) are upgraded on the first correct login. The hint chosen by the adult is kept as text on the device to be shown under "Forgot password". Password, hash, salt and hint are never sent to any server and are excluded from backups, copies and sync. After wrong attempts, access is locked for a growing time; as a last resort, "Reset by erasing ALL progress" erases local data so a new password can be created.

## Permissions

- **Extensions (Chrome, Edge, Firefox)**: only `storage`, to keep progress and preferences. The extension replaces the new tab page with a quick math challenge that can be turned off in the game. No site, tab, history or network permissions.
- **Windows**: the app runs without internet access and without special permissions.
- **Android**: the game ships inside the app and works without internet from the first launch; it asks for no camera, microphone, location, contacts or storage access. The backup file goes out through the Android share sheet, to wherever the parent chooses.

## Children

The game is made for families and children. It collects no children's data, has no advertising, no purchases and no external links during play. Since nothing is collected, there is no data on our servers to access, correct or delete; everything is on the device, under the parents' control.

## Changes and contact

Changes to this policy will carry a new date and be mentioned in the store release notes. Privacy questions: open a conversation at <https://github.com/klivfy/Conta-Comigo/issues> (publisher: Klivfy Tecnologia).

# Política de Privacidad — Cuenta Conmigo

Última actualización: 28 de octubre de 2026 · Versión de la aplicación: 2.7.2

## Resumen

Cuenta Conmigo (el nombre en español de Conta Comigo) es un juego educativo de matemática para niños de 4 a 8 años. Está disponible como extensión de Chrome, Edge y Firefox, aplicación para Windows 10/11, aplicación para Android y versión web instalable. En todas las versiones es **privado por diseño**: no se recopila, transmite, vende ni comparte ningún dato personal. No hay servidores de la aplicación, cuentas, anuncios, rastreadores, analítica ni compras dentro de la aplicación.

## Datos guardados en tu dispositivo

El juego guarda localmente (en el navegador o en el dispositivo) solo: el progreso (estrellas, puntos, niveles, aciertos y errores, logros, cromos y artículos de la tienda comprados con estrellas ganadas jugando); hasta 4 perfiles locales con un apodo y un avatar de emoji; las preferencias (idioma, tema, sonido, voz, accesibilidad, dificultad, metas, límite de sesión); y datos locales de uso (tiempo de juego y resultados de las rondas) que solo se ven en el área de las familias dentro de la aplicación.

Estos datos **nunca salen del dispositivo**. Se pueden borrar en el área de las familias ("Borrar todo"), limpiando los datos del navegador o de la aplicación, o desinstalando.

## Sincronización opcional (extensiones)

En las extensiones de Chrome, Edge y Firefox, las familias pueden activar la sincronización del progreso entre computadoras. El navegador usa entonces su propia API `storage.sync`: los datos pasan por la cuenta del navegador de la persona, bajo el control de ese proveedor (Google, Microsoft o Mozilla), fuera del alcance de Cuenta Conmigo. La contraseña de las familias **no** se sincroniza. Las aplicaciones de Windows y Android no tienen sincronización.

## Copia de seguridad en archivo

El área de las familias puede crear un archivo de copia del progreso, guardado donde la persona adulta elija. El archivo queda bajo control exclusivo de la familia y nunca se envía a ningún lugar. **No contiene** la contraseña, su sal ni su pista.

## Narración por voz

La narración usa solo la síntesis de voz del propio navegador o sistema (`speechSynthesis`), con las voces ya instaladas en el dispositivo. Si el sistema ofrece una voz en línea, la proporciona el fabricante del sistema, no Cuenta Conmigo.

## Contraseña de las familias

El área de las familias puede protegerse con una contraseña creada por la persona adulta. Se guarda **solo en este dispositivo** como resumen criptográfico **PBKDF2-HMAC-SHA-256** con sal aleatoria y muchas iteraciones, nunca como texto legible; las contraseñas de versiones anteriores (resumen simple) se actualizan en el primer acceso correcto. La pista elegida se guarda como texto en el dispositivo para mostrarse en "Olvidé la contraseña". Contraseña, resumen, sal y pista no se envían a ningún servidor y quedan fuera de copias y sincronización. Tras intentos fallidos, el acceso se bloquea por un tiempo creciente; como último recurso, "Restablecer borrando TODO el progreso" borra los datos locales para crear otra contraseña.

## Permisos

- **Extensiones (Chrome, Edge, Firefox)**: solo `storage`, para guardar progreso y preferencias. La extensión reemplaza la página de nueva pestaña por un desafío rápido de matemática que se puede apagar en el juego. Sin permisos de sitios, pestañas, historial ni red.
- **Windows**: la aplicación funciona sin acceso a internet y sin permisos especiales.
- **Android**: el juego viene dentro de la aplicación y funciona sin conexión desde el primer inicio; no pide cámara, micrófono, ubicación, contactos ni almacenamiento. La copia de seguridad sale por el menú de compartir de Android, al lugar que la familia elija.

## Niños

El juego está hecho para familias y niños. No recopila datos de niños, no tiene publicidad, compras ni enlaces externos durante el juego. Como no se recopila nada, no hay datos en nuestros servidores que acceder, corregir o eliminar; todo está en el dispositivo, bajo control de las familias.

## Cambios y contacto

Los cambios en esta política llevarán una nueva fecha y se mencionarán en las notas de versión de la tienda. Consultas de privacidad: abre una conversación en <https://github.com/klivfy/Conta-Comigo/issues> (publicador: Klivfy Tecnologia).
