# 📚 Documentação Completa do Projeto - Sistema de Anamnese Estética

**Projeto**: Sistema de Gestão de Clínica de Estética  
**Tecnologias**: Vue.js 3, Firebase/Firestore, Vercel, Cloudinary  
**Tipo**: PWA (Progressive Web App)  
**Data última atualização**: Outubro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Documentação de Funcionalidades](#documentação-de-funcionalidades)
4. [Componentes Vue](#componentes-vue)
5. [Composables (Lógica Reutilizável)](#composables)
6. [Firebase e Firestore](#firebase-e-firestore)
7. [Integrações Externas](#integrações-externas)
8. [Guias e Tutoriais](#guias-e-tutoriais)
9. [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🎯 Visão Geral

### Objetivo do Projeto
Sistema completo de gestão para clínicas de estética que oferece:
- Gestão de pacientes e anamneses
- Agendamento e controle de atendimentos
- Catálogo de procedimentos
- Controle de estoque de produtos
- Gestão financeira (contas a pagar/receber, fluxo de caixa)
- Sistema de comissões para profissionais
- Relatórios e dashboards analíticos

### Características Principais
- ✅ **PWA (Progressive Web App)** - Funciona offline e pode ser instalado
- ✅ **Mobile-First** - Otimizado para celular e tablet
- ✅ **Multi-tenancy** - Suporta múltiplas clínicas
- ✅ **Sistema de Notificações Moderno** - Toast e modais mobile-friendly
- ✅ **Upload de Imagens** - Integração com Cloudinary
- ✅ **Real-time** - Dados sincronizados via Firebase

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Frontend
- **Vue.js 3** (Composition API)
- **Vue Router** (navegação)
- **CSS3** (design responsivo)
- **Font Awesome** (ícones)

#### Backend/Database
- **Firebase Authentication** (autenticação)
- **Firestore** (banco de dados NoSQL)
- **Firebase Storage** (arquivos)

#### Hospedagem & CDN
- **Vercel** (deploy e hosting)
- **Cloudinary** (upload e otimização de imagens)

#### Build & Deploy
- **Vite** (build tool)
- **Git/GitHub** (controle de versão)
- **CI/CD** (deploy automático via Vercel)

### Padrão de Arquitetura
- **Composables Pattern** - Lógica reutilizável
- **Component-Based** - Componentes modulares
- **State Management** - Reactive refs compartilhados
- **Multi-tenancy** - Isolamento por `clinicaId`

---

## 📝 Documentação de Funcionalidades

### Documentos Principais

#### 1. `RELACIONAMENTO_FIREBASE.md`
**Descrição**: Diagrama ER e estrutura das coleções Firestore  
**Conteúdo**:
- Coleções do Firebase (anamneses, clientes, agendamentos, etc)
- Relacionamentos entre entidades
- Índices necessários
- Queries otimizadas

#### 2. `DIAGRAMA_IMPLEMENTADO.md`
**Descrição**: Confirmação da implementação do diagrama ER  
**Conteúdo**:
- Status de implementação de cada entidade
- Relacionamentos implementados
- Foreign keys e referências

#### 3. `GUIA_FICHAS_CLIENTES.md`
**Descrição**: Sistema de fichas/anamneses de clientes  
**Conteúdo**:
- Como criar anamnese pública (cliente preenche)
- Como criar anamnese interna (profissional preenche)
- Campos da anamnese
- Upload de fotos
- Sistema de status (pendente/analisada)

#### 4. `SISTEMA_BAIXA_CONTAS.md`
**Descrição**: Sistema de baixa de contas a pagar/receber  
**Conteúdo**:
- Como dar baixa em contas
- Registro de pagamentos/recebimentos
- Integração com fluxo de caixa
- Controle de status (pendente/pago/parcial)

#### 5. `PARCELAMENTO_SISTEMA.md`
**Descrição**: Sistema de parcelamento de despesas e receitas  
**Conteúdo**:
- Como criar contas parceladas
- Geração automática de parcelas
- Controle de vencimentos
- Funções do composable

#### 6. `INCONSISTENCIAS_CORRIGIDAS.md`
**Descrição**: Correções de inconsistências de formulários  
**Conteúdo**:
- Problemas identificados
- Soluções implementadas
- Padronização de formulários

#### 7. `FIRESTORE_RULES_GUIDE.md` *(Deletado)*
**Descrição**: Guia de regras de segurança do Firestore  
**Status**: Substituído por `APLICAR_REGRAS_FIREBASE.md`

#### 8. `APLICAR_REGRAS_FIREBASE.md`
**Descrição**: Como aplicar regras de segurança no Firebase  
**Conteúdo**:
- Regras de segurança atuais
- Como atualizar via console Firebase
- Autenticação e autorização
- Regras por coleção

#### 9. `SOLUCAO_UPLOAD_CLOUDINARY.md`
**Descrição**: Implementação de upload de imagens via Cloudinary  
**Conteúdo**:
- Configuração do Cloudinary
- Presets de upload
- Compressão de imagens
- Tratamento de erros
- Upload profiles vs anamneses

#### 10. `SUBSTITUICOES_POPUPS_PENDENTES.md`
**Descrição**: Controle de substituição de popups por notificações mobile  
**Conteúdo**:
- Arquivos já atualizados
- Arquivos pendentes
- Padrões de substituição
- Progresso da migração

---

## 🧩 Componentes Vue

### Views (Páginas Principais)

#### 📁 **Cadastros**
1. **`NovaAnamnese.vue`**
   - Criação de anamnese pela profissional
   - Upload de foto do paciente
   - Formulário completo de anamnese
   - Integração com `usePacientes`

2. **`AnamneseCliente.vue`**
   - Anamnese pública para clientes
   - Link público compartilhável
   - Formulário simplificado
   - Upload de múltiplas fotos

3. **`ListaAnamneses.vue`**
   - Lista de pacientes cadastrados
   - Filtros e paginação
   - Sistema de busca
   - Ações: ver detalhes, editar, excluir

4. **`DetalhesAnamnese.vue`**
   - Visualização completa da anamnese
   - Foto do paciente
   - Dados pessoais e histórico médico
   - Status de análise

5. **`EditarPaciente.vue`**
   - Edição de dados do paciente
   - Upload/alteração de foto
   - Atualização de anamnese
   - Sincronização com agendamentos

6. **`CatalogoProcedimentos.vue`**
   - CRUD de procedimentos estéticos
   - Categorias (facial, corporal, capilar, etc)
   - Valores e durações
   - Produtos utilizados
   - Filtros e paginação

7. **`Produtos.vue`**
   - CRUD de produtos
   - Controle de estoque
   - Alertas de validade
   - Movimentação de estoque
   - Preços (custo e venda)

8. **`Fornecedores.vue`**
   - CRUD de fornecedores
   - Dados de contato
   - Status ativo/inativo

9. **`Profissionais.vue`**
   - CRUD de profissionais
   - Especialidades
   - Configuração de comissões
   - Registro profissional

#### 📁 **Atendimento**
10. **`Agenda.vue`**
    - Calendário de agendamentos
    - Visualização semanal e mensal
    - CRUD de agendamentos
    - Status (confirmado, realizado, cancelado)
    - Upload de foto do paciente no agendamento
    - Filtros por profissional/procedimento

11. **`RegistrarAtendimento.vue`** *(Removido do menu)*
    - Registro de atendimento avulso
    - Múltiplos procedimentos
    - Controle financeiro
    - Baixa automática de estoque

12. **`RegistrarAtendimentoAgendado.vue`**
    - Lista de atendimentos agendados
    - Registro de atendimento para agendados
    - Filtros por cliente e data
    - Status de confirmação
    - Ícones no combobox

#### 📁 **Financeiro**
13. **`Financeiro.vue`**
    - Dashboard financeiro
    - Resumo de receitas e despesas
    - Saldo do período
    - Cards informativos

14. **`ContasPagar.vue`**
    - Contas a pagar
    - Controle de vencimentos
    - Baixa de contas
    - Categorização

15. **`ContasReceber.vue`**
    - Contas a receber
    - Controle de recebimentos
    - Baixa de contas
    - Categorização

16. **`FluxoCaixa.vue`**
    - Movimentações financeiras
    - Entradas e saídas
    - Saldo consolidado
    - Filtros por período

17. **`PlanoContas.vue`**
    - Categorias financeiras
    - Plano de contas padrão
    - Personalização de categorias

18. **`DespesasRecorrentes.vue`**
    - Despesas fixas mensais
    - Geração automática de contas
    - Controle de vencimentos

19. **`EntradaProdutos.vue`**
    - Entrada de produtos no estoque
    - Registro de compras
    - Geração de conta a pagar
    - Associação com fornecedor

20. **`Comissoes.vue`**
    - Comissões de profissionais
    - Cálculo automático
    - Pagamento de comissões
    - Filtros e relatórios

#### 📁 **Relatórios**
21. **`RelatorioAtendimentos.vue`**
    - Relatório de atendimentos
    - Filtros por período
    - Exportação (planejada)

22. **`Dashboard.vue`**
    - KPIs principais
    - Gráficos e estatísticas
    - Visão geral do negócio

#### 📁 **Configurações**
23. **`Configuracoes.vue`**
    - Dados da clínica
    - Informações do proprietário
    - Upload de foto do profissional
    - Horários de atendimento

24. **`LimpezaDados.vue`**
    - Limpeza de dados de teste
    - Exclusão em massa
    - Confirmações de segurança

#### 📁 **Autenticação**
25. **`Login.vue`**
    - Tela de login
    - Autenticação Firebase
    - Recuperação de senha

26. **`Cadastro.vue`**
    - Cadastro de nova clínica
    - Criação de conta
    - Inicialização de dados

#### 📁 **Home**
27. **`Home.vue`**
    - Página inicial
    - Botões de acesso rápido
    - Informações da clínica
    - Cards de funcionalidades

---

### Componentes Reutilizáveis

#### **Navegação**
1. **`Sidebar.vue`**
   - Menu lateral desktop
   - Navegação por módulos
   - Indicador de anamneses pendentes
   - Botão de collapse
   - Ajuste dinâmico de espaço

2. **`MobileMenu.vue`**
   - Menu mobile (bottom navigation)
   - Ícones touch-friendly
   - Navegação responsiva

3. **`VoltarHome.vue`**
   - Botão de voltar para Home
   - Reutilizável em todas as páginas

#### **Filtros e Paginação**
4. **`Filtros.vue`**
   - Sistema de filtros universal
   - Layout mobile/desktop
   - Filtros colapsáveis no mobile
   - Busca, status, categoria, data

5. **`Paginacao.vue`**
   - Controles de paginação
   - Layout mobile/desktop
   - Seleção de itens por página
   - Navegação entre páginas

#### **Notificações (Sistema Novo - Mobile-Friendly)**
6. **`Toast.vue`**
   - Notificações toast
   - 4 tipos: success, error, warning, info
   - Animações suaves
   - Auto-dismiss configurável
   - Posicionamento responsivo

7. **`ConfirmModal.vue`**
   - Modal de confirmação
   - Botões touch-friendly (48px)
   - 4 tipos visuais
   - Backdrop blur
   - Layout empilhado no mobile

8. **`PromptModal.vue`**
   - Modal de input
   - Suporte a vários tipos de input
   - Validação
   - Focus automático
   - Enter para confirmar

---

## 🔧 Composables (Lógica Reutilizável)

### Composables Principais

1. **`useAuth.js`**
   - Autenticação Firebase
   - Login/Logout
   - Gerenciamento de sessão
   - Guards de rota

2. **`useClinica.js`**
   - Gerenciamento do `clinicaId`
   - Multi-tenancy
   - Inicialização de clínica

3. **`usePacientes.js`**
   - CRUD de pacientes
   - Busca ou criação de cliente
   - Atualização de dados
   - Incremento de contadores

4. **`useProcedimentos.js`**
   - CRUD de procedimentos
   - Catálogo de procedimentos
   - Busca e filtros
   - Estatísticas

5. **`useProdutos.js`**
   - CRUD de produtos
   - Controle de estoque
   - Alertas de validade
   - Cálculo de status

6. **`useEstoque.js`**
   - Movimentação de estoque
   - Entrada e saída
   - Histórico de movimentações

7. **`useProfissionais.js`**
   - CRUD de profissionais
   - Dados profissionais
   - Estatísticas

8. **`useAgendamento.js`**
   - CRUD de agendamentos
   - Busca com atualização de fotos
   - Verificação de conflitos
   - Estatísticas

9. **`useFinanceiro.js`**
   - Contas a pagar/receber
   - Movimentações financeiras
   - Parcelamento
   - Baixa de contas

10. **`useComissoes.js`**
    - Cálculo de comissões
    - Pagamento
    - Filtros e relatórios

11. **`useFornecedores.js`**
    - CRUD de fornecedores
    - Gerenciamento de dados

12. **`useCompras.js`**
    - Entrada de produtos
    - Registro de compras

13. **`useDespesasRecorrentes.js`**
    - Despesas fixas
    - Geração automática

14. **`useConfiguracoes.js`**
    - Configurações da clínica
    - Dados do proprietário

15. **`useKPIs.js`**
    - Cálculo de KPIs
    - Métricas do dashboard

16. **`usePaginacao.js`**
    - Lógica de paginação
    - Controle de páginas
    - Itens por página

17. **`useFiltros.js`**
    - Lógica de filtros
    - Busca e ordenação
    - Filtros ativos

18. **`useNotifications.js`** *(NOVO)*
    - Sistema de notificações global
    - Toast, Confirm e Prompt
    - Estado compartilhado
    - Promises para confirmações

---

## 🔥 Firebase e Firestore

### Estrutura de Coleções

#### Principais Coleções

1. **`anamneses`**
   - Fichas de anamnese dos pacientes
   - Campos: nome, telefone, dataNascimento, cpf, email, endereco, doencas, medicamentos, alergias, gestante, lactante, fumante, tipoPele, protetorSolar, exposicaoSol, produtosCosmeticos, objetivos, procedimentosAnteriores, observacoes, fotos, fotoURL, status, origem, clinicaId, clienteId, dataCriacao

2. **`clientes`**
   - Cadastro de clientes/pacientes
   - Campos: nome, telefone, cpf, email, dataNascimento, endereco, fotoURL, ativo, clinicaId, totalAnamneses, dataCriacao, dataAtualizacao

3. **`agendamentos`**
   - Agendamentos de procedimentos
   - Campos: clienteId, clienteNome, pacienteFoto, profissionalId, profissionalNome, procedimentoId, procedimento, dataHora, duracao, valorEstimado, status, observacoes, clinicaId, dataCriacao

4. **`catalogo_procedimentos`**
   - Catálogo de procedimentos oferecidos
   - Campos: nome, categoria, valor, duracao, sessoesRecomendadas, descricao, observacoes, produtosUtilizados, ativo, totalRealizados, clinicaId, dataCriacao, dataAtualizacao

5. **`produtos`**
   - Produtos e insumos
   - Campos: nome, categoria, marca, estoqueAtual, estoqueMinimo, estoqueMaximo, precoCusto, precoVenda, unidade, dataValidade, statusValidade, observacoes, ativo, clinicaId, dataCriacao

6. **`fornecedores`**
   - Fornecedores de produtos
   - Campos: nome, cnpj, telefone, email, endereco, observacoes, ativo, clinicaId, dataCriacao

7. **`profissionais`**
   - Profissionais da clínica
   - Campos: nome, especialidade, registroProfissional, telefone, email, percentualComissao, tipoComissao, observacoes, ativo, clinicaId, dataCriacao

8. **`atendimentos`**
   - Registro de atendimentos realizados
   - Campos: clienteId, clienteNome, profissionalId, profissionalNome, procedimentos[], produtosUtilizados[], valorTotal, formaPagamento, observacoes, clinicaId, dataAtendimento

9. **`contas_pagar`**
   - Contas a pagar
   - Campos: descricao, valor, categoria, vencimento, status, fornecedorId, observacoes, clinicaId, dataCriacao

10. **`contas_receber`**
    - Contas a receber
    - Campos: descricao, valor, categoria, vencimento, status, clienteId, observacoes, clinicaId, dataCriacao

11. **`movimentacoes_financeiras`**
    - Movimentações de caixa
    - Campos: tipo, valor, categoria, descricao, data, clinicaId

12. **`estoque_movimentacoes`**
    - Histórico de movimentações de estoque
    - Campos: produtoId, produtoNome, tipo, quantidade, motivo, clinicaId, data

13. **`comissoes`**
    - Comissões dos profissionais
    - Campos: profissionalId, profissionalNome, atendimentoId, valor, percentual, status, dataPagamento, clinicaId, dataCriacao

14. **`despesas_recorrentes`**
    - Despesas fixas mensais
    - Campos: descricao, valor, categoria, diaVencimento, ativo, clinicaId, dataCriacao

15. **`configuracoes`**
    - Configurações da clínica
    - Campos: nomeClinica, cnpj, endereco, telefone, whatsapp, email, website, nomeProprietario, registroProfissional, fotoProfissional, formacao, experiencia, especialidades, horarioSegSex, horarioSabado, observacoesHorarios, clinicaId

16. **`users`**
    - Usuários do sistema
    - Campos: uid, email, clinicaId, role, dataCriacao

### Regras de Segurança (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function belongsToClinica() {
      return resource.data.clinicaId == request.auth.token.clinicaId;
    }
    
    // Anamneses e Clientes - Acesso público para criação
    match /anamneses/{anamneseId} {
      allow read, write: if true;
    }
    
    match /clientes/{clienteId} {
      allow read, write: if true;
    }
    
    // Demais coleções - Autenticadas e por clínica
    match /agendamentos/{agendamentoId} {
      allow read, write: if isAuthenticated();
    }
    
    match /catalogo_procedimentos/{procedimentoId} {
      allow read, write: if isAuthenticated();
    }
    
    match /produtos/{produtoId} {
      allow read, write: if isAuthenticated();
    }
    
    match /fornecedores/{fornecedorId} {
      allow read, write: if isAuthenticated();
    }
    
    match /profissionais/{profissionalId} {
      allow read, write: if isAuthenticated();
    }
    
    match /atendimentos/{atendimentoId} {
      allow read, write: if isAuthenticated();
    }
    
    match /contas_pagar/{contaId} {
      allow read, write: if isAuthenticated();
    }
    
    match /contas_receber/{contaId} {
      allow read, write: if isAuthenticated();
    }
    
    match /movimentacoes_financeiras/{movId} {
      allow read, write: if isAuthenticated();
    }
    
    match /estoque_movimentacoes/{movId} {
      allow read, write: if isAuthenticated();
    }
    
    match /comissoes/{comissaoId} {
      allow read, write: if isAuthenticated();
    }
    
    match /despesas_recorrentes/{despesaId} {
      allow read, write: if isAuthenticated();
    }
    
    match /configuracoes/{clinicaId} {
      allow read, write: if isAuthenticated();
    }
    
    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Índices Necessários

Para queries complexas, os seguintes índices são necessários:

1. **agendamentos**: `clinicaId` (ASC) + `dataHora` (ASC)
2. **atendimentos**: `clinicaId` (ASC) + `dataAtendimento` (DESC)
3. **contas_pagar**: `clinicaId` (ASC) + `vencimento` (ASC)
4. **contas_receber**: `clinicaId` (ASC) + `vencimento` (ASC)
5. **produtos**: `clinicaId` (ASC) + `statusValidade` (ASC)

---

## 🌐 Integrações Externas

### Cloudinary (Upload de Imagens)

#### Configuração
```javascript
// src/utils/cloudinary.js
cloudName: 'dkliyeyoq'
apiKey: '655279166963564'
uploadPreset: 'pacientes' ou 'profissionais'
```

#### Presets Configurados
1. **`pacientes`** - Para fotos de pacientes/anamneses
2. **`profissionais`** - Para fotos de profissionais

#### Compressão de Imagens
```javascript
// src/utils/imageCompressor.js
- compressProfileImage() - Max 800x800, 80% quality
- compressAnamneseImage() - Max 1920x1920, 85% quality
- isValidImage() - Validação de tipo e tamanho
```

#### Funções Principais
```javascript
// Upload
uploadToCloudinary(file, options)

// Validação
isValidImage(file)

// Compressão
compressProfileImage(file)
compressAnamneseImage(file)
```

### Firebase/Firestore

#### Configuração
```javascript
// src/firebase.js
apiKey: process.env.VITE_FIREBASE_API_KEY
authDomain: "estetica-anamnese.firebaseapp.com"
projectId: "estetica-anamnese"
storageBucket: "estetica-anamnese.appspot.com"
messagingSenderId: "..."
appId: "..."
```

### Vercel (Deploy)

#### Configuração
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Deploy**: Automático via Git push

---

## 📖 Guias e Tutoriais

### Guias de Uso

#### Como Criar uma Anamnese Pública
1. Acessar `/anamnese-cliente`
2. Preencher formulário
3. Fazer upload de fotos (opcional)
4. Submeter
5. Sistema cria/atualiza cliente automaticamente

#### Como Registrar um Atendimento
1. Acessar `Agenda` ou `Registrar Atendimento Agendado`
2. Selecionar cliente
3. Selecionar procedimento(s)
4. Definir profissional
5. Preencher valores e forma de pagamento
6. Salvar (estoque baixado automaticamente)

#### Como Gerenciar Estoque
1. **Entrada**: Usar `Entrada de Produtos`
2. **Saída Manual**: Usar botão de movimentação em `Produtos`
3. **Saída Automática**: Ocorre ao registrar atendimento
4. **Alertas**: Dashboard mostra produtos vencendo/vencidos

#### Como Configurar Comissões
1. Cadastrar profissional em `Profissionais`
2. Definir percentual de comissão
3. Comissões geradas automaticamente ao registrar atendimento
4. Pagar comissões em `Comissões`

---

## 📁 Estrutura de Pastas

```
estetica-anamnese/
├── public/
│   ├── favicon.ico
│   └── manifest.json (PWA)
│
├── src/
│   ├── assets/          # Imagens, CSS global
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Sidebar.vue
│   │   ├── MobileMenu.vue
│   │   ├── VoltarHome.vue
│   │   ├── Filtros.vue
│   │   ├── Paginacao.vue
│   │   ├── Toast.vue
│   │   ├── ConfirmModal.vue
│   │   └── PromptModal.vue
│   │
│   ├── composables/     # Lógica reutilizável
│   │   ├── useAuth.js
│   │   ├── useClinica.js
│   │   ├── usePacientes.js
│   │   ├── useProcedimentos.js
│   │   ├── useProdutos.js
│   │   ├── useEstoque.js
│   │   ├── useProfissionais.js
│   │   ├── useAgendamento.js
│   │   ├── useFinanceiro.js
│   │   ├── useComissoes.js
│   │   ├── useFornecedores.js
│   │   ├── useCompras.js
│   │   ├── useDespesasRecorrentes.js
│   │   ├── useConfiguracoes.js
│   │   ├── useKPIs.js
│   │   ├── usePaginacao.js
│   │   ├── useFiltros.js
│   │   └── useNotifications.js
│   │
│   ├── utils/           # Funções utilitárias
│   │   ├── cloudinary.js
│   │   └── imageCompressor.js
│   │
│   ├── views/           # Páginas/Views
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Cadastro.vue
│   │   ├── NovaAnamnese.vue
│   │   ├── AnamneseCliente.vue
│   │   ├── ListaAnamneses.vue
│   │   ├── DetalhesAnamnese.vue
│   │   ├── EditarPaciente.vue
│   │   ├── CatalogoProcedimentos.vue
│   │   ├── Produtos.vue
│   │   ├── Fornecedores.vue
│   │   ├── Profissionais.vue
│   │   ├── Agenda.vue
│   │   ├── RegistrarAtendimento.vue (removido do menu)
│   │   ├── RegistrarAtendimentoAgendado.vue
│   │   ├── Financeiro.vue
│   │   ├── ContasPagar.vue
│   │   ├── ContasReceber.vue
│   │   ├── FluxoCaixa.vue
│   │   ├── PlanoContas.vue
│   │   ├── DespesasRecorrentes.vue
│   │   ├── EntradaProdutos.vue
│   │   ├── Comissoes.vue
│   │   ├── RelatorioAtendimentos.vue
│   │   ├── Dashboard.vue
│   │   ├── Configuracoes.vue
│   │   └── LimpezaDados.vue
│   │
│   ├── App.vue          # Componente raiz
│   ├── main.js          # Entry point + Router
│   └── firebase.js      # Configuração Firebase
│
├── firestore.rules      # Regras de segurança
├── package.json         # Dependências
├── vite.config.js       # Configuração Vite
├── vercel.json          # Configuração Vercel
│
└── Documentação/
    ├── RELACIONAMENTO_FIREBASE.md
    ├── DIAGRAMA_IMPLEMENTADO.md
    ├── GUIA_FICHAS_CLIENTES.md
    ├── SISTEMA_BAIXA_CONTAS.md
    ├── PARCELAMENTO_SISTEMA.md
    ├── INCONSISTENCIAS_CORRIGIDAS.md
    ├── APLICAR_REGRAS_FIREBASE.md
    ├── SOLUCAO_UPLOAD_CLOUDINARY.md
    ├── SUBSTITUICOES_POPUPS_PENDENTES.md
    └── DOCUMENTACAO_COMPLETA_PROJETO.md (este arquivo)
```

---

## 🔄 Fluxos de Dados Principais

### Fluxo de Criação de Anamnese

1. Cliente acessa `/anamnese-cliente` ou profissional acessa `/nova-anamnese`
2. Preenche formulário
3. Faz upload de foto (opcional)
4. Submit → `usePacientes.buscarOuCriarCliente()`
5. Se foto: `compressAnamneseImage()` → `uploadToCloudinary()`
6. Salva em `anamneses` collection
7. Atualiza/cria em `clientes` collection
8. Incrementa contador `totalAnamneses` do cliente

### Fluxo de Agendamento

1. Acessa `/agenda`
2. Clica em horário ou em agendamento existente
3. Preenche modal:
   - Cliente (busca em `clientes`)
   - Profissional (busca em `profissionais`)
   - Procedimento (busca em `catalogo_procedimentos`)
   - Data/hora/status
4. Pode fazer upload de foto do paciente
5. Salva em `agendamentos` collection com `clienteId`
6. Na próxima carga, `buscarAgendamentos()` busca foto atualizada de `clientes`

### Fluxo de Atendimento

1. Acessa `/registrar-atendimento-agendado` ou `/registrar-atendimento`
2. Seleciona/busca cliente
3. Adiciona procedimento(s)
4. Sistema carrega produtos utilizados do procedimento
5. Define valores, forma de pagamento
6. Salva:
   - Cria documento em `atendimentos`
   - Dá baixa automática no estoque de produtos
   - Cria movimentação em `estoque_movimentacoes`
   - Gera comissão em `comissoes` (se profissional configurado)
   - Cria/atualiza conta a receber (se parcelado)
   - Atualiza contador `totalRealizados` do procedimento

### Fluxo Financeiro

#### Entrada de Produto
1. Acessa `/entrada-produtos`
2. Seleciona fornecedor
3. Adiciona produtos e quantidades
4. Define valor total e forma de pagamento
5. Salva:
   - Atualiza `estoqueAtual` em `produtos`
   - Cria `estoque_movimentacoes` (entrada)
   - Cria `contas_pagar` (se parcelado/a prazo)

#### Baixa de Conta
1. Acessa `/contas-pagar` ou `/contas-receber`
2. Clica em "Dar Baixa"
3. Confirma pagamento/recebimento
4. Sistema:
   - Atualiza `status` para "pago"
   - Registra `dataPagamento`
   - Cria `movimentacoes_financeiras`

---

## 🎨 Design System

### Cores Principais
```css
/* Primárias */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--primary-color: #667eea;
--secondary-color: #764ba2;

/* Tons de Cinza */
--text-primary: #1d1d1f;
--text-secondary: #6e6e73;
--text-tertiary: #8e8e93;
--border-color: #d2d2d7;
--background-light: #f5f5f7;

/* Estados */
--success: #28a745;
--error: #dc3545;
--warning: #ffc107;
--info: #17a2b8;
```

### Tipografia
```css
/* Família */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

/* Tamanhos */
--font-xs: 12px;
--font-sm: 14px;
--font-base: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 28px;
```

### Espaçamentos
```css
/* Touch-friendly (mínimo 48px para botões) */
--touch-min: 48px;
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### Bordas e Sombras
```css
/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
```

---

## 🚀 Deploy e CI/CD

### Processo de Deploy

1. **Commit local**: `git commit -m "mensagem"`
2. **Push para GitHub**: `git push origin main`
3. **Vercel detecta push**: Inicia build automático
4. **Build**: `npm run build` (Vite)
5. **Deploy**: Publica em produção
6. **URL**: https://estetica-anamnese.vercel.app

### Variáveis de Ambiente (Vercel)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=estetica-anamnese.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=estetica-anamnese
VITE_FIREBASE_STORAGE_BUCKET=estetica-anamnese.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDINARY_CLOUD_NAME=dkliyeyoq
VITE_CLOUDINARY_API_KEY=655279166963564
```

---

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas

- ✅ Sistema de autenticação
- ✅ Multi-tenancy (múltiplas clínicas)
- ✅ CRUD completo de:
  - ✅ Pacientes/Anamneses
  - ✅ Procedimentos
  - ✅ Produtos
  - ✅ Fornecedores
  - ✅ Profissionais
  - ✅ Agendamentos
  - ✅ Atendimentos
- ✅ Sistema financeiro completo
- ✅ Controle de estoque
- ✅ Sistema de comissões
- ✅ Dashboard analítico
- ✅ Upload de imagens (Cloudinary)
- ✅ Sistema de notificações mobile-friendly
- ✅ PWA (Progressive Web App)
- ✅ Design responsivo (mobile-first)
- ✅ Filtros e paginação
- ✅ Relatórios básicos

### 🔄 Em Desenvolvimento

- 🔄 Exportação de relatórios (PDF/Excel)
- 🔄 Notificações push
- 🔄 Chat/Mensagens internas
- 🔄 Integração com WhatsApp
- 🔄 Sistema de agendamento online (cliente)

### 📋 Backlog

- 📋 Múltiplos idiomas (i18n)
- 📋 Tema escuro (dark mode)
- 📋 Backup automático
- 📋 Auditoria de ações
- 📋 Permissões granulares por usuário

---

## 📞 Contato e Suporte

**Desenvolvedor**: Alexandre Grick  
**GitHub**: https://github.com/grickalexandre/estetica-anamnese  
**Vercel**: https://estetica-anamnese.vercel.app

---

## 📝 Changelog

### Versão Atual (Outubro 2025)

#### Adicionado
- ✨ Sistema de notificações mobile-friendly (Toast, ConfirmModal, PromptModal)
- ✨ Componente EditarPaciente.vue completo
- ✨ Atualização automática de foto do paciente na Agenda
- ✨ useNotifications.js composable global
- ✨ Substituição de ~50 popups por notificações modernas nos módulos principais

#### Modificado
- 🔧 Agenda.vue - Sistema de upload de foto do paciente
- 🔧 useAgendamento.js - Busca foto atualizada do cliente
- 🔧 Sidebar.vue - Botão de collapse sempre visível
- 🔧 Todos os botões e inputs - Mínimo 48px (touch-friendly)

#### Corrigido
- 🐛 Foto do paciente não atualizava na Agenda após edição
- 🐛 fileInput is not defined em EditarPaciente
- 🐛 Sidebar collapse button sumindo
- 🐛 Espaço vazio ao retrair menu

#### Removido
- 🗑️ Card "Funcionalidades" da Home
- 🗑️ Botão "Registrar Atendimento" da Agenda
- 🗑️ Menu item "Registrar Atendimento" do Sidebar
- 🗑️ Seção "Observações e Alterações" de DetalhesAnamnese

---

## 🙏 Agradecimentos

Este projeto foi desenvolvido com o objetivo de facilitar a gestão de clínicas de estética, proporcionando uma ferramenta moderna, mobile-first e intuitiva.

**Tecnologias utilizadas com ❤️**:
- Vue.js
- Firebase/Firestore
- Cloudinary
- Vercel
- Font Awesome

---

*Documento gerado em: Outubro 2025*  
*Última atualização: 22/10/2025*

