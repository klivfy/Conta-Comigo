# Conta Comigo — regras do R8 para o app Capacitor.
# O capacitor-android já traz as regras dos plugins (classes com @CapacitorPlugin,
# abertas por nome a partir do capacitor.plugins.json). Aqui fica só o que falta:
# a ponte JavaScript ↔ Java, chamada pelo WebView através de @JavascriptInterface.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
# Linhas e nome do arquivo nos rastros de falha (desofuscados pelo mapping.txt no Play)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
