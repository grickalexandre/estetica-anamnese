# 💰 Sistema de Baixa de Contas (Pagamento/Recebimento)

## ✅ **Sim! O sistema já tem baixa automática implementada!**

---

## 🔄 **Como Funciona:**

### **📤 Contas a Pagar - Baixa (Pagamento)**

Quando você **marca uma conta como "Paga"**, o sistema:

1. ✅ Atualiza o status para **"Pago"**
2. ✅ Registra a **data do pagamento**
3. ✅ Registra o **valor pago** (pode ser diferente do valor original)
4. ✅ **Cria movimentação no Fluxo de Caixa** (saída de dinheiro)
5. ✅ **Atualiza o saldo** automaticamente

### **📥 Contas a Receber - Baixa (Recebimento)**

Quando você **marca uma conta como "Recebida"**, o sistema:

1. ✅ Atualiza o status para **"Recebido"**
2. ✅ Registra a **data do recebimento**
3. ✅ Registra o **valor recebido** (pode ter desconto/acréscimo)
4. ✅ **Cria movimentação no Fluxo de Caixa** (entrada de dinheiro)
5. ✅ **Atualiza o saldo** automaticamente

---

## 📋 **Onde Fazer a Baixa:**

### **Interface de Contas a Pagar:**
```
Financeiro → Contas a Pagar
  ↓
Clica no botão "💰 Pagar" da conta
  ↓
Informa:
  - Data do pagamento
  - Valor pago (se diferente)
  ↓
Sistema registra TUDO automaticamente!
```

### **Interface de Contas a Receber:**
```
Financeiro → Contas a Receber
  ↓
Clica no botão "💵 Receber" da conta
  ↓
Informa:
  - Data do recebimento
  - Valor recebido (se houver desconto)
  ↓
Sistema registra TUDO automaticamente!
```

---

## 💡 **Exemplo Prático:**

### **Cenário 1: Pagar Aluguel**

**Situação:**
- Aluguel de R$ 3.000 vence dia 10/11/2025
- Você paga dia 08/11/2025

**Ação:**
1. Vai em **Contas a Pagar**
2. Encontra "Aluguel do imóvel"
3. Clica em **"💰 Pagar"**
4. Informa data: 08/11/2025
5. Confirma

**Resultado Automático:**
```
✅ Conta marcada como "Paga"
✅ Movimentação registrada: -R$ 3.000 (08/11/2025)
✅ Fluxo de caixa atualizado
✅ Saldo reduzido em R$ 3.000
✅ Aparece no relatório DRE
```

### **Cenário 2: Receber Parcela de Cliente**

**Situação:**
- Cliente Maria deve parcela 2/3 de R$ 100
- Vencimento: 10/12/2025
- Ela paga adiantado dia 05/12/2025

**Ação:**
1. Vai em **Contas a Receber**
2. Encontra "Atendimento: Limpeza de Pele - Maria Silva (2/3)"
3. Clica em **"💵 Receber"**
4. Informa data: 05/12/2025
5. Confirma

**Resultado Automático:**
```
✅ Parcela marcada como "Recebida"
✅ Movimentação registrada: +R$ 100 (05/12/2025)
✅ Fluxo de caixa atualizado
✅ Saldo aumentado em R$ 100
✅ Aparece no relatório DRE
✅ Histórico do cliente atualizado
```

---

## 🎯 **Vantagens do Sistema Atual:**

### **✨ Automação Total:**
- ✅ Não precisa lançar manualmente no fluxo de caixa
- ✅ Não precisa calcular saldo manualmente
- ✅ Não precisa lembrar de atualizar relatórios
- ✅ Tudo vinculado e rastreável

### **💪 Flexibilidade:**
- ✅ Pode pagar valor diferente (desconto/juros)
- ✅ Pode receber valor diferente (desconto)
- ✅ Data real de pagamento/recebimento
- ✅ Cada parcela é independente

### **📊 Relatórios Automáticos:**
- ✅ Fluxo de Caixa mostra tudo
- ✅ DRE consolida automaticamente
- ✅ Análise de Tendências considera tudo
- ✅ Dashboard com KPIs atualizados

---

## 🔍 **Funções Disponíveis no Código:**

```javascript
// Importar
const { baixarContaPagar, baixarContaReceber } = useFinanceiro()

// Baixar conta a pagar
await baixarContaPagar(
  contaId,           // ID da conta
  '2025-11-08',      // Data do pagamento
  3000               // Valor pago (opcional, usa valor original se não informar)
)

// Baixar conta a receber
await baixarContaReceber(
  contaId,           // ID da conta
  '2025-12-05',      // Data do recebimento
  100                // Valor recebido (opcional)
)
```

---

## 📱 **Status Possíveis:**

### **Contas a Pagar:**
- 🔴 **Pendente** - Ainda não foi paga
- 🔴 **Vencida** - Passou do vencimento e não foi paga
- 🟢 **Paga** - Baixa realizada

### **Contas a Receber:**
- 🟡 **Pendente** - Ainda não foi recebida
- 🟡 **Vencida** - Passou do vencimento e não foi recebida
- 🟢 **Recebida** - Baixa realizada

---

## 🚀 **Fluxo Completo:**

```
CRIAR CONTA
    ↓
PENDENTE (aparece em Contas a Pagar/Receber)
    ↓
FAZER BAIXA (clicar em Pagar/Receber)
    ↓
PAGO/RECEBIDO
    ↓
MOVIMENTAÇÃO CRIADA NO FLUXO DE CAIXA
    ↓
SALDO ATUALIZADO
    ↓
RELATÓRIOS ATUALIZADOS
```

---

## ⚡ **Resumo:**

### **✅ O que JÁ funciona:**
- Baixa de contas a pagar ✅
- Baixa de contas a receber ✅
- Registro automático no fluxo de caixa ✅
- Atualização de saldo ✅
- Rastreabilidade total ✅

### **💡 Sugestões de Melhoria:**

Posso adicionar:
1. **Baixa em lote** - marcar várias contas de uma vez
2. **Baixa parcial** - pagar/receber só uma parte
3. **Histórico de baixas** - ver todas as baixas realizadas
4. **Relatório de baixas** - exportar baixas do período
5. **Alerta de vencimentos** - notificar contas próximas do vencimento

**Quer que eu implemente alguma dessas melhorias?** 🤔

