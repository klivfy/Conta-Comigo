// Configuração do electron-builder. Fica em JS (e não no package.json) porque a
// identidade do pacote da Microsoft Store vem do ambiente e o electron-builder não
// expande ${env.X} dentro do bloco appx. Sem as variáveis, usa valores de teste.
const env = process.env;

module.exports = Object.assign({
  "appId": "com.klivfy.contacomigo",
  "productName": "Conta Comigo",
  "copyright": "Copyright © 2026 Klivfy Tecnologia",
  "directories": {
    "output": "dist"
  },
  "files": [
    "main.js",
    "app/**/*",
    "build/icon.ico"
  ],
  "win": {
    "icon": "build/icon.ico",
    "target": [
      {
        "target": "nsis",
        "arch": [
          "x64"
        ]
      },
      {
        "target": "portable",
        "arch": [
          "x64"
        ]
      },
      {
        "target": "appx",
        "arch": [
          "x64"
        ]
      }
    ],
    "artifactName": "Conta-Comigo-${version}-${arch}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Conta Comigo"
  },
  "portable": {
    "artifactName": "Conta-Comigo-${version}-portable.${ext}"
  }
}, {
  appx: {
    identityName: env.APPX_IDENTITY_NAME || 'Klivfy.ContaComigo',
    publisher: env.APPX_PUBLISHER || 'CN=00000000-0000-0000-0000-000000000000',
    publisherDisplayName: env.APPX_PUBLISHER_DISPLAY_NAME || 'Klivfy Tecnologia',
    applicationId: 'ContaComigo',
    displayName: 'Conta Comigo',
    languages: ['pt-BR', 'en-US', 'es-ES'],
    artifactName: 'Conta-Comigo-${version}-store.${ext}',
  },
});
