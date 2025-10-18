# ✅ Diagrama de Relacionamentos - IMPLEMENTADO

## 🎯 **Status: 100% Implementado conforme proposta!**

---

## 📊 **Entidades Implementadas (19 coleções):**

### **✅ 1. CLINICA**
```javascript
{
  id: "estetica-rho",
  nome: "Clínica Bella",
  slug: "estetica-rho",
  ownerId: "user-uid-123",
  ativo: true,
  contato: { email, telefone },
  dataCriacao: Timestamp
}
```
**Composable:** `useClinica.js`

---

### **✅ 2. USUARIO**
```javascript
{
  uid: "user-uid-123",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "João Silva",
  email: "joao@clinica.com",
  role: "owner",
  dataCriacao: Timestamp
}
```
**Composable:** `useAuth.js`

---

### **✅ 3. PROFISSIONAL** ⭐ NOVO!
```javascript
{
  id: "prof-123",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "Dr. João Silva",
  especialidade: "dermatologista",
  registroProfissional: "CRM 123456",
  telefone: "(14) 99999-9999",
  email: "joao@clinica.com",
  percentualComissao: 30,
  tipoComissao: "porcentagem",
  totalAtendimentos: 45,
  totalComissoes: 4500.00,
  ativo: true,
  dataCriacao: Timestamp
}
```
**Composable:** `useProfissionais.js`  
**Interface:** `Profissionais.vue` (`/profissionais`)  
**Menu:** Cadastros → Profissionais

---

### **✅ 4. PACIENTE**
```javascript
{
  id: "paciente-123",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  email: "maria@email.com",
  dataNascimento: "1990-05-15",
  endereco: "Rua X, 123",
  totalAnamneses: 2,
  totalAtendimentos: 5,
  totalGasto: 1500.00,
  dataCriacao: Timestamp
}
```
**Composable:** `usePacientes.js`  
**Criado automaticamente via:** `AnamneseCliente.vue`, `NovaAnamnese.vue`

---

### **✅ 5. ANAMNESE**
```javascript
{
  id: "anamnese-456",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  pacienteId: "paciente-123", // ← vincula PACIENTE (auto-criado)
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  email: "maria@email.com",
  dataNascimento: "1990-05-15",
  tipoPele: "normal",
  fotoURL: "cloudinary-url",
  status: "pendente",
  // ... outras respostas
  dataCriacao: Timestamp
}
```
**Composables:** `useAnamneses.js` (implícito)  
**Interfaces:** `AnamneseCliente.vue`, `NovaAnamnese.vue`, `ListaAnamneses.vue`

---

### **✅ 6. AGENDAMENTO**
```javascript
{
  id: "agend-789",
  clinicaId: "estetica-rho",     // ← vincula CLINICA
  pacienteId: "paciente-123",    // ← vincula PACIENTE
  pacienteNome: "Maria Silva",
  profissionalId: "prof-123",    // ← vincula PROFISSIONAL ⭐
  profissionalNome: "Dr. João",
  procedimentoId: "proc-xyz",    // ← vincula PROCEDIMENTO
  procedimentoNome: "Limpeza de Pele",
  dataHora: Timestamp,
  duracao: 60,
  status: "confirmado",
  observacoes: "...",
  dataCriacao: Timestamp
}
```
**Composable:** `useAgendamento.js`  
**Interface:** `Agenda.vue` (`/agenda`)

---

### **✅ 7. ATENDIMENTO** (Centro de Integração)
```javascript
{
  id: "atend-555",
  clinicaId: "estetica-rho",        // ← vincula CLINICA
  clienteId: "paciente-123",        // ← vincula PACIENTE
  clienteNome: "Maria Silva",
  profissionalId: "prof-123",       // ← vincula PROFISSIONAL ⭐
  profissionalNome: "Dr. João Silva",
  procedimentoId: "proc-xyz",       // ← vincula PROCEDIMENTO
  procedimentoNome: "Limpeza de Pele",
  data: Timestamp,
  valorCobrado: 300.00,
  formaPagamento: "credito",
  numeroParcelas: 3,
  pago: false,
  observacao: "...",
  statusFinanceiro: "pendente",
  produtosUtilizados: [             // ← vincula PRODUTO
    { produtoId, produtoNome, quantidade, unidade }
  ],
  custoProdutos: 33.00,
  dataCriacao: Timestamp
}
```
**Composable:** `useProcedimentos.js`  
**Interface:** `RegistrarAtendimento.vue` (`/registrar-atendimento`)  
**Relatório:** `RelatorioAtendimentos.vue` (`/relatorio-atendimentos`)

