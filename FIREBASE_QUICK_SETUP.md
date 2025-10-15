# 🚀 Configuração Rápida do Firebase

## ⚠️ PROBLEMA: Erro ao criar conta

Se você está recebendo "Erro ao criar conta. Tente novamente.", siga estes passos:

## 1. 🔥 Configurar Regras do Firestore

### Acesse o Firebase Console:
1. Vá para: https://console.firebase.google.com
2. Selecione o projeto: `estetica-anamnese`
3. Clique em **Firestore Database** → **Rules**

### Cole estas regras (DESENVOLVIMENTO):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== CLÍNICAS =====
    match /clinicas/{clinicaId} {
      allow read, write: if true;
    }
    
    // ===== USUÁRIOS =====
    match /usuarios/{userId} {
      allow read, write: if true;
    }
    
    // ===== CONFIGURAÇÕES =====
    match /configuracoes/{clinicaId} {
      allow read, write: if true;
    }
    
    // ===== ANAMNESES =====
    match /anamneses/{anamneseId} {
      allow read, write: if true;
    }
  }
}
```

4. Clique em **"Publicar"**

## 2. 🔐 Verificar Firebase Authentication

### Ativar Email/Password:
1. No Firebase Console, vá em **Authentication** → **Sign-in method**
2. Clique em **Email/Password**
3. Ative **"Enable"** se não estiver ativo
4. Clique em **"Save"**

## 3. 🧪 Testar o Cadastro

1. Abra o console do navegador (F12)
2. Tente criar uma conta
3. Verifique os logs no console para ver onde está falhando

## 4. 📊 Verificar Dados

Após o cadastro, verifique se os dados foram criados:
- **Authentication** → **Users** (deve aparecer o usuário)
- **Firestore** → **Data** (deve aparecer as coleções: clinicas, usuarios, configuracoes)

## 🔍 Debug

Se ainda der erro, verifique no console do navegador:
- Código do erro
- Mensagem detalhada
- Em qual etapa está falhando

## ✅ Próximos Passos

Após resolver o cadastro:
1. Teste o login
2. Verifique se a clínica foi criada
3. Teste criar uma anamnese
