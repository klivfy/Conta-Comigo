# Conta Comigo — regras do R8 para a TWA.
# A LauncherActivity e as demais classes do Android Browser Helper são abertas pelo
# sistema por nome (manifest e intents de Custom Tabs); mantê-las evita quebrar a TWA.
-keep class com.google.androidbrowserhelper.** { *; }
-dontwarn com.google.androidbrowserhelper.**
# Linhas e nome do arquivo nos rastros de falha (desofuscados pelo mapping.txt no Play)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
