# Configuração do Firebase

## Passos para configurar o Firebase

### 1. Criar projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Digite o nome do projeto (ex: "estetica-anamnese")
4. Configure as opções conforme necessário
5. Aguarde a criação do projeto

### 2. Configurar Firestore Database
1. No painel do projeto, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (recomendado: us-central1)

### 3. Configurar Storage
1. No painel do projeto, vá em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão
4. Selecione a mesma localização do Firestore

### 4. Obter credenciais
1. No painel do projeto, clique no ícone de configurações (⚙️)
2. Selecione "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique em "Adicionar app" e escolha "Web" (ícone </>)
5. Digite um nome para o app (ex: "estetica-web")
6. Copie as credenciais do Firebase

### 5. Configurar o arquivo firebase.js
Substitua as credenciais no arquivo `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto-id.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto-id.appspot.com",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
}
```

### 6. Configurar regras de segurança (Firestore)
No Firestore, vá em "Regras" e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para desenvolvimento
    // ATENÇÃO: Em produção, configure regras mais restritivas
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 7. Configurar regras de segurança (Storage)
No Storage, vá em "Regras" e configure:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload de imagens para desenvolvimento
    // ATENÇÃO: Em produção, configure regras mais restritivas
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Estrutura de dados

### Coleção: anamneses
Cada documento contém:
- `nome` (string)
- `dataNascimento` (string)
- `telefone` (string)
- `email` (string)
- `endereco` (string)
- `doencas` (string)
- `medicamentos` (string)
- `alergias` (string)
- `gestante` (boolean)
- `lactante` (boolean)
- `fumante` (boolean)
- `exercicios` (string)
- `ingestaoAgua` (string)
- `sono` (string)
- `alimentacao` (string)
- `tipoPele` (string)
- `protetorSolar` (string)
- `exposicaoSol` (string)
- `produtosCosmeticos` (string)
- `objetivos` (string)
- `procedimentosAnteriores` (string)
- `observacoes` (string)
- `fotoURL` (string, opcional)
- `status` (string: "pendente" ou "analisada")
- `origem` (string: "cliente" ou "profissional")
- `dataCriacao` (timestamp)
- `dataAnalise` (timestamp, opcional)

## URLs importantes

- **Sistema da profissional**: `http://localhost:5173/`
- **Formulário do cliente**: `http://localhost:5173/anamnese-cliente`

## Deploy

Para fazer deploy em produção, considere:
1. Configurar regras de segurança mais restritivas
2. Configurar autenticação se necessário
3. Usar variáveis de ambiente para as credenciais
4. Configurar domínios autorizados no Firebase