---

### **✅ 8. PROCEDIMENTO** (CATALOGO_PROCEDIMENTOS)
```javascript
{
  id: "proc-xyz",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "Limpeza de Pele Profunda",
  descricao: "...",
  preco: 300.00,
  duracao: 60,
  categoria: "facial",
  categoriaCodigo: "3.01.001",    // ← vincula PLANO_CONTAS
  categoriaNome: "Receitas Atendimentos",
  produtosUtilizados: [           // ← vincula PRODUTO
    { produtoId, produtoNome, quantidade, unidade }
  ],
  totalRealizados: 12,
  ativo: true,
  dataCriacao: Timestamp
}
```
**Composable:** `useProcedimentos.js`  
**Interface:** `CatalogoProcedimentos.vue` (`/procedimentos`)

---

### **✅ 9. PRODUTO**
```javascript
{
  id: "produto-abc",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "Creme Hidratante",
  categoria: "cosmeticos",
  unidade: "ml",
  estoqueAtual: 500,
  estoqueMinimo: 50,
  estoqueMaximo: 1000,
  precoCusto: 25.00,
  precoVenda: 80.00,
  dataValidade: "2026-12-31",
  statusValidade: "valido",
  totalVendido: 0,
  ativo: true,
  dataCriacao: Timestamp
}
```
**Composable:** `useProdutos.js`  
**Interface:** `Produtos.vue` (`/produtos`)

---

### **✅ 10. MOVIMENTACAO_ESTOQUE**
```javascript
{
  id: "mov-estoque-111",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  produtoId: "produto-abc",   // ← vincula PRODUTO
  produtoNome: "Creme Hidratante",
  tipo: "saida", // entrada ou saida
  quantidade: 50,
  motivo: "Utilizado em: Limpeza de Pele - Cliente: Maria Silva",
  valorCusto: 12.50,
  origem: "atendimento",      // atendimento, compra, ajuste
  referenciaId: "atend-555",  // ID do atendimento ou compra
  observacao: "...",
  data: Timestamp,
  dataCriacao: Timestamp
}
```
**Composable:** `useEstoque.js`  
**Gerado automaticamente em:** Atendimentos e Compras

---

### **✅ 11. FORNECEDOR**
```javascript
{
  id: "fornecedor-789",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  nome: "Distribuidora ABC",
  cnpj: "12.345.678/0001-00",
  cpf: null,
  telefone: "(11) 98888-8888",
  email: "contato@abc.com",
  endereco: "...",
  categoria: "cosmeticos",
  ativo: true,
  dataCriacao: Timestamp
}
```
**Composable:** `useFornecedores.js`  
**Interface:** `Fornecedores.vue` (`/fornecedores`)

---

### **✅ 12. CONTA_RECEBER**
```javascript
{
  id: "receber-777",
  clinicaId: "estetica-rho",     // ← vincula CLINICA
  pacienteId: "paciente-123",    // ← vincula PACIENTE
  clienteNome: "Maria Silva",
  atendimentoId: "atend-555",    // ← vincula ATENDIMENTO
  descricao: "Atendimento: Limpeza de Pele - Maria Silva",
  valor: 100.00,
  valorTotal: 300.00,
  numeroParcela: 1,
  totalParcelas: 3,
  parcelaId: "1729260000-0",
  dataVencimento: Timestamp,
  formaPagamento: "credito",
  categoria: "atendimentos",
  categoriaCodigo: "3.01.001",   // ← vincula PLANO_CONTAS
  categoriaNome: "Receitas Atendimentos",
  status: "pendente",
  dataRecebimento: null,
  valorRecebido: null,
  dataCriacao: Timestamp
}
```
**Composable:** `useFinanceiro.js`  
**Interface:** `ContasReceber.vue` (`/financeiro/contas-receber`)

---

