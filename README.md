# 🌸 Sistema de Anamnese - Clínica de Estética

Sistema completo de gestão de fichas de anamnese para clínicas de estética, desenvolvido com Vue.js 3 e Firebase.

## ✨ Funcionalidades

- 📋 Cadastro completo de anamnese com diversos campos
- 📸 Upload e armazenamento de fotos dos pacientes
- 🔍 Busca rápida por nome, telefone ou CPF
- 💾 Armazenamento em nuvem com Firebase (Firestore + Storage)
- 📱 Interface responsiva e moderna
- ☁️ Deploy gratuito na Vercel

## 🚀 Tecnologias Utilizadas

- **Frontend:** Vue.js 3 (Composition API)
- **Backend/Database:** Firebase (Firestore + Storage)
- **Roteamento:** Vue Router
- **Build:** Vite
- **Deploy:** Vercel

## 📋 Campos da Anamnese

### Dados Pessoais
- Nome completo
- Data de nascimento
- CPF
- Telefone
- Email
- Endereço
- Foto do paciente

### Histórico Médico
- Doenças
- Medicamentos em uso
- Alergias
- Gestante/Lactante/Fumante

### Hábitos e Estilo de Vida
- Prática de exercícios físicos
- Ingestão de água
- Qualidade do sono
- Tipo de alimentação

### Cuidados com a Pele
- Tipo de pele
- Uso de protetor solar
- Exposição ao sol
- Produtos cosméticos em uso

### Objetivos do Tratamento
- Expectativas e objetivos
- Procedimentos estéticos anteriores
- Observações adicionais

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Conta no Firebase (gratuita)
- Conta na Vercel (gratuita)

### Passo 1: Clone o projeto
```bash
git clone <seu-repositorio>
cd Estetica
```

### Passo 2: Instale as dependências
```bash
npm install
```

### Passo 3: Configure o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto (ou use um existente)
3. Ative o **Firestore Database**:
   - Vá em "Build" > "Firestore Database"
   - Clique em "Criar banco de dados"
   - Escolha "Modo de teste" (para desenvolvimento)
   - Selecione a localização

4. Ative o **Storage**:
   - Vá em "Build" > "Storage"
   - Clique em "Começar"
   - Use as regras de segurança padrão

5. Obtenha as credenciais:
   - Vá em "Configurações do projeto" (ícone de engrenagem)
   - Role até "Seus aplicativos"
   - Clique no ícone web `</>`
   - Registre seu app
   - Copie as credenciais do Firebase

6. Atualize o arquivo `src/firebase.js` com suas credenciais:
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
}
```

### Passo 4: Execute localmente
```bash
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## 🌐 Deploy na Vercel (Gratuito)

### Método 1: Via CLI da Vercel

1. Instale a CLI da Vercel:
```bash
npm install -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel
```

4. Siga as instruções:
   - Confirme o diretório do projeto
   - Confirme as configurações
   - Aguarde o deploy

### Método 2: Via Interface Web da Vercel

1. Faça commit do código no GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <seu-repositorio-github>
git push -u origin main
```

2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Conecte seu repositório do GitHub
5. Configure o projeto:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Clique em "Deploy"

## 📱 Como Usar

### Criar Nova Anamnese
1. Clique em "Nova Anamnese"
2. Preencha os campos do formulário
3. Adicione uma foto do paciente (opcional)
4. Clique em "Salvar Anamnese"

### Visualizar Pacientes
1. Clique em "Pacientes" no menu
2. Use a busca para encontrar pacientes específicos
3. Clique em um paciente para ver os detalhes completos

### Buscar Pacientes
- Digite nome, telefone ou CPF na barra de busca
- Os resultados são filtrados em tempo real

## 🔒 Segurança

Para produção, configure as regras de segurança do Firebase:

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /anamneses/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pacientes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Nota:** As regras acima exigem autenticação. Para desenvolvimento, você pode usar modo de teste, mas para produção, implemente autenticação de usuários.

## 📝 Estrutura do Projeto

```
Estetica/
├── public/
├── src/
│   ├── views/
│   │   ├── Home.vue
│   │   ├── NovaAnamnese.vue
│   │   ├── ListaAnamneses.vue
│   │   └── DetalhesAnamnese.vue
│   ├── App.vue
│   ├── main.js
│   ├── firebase.js
│   └── style.css
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## 🐛 Troubleshooting

### Erro ao salvar anamnese
- Verifique se as credenciais do Firebase estão corretas
- Confirme que Firestore e Storage estão ativados no Firebase Console

### Erro no upload de imagem
- Verifique as regras do Firebase Storage
- Confirme que o Storage está ativado

### Erro 404 ao acessar rotas
- Verifique se o arquivo `vercel.json` está configurado corretamente
- As SPAs precisam de rewrites para funcionar corretamente

## 🎨 Personalização

### Cores do tema
Edite o arquivo `src/style.css` para personalizar as cores:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Campos do formulário
Edite o arquivo `src/views/NovaAnamnese.vue` para adicionar ou remover campos.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.

---

Desenvolvido com ❤️ para clínicas de estética


