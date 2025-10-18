# 💳 Sistema de Parcelamento e Múltiplas Formas de Pagamento

## 📋 **Visão Geral**

O sistema agora suporta **parcelamento automático** tanto para contas a pagar quanto para contas a receber, com múltiplas formas de pagamento.

---

## 🏦 **Contas a Pagar (Fornecedores)**

### **Cenário: Compra de R$ 3.000 parcelada em 3x**

```javascript
{
  fornecedorId: "fornecedor-123",
  fornecedorNome: "Fornecedor XYZ",
  descricao: "Compra de produtos",
  valorTotal: 3000,
  numeroParcelas: 3,
  dataVencimentoInicial: "2025-01-15",
  formaPagamento: "boleto",
  categoria: "compra-produtos"
}
```

### **Resultado:**
Sistema cria automaticamente 3 contas a pagar:

| Parcela | Valor    | Vencimento | Status    |
|---------|----------|------------|-----------|
| 1/3     | R$ 1.000 | 15/01/2025 | Pendente  |
| 2/3     | R$ 1.000 | 15/02/2025 | Pendente  |
| 3/3     | R$ 1.000 | 15/03/2025 | Pendente  |

---

## 💰 **Contas a Receber (Clientes)**

### **Cenário: Atendimento de R$ 600 parcelado em 4x no cartão**

```javascript
{
  clienteId: "cliente-456",
  clienteNome: "Maria Silva",
  descricao: "Tratamento estético",
  valorTotal: 600,
  numeroParcelas: 4,
  dataVencimentoInicial: "2025-01-10",
  formaPagamento: "cartao",
  categoria: "atendimentos"
}
```

### **Resultado:**
Sistema cria automaticamente 4 contas a receber:

| Parcela | Valor   | Vencimento | Status    |
|---------|---------|------------|-----------|
| 1/4     | R$ 150  | 10/01/2025 | Pendente  |
| 2/4     | R$ 150  | 10/02/2025 | Pendente  |
| 3/4     | R$ 150  | 10/03/2025 | Pendente  |
| 4/4     | R$ 150  | 10/04/2025 | Pendente  |

---

## 💳 **Formas de Pagamento Suportadas**

### **Para Pagar (Fornecedores):**
- 💵 **Dinheiro** - Pagamento à vista
- 📱 **PIX** - Transferência instantânea
- 💳 **Cartão** - Débito ou crédito
- 📄 **Boleto** - Com possibilidade de parcelamento
- 🏦 **Transferência** - TED/DOC bancária
- 📝 **Cheque** - Para pagamentos futuros

### **Para Receber (Clientes):**
- 💵 **Dinheiro** - À vista
- 📱 **PIX** - Transferência instantânea
- 💳 **Cartão de Débito** - Pagamento único
- 💳 **Cartão de Crédito** - Com parcelamento
- 📄 **Boleto** - Pagamento único ou parcelado
- 📝 **Promissória** - Compromisso de pagamento

---

## 🔄 **Fluxo de Parcelamento**

### **1. Entrada de Produtos (Compra)**
```
Fornecedor → Valor Total → Parcelas → Contas a Pagar
    ↓
Estoque Atualizado
    ↓
N Contas a Pagar Criadas (1 por parcela)
```

### **2. Atendimento ao Cliente**
```
Cliente → Valor Total → Parcelas → Contas a Receber
    ↓
Serviço Registrado
    ↓
N Contas a Receber Criadas (1 por parcela)
```

---

## 📊 **Vantagens do Sistema**

### **✅ Gestão Financeira:**
- **Fluxo de caixa preciso** - cada parcela aparece no mês correto
- **Controle individual** - baixa parcela por parcela
- **Rastreabilidade** - vinculação entre parcelas do mesmo lançamento
- **Projeções** - vencimentos futuros visíveis

### **✅ Flexibilidade:**
- **Qualquer número de parcelas**
- **Múltiplas formas de pagamento**
- **Vencimentos mensais automáticos**
- **Valores calculados automaticamente**

### **✅ Controle:**
- **Status individual** por parcela
- **Baixa independente** - paga parcela por parcela
- **Histórico completo** - todas as movimentações registradas
- **Relatórios detalhados** - por parcela ou total

---

## 🎯 **Como Usar**

### **No Código:**

```javascript
// Importar o composable
const { adicionarContaPagarParcelada, adicionarContaReceberParcelada } = useFinanceiro()

// Criar conta a pagar parcelada
await adicionarContaPagarParcelada({
  fornecedorId: "...",
  fornecedorNome: "...",
  descricao: "...",
  valorTotal: 3000,
  numeroParcelas: 3,
  dataVencimentoInicial: "2025-01-15",
  formaPagamento: "boleto",
  categoria: "compra-produtos"
})

// Criar conta a receber parcelada
await adicionarContaReceberParcelada({
  clienteId: "...",
  clienteNome: "...",
  descricao: "...",
  valorTotal: 600,
  numeroParcelas: 4,
  dataVencimentoInicial: "2025-01-10",
  formaPagamento: "cartao",
  categoria: "atendimentos"
})
```

---

## 📈 **Relatórios Disponíveis**

- **Fluxo de Caixa**: Visualiza todas as parcelas por mês
- **Contas a Pagar**: Lista todas as parcelas pendentes
- **Contas a Receber**: Lista todas as parcelas a receber
- **DRE**: Consolida receitas e despesas considerando parcelas
- **Análise de Tendências**: Projeção baseada em parcelas futuras

---

## 🔐 **Regras do Sistema**

1. **Parcelas são criadas individualmente** no Firestore
2. **Cada parcela tem status independente** (pendente/pago/recebido)
3. **Vencimentos são mensais** (incremento de 1 mês)
4. **Valor da parcela** = Valor Total ÷ Número de Parcelas
5. **ParcelaId único** identifica parcelas do mesmo lançamento
6. **Forma de pagamento** é registrada em cada parcela
7. **Baixa individual** - cada parcela é paga/recebida separadamente

---

## 📝 **Estrutura dos Dados**

### **Conta a Pagar Parcelada:**
```javascript
{
  clinicaId: "estetica-123",
  fornecedorId: "fornecedor-456",
  fornecedorNome: "Fornecedor XYZ",
  descricao: "Compra de produtos",
  valor: 1000,              // Valor desta parcela
  valorTotal: 3000,         // Valor total do lançamento
  numeroParcela: 1,         // Número desta parcela
  totalParcelas: 3,         // Total de parcelas
  parcelaId: "1234567890-0", // ID único do lançamento
  dataVencimento: "2025-01-15",
  formaPagamento: "boleto",
  categoria: "compra-produtos",
  status: "pendente",
  tipo: "despesa"
}
```

---

## 🚀 **Próximos Passos**

As interfaces de usuário serão atualizadas para incluir:
- ✅ Opção de parcelamento ao criar contas
- ✅ Visualização agrupada de parcelas
- ✅ Indicador de parcela (1/3, 2/3, 3/3)
- ✅ Filtro por lançamento parcelado
- ✅ Resumo de parcelas pendentes

---

## ⚠️ **Importante**

- **Não é possível** editar o número de parcelas após criação
- **Para cancelar**, exclua cada parcela individualmente
- **Baixa automática** não se aplica a parcelas futuras
- **Cada parcela** gera sua própria movimentação no fluxo de caixa