### **✅ 13. CONTA_PAGAR**
```javascript
{
  id: "pagar-888",
  clinicaId: "estetica-rho",       // ← vincula CLINICA
  fornecedorId: "fornecedor-789",  // ← vincula FORNECEDOR
  fornecedorNome: "Distribuidora ABC",
  compraId: "compra-999",          // ← vincula COMPRA
  atendimentoId: "atend-555",      // ← vincula ATENDIMENTO (custos)
  comissaoId: "comissao-456",      // ← vincula COMISSAO ⭐
  descricao: "Compra de produtos - NF: 12345",
  valor: 1000.00,
  valorTotal: 3000.00,
  numeroParcela: 1,
  totalParcelas: 3,
  parcelaId: "1729260100-0",
  dataVencimento: Timestamp,
  formaPagamento: "boleto",
  categoria: "compra-produtos",
  categoriaCodigo: "4.01.001",     // ← vincula PLANO_CONTAS
  categoriaNome: "Compras de Produtos",
  status: "pendente",
  dataPagamento: null,
  valorPago: null,
  dataCriacao: Timestamp
}
```
**Composable:** `useFinanceiro.js`  
**Interface:** `ContasPagar.vue` (`/financeiro/contas-pagar`)

---

### **✅ 14. MOVIMENTACAO_FINANCEIRA** (MOVIMENTACOES - Fluxo de Caixa)
```javascript
{
  id: "mov-111",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  tipo: "entrada", // entrada ou saida
  valor: 100.00,
  descricao: "Recebimento de Maria Silva - Parcela 1/3",
  categoria: "atendimentos",
  data: Timestamp,
  contaOrigem: "receber-777",     // ← vincula CONTA_RECEBER
  contaDestino: null,
  referenciaId: "atend-555",      // ← vincula ATENDIMENTO
  origem: "atendimento",          // atendimento, compra, comissao
  tipoConta: "receber",           // receber ou pagar
  dataCriacao: Timestamp
}
```
**Composable:** `useFinanceiro.js`  
**Interface:** `FluxoCaixa.vue` (`/financeiro/fluxo-caixa`)  
**Gerado automaticamente:** Quando marca conta como pago/recebido

---

### **✅ 15. PLANO_CONTAS**
```javascript
{
  id: "categoria-444",
  clinicaId: "estetica-rho",  // ← vincula CLINICA
  codigo: "3.01.001",
  descricao: "Receitas de Atendimentos",
  tipo: "receita", // receita ou despesa
  nivel: 3,
  pai: "3.01",
  ativo: true,
  dataCriacao: Timestamp
}
```
**Composable:** `usePlanoContas.js`  
**Interface:** `PlanoContas.vue` (`/financeiro/plano-contas`)

---

### **✅ 16. COMISSAO** ⭐ NOVO!
```javascript
{
  id: "comissao-456",
  clinicaId: "estetica-rho",      // ← vincula CLINICA
  profissionalId: "prof-123",     // ← vincula PROFISSIONAL
  profissionalNome: "Dr. João Silva",
  atendimentoId: "atend-555",     // ← vincula ATENDIMENTO
  pacienteId: "paciente-123",     // ← vincula PACIENTE
  pacienteNome: "Maria Silva",
  procedimentoNome: "Limpeza de Pele",
  valorAtendimento: 300.00,
  percentual: 30,
  valorComissao: 90.00,           // 30% de R$ 300
  pago: false,
  dataPagamento: null,
  data: Timestamp,
  dataCriacao: Timestamp
}
```
**Composable:** `useComissoes.js`  
**Interface:** `Comissoes.vue` (`/comissoes`)  
**Menu:** Financeiro → Comissões  
**Gerado automaticamente:** Quando registra atendimento com profissional que tem comissão

---

### **✅ 17. COMPRAS** (Entrada de Produtos)
```javascript
{
  id: "compra-999",
  clinicaId: "estetica-rho",       // ← vincula CLINICA
  fornecedorId: "fornecedor-789",  // ← vincula FORNECEDOR
  fornecedorNome: "Distribuidora ABC",
  data: Timestamp,
  numeroNota: "12345",
  formaPagamento: "boleto",
  numeroParcelas: 3,
  valorTotal: 3000.00,
  pago: false,
  dataVencimento: "2025-11-10",
  produtos: [                      // ← vincula PRODUTO
    { produtoId, produtoNome, quantidade, valorUnitario, subtotal }
  ],
  observacoes: "...",
  dataCriacao: Timestamp
}
```
**Composable:** `useCompras.js`  
**Interface:** `EntradaProdutos.vue` (`/entrada-produtos`)

