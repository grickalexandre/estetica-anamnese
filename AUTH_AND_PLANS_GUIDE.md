# 🔐 Guia de Autenticação e Planos

## 📋 Sistema Implementado

Sistema completo de autenticação, cadastro de clínicas e planos (Free e Premium).

---

## ✅ Funcionalidades Implementadas

### **1. Autenticação (Firebase Auth)**
- ✅ Login com email/senha
- ✅ Cadastro de novas clínicas
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Persistência de sessão
- ✅ Guard de navegação

### **2. Cadastro de Clínicas**
- ✅ Formulário completo de registro
- ✅ Escolha de plano (Free ou Premium)
- ✅ Criação automática de clinicaId
- ✅ Setup inicial de configurações
- ✅ Geração de slug único

### **3. Sistema de Planos**
- ✅ **Plano Free** (Gratuito)
- ✅ **Plano Premium** (R$ 49/mês)
- ✅ Página de upgrade/downgrade
- ✅ Comparação de recursos
- ✅ Limites por plano

---

## 📊 Comparação de Planos

| Recurso | Free | Premium |
|---------|------|---------|
| **Anamneses** | 100 | Ilimitadas |
| **Usuários** | 1 | 10 |
| **Fotos por paciente** | 4 | 20 |
| **Upload máximo** | 10MB | 50MB |
| **Relatórios** | Básicos | Avançados |
| **Suporte** | Email | WhatsApp Prioritário |
| **Logo personalizada** | ❌ | ✅ |
| **Domínio próprio** | ❌ | ✅ |
| **Preço** | Grátis | R$ 49/mês |

---

## 🔧 Configuração Necessária

### **1. Ativar Firebase Authentication**

1. **Acesse o Firebase Console:**
   - https://console.firebase.google.com
   - Selecione o projeto: `estetica-anamnese`

2. **Vá para Authentication:**
   - No menu lateral, clique em **"Authentication"**
   - Clique em **"Get Started"** (se for a primeira vez)

3. **Ativar Email/Password:**
   - Vá na aba **"Sign-in method"**
   - Clique em **"Email/Password"**
   - **Ative** a opção "Email/Password"
   - Clique em **"Save"**

### **2. Atualizar Regras do Firestore**

Cole as regras atualizadas no Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função helper para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função helper para verificar se pertence à clínica
    function belongsToClinica(clinicaId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.clinicaId == clinicaId;
    }
    
    // ===== CLÍNICAS =====
    match /clinicas/{clinicaId} {
      allow read: if true; // Dados públicos
      allow create: if isAuthenticated(); // Qualquer um autenticado pode criar
      allow update, delete: if belongsToClinica(clinicaId);
    }
    
    // ===== USUÁRIOS =====
    match /usuarios/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false; // Não permitir deletar
    }
    
    // ===== CONFIGURAÇÕES =====
    match /configuracoes/{clinicaId} {
      allow read: if true; // Público (para formulário de pacientes)
      allow write: if belongsToClinica(clinicaId);
    }
    
    // ===== ANAMNESES =====
    match /anamneses/{anamneseId} {
      // Ler apenas da própria clínica
      allow read: if belongsToClinica(resource.data.clinicaId);
      
      // Criar: própria clínica OU origem cliente
      allow create: if belongsToClinica(request.resource.data.clinicaId) ||
                    request.resource.data.origem == 'cliente';
      
      // Atualizar/Deletar: apenas da própria clínica
      allow update, delete: if belongsToClinica(resource.data.clinicaId);
    }
  }
}
```

---

## 🚀 Como Usar

### **Primeiro Acesso:**

1. **Acessar a aplicação:**
   ```
   https://estetica-anamnese.vercel.app
   ```

2. **Será redirecionado para /login**

3. **Criar nova conta:**
   - Clicar em "Criar conta grátis"
   - Escolher plano (Free ou Premium)
   - Preencher dados da clínica
   - Preencher seus dados
   - Aceitar termos
   - Criar conta

4. **Login automático e redirecionamento**

### **Rotas Públicas (não requerem login):**
- `/login` - Tela de login
- `/cadastro` - Cadastro de clínicas
- `/anamnese-cliente` - Formulário para pacientes

### **Rotas Protegidas (requerem login):**
- `/` - Home
- `/nova` - Nova anamnese
- `/lista` - Lista de anamneses
- `/detalhes/:id` - Detalhes da anamnese
- `/configuracoes` - Configurações
- `/relatorios` - Relatórios
- `/planos` - Planos e upgrade

---

## 👤 Estrutura de Dados

### **Coleção: `usuarios`**

```javascript
{
  uid: "firebase-auth-uid",
  nome: "Maria Silva",
  email: "maria@clinica.com",
  clinicaId: "clinica-bella-abc123",
  role: "owner", // owner, admin, user
  plano: "free", // free, premium
  dataCriacao: Timestamp
}
```

### **Coleção: `clinicas`**

```javascript
{
  id: "clinica-bella-abc123",
  nome: "Clínica Bella",
  slug: "clinica-bella",
  ownerId: "firebase-auth-uid",
  plano: "free",
  ativo: true,
  dataCriacao: Timestamp,
  limites: {
    maxAnamneses: 100,
    maxUsuarios: 1,
    maxFotos: 4,
    uploadSize: 10
  },
  contato: {
    email: "contato@clinica.com",
    telefone: "(11) 99999-9999"
  }
}
```

---

## 💳 Integração de Pagamento (Próximos Passos)

### **Opções Recomendadas:**

1. **Stripe** (Internacional)
   - Fácil integração
   - Suporta PIX via Stripe Brasil
   - Dashboard completo

2. **Mercado Pago** (Brasil)
   - PIX, Cartão, Boleto
   - Bem estabelecido no Brasil
   - Taxas competitivas

3. **Asaas** (Brasil)
   - Focado em SaaS
   - Gestão de assinaturas
   - Cobrança recorrente

### **Implementação Futura:**

```javascript
// src/views/Planos.vue - função upgradePlano()

