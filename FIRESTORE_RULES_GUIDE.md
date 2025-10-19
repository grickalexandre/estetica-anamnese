# 🔒 Guia de Configuração das Regras do Firestore

## ⚠️ Problema Atual
**Erro**: "Missing or insufficient permissions" ao salvar profissional

**Causa**: As regras de segurança do Firestore não estão permitindo operações de escrita nas coleções.

## 📋 Como Aplicar as Regras

### Opção 1: Via Console do Firebase (Recomendado)

1. **Acesse o Console do Firebase**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto

2. **Navegue até Firestore Database**
   - No menu lateral, clique em "Firestore Database"
   - Clique na aba "Regras" (Rules)

3. **Copie e Cole as Regras**
   - Abra o arquivo `firestore.rules` deste projeto
   - Copie todo o conteúdo
   - Cole no editor de regras do Firebase
   - Clique em "Publicar" (Publish)

4. **Aguarde a Publicação**
   - As regras levam alguns segundos para serem aplicadas
   - Você verá uma confirmação quando estiver pronto

### Opção 2: Via Firebase CLI

```bash
# 1. Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# 2. Fazer login
firebase login

# 3. Inicializar o projeto (se ainda não fez)
firebase init firestore

# 4. Aplicar as regras
firebase deploy --only firestore:rules
```

## 🔑 Estrutura das Regras Implementadas

### Autenticação Básica
- Usuários devem estar autenticados para operações de escrita
- Cada documento vinculado a uma `clinicaId`
- Verificação automática se usuário pertence à clínica

### Permissões por Coleção

#### ✅ Coleções com Permissão de Escrita (Autenticado)
- `profissionais` ✅
- `fornecedores` ✅
- `produtos` ✅
- `procedimentos` ✅
- `atendimentos` ✅
- `contas_pagar` ✅
- `contas_receber` ✅
- `comissoes` ✅
- `plano_contas` ✅
- `movimentacoes_estoque` ✅
- `compras` ✅
- `despesas_recorrentes` ✅
- `observacoes_anamnese` ✅

#### 🌍 Coleções com Permissão Pública (Limitada)
- `anamneses` - Criação pública (clientes preenchendo)
- `clientes` - Criação ao preencher anamnese
- `configuracoes` - Leitura pública (para página do cliente)

#### 🔒 Coleções Protegidas
- `users` - Apenas próprio usuário
- `clinicas` - Apenas membros da clínica

## 🧪 Testar as Regras

### No Console do Firebase:

1. Vá para a aba "Regras" do Firestore
2. Clique em "Simulador de Regras"
3. Teste operações:
   ```
   Operação: create
   Caminho: /profissionais/test123
   Autenticação: Simular usuário autenticado
   Dados: { "clinicaId": "sua-clinica-id", "nome": "Teste" }
   ```

### No Código (Console do Navegador):

```javascript
// Verificar autenticação
console.log('Usuário autenticado:', firebase.auth().currentUser)

// Verificar clinicaId
const userId = firebase.auth().currentUser.uid
const userDoc = await firebase.firestore().collection('users').doc(userId).get()
console.log('Dados do usuário:', userDoc.data())
console.log('clinicaId:', userDoc.data().clinicaId)
```

## 🔍 Troubleshooting

### Erro persiste após aplicar regras?

1. **Limpar cache do navegador**
   - Ctrl + Shift + Delete
   - Limpar cache e cookies

2. **Fazer logout e login novamente**
   ```javascript
   // No console do navegador
   firebase.auth().signOut()
   ```

3. **Verificar clinicaId no documento do usuário**
   - O campo `clinicaId` deve existir no documento `users/{userId}`
   - Deve corresponder ao `clinicaId` dos dados sendo salvos

4. **Verificar estrutura do documento**
   ```javascript
   // Dados enviados devem incluir clinicaId
   {
     "clinicaId": "sua-clinica-id", // Obrigatório!
     "nome": "Nome do Profissional",
     // ... outros campos
   }
   ```

## 📝 Regras para Desenvolvimento (Temporário)

Se precisar testar localmente com regras mais permissivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // ⚠️ APENAS PARA DESENVOLVIMENTO - NUNCA EM PRODUÇÃO!
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

⚠️ **Atenção**: Não use regras permissivas em produção!

## ✅ Checklist de Segurança

- [ ] Regras aplicadas no Firebase Console
- [ ] Teste de criação de profissional funcionando
- [ ] Teste de atualização funcionando
- [ ] Teste de leitura funcionando
- [ ] Verificado que apenas usuários autenticados conseguem escrever
- [ ] Verificado que dados são isolados por clínica
- [ ] Regras de desenvolvimento removidas (se aplicadas)

## 🆘 Suporte

Se o erro persistir após seguir todos os passos:

1. Copie as mensagens do console do navegador (F12)
2. Verifique o UID do usuário autenticado
3. Verifique se o documento em `users/{uid}` tem o campo `clinicaId`
4. Verifique se as regras foram publicadas corretamente no Firebase Console

## 📚 Documentação Oficial

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Language](https://firebase.google.com/docs/rules/rules-language)
- [Testing Rules](https://firebase.google.com/docs/rules/unit-tests)

