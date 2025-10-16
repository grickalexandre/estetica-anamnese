# Regras do Firestore - Módulo Financeiro

Este documento contém as regras de segurança do Firestore para o módulo financeiro da aplicação.

## 📋 Collections do Módulo Financeiro

### 1. `contas_pagar`
Armazena todas as despesas da clínica.

**Estrutura:**
```javascript
{
  clinicaId: string,           // ID da clínica (para multi-tenancy)
  descricao: string,           // Descrição da despesa
  categoria: string,           // aluguel, salarios, fornecedores, etc.
  fornecedor: string,          // Nome do fornecedor (opcional)
  valor: number,               // Valor da despesa
  dataVencimento: timestamp,   // Data de vencimento
  status: string,              // pendente, pago, vencido
  dataPagamento: timestamp,    // Data do pagamento (se pago)
  valorPago: number,           // Valor efetivamente pago (se diferente)
  observacoes: string,         // Observações adicionais
  dataCriacao: timestamp       // Data de criação do registro
}
```

### 2. `contas_receber`
Armazena todas as receitas da clínica.

**Estrutura:**
```javascript
{
  clinicaId: string,           // ID da clínica (para multi-tenancy)
  descricao: string,           // Descrição da receita
  categoria: string,           // consultas, procedimentos, produtos, etc.
  cliente: string,             // Nome do cliente (opcional)
  valor: number,               // Valor da receita
  dataVencimento: timestamp,   // Data de vencimento
  status: string,              // pendente, recebido, vencido
  dataRecebimento: timestamp,  // Data do recebimento (se recebido)
  valorRecebido: number,       // Valor efetivamente recebido (se diferente)
  observacoes: string,         // Observações adicionais
  dataCriacao: timestamp       // Data de criação do registro
}
```

### 3. `movimentacoes`
Armazena o fluxo de caixa (movimentações diárias).

**Estrutura:**
```javascript
{
  clinicaId: string,           // ID da clínica (para multi-tenancy)
  tipo: string,                // entrada ou saida
  descricao: string,           // Descrição da movimentação
  categoria: string,           // Categoria (mesmas das contas)
  valor: number,               // Valor da movimentação
  data: timestamp,             // Data da movimentação
  contaId: string,             // ID da conta relacionada (opcional)
  tipoConta: string,           // pagar ou receber (se relacionado a conta)
  observacoes: string,         // Observações adicionais
  dataCriacao: timestamp       // Data de criação do registro
}
```

## 🔒 Regras de Segurança do Firestore

### Regras para Desenvolvimento

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para contas_pagar
    match /contas_pagar/{contaId} {
      // Permitir leitura para todos (temporário para desenvolvimento)
      allow read: if true;
      
      // Permitir escrita para todos (temporário para desenvolvimento)
      allow create, update, delete: if true;
    }
    
    // Regras para contas_receber
    match /contas_receber/{contaId} {
      // Permitir leitura para todos (temporário para desenvolvimento)
      allow read: if true;
      
      // Permitir escrita para todos (temporário para desenvolvimento)
      allow create, update, delete: if true;
    }
    
    // Regras para movimentacoes
    match /movimentacoes/{movimentacaoId} {
      // Permitir leitura para todos (temporário para desenvolvimento)
      allow read: if true;
      
      // Permitir escrita para todos (temporário para desenvolvimento)
      allow create, update, delete: if true;
    }
  }
}
```

### Regras para Produção

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função auxiliar para verificar autenticação
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Função auxiliar para verificar se o usuário pertence à clínica
    function belongsToClinic(clinicaId) {
      return isSignedIn() && 
             get(/databases/$(database)/documents/configuracoes/$(clinicaId)).data.userId == request.auth.uid;
    }
    
    // Regras para contas_pagar
    match /contas_pagar/{contaId} {
      // Permitir leitura apenas para membros da clínica
      allow read: if isSignedIn() && 
                     belongsToClinic(resource.data.clinicaId);
      
      // Permitir criação apenas se autenticado e pertencer à clínica
      allow create: if isSignedIn() && 
                       belongsToClinic(request.resource.data.clinicaId) &&
                       request.resource.data.clinicaId is string &&
                       request.resource.data.descricao is string &&
                       request.resource.data.categoria is string &&
                       request.resource.data.valor is number &&
                       request.resource.data.dataVencimento is timestamp &&
                       request.resource.data.status in ['pendente', 'pago', 'vencido'];
      
      // Permitir atualização apenas se autenticado e pertencer à clínica
      allow update: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId) &&
                       request.resource.data.clinicaId == resource.data.clinicaId;
      
      // Permitir exclusão apenas se autenticado e pertencer à clínica
      allow delete: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId);
    }
    
    // Regras para contas_receber
    match /contas_receber/{contaId} {
      // Permitir leitura apenas para membros da clínica
      allow read: if isSignedIn() && 
                     belongsToClinic(resource.data.clinicaId);
      
      // Permitir criação apenas se autenticado e pertencer à clínica
      allow create: if isSignedIn() && 
                       belongsToClinic(request.resource.data.clinicaId) &&
                       request.resource.data.clinicaId is string &&
                       request.resource.data.descricao is string &&
                       request.resource.data.categoria is string &&
                       request.resource.data.valor is number &&
                       request.resource.data.dataVencimento is timestamp &&
                       request.resource.data.status in ['pendente', 'recebido', 'vencido'];
      
      // Permitir atualização apenas se autenticado e pertencer à clínica
      allow update: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId) &&
                       request.resource.data.clinicaId == resource.data.clinicaId;
      
      // Permitir exclusão apenas se autenticado e pertencer à clínica
      allow delete: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId);
    }
    
    // Regras para movimentacoes
    match /movimentacoes/{movimentacaoId} {
      // Permitir leitura apenas para membros da clínica
      allow read: if isSignedIn() && 
                     belongsToClinic(resource.data.clinicaId);
      
      // Permitir criação apenas se autenticado e pertencer à clínica
      allow create: if isSignedIn() && 
                       belongsToClinic(request.resource.data.clinicaId) &&
                       request.resource.data.clinicaId is string &&
                       request.resource.data.tipo in ['entrada', 'saida'] &&
                       request.resource.data.descricao is string &&
                       request.resource.data.categoria is string &&
                       request.resource.data.valor is number &&
                       request.resource.data.data is timestamp;
      
      // Permitir atualização apenas se autenticado e pertencer à clínica
      allow update: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId) &&
                       request.resource.data.clinicaId == resource.data.clinicaId;
      
      // Permitir exclusão apenas se autenticado e pertencer à clínica
      allow delete: if isSignedIn() && 
                       belongsToClinic(resource.data.clinicaId);
    }
  }
}
```

