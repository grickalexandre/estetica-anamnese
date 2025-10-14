# 🚀 Guia de Deploy - Sistema de Anamnese

Este guia contém instruções passo a passo para configurar o Firebase e fazer deploy no Vercel.

## 📋 Índice
- [Configuração do Firebase](#-configuração-do-firebase)
- [Configuração do Vercel](#-configuração-do-vercel)
- [Configurações Adicionais](#-configurações-adicionais-recomendadas)
- [Troubleshooting](#-troubleshooting-comum)
- [Checklist Final](#-checklist-final)

---

## 🔥 Configuração do Firebase

### Passo 1: Criar Projeto no Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Digite o nome: `estetica-anamnese` (ou o nome que preferir)
4. Desabilite o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### Passo 2: Configurar Firestore Database
1. No painel do Firebase, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (para desenvolvimento)
4. Selecione a localização mais próxima (ex: `southamerica-east1`)
5. Clique em **"Concluído"**

### Passo 3: Storage (Opcional - Não Necessário)
> **Nota**: O sistema foi configurado para funcionar sem Storage, usando apenas o plano gratuito do Firebase. Se quiser usar upload de fotos no futuro, você pode configurar o Storage posteriormente.

### Passo 4: Adicionar Aplicativo Web
1. No painel do projeto, clique no ícone **`</>`** (Web)
2. Digite o nome do app: `estetica-anamnese-web`
3. **NÃO** marque "Também configurar o Firebase Hosting"
4. Clique em **"Registrar app"**
5. **Copie as credenciais** que aparecem (firebaseConfig)

### Passo 5: Atualizar Credenciais no Projeto
1. Abra o arquivo `src/firebase.js`
2. Substitua o `firebaseConfig` pelas suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
}
```

### Passo 6: Configurar Regras de Segurança

**Firestore Rules** (`database.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

**Storage Rules** (Não necessário - sistema funciona sem Storage):
> O sistema foi configurado para funcionar apenas com Firestore, sem necessidade de Storage.

---

## 🌐 Configuração do Vercel

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Fazer Login no Vercel
```bash
vercel login
```
- Escolha **"Continue with GitHub"** (recomendado)
- Autorize o Vercel no GitHub

### Passo 3: Configurar Projeto para Deploy
1. No terminal, navegue até a pasta do projeto:
```bash
cd C:\Users\luis.oliveira\Documents\Node\Estetica
```

2. Execute o comando de deploy:
```bash
vercel
```

3. Responda as perguntas:
   - **"Set up and deploy?"** → `Y`
   - **"Which scope?"** → Escolha sua conta
   - **"Link to existing project?"** → `N`
   - **"What's your project's name?"** → `estetica-anamnese`
   - **"In which directory is your code located?"** → `./`

### Passo 4: Configurar Build Settings
O Vercel detectará automaticamente que é um projeto Vite. As configurações serão:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Passo 5: Configurar Variáveis de Ambiente (Opcional)
Se quiser usar variáveis de ambiente:

1. No painel do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione as variáveis do Firebase (opcional, pois já estão no código)

### Passo 6: Deploy Automático
Após a configuração inicial:
- **Push para GitHub** = Deploy automático
- **Branch main** = Deploy de produção
- **Outras branches** = Deploy de preview

---

## 🔧 Configurações Adicionais Recomendadas

### 1. Configurar Domínio Personalizado (Opcional)
1. No painel do Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 2. Configurar HTTPS (Automático)
- O Vercel fornece HTTPS automaticamente
- Certificados SSL são gerenciados automaticamente

### 3. Configurar Analytics (Opcional)
1. No painel do Vercel, vá em **Analytics**
2. Ative o Vercel Analytics para métricas

---

## 🚨 Troubleshooting Comum

### Erro de Build no Vercel:
```bash
# Verificar se todas as dependências estão no package.json
npm install
npm run build
```

### Erro de Firebase:
- Verificar se as credenciais estão corretas
- Verificar se o projeto está ativo
- Verificar regras de segurança

### Erro de CORS:
- Adicionar domínio do Vercel nas configurações do Firebase
- Verificar configurações de autenticação

### Erro de Porta em Uso:
```bash
# Verificar processos usando a porta
netstat -ano | findstr :3000
# Matar processo se necessário
taskkill /PID <PID_NUMBER> /F
```

---

## 📋 Checklist Final

### Firebase:
- [ ] Projeto criado
- [ ] Firestore configurado
- [ ] App web registrado
- [ ] Credenciais atualizadas no código
- [ ] Regras de segurança configuradas

### Vercel:
- [ ] CLI instalado
- [ ] Login realizado
- [ ] Projeto deployado
- [ ] Build funcionando
- [ ] URL de produção ativa

### Testes:
- [ ] Sistema funcionando localmente
- [ ] Deploy no Vercel funcionando
- [ ] Firebase conectado
- [ ] Formulário do cliente funcionando
- [ ] Lista de pacientes funcionando

---

## 📱 URLs Finais

Após o deploy, você terá:
- **Produção**: `https://estetica-anamnese.vercel.app`
- **Link do Cliente**: `https://estetica-anamnese.vercel.app/anamnese-cliente`
- **Admin**: `https://estetica-anamnese.vercel.app`

---

## 🔄 Deploy Contínuo

Para futuras atualizações:
1. Faça as alterações no código
2. Commit e push para GitHub:
```bash
git add .
git commit -m "Atualização do sistema"
git push origin main
```
3. O Vercel fará o deploy automaticamente!

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Verifique os logs do Vercel no painel
3. Verifique as regras do Firebase
4. Teste localmente primeiro

---

## 🎯 Próximos Passos

Após o deploy:
1. Configure um domínio personalizado
2. Configure regras de segurança mais restritivas
3. Configure backup automático do Firestore
4. Configure monitoramento de performance
5. Configure analytics detalhados

---

**Desenvolvido com ❤️ para clínicas de estética**