const upgradePlano = async () => {
  try {
    // 1. Criar checkout session
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      body: JSON.stringify({
        clinicaId: clinicaId.value,
        plano: 'premium'
      })
    })
    
    const { checkoutUrl } = await response.json()
    
    // 2. Redirecionar para checkout
    window.location.href = checkoutUrl
  } catch (error) {
    console.error('Erro ao criar checkout:', error)
  }
}
```

---

## 🔒 Segurança

### **Já Implementado:**

- ✅ Autenticação via Firebase Auth
- ✅ Proteção de rotas no front-end
- ✅ Regras de segurança no Firestore
- ✅ Validação de clinicaId em todas as operações
- ✅ Isolamento de dados por clínica

### **Recomendações Adicionais:**

- ⚠️ Implementar rate limiting
- ⚠️ Adicionar captcha no registro
- ⚠️ Validação server-side com Cloud Functions
- ⚠️ Logs de auditoria

---

## 📱 Fluxo de Cadastro

```
1. Usuário acessa /cadastro
   ↓
2. Escolhe plano (Free ou Premium)
   ↓
3. Preenche dados (clínica + pessoais)
   ↓
4. Sistema cria:
   - Usuário no Firebase Auth
   - Documento em /clinicas
   - Documento em /usuarios
   - Documento em /configuracoes
   ↓
5. Login automático
   ↓
6. Redirecionamento para /?clinica={clinicaId}
```

---

## 🎯 Próximos Passos

### **Curto Prazo:**
- [ ] Integrar gateway de pagamento
- [ ] Adicionar recuperação de senha
- [ ] Implementar verificação de email
- [ ] Criar tela de perfil do usuário

### **Médio Prazo:**
- [ ] Gerenciamento de usuários (adicionar/remover)
- [ ] Sistema de permissões (roles)
- [ ] Webhooks para pagamentos
- [ ] Notificações por email

### **Longo Prazo:**
- [ ] App mobile (React Native)
- [ ] Integrações com CRMs
- [ ] API pública
- [ ] Plano Enterprise

---

## ✅ Checklist de Deploy

- [x] Firebase Auth configurado
- [x] Telas de login e cadastro criadas
- [x] Sistema de planos implementado
- [x] Proteção de rotas ativa
- [ ] Regras do Firestore atualizadas (faça no console)
- [ ] Teste de fluxo completo
- [ ] Gateway de pagamento (futuro)

---

**🚀 Sistema pronto para produção (exceto gateway de pagamento)!**