## 📊 Índices Necessários no Firestore

Para melhor performance, crie os seguintes índices compostos no Firestore Console:

### Collection: `contas_pagar`
1. **Índice 1:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `status` (Ascending)
   - Campo: `dataVencimento` (Ascending)

2. **Índice 2:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `categoria` (Ascending)
   - Campo: `dataVencimento` (Ascending)

### Collection: `contas_receber`
1. **Índice 1:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `status` (Ascending)
   - Campo: `dataVencimento` (Ascending)

2. **Índice 2:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `categoria` (Ascending)
   - Campo: `dataVencimento` (Ascending)

### Collection: `movimentacoes`
1. **Índice 1:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `data` (Descending)

2. **Índice 2:**
   - Campo: `clinicaId` (Ascending)
   - Campo: `tipo` (Ascending)
   - Campo: `data` (Descending)

## 🚀 Como Aplicar as Regras

### Pelo Firebase Console (Recomendado)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** → **Regras**
4. Cole as regras de produção acima
5. Clique em **Publicar**

### Pelo Firebase CLI

```bash
# Criar arquivo firestore.rules com as regras acima
# Depois executar:
firebase deploy --only firestore:rules
```

## ⚠️ Importante

1. **Desenvolvimento vs Produção:**
   - Use as regras de desenvolvimento apenas em ambiente de testes
   - Em produção, SEMPRE use as regras com autenticação

2. **Multi-tenancy:**
   - Todas as consultas devem filtrar por `clinicaId`
   - Nunca confie apenas nas regras do Firestore, valide no frontend também

3. **Performance:**
   - Crie os índices compostos conforme especificado acima
   - O Firestore pode sugerir índices automaticamente ao fazer consultas

4. **Custos:**
   - Cada leitura/escrita no Firestore tem custo
   - Otimize suas consultas para reduzir custos
   - Use cache quando apropriado

## 📝 Exemplo de Uso

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

// Buscar contas a pagar de uma clínica
const buscarContasPagar = async (clinicaId) => {
  const q = query(
    collection(db, 'contas_pagar'),
    where('clinicaId', '==', clinicaId),
    where('status', '==', 'pendente')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
```

## 🔄 Migração de Dados

Se você já tem dados no Firestore, execute uma migração para adicionar o campo `clinicaId`:

```javascript
// Script de migração (executar uma vez)
const migrarDados = async (clinicaId) => {
  const collections = ['contas_pagar', 'contas_receber', 'movimentacoes']
  
  for (const collectionName of collections) {
    const snapshot = await getDocs(collection(db, collectionName))
    
    for (const doc of snapshot.docs) {
      if (!doc.data().clinicaId) {
        await updateDoc(doc.ref, {
          clinicaId: clinicaId
        })
      }
    }
  }
}
```

## 📚 Recursos Adicionais

- [Documentação oficial do Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guia de boas práticas](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Simulador de regras](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

