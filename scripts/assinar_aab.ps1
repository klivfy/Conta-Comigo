# Conta Comigo — assina o .aab para o Google Play no Windows (PowerShell).
# Se a upload key ainda não existe, cria. A senha é pedida aqui e não é gravada em lugar nenhum.
# Uso (na pasta onde está o .aab):
#   powershell -ExecutionPolicy Bypass -File assinar_aab.ps1 -Aab conta-comigo-2.6.4-264-sem-assinatura.aab
# Parâmetros opcionais: -Keystore <caminho.jks> (padrão: %USERPROFILE%\conta-comigo-keys\upload.jks) e -Alias <nome>.
# Precisa de um JDK 17+ (keytool e jarsigner). Sem JDK: winget install EclipseAdoptium.Temurin.21.JDK
param(
  [Parameter(Mandatory = $true)][string]$Aab,
  [string]$Keystore = (Join-Path $env:USERPROFILE 'conta-comigo-keys\upload.jks'),
  [string]$Alias = 'contacomigo-upload'
)
$ErrorActionPreference = 'Stop'

function Find-JdkTool([string]$name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $dirs = @()
  if ($env:JAVA_HOME) { $dirs += (Join-Path $env:JAVA_HOME 'bin') }
  $dirs += (Get-ChildItem 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java', 'C:\Program Files\Microsoft', 'C:\Program Files\Android\Android Studio\jbr' -Directory -ErrorAction SilentlyContinue | ForEach-Object { Join-Path $_.FullName 'bin' })
  $dirs += 'C:\Program Files\Android\Android Studio\jbr\bin'
  foreach ($d in $dirs) { $p = Join-Path $d "$name.exe"; if (Test-Path $p) { return $p } }
  throw "$name não encontrado. Instale um JDK 17+ (winget install EclipseAdoptium.Temurin.21.JDK), feche e abra o PowerShell e rode de novo."
}
function Read-Pass([string]$prompt) {
  $s = Read-Host $prompt -AsSecureString
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

if (-not (Test-Path $Aab)) { throw "$Aab não existe" }
$keytool = Find-JdkTool 'keytool'
$jarsigner = Find-JdkTool 'jarsigner'
$out = [IO.Path]::ChangeExtension((Resolve-Path $Aab).Path, $null).TrimEnd('.') + '-assinado.aab'
if (Test-Path $out) { throw "$out já existe" }

try {
  if (-not (Test-Path $Keystore)) {
    Write-Host "Criando a upload key em $Keystore"
    $p1 = Read-Pass 'Senha nova do keystore (mín. 12 caracteres)'
    $p2 = Read-Pass 'Repita a senha'
    if ($p1 -ne $p2) { throw 'senhas diferentes' }
    if ($p1.Length -lt 12) { throw 'senha curta demais' }
    New-Item -ItemType Directory -Force -Path (Split-Path $Keystore) | Out-Null
    $env:CC_PASS = $p1
    & $keytool -genkeypair -keystore $Keystore -storetype PKCS12 -alias $Alias -keyalg RSA -keysize 2048 -validity 10000 `
      '-storepass:env' CC_PASS '-keypass:env' CC_PASS -dname 'CN=Conta Comigo, OU=Klivfy Tecnologia, O=Klivfy Tecnologia, L=Sao Paulo, ST=SP, C=BR'
    if ($LASTEXITCODE -ne 0) { throw 'keytool falhou' }
  } else {
    $env:CC_PASS = Read-Pass 'Senha do keystore'
  }

  Copy-Item $Aab $out
  & $jarsigner -keystore $Keystore '-storepass:env' CC_PASS '-keypass:env' CC_PASS -sigalg SHA256withRSA -digestalg SHA-256 $out $Alias | Out-Null
  if ($LASTEXITCODE -ne 0) { Remove-Item $out -Force; throw 'jarsigner falhou (senha ou alias errado?)' }
  if (-not ((& $jarsigner -verify $out) -match 'jar verified')) { Remove-Item $out -Force; throw 'a assinatura não confere' }

  Write-Host "`n[OK] $out"
  Write-Host 'SHA256 da upload key (para conferir no Play Console):'
  (& $keytool -list -v -keystore $Keystore '-storepass:env' CC_PASS -alias $Alias) | Select-String 'SHA256:' | Select-Object -First 1 | ForEach-Object { $_.Line.Trim() }
  Write-Host "`nGuarde $Keystore e a senha num cofre, fora do Git. Sem eles não dá para assinar as próximas versões."
} finally {
  Remove-Item Env:CC_PASS -ErrorAction SilentlyContinue
}