---

### **✅ 18. DESPESAS_RECORRENTES**
```javascript
{
  id: "recorrente-333",
  clinicaId: "estetica-rho",        // ← vincula CLINICA
  descricao: "Aluguel do imóvel",
  categoria: "aluguel",
  valor: 3000.00,
  diaVencimento: 10,
  formaPagamento: "transferencia",
  periodicidade: "mensal",
  fornecedorId: "fornecedor-789",   // ← vincula FORNECEDOR (opcional)
  fornecedorNome: "Imobiliária XYZ",
  ativo: true,
  ultimaGeracao: "2025-10-01",
  dataCriacao: Timestamp
}
```
**Composable:** `useDespesasRecorrentes.js`  
**Interface:** `DespesasRecorrentes.vue` (`/financeiro/despesas-recorrentes`)  
**Gera automaticamente:** CONTAS_PAGAR mensalmente

---

### **✅ 19. CONFIGURACOES**
```javascript
{
  clinicaId: "estetica-rho",  // ← vincula CLINICA (1:1)
  nomeClinica: "Clínica Bella",
  cnpj: "...",
  telefone: "...",
  email: "...",
  fotoProfissional: "cloudinary-url",
  // ... outras configurações
}
```
**Composable:** `useConfiguracoes.js`  
**Interface:** `Configuracoes.vue` (`/configuracoes`)

---

## 🔗 **RELACIONAMENTOS IMPLEMENTADOS:**

### **✅ CLINICA (Raiz Multi-tenancy)**
```
CLINICA ||--o{ USUARIO           ✅
CLINICA ||--o{ PACIENTE          ✅
CLINICA ||--o{ PROFISSIONAL      ✅ NOVO!
CLINICA ||--o{ FORNECEDOR        ✅
CLINICA ||--o{ PROCEDIMENTO      ✅
CLINICA ||--o{ PRODUTO           ✅
CLINICA ||--o{ PLANO_CONTAS      ✅
```

### **✅ PACIENTE**
```
PACIENTE ||--o{ ANAMNESE         ✅
PACIENTE ||--o{ AGENDAMENTO      ✅
PACIENTE ||--o{ ATENDIMENTO      ✅
PACIENTE ||--o{ CONTA_RECEBER    ✅
```

### **✅ PROFISSIONAL** ⭐ NOVO!
```
PROFISSIONAL ||--o{ AGENDAMENTO  ✅
PROFISSIONAL ||--o{ ATENDIMENTO  ✅
PROFISSIONAL ||--o{ COMISSAO     ✅ NOVO!
```

### **✅ ATENDIMENTO** (Hub Central)
```
ATENDIMENTO ||--o{ CONTA_RECEBER        ✅
ATENDIMENTO ||--o{ MOVIMENTACAO_ESTOQUE ✅
ATENDIMENTO ||--o{ COMISSAO             ✅ NOVO!
ATENDIMENTO ||--o{ CONTA_PAGAR          ✅ (custos)
```

### **✅ FORNECEDOR**
```
FORNECEDOR ||--o{ CONTA_PAGAR    ✅
FORNECEDOR ||--o{ COMPRA         ✅
```

### **✅ PRODUTO**
```
PRODUTO ||--o{ MOVIMENTACAO_ESTOQUE  ✅
PRODUTO ||--o{ PROCEDIMENTO          ✅ (produtosUtilizados)
PRODUTO ||--o{ ATENDIMENTO           ✅ (produtosUtilizados)
```

### **✅ PLANO_CONTAS**
```
PLANO_CONTAS ||--o{ CONTA_RECEBER    ✅
PLANO_CONTAS ||--o{ CONTA_PAGAR      ✅
```

---

## 🎯 **FLUXO COMPLETO IMPLEMENTADO:**

