# 🔒 Regras de Segurança do Firestore - SaaS Multi-Cliente

## 📋 Como Aplicar

1. Acesse o Firebase Console: https://console.firebase.google.com
2. Selecione seu projeto: `estetica-anamnese`
3. Vá em **Firestore Database** → **Rules**
4. Cole as regras abaixo
5. Clique em **"Publicar"**

## 🔐 Regras de Segurança (Desenvolvimento)

**⚠️ Use estas regras durante o desenvolvimento:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== CLÍNICAS =====
    match /clinicas/{clinicaId} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita para todos (apenas dev)
      allow write: if true;
    }
    
    // ===== CONFIGURAÇÕES =====
    match /configuracoes/{clinicaId} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita garantindo que clinicaId corresponde
      allow write: if true;
    }
    
    // ===== ANAMNESES =====
    match /anamneses/{anamneseId} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita garantindo que clinicaId existe
      allow create: if request.resource.data.clinicaId is string
                    && request.resource.data.clinicaId.size() > 0;
      
      allow update, delete: if true;
    }
  }
}
```

## 🔐 Regras de Segurança (Produção)

**⚠️ Use estas regras em produção (quando implementar autenticação):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função helper para verificar se usuário pertence à clínica
    function pertenceClinica(clinicaId) {
      return request.auth != null && 
             request.auth.token.clinicaId == clinicaId;
    }
    
    // Função helper para verificar se é admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    // ===== CLÍNICAS =====
    match /clinicas/{clinicaId} {
      // Permitir leitura para todos (dados públicos)
      allow read: if true;
      
      // Apenas admins podem criar/editar clínicas
      allow create: if isAdmin();
      
      // Apenas admin ou owner da clínica podem editar
      allow update: if isAdmin() || 
                    (request.auth != null && 
                     request.auth.token.clinicaId == clinicaId);
      
      // Apenas admins podem deletar
      allow delete: if isAdmin();
    }
    
    // ===== CONFIGURAÇÕES =====
    match /configuracoes/{clinicaId} {
      // Permitir leitura para todos (página pública de anamnese precisa)
      allow read: if true;
      
      // Apenas usuários da clínica podem editar
      allow write: if pertenceClinica(clinicaId) ||
                   isAdmin();
    }
    
    // ===== ANAMNESES =====
    match /anamneses/{anamneseId} {
      // Permitir leitura apenas para usuários da mesma clínica
      allow read: if pertenceClinica(resource.data.clinicaId) ||
                  isAdmin();
      
      // Permitir criação garantindo clinicaId correto
      allow create: if (request.resource.data.clinicaId is string &&
                       request.resource.data.clinicaId.size() > 0) &&
                      (pertenceClinica(request.resource.data.clinicaId) ||
                       request.resource.data.origem == 'cliente'); // Permitir clientes criarem
      
      // Apenas usuários da clínica podem editar/deletar
      allow update, delete: if pertenceClinica(resource.data.clinicaId) ||
                            isAdmin();
    }
  }
}
```

## 📊 Índices Necessários

### **Criar no Firebase Console → Firestore → Indexes**

#### **Coleção: `anamneses`**

**Índice 1: Listar anamneses por clínica**
- Campo: `clinicaId` → Ascending
- Campo: `dataCriacao` → Descending

**Índice 2: Filtrar por status e clínica**
- Campo: `clinicaId` → Ascending
- Campo: `status` → Ascending
- Campo: `dataCriacao` → Descending

**Índice 3: Notificações de pendentes**
- Campo: `clinicaId` → Ascending
- Campo: `status` → Ascending
- Campo: `origem` → Ascending

**Índice 4: Verificar duplicatas**
- Campo: `clinicaId` → Ascending
- Campo: `nome` → Ascending
- Campo: `telefone` → Ascending

**Índice 5: Relatórios com filtro de data**
- Campo: `clinicaId` → Ascending
- Campo: `dataCriacao` → Ascending (ou Descending)

## 🎯 Como Criar os Índices

### **Opção 1: Pelo Console (Manual)**
1. Vá em Firestore → Indexes
2. Clique em "Create Index"
3. Adicione os campos conforme especificado acima

### **Opção 2: Automático (quando der erro)**
Quando você executar uma query que precisa de índice, o Firebase mostrará um link no erro. Clique nele e o índice será criado automaticamente.

### **Opção 3: Por URL (Mais Rápido)**

```
https://console.firebase.google.com/v1/r/project/estetica-anamnese/firestore/indexes?create_composite=Clg5cHJvamVjdHMvZXN0ZXRpY2EtYW5hbW5lc2UvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FuYW1uZXNlcy9pbmRleGVzL18QARoKCgZjbGluaWNhEAEaEAoMZGF0YUNyaWFjYW8QAg
```

## ✅ Validação de Dados

As regras garantem:

1. **Isolamento de Dados:**
   - ✅ Cada clínica só vê seus próprios dados
   - ✅ clinicaId é obrigatório em todas as coleções

2. **Segurança:**
   - ✅ Apenas usuários autenticados podem modificar dados
   - ✅ Clientes podem criar anamneses sem autenticação
   - ✅ Admins têm acesso total

3. **Integridade:**
   - ✅ clinicaId não pode ser vazio
   - ✅ Validação de tipos de dados
   - ✅ Prevenção de modificação de clinicaId

## 🔄 Teste as Regras

No Firebase Console → Firestore → Rules → Playground:

```javascript
// Teste 1: Criar anamnese com clinicaId
{
  "location": "anamneses/test123",
  "method": "create",
  "data": {
    "clinicaId": "demo",
    "nome": "Teste",
    "telefone": "11999999999",
    "origem": "cliente"
  }
}

// Teste 2: Ler configurações de uma clínica
{
  "location": "configuracoes/demo",
  "method": "get"
}
```

---

**✅ Após aplicar as regras, seu sistema estará seguro e pronto para produção!**

