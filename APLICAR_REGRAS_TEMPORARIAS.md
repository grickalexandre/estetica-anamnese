# 🔧 Aplicar Regras Temporárias do Firestore

## Problema
Os agendamentos não estão aparecendo na agenda, possivelmente por problemas de permissão no Firestore.

## Solução
Aplicar regras temporárias mais permissivas para debug.

## Passos

### 1. Acessar Firebase Console
1. Vá para https://console.firebase.google.com/
2. Selecione o projeto "estetica-anamnese"
3. No menu lateral, clique em "Firestore Database"
4. Clique na aba "Regras"

### 2. Aplicar Regras Temporárias
Substitua o conteúdo das regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS PARA DEBUG - PERMITIR TUDO
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Publicar Regras
1. Clique em "Publicar"
2. Aguarde a confirmação

### 4. Testar
1. Abra `debug-firebase.html` no navegador
2. Teste os 3 botões em sequência
3. Verifique se consegue criar e listar agendamentos

## ⚠️ IMPORTANTE
Estas regras são temporárias e permitem acesso total. 
**NÃO use em produção!**

Após resolver o problema, volte às regras originais.
