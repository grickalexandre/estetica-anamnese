# 🔗 Relacionamento Completo entre Documentos do Firebase

## 📊 **Diagrama de Relacionamentos**

```
┌─────────────────┐
│    CLINICAS     │ (Raiz - Multi-tenancy)
└────────┬────────┘
         │
         ├──── clinicaId ────┐
         │                   │
         ▼                   ▼
┌─────────────────┐   ┌─────────────────┐
│  CONFIGURACOES  │   │    USUARIOS     │
└─────────────────┘   └─────────────────┘
         │                   │
         │                   │
         └───── clinicaId ───┴──────────────┐
                                            │
         ┌──────────────────────────────────┤
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│   FORNECEDORES  │              │    PACIENTES    │
└────────┬────────┘              └────────┬────────┘
         │                                │
         │ fornecedorId                   │ clienteId
         │                                │
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│    PRODUTOS     │              │   ANAMNESES     │
└────────┬────────┘              └─────────────────┘
         │                                │
         │ produtoId                      │
         │                                │
         ▼                                │
┌─────────────────┐                      │
│CATALOGO_PROCEDIM│                      │
└────────┬────────┘                      │
         │                                │
         │ procedimentoId                 │
         │                                │
         └──────────┬─────────────────────┤
                    │                     │
                    ▼                     │
           ┌─────────────────┐            │
           │  ATENDIMENTOS   │◄───────────┘
           └────────┬────────┘
                    │
                    │ atendimentoId
                    │
         ┌──────────┴──────────┬──────────────┐
         ▼                     ▼              ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ CONTAS_RECEBER  │   │  CONTAS_PAGAR   │   │ MOVIMENTACOES   │
└─────────────────┘   └─────────────────┘   │    _ESTOQUE     │
                                             └─────────────────┘
         │                     │
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ MOVIMENTACOES   │ (Fluxo de Caixa)
           └─────────────────┘
```

---

## 📚 **Detalhamento das Coleções:**

### **1️⃣ CLINICAS** (Raiz do Multi-tenancy)
```javascript
{
  id: "estetica-rho",
  nome: "Clínica Bella",
  slug: "estetica-rho",
  ownerId: "user-uid-123",
  ativo: true,
  contato: { email: "...", telefone: "..." }
}
```
**Relacionamentos:**
- `id` (clinicaId) → usado em TODAS as outras coleções
- `ownerId` → vincula com USUARIOS (uid)

---

### **2️⃣ USUARIOS**
```javascript
{
  uid: "user-uid-123",
  nome: "João Silva",
  email: "joao@clinica.com",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  role: "owner"
}
```
**Relacionamentos:**
- `uid` → usado para autenticação
- `clinicaId` → vincula com CLINICAS

---

