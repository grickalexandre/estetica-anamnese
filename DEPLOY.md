# 🚀 Guia Completo de Deploy

Este documento fornece um guia passo a passo para fazer o deploy do sistema de anamnese na Vercel gratuitamente.

## 📋 Pré-requisitos

- [x] Conta no GitHub (gratuita)
- [x] Conta no Firebase (gratuita)
- [x] Conta na Vercel (gratuita)
- [x] Git instalado
- [x] Node.js instalado

## 🔥 Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Escolha um nome para o projeto (ex: "clinica-estetica-anamnese")
4. Desative o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database

1. No menu lateral, vá em **Build** > **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha um local (ex: "southamerica-east1" para Brasil)
4. Selecione **Iniciar no modo de teste**
5. Clique em **Ativar**

**Regras de segurança (modo teste - válido por 30 dias):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

### 3. Configurar Firebase Storage

1. No menu lateral, vá em **Build** > **Storage**
2. Clique em **Começar**
3. Use as regras de segurança padrão
4. Escolha o mesmo local do Firestore
5. Clique em **Concluído**

**Regras de segurança (modo teste):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

### 4. Obter Credenciais do Firebase

1. Clique no ícone de **engrenagem** ⚙️ > **Configurações do projeto**
2. Role para baixo até **Seus aplicativos**
3. Clique no ícone **</>** (Web)
4. Dê um apelido ao app (ex: "anamnese-web")
5. **NÃO** marque "Configurar Firebase Hosting"
6. Clique em **Registrar app**
7. **COPIE** as credenciais que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 5. Atualizar Código com Credenciais

Edite o arquivo `src/firebase.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
}
```

## 📦 Preparar Código para Deploy

### 1. Inicializar Git (se ainda não fez)

```bash
git init
git add .
git commit -m "Initial commit - Sistema de Anamnese"
```

### 2. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Dê um nome ao repositório (ex: "clinica-anamnese")
3. Escolha "Public" ou "Private"
4. **NÃO** adicione README, .gitignore ou licença
5. Clique em "Create repository"

### 3. Enviar Código para GitHub

```bash
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

## 🌐 Deploy na Vercel

### Método 1: Interface Web (Recomendado)

1. Acesse https://vercel.com/
2. Clique em **Sign Up** ou **Log In**
3. Conecte com sua conta do GitHub
4. Clique em **Add New** > **Project**
5. Selecione o repositório do GitHub que você criou
6. Configure o projeto:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (deixe como está)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
7. Clique em **Deploy**
8. Aguarde o build terminar (1-2 minutos)
9. Acesse a URL fornecida pela Vercel!

### Método 2: CLI da Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Escolha as opções:
# Set up and deploy? Y
# Which scope? Sua conta
# Link to existing project? N
# Project name? clinica-anamnese (ou outro nome)
# Directory? ./ 
# Override settings? N

# Para fazer deploy em produção:
vercel --prod
```

## ✅ Verificar Deploy

Após o deploy bem-sucedido:

1. Acesse a URL fornecida pela Vercel
2. Teste criar uma nova anamnese
3. Teste fazer upload de foto
4. Verifique se os dados aparecem na lista
5. Confira no Firebase Console se os dados foram salvos

## 🔄 Atualizações Futuras

Para fazer deploy de novas versões:

```bash
# Faça suas alterações no código
git add .
git commit -m "Descrição das alterações"
git push

# A Vercel fará o deploy automaticamente!
```

## 🔒 Configurar Segurança (Produção)

### Atualizar Regras do Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /anamneses/{anamneseId} {
      // Permitir leitura para todos (ou adicione autenticação)
      allow read: if true;
      // Permitir escrita apenas para usuários autenticados
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### Atualizar Regras do Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pacientes/{imageId} {
      // Permitir leitura para todos
      allow read: if true;
      // Permitir upload apenas para usuários autenticados
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 🌍 Domínio Personalizado (Opcional)

1. Vá ao dashboard da Vercel
2. Selecione seu projeto
3. Clique em **Settings** > **Domains**
4. Adicione seu domínio personalizado
5. Configure o DNS conforme instruções da Vercel

## 📊 Monitoramento

### Vercel Analytics (Gratuito)
1. No dashboard da Vercel, vá em **Analytics**
2. Visualize visitantes, pageviews e performance

### Firebase Usage
1. No Firebase Console, vá em **Usage**
2. Monitore uso de Firestore e Storage
3. Plano gratuito (Spark):
   - Firestore: 50K leituras/dia, 20K escritas/dia
   - Storage: 1GB armazenado, 10GB transferido/mês

## ❗ Limites do Plano Gratuito

### Vercel Free
- 100GB bandwidth/mês
- Builds ilimitados
- Domínio personalizado
- SSL automático

### Firebase Spark (Free)
- Firestore: 1GB armazenado
- Storage: 1GB armazenado
- 10GB bandwidth/mês

## 🐛 Troubleshooting

### Deploy falhou na Vercel
- Verifique os logs de build no dashboard
- Confirme que `package.json` está correto
- Teste `npm run build` localmente

### Erro ao salvar dados
- Verifique credenciais do Firebase
- Confirme que Firestore está ativado
- Verifique regras de segurança

### Imagens não carregam
- Confirme que Storage está ativado
- Verifique regras do Storage
- Teste upload de imagem pequena

### Erro 404 em rotas
- Confirme que `vercel.json` existe
- Verifique configuração de rewrites

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Vue.js Docs:** https://vuejs.org/

---

✅ **Checklist Final**

- [ ] Firebase configurado (Firestore + Storage)
- [ ] Credenciais atualizadas em `src/firebase.js`
- [ ] Código no GitHub
- [ ] Deploy na Vercel realizado
- [ ] Aplicação testada em produção
- [ ] Regras de segurança configuradas

🎉 **Parabéns! Seu sistema está no ar!**