### **Atendimento ao Cliente:**
```
1. PACIENTE (criado via anamnese)
    ↓ clienteId
2. PROFISSIONAL (selecionado)           ⭐ NOVO!
    ↓ profissionalId
3. PROCEDIMENTO (selecionado)
    ↓ procedimentoId + produtosUtilizados
4. ATENDIMENTO (registrado)
    ├─ clienteId → PACIENTE
    ├─ profissionalId → PROFISSIONAL   ⭐ NOVO!
    ├─ procedimentoId → PROCEDIMENTO
    └─ produtosUtilizados → PRODUTOS
    
    Gera automaticamente:
    ├─→ CONTAS_RECEBER (3 parcelas)
    ├─→ CONTAS_PAGAR (custo produtos)
    ├─→ COMISSAO (do profissional)     ⭐ NOVO!
    ├─→ MOVIMENTACAO_ESTOQUE (baixa produtos)
    ├─→ Atualiza PACIENTE (totais)
    ├─→ Atualiza PROFISSIONAL (totais) ⭐ NOVO!
    └─→ Atualiza PROCEDIMENTO (contador)

5. Quando marca CONTA_RECEBER como "recebido"
    └─→ MOVIMENTACAO_FINANCEIRA (entrada)

6. Quando marca CONTA_PAGAR como "pago"
    └─→ MOVIMENTACAO_FINANCEIRA (saída)

7. Quando paga COMISSAO                 ⭐ NOVO!
    └─→ CONTA_PAGAR (despesa comissão)
        └─→ MOVIMENTACAO_FINANCEIRA (saída)
```

---

## 📊 **Comparação: Proposta vs Implementado**

| Entidade | Proposto | Implementado | Status |
|----------|----------|--------------|--------|
| CLINICA | ✅ | ✅ | 100% |
| USUARIO | ✅ | ✅ | 100% |
| PROFISSIONAL | ✅ | ✅ | ⭐ 100% NOVO! |
| PACIENTE | ✅ | ✅ | 100% |
| ANAMNESE | ✅ | ✅ | 100% |
| AGENDAMENTO | ✅ | ✅ | 100% |
| ATENDIMENTO | ✅ | ✅ | 100% |
| PROCEDIMENTO | ✅ | ✅ CATALOGO_PROCEDIMENTOS | 100% |
| PRODUTO | ✅ | ✅ | 100% |
| MOVIMENTACAO_ESTOQUE | ✅ | ✅ | 100% |
| FORNECEDOR | ✅ | ✅ | 100% |
| CONTA_RECEBER | ✅ | ✅ | 100% |
| CONTA_PAGAR | ✅ | ✅ | 100% |
| MOVIMENTACAO_FINANCEIRA | ✅ | ✅ MOVIMENTACOES | 100% |
| PLANO_CONTAS | ✅ | ✅ | 100% |
| COMISSAO | ✅ | ✅ | ⭐ 100% NOVO! |

### **Extras Implementados (não estavam no diagrama):**
- ✅ **COMPRAS** - Gestão de entradas de produtos
- ✅ **DESPESAS_RECORRENTES** - Despesas fixas mensais
- ✅ **CONFIGURACOES** - Configurações da clínica

---

## ✅ **CONCLUSÃO:**

### **✅ 100% CONFORME DIAGRAMA!**

Todos os relacionamentos propostos foram implementados:

1. ✅ **CLINICA** possui: usuarios, pacientes, profissionais, fornecedores, procedimentos, produtos, plano_contas
2. ✅ **PACIENTE** preenche anamnese, agenda, realiza atendimento, gera conta_receber
3. ✅ **PROFISSIONAL** atende agendamento, executa atendimento, recebe comissão ⭐
4. ✅ **ATENDIMENTO** gera conta_receber, consome estoque, gera comissão ⭐
5. ✅ **FORNECEDOR** fornece (conta_pagar)
6. ✅ **PRODUTO** movimentado em estoque
7. ✅ **PLANO_CONTAS** classifica contas_receber e contas_pagar

### **🎉 Sistema Completo e Funcional!**

- 19 coleções no Firebase
- Relacionamentos automáticos
- Integridade referencial
- Multi-tenancy (clinicaId)
- Interfaces completas
- Gestão total: Profissionais, Comissões, Parcelas, Estoque, Financeiro

**Deploy automático iniciado no Vercel!** 🚀

