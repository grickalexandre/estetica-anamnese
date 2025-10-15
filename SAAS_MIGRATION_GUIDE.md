# 🚀 Guia de Migração para SaaS Multi-Cliente

## 📋 O que foi implementado

Sistema completo de multi-tenancy (SaaS) com isolamento de dados por clínica.

### **✅ Arquivos Criados/Atualizados:**

1. **`src/composables/useClinica.js`** (NOVO)
   - Gerencia o contexto da clínica
   - Detecta clinicaId por subdomínio, path ou query
   - Funções de inicialização e gerenciamento

2. **`src/composables/useConfiguracoes.js`** (ATUALIZADO)
   - Agora usa clinicaId para buscar configurações

3. **`src/views/Configuracoes.vue`** (ATUALIZADO)
   - Salva configurações com clinicaId
   - Carrega configurações específicas da clínica

4. **`src/views/AnamneseCliente.vue`** (ATUALIZADO)
   - Salva anamneses com clinicaId
   - Busca anamneses apenas da clínica específica

5. **`src/App.vue`** (ATUALIZADO)
   - Inicializa contexto da clínica no onMounted
   - Filtra notificações por clinicaId

### **📌 Arquivos que AINDA PRECISAM ser atualizados:**

1. **`src/views/ListaAnamneses.vue`**
   - Adicionar filtro por clinicaId nas queries

2. **`src/views/DetalhesAnamnese.vue`**
   - Verificar clinicaId ao carregar detalhes

3. **`src/views/NovaAnamnese.vue`**
   - Adicionar clinicaId ao salvar nova anamnese

4. **`src/views/Relatorios.vue`**
   - Filtrar relatórios por clinicaId

5. **`src/views/Home.vue`**
   - Verificar se precisa de filtros

## 🔧 Como Funciona

### **Detecção de Clínica:**

O sistema detecta a clínica de 3 formas (em ordem de prioridade):

1. **Query Parameter** (para desenvolvimento):
   ```
   http://localhost:3000?clinica=clinica1
   ```

2. **Subdomínio**:
   ```
   https://clinica1.estetica.com.br
   ```

3. **Path**:
   ```
   https://estetica.com.br/clinica1
   ```

4. **Fallback**: Usa localStorage ou 'demo'

### **Estrutura de Dados no Firestore:**

```
firestore/
├── clinicas/
│   ├── clinica1/
│   │   ├── nome: "Clínica Exemplo"
│   │   ├── ativo: true
│   │   └── plano: "premium"
│   └── demo/
│       └── ...
│
├── configuracoes/
│   ├── clinica1/
│   │   ├── clinicaId: "clinica1"
│   │   ├── nomeClinica: "Clínica Exemplo"
│   │   └── ...
│   └── demo/
│       └── ...
│
└── anamneses/
    ├── doc1/
    │   ├── clinicaId: "clinica1"
    │   ├── nome: "João Silva"
    │   └── ...
    └── doc2/
        ├── clinicaId: "demo"
        └── ...
```

## 🔒 Regras de Segurança do Firestore

**IMPORTANTE**: Atualize as regras do Firestore para garantir isolamento de dados:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para clínicas
    match /clinicas/{clinicaId} {
      allow read: if true;
      allow write: if request.auth != null; // Apenas autenticados (admin)
    }
    
    // Regras para configurações
    match /configuracoes/{clinicaId} {
      allow read: if true;
      allow write: if resource.data.clinicaId == clinicaId; // Apenas própria clínica
    }
    
    // Regras para anamneses
    match /anamneses/{anamneseId} {
      // Permitir leitura apenas da própria clínica
      allow read: if resource.data.clinicaId == request.resource.data.clinicaId;
      
      // Permitir escrita com validação de clinicaId
      allow create: if request.resource.data.clinicaId is string
                    && request.resource.data.clinicaId.size() > 0;
      
      allow update, delete: if resource.data.clinicaId == request.resource.data.clinicaId;
    }
  }
}
```

## 📝 Índices Necessários no Firestore

Para melhor performance, crie os seguintes índices compostos:

### **Coleção: `anamneses`**

1. **Índice 1:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `status` (Ascending)
   - Campo: `origem` (Ascending)

2. **Índice 2:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `nome` (Ascending)
   - Campo: `telefone` (Ascending)

3. **Índice 3:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `dataCriacao` (Descending)

4. **Índice 4:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `status` (Ascending)
   - Campo: `dataCriacao` (Descending)

## 🚀 Como Criar uma Nova Clínica

### **1. Criar documento na coleção `clinicas`:**

```javascript
{
  id: "minhaClinica",
  nome: "Minha Clínica de Estética",
  slug: "minha-clinica",
  ativo: true,
  plano: "basico",
  dataCriacao: serverTimestamp(),
  contato: {
    email: "contato@minhaClinica.com.br",
    telefone: "(11) 99999-9999"
  },
  limites: {
    maxAnamneses: 1000,
    maxUsuarios: 5
  }
}
```

### **2. Acessar o sistema:**

**Desenvolvimento:**
```
http://localhost:3000?clinica=minhaClinica
```

**Produção (subdomínio):**
```
https://minhaclinica.estetica-anamnese.vercel.app
```

**Produção (path):**
```
https://estetica-anamnese.vercel.app/minhaclinica
```

### **3. Configurar a clínica:**

- Acesse `/configuracoes`
- Preencha todos os dados
- Salve

## 🔄 Migração de Dados Existentes

Se você já tem dados sem `clinicaId`, execute este script no Firebase Console:

```javascript
// Abra o Firebase Console → Firestore → Execute esta query

const db = firebase.firestore();
const batch = db.batch();

// Migrar configurações
db.collection('configuracoes').doc('clinica').get().then(doc => {
  if (doc.exists) {
    const data = doc.data();
    batch.set(db.collection('configuracoes').doc('demo'), {
      ...data,
      clinicaId: 'demo'
    });
  }
});

// Migrar anamneses
db.collection('anamneses').get().then(snapshot => {
  snapshot.forEach(doc => {
    const ref = db.collection('anamneses').doc(doc.id);
    batch.update(ref, { clinicaId: 'demo' });
  });
  
  return batch.commit();
}).then(() => {
  console.log('Migração concluída!');
});
```

## 📊 Próximos Passos

1. ✅ Atualizar arquivos restantes (Lista, Detalhes, Nova, Relatórios)
2. ✅ Criar painel administrativo para gerenciar clínicas
3. ✅ Implementar autenticação (Firebase Auth)
4. ✅ Criar sistema de planos e limites
5. ✅ Implementar billing (integração com Stripe/PagSeguro)
6. ✅ Criar landing page para cadastro de novas clínicas

## 🎯 Benefícios

- ✅ **Isolamento de dados** por clínica
- ✅ **Escalabilidade** ilimitada
- ✅ **Multi-tenancy** verdadeiro
- ✅ **Fácil gerenciamento** de múltiplas clínicas
- ✅ **Segurança** aprimorada
- ✅ **Plano gratuito** do Firebase comporta muitas clínicas

---

**Desenvolvido para SaaS multi-cliente 🚀**