### **3️⃣ CONFIGURACOES**
```javascript
{
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  nomeClinica: "Clínica Bella",
  cnpj: "...",
  telefone: "...",
  fotoProfissional: "url-cloudinary"
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS (1:1)

---

### **4️⃣ PACIENTES** (Clientes)
```javascript
{
  id: "paciente-123",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  email: "maria@email.com",
  totalAnamneses: 2,
  totalAtendimentos: 5,
  totalGasto: 1500.00
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `id` (clienteId) → vincula com ANAMNESES, ATENDIMENTOS, CONTAS_RECEBER

---

### **5️⃣ ANAMNESES**
```javascript
{
  id: "anamnese-456",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  email: "maria@email.com",
  tipoPele: "normal",
  fotoURL: "url-cloudinary",
  status: "pendente"
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `cpf` + `telefone` → cria/atualiza PACIENTES automaticamente

---

### **6️⃣ FORNECEDORES**
```javascript
{
  id: "fornecedor-789",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  nome: "Distribuidora ABC",
  cnpj: "12.345.678/0001-00",
  telefone: "(11) 98888-8888",
  email: "contato@abc.com",
  categoria: "cosmeticos",
  ativo: true
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `id` (fornecedorId) → vincula com CONTAS_PAGAR, COMPRAS, PRODUTOS

---

### **7️⃣ PRODUTOS**
```javascript
{
  id: "produto-abc",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
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
  ativo: true
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `id` (produtoId) → vincula com:
  - MOVIMENTACOES_ESTOQUE
  - CATALOGO_PROCEDIMENTOS (produtos utilizados)
  - ATENDIMENTOS (produtos utilizados)
  - COMPRAS

---

### **8️⃣ MOVIMENTACOES_ESTOQUE**
```javascript
{
  id: "mov-estoque-111",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  produtoId: "produto-abc",   // ← vincula com PRODUTOS
  produtoNome: "Creme Hidratante",
  tipo: "saida", // entrada ou saida
  quantidade: 50,
  motivo: "Utilizado em: Limpeza de Pele - Cliente: Maria Silva",
  valorCusto: 25.00,
  data: Timestamp
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `produtoId` → vincula com PRODUTOS

---

### **9️⃣ CATALOGO_PROCEDIMENTOS**
```javascript
{
  id: "proc-xyz",
  clinicaId: "estetica-rho", // ← vincula com CLINICAS
  nome: "Limpeza de Pele Profunda",
  descricao: "...",
  preco: 300.00,
  duracao: 60, // minutos
  produtosUtilizados: [ // ← vincula com PRODUTOS
    {
      produtoId: "produto-abc",
      produtoNome: "Creme Hidratante",
      quantidade: 50,
      unidade: "ml"
    }
  ],
  totalRealizados: 12,
  ativo: true
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `id` (procedimentoId) → vincula com ATENDIMENTOS
- `produtosUtilizados[].produtoId` → vincula com PRODUTOS

---

### **🔟 ATENDIMENTOS** (Centro de Integração)
```javascript
{
  id: "atend-555",
  clinicaId: "estetica-rho",           // ← vincula com CLINICAS
  clienteId: "paciente-123",           // ← vincula com PACIENTES
  clienteNome: "Maria Silva",
  procedimentoId: "proc-xyz",          // ← vincula com CATALOGO_PROCEDIMENTOS
  procedimentoNome: "Limpeza de Pele",
  profissional: "Dr. João",
  data: Timestamp,
  valorCobrado: 300.00,
  formaPagamento: "credito",
  numeroParcelas: 3,
  pago: false,
  produtosUtilizados: [                // ← vincula com PRODUTOS
    {
      produtoId: "produto-abc",
      produtoNome: "Creme Hidratante",
      quantidade: 50,
      unidade: "ml"
    }
  ],
  custoProdutos: 33.00,
  observacoes: "..."
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `clienteId` → vincula com PACIENTES
- `procedimentoId` → vincula com CATALOGO_PROCEDIMENTOS
- `produtosUtilizados[].produtoId` → vincula com PRODUTOS
- `id` (atendimentoId) → vincula com CONTAS_RECEBER, CONTAS_PAGAR

---

### **1️⃣1️⃣ CONTAS_RECEBER**
```javascript
{
  id: "receber-777",
  clinicaId: "estetica-rho",     // ← vincula com CLINICAS
  clienteId: "paciente-123",     // ← vincula com PACIENTES
  clienteNome: "Maria Silva",
  atendimentoId: "atend-555",    // ← vincula com ATENDIMENTOS
  descricao: "Atendimento: Limpeza de Pele - Maria Silva",
  valor: 100.00,
  valorTotal: 300.00,
  numeroParcela: 1,
  totalParcelas: 3,
  parcelaId: "1729260000-0",     // ← agrupa parcelas do mesmo lançamento
  dataVencimento: Timestamp,
  formaPagamento: "credito",
  categoria: "atendimentos",
  status: "pendente", // ou "recebido"
  dataRecebimento: null,
  valorRecebido: null
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `clienteId` → vincula com PACIENTES
- `atendimentoId` → vincula com ATENDIMENTOS
- `parcelaId` → agrupa parcelas do mesmo lançamento
- `id` (contaId) → vincula com MOVIMENTACOES (quando recebido)

---

### **1️⃣2️⃣ CONTAS_PAGAR**
```javascript
{
  id: "pagar-888",
  clinicaId: "estetica-rho",       // ← vincula com CLINICAS
  fornecedorId: "fornecedor-789",  // ← vincula com FORNECEDORES
  fornecedorNome: "Distribuidora ABC",
  compraId: "compra-999",          // ← vincula com COMPRAS
  atendimentoId: "atend-555",      // ← vincula com ATENDIMENTOS (custos)
  descricao: "Compra de produtos - Distribuidora ABC - NF: 12345",
  valor: 1000.00,
  valorTotal: 3000.00,
  numeroParcela: 1,
  totalParcelas: 3,
  parcelaId: "1729260100-0",       // ← agrupa parcelas do mesmo lançamento
  dataVencimento: Timestamp,
  formaPagamento: "boleto",
  categoria: "compra-produtos",
  status: "pendente", // ou "pago"
  dataPagamento: null,
  valorPago: null
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `fornecedorId` → vincula com FORNECEDORES
- `compraId` → vincula com COMPRAS
- `atendimentoId` → vincula com ATENDIMENTOS (quando é custo de produto)
- `parcelaId` → agrupa parcelas do mesmo lançamento
- `id` (contaId) → vincula com MOVIMENTACOES (quando pago)

---

### **1️⃣3️⃣ COMPRAS** (Entrada de Produtos)
```javascript
{
  id: "compra-999",
  clinicaId: "estetica-rho",       // ← vincula com CLINICAS
  fornecedorId: "fornecedor-789",  // ← vincula com FORNECEDORES
  fornecedorNome: "Distribuidora ABC",
  data: Timestamp,
  numeroNota: "12345",
  formaPagamento: "boleto",
  numeroParcelas: 3,
  valorTotal: 3000.00,
  pago: false,
  dataVencimento: "2025-11-10",
  produtos: [                      // ← vincula com PRODUTOS
    {
      produtoId: "produto-abc",
      produtoNome: "Creme Hidratante",
      quantidade: 100,
      valorUnitario: 25.00,
      subtotal: 2500.00
    }
  ],
  observacoes: "..."
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `fornecedorId` → vincula com FORNECEDORES
- `produtos[].produtoId` → vincula com PRODUTOS
- `id` (compraId) → vincula com CONTAS_PAGAR

---

### **1️⃣4️⃣ MOVIMENTACOES** (Fluxo de Caixa)
```javascript
{
  id: "mov-111",
  clinicaId: "estetica-rho",  // ← vincula com CLINICAS
  tipo: "entrada", // ou "saida"
  valor: 100.00,
  descricao: "Recebimento de Maria Silva - Parcela 1/3",
  categoria: "atendimentos",
  data: Timestamp,
  contaId: "receber-777",     // ← vincula com CONTAS_RECEBER ou CONTAS_PAGAR
  tipoConta: "receber" // ou "pagar"
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `contaId` → vincula com CONTAS_RECEBER ou CONTAS_PAGAR
- Criado automaticamente quando:
  - Conta a receber é marcada como "recebido"
  - Conta a pagar é marcada como "pago"

---

### **1️⃣5️⃣ AGENDAMENTOS**
```javascript
{
  id: "agend-222",
  clinicaId: "estetica-rho",        // ← vincula com CLINICAS
  pacienteId: "paciente-123",       // ← vincula com PACIENTES
  pacienteNome: "Maria Silva",
  procedimentoId: "proc-xyz",       // ← vincula com CATALOGO_PROCEDIMENTOS
  procedimentoNome: "Limpeza de Pele",
  dataHora: Timestamp,
  duracao: 60,
  profissional: "Dr. João",
  status: "confirmado", // pendente, confirmado, realizado, cancelado
  observacoes: "..."
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `pacienteId` → vincula com PACIENTES
- `procedimentoId` → vincula com CATALOGO_PROCEDIMENTOS

---

### **1️⃣6️⃣ DESPESAS_RECORRENTES**
```javascript
{
  id: "recorrente-333",
  clinicaId: "estetica-rho",        // ← vincula com CLINICAS
  descricao: "Aluguel do imóvel",
  categoria: "aluguel",
  valor: 3000.00,
  diaVencimento: 10,
  formaPagamento: "transferencia",
  periodicidade: "mensal",
  fornecedorId: "fornecedor-789",   // ← vincula com FORNECEDORES (opcional)
  fornecedorNome: "Imobiliária XYZ",
  ativo: true,
  ultimaGeracao: "2025-10-01"
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `fornecedorId` → vincula com FORNECEDORES (opcional)
- Gera automaticamente → CONTAS_PAGAR (mensalmente)

---

### **1️⃣7️⃣ PLANO_CONTAS**
```javascript
{
  id: "categoria-444",
  clinicaId: "estetica-rho",  // ← vincula com CLINICAS
  codigo: "3.01.001",
  nome: "Receitas de Atendimentos",
  tipo: "receita", // receita ou despesa
  nivel: 3,
  pai: "3.01", // código da categoria pai
  ativo: true
}
```
**Relacionamentos:**
- `clinicaId` → vincula com CLINICAS
- `codigo` → usado em CONTAS_PAGAR e CONTAS_RECEBER (categoria)

---

## 🔗 **Fluxos de Relacionamento Completos:**

### **FLUXO 1: Atendimento ao Cliente**
```
1. PACIENTE (criado via anamnese)
   ↓ clienteId
2. ANAMNESE (ficha do paciente)
   ↓ (cadastro)
3. PACIENTE (atualizado)
   ↓ clienteId
4. AGENDAMENTO (opcional)
   ↓ agendamentoId
5. ATENDIMENTO
   ├─ clienteId → PACIENTES
   ├─ procedimentoId → CATALOGO_PROCEDIMENTOS
   ├─ produtosUtilizados[] → PRODUTOS
   └─ atendimentoId ↓
6. CONTAS_RECEBER (3 parcelas)
   ├─ parcela 1/3
   ├─ parcela 2/3
   └─ parcela 3/3
   ↓ (quando recebido)
7. MOVIMENTACOES (3 entradas no fluxo)
   ├─ +R$ 100 (parcela 1)
   ├─ +R$ 100 (parcela 2)
   └─ +R$ 100 (parcela 3)
8. CONTAS_PAGAR (custo dos produtos)
   ↓ (quando marcado como pago)
9. MOVIMENTACOES (-R$ 33)
```

### **FLUXO 2: Compra de Fornecedor**
```
1. FORNECEDOR (cadastrado)
   ↓ fornecedorId
2. COMPRA (entrada de produtos)
   ├─ fornecedorId → FORNECEDORES
   └─ produtos[] → PRODUTOS
   ↓ compraId
3. MOVIMENTACOES_ESTOQUE
   ├─ entrada produto 1
   ├─ entrada produto 2
   └─ entrada produto 3
4. PRODUTOS (estoque atualizado)
5. CONTAS_PAGAR (3 parcelas)
   ├─ parcela 1/3
   ├─ parcela 2/3
   └─ parcela 3/3
   ↓ (quando pago)
6. MOVIMENTACOES (3 saídas no fluxo)
   ├─ -R$ 1.000 (parcela 1)
   ├─ -R$ 1.000 (parcela 2)
   └─ -R$ 1.000 (parcela 3)
```

### **FLUXO 3: Despesa Recorrente (Aluguel)**
```
1. DESPESAS_RECORRENTES (cadastrada uma vez)
   ↓ (geração mensal)
2. CONTAS_PAGAR (gerada automaticamente todo mês)
   ↓ (quando pago)
3. MOVIMENTACOES (-R$ 3.000 todo mês)
```

---

## 📊 **Matriz de Relacionamentos:**

| De ↓ / Para → | CLINICAS | PACIENTES | PRODUTOS | FORNEC | ATEND | C.RECEBER | C.PAGAR | MOVIM |
|---------------|----------|-----------|----------|--------|-------|-----------|---------|-------|
| **CLINICAS** | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PACIENTES** | ✅ | - | - | - | ✅ | ✅ | - | - |
| **PRODUTOS** | ✅ | - | - | - | ✅ | - | - | ✅ |
| **FORNECEDORES** | ✅ | - | ✅ | - | - | - | ✅ | - |
| **ATENDIMENTOS** | ✅ | ✅ | ✅ | - | - | ✅ | ✅ | - |
| **CONTAS_RECEBER** | ✅ | ✅ | - | - | ✅ | - | - | ✅ |
| **CONTAS_PAGAR** | ✅ | - | - | ✅ | ✅ | - | - | ✅ |
| **MOVIMENTACOES** | ✅ | - | - | - | - | ✅ | ✅ | - |

---

## 🎯 **Campos de Vinculação (IDs):**

### **Sempre Presente em TODAS as coleções:**
- `clinicaId` → Isolamento multi-tenancy

### **IDs de Relacionamento:**
- `clienteId` / `pacienteId` → vincula com PACIENTES
- `fornecedorId` → vincula com FORNECEDORES
- `produtoId` → vincula com PRODUTOS
- `procedimentoId` → vincula com CATALOGO_PROCEDIMENTOS
- `atendimentoId` → vincula com ATENDIMENTOS
- `compraId` → vincula com COMPRAS
- `contaId` → vincula com CONTAS_RECEBER ou CONTAS_PAGAR
- `parcelaId` → agrupa parcelas do mesmo lançamento
- `despesaRecorrenteId` → vincula com DESPESAS_RECORRENTES

---

## 🔍 **Exemplo de Consulta Completa:**

### **Ver tudo sobre um paciente:**
```javascript
// 1. Buscar paciente
const paciente = await getPaciente(clienteId)

// 2. Buscar anamneses do paciente
const anamneses = await query(
  collection(db, 'anamneses'),
  where('cpf', '==', paciente.cpf)
)

// 3. Buscar atendimentos do paciente
const atendimentos = await query(
  collection(db, 'atendimentos'),
  where('clienteId', '==', clienteId)
)

// 4. Buscar contas a receber do paciente
const contas = await query(
  collection(db, 'contas_receber'),
  where('clienteId', '==', clienteId)
)

// 5. Buscar agendamentos do paciente
const agendamentos = await query(
  collection(db, 'agendamentos'),
  where('pacienteId', '==', clienteId)
)
```

---

## 📝 **Total de Coleções: 17**

1. ✅ **clinicas** - Clínicas cadastradas
2. ✅ **usuarios** - Usuários do sistema
3. ✅ **configuracoes** - Configurações da clínica
4. ✅ **pacientes** - Clientes/Pacientes (criados via anamnese)
5. ✅ **anamneses** - Fichas de anamnese
6. ✅ **fornecedores** - Fornecedores de produtos
7. ✅ **produtos** - Catálogo de produtos
8. ✅ **movimentacoes_estoque** - Histórico de entrada/saída de produtos
9. ✅ **catalogo_procedimentos** - Procedimentos oferecidos
10. ✅ **atendimentos** - Atendimentos realizados (centro de integração)
11. ✅ **contas_receber** - Contas a receber (com parcelas)
12. ✅ **contas_pagar** - Contas a pagar (com parcelas)
13. ✅ **compras** - Compras de fornecedores
14. ✅ **movimentacoes** - Fluxo de caixa
15. ✅ **agendamentos** - Agenda de atendimentos
16. ✅ **despesas_recorrentes** - Despesas fixas mensais
17. ✅ **plano_contas** - Categorias contábeis

---

## 🎯 **Integridade Referencial:**

### **Quando você EXCLUI:**

- **PACIENTE** → Mantém anamneses e atendimentos (histórico)
- **PRODUTO** → Desativa (não exclui) para manter histórico
- **FORNECEDOR** → Desativa (não exclui) para manter histórico
- **ATENDIMENTO** → Mantém contas geradas (financeiro intacto)
- **CONTA** → Exclui movimentação vinculada também

### **Quando você CRIA:**

- **ANAMNESE** → Cria/Atualiza PACIENTE automaticamente (CPF)
- **ATENDIMENTO** → Cria CONTAS_RECEBER e CONTAS_PAGAR automaticamente
- **COMPRA** → Cria CONTAS_PAGAR e atualiza ESTOQUE automaticamente
- **BAIXA DE CONTA** → Cria MOVIMENTACAO automaticamente
- **DESPESA_RECORRENTE + Gerar** → Cria CONTAS_PAGAR automaticamente

---

## 🔐 **Regras de Segurança (Firestore):**

Todas as coleções têm:
```javascript
allow read, write: if request.auth != null 
                   && resource.data.clinicaId == getUserClinicaId();
```

Isso garante:
- ✅ Apenas usuários autenticados
- ✅ Isolamento total por clínica
- ✅ Dados seguros e privados

---

## 📈 **Estatísticas e Totalizadores:**

### **PACIENTES:**
- `totalAnamneses` → contador de anamneses
- `totalAtendimentos` → contador de atendimentos
- `totalGasto` → soma de todos os valores cobrados

### **CATALOGO_PROCEDIMENTOS:**
- `totalRealizados` → contador de vezes que foi realizado

### **PRODUTOS:**
- `estoqueAtual` → atualizado em cada movimentação
- `totalVendido` → contador de saídas

---

## 🚀 **Fluxo de Dados em Tempo Real:**

```
INTERFACE
    ↓
COMPOSABLE (lógica)
    ↓
FIRESTORE (dados)
    ↓
RELACIONAMENTOS (automáticos)
    ↓
UPDATES (cascata)
    ↓
INTERFACE (atualizada)
```

---

## 📖 **Como Usar os Relacionamentos:**

### **Exemplo: Buscar tudo de um atendimento**
```javascript
// Buscar atendimento
const atendimento = await getDoc(doc(db, 'atendimentos', atendimentoId))

// Com esse atendimento, você tem:
const clienteId = atendimento.clienteId        // → buscar PACIENTES
const procedimentoId = atendimento.procedimentoId // → buscar CATALOGO_PROCEDIMENTOS
const produtosIds = atendimento.produtosUtilizados.map(p => p.produtoId) // → buscar PRODUTOS

// Buscar contas geradas por esse atendimento
const contas = await query(
  collection(db, 'contas_receber'),
  where('atendimentoId', '==', atendimentoId)
)
```

---

## 💡 **Dicas de Performance:**

1. **Sempre filtre por `clinicaId`** - isso usa índices
2. **Use `.where()` para relacionamentos** - mais eficiente
3. **Evite joins** - denormalize quando necessário (ex: `clienteNome`)
4. **Cache em memória** - os composables já fazem isso
5. **Carregue só o necessário** - não carregue todas as coleções

---

## ✅ **Conclusão:**

O sistema tem **relacionamento completo e automático** entre todas as 17 coleções, com:

- ✅ Integridade referencial
- ✅ Cascata de atualizações
- ✅ Rastreabilidade total
- ✅ Isolamento por clínica
- ✅ Performance otimizada

**Tudo está conectado e funcionando automaticamente!** 🎉

