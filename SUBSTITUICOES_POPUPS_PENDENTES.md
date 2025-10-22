# Substituições de Popups Pendentes

## ✅ Arquivos Já Atualizados
1. ✅ Agenda.vue
2. ✅ CatalogoProcedimentos.vue  
3. ✅ RegistrarAtendimento.vue
4. ✅ Fornecedores.vue

## 📋 Arquivos Pendentes

### Produtos.vue (6 alerts, 1 confirm)
- Import: `useNotifications`
- Substituir validações por `showWarning()`
- Substituir sucessos por `showSuccess()`
- Substituir erros por `showError()`
- Substituir confirm de desativar por `showConfirm()`

### Profissionais.vue (9 alerts, 3 confirms)
- Import: `useNotifications`
- Validações → `showWarning()`
- Sucessos → `showSuccess()`
- Erros → `showError()`  
- Confirms (desativar, reativar, excluir) → `showConfirm()` com tipos apropriados

### RegistrarAtendimentoAgendado.vue (3 alerts)
- Import: `useNotifications`
- Validações → `showWarning()`
- Sucessos → `showSuccess()`
- Erros → `showError()`

### Comissoes.vue (4 alerts)
- Import: `useNotifications`
- Validações → `showWarning()`
- Sucessos → `showSuccess()`
- Erros → `showError()`

### Demais Arquivos Financeiros
- ContasReceber.vue (5 alerts, 1 confirm)
- ContasPagar.vue (5 alerts, 1 confirm)
- PlanoContas.vue (4 alerts, 2 confirms)
- FluxoCaixa.vue (2 alerts)
- EntradaProdutos.vue (3 alerts)
- DespesasRecorrentes.vue (5 alerts, 3 confirms)

### Outros
- DetalhesAnamnese.vue (1 alert)
- RelatorioAtendimentos.vue (1 alert)
- LimpezaDados.vue (1 alert, 6 confirms, 1 prompt)

## 🎯 Status
**Concluídos**: 4/19 arquivos (21%)
**Pendentes**: 15/19 arquivos (79%)
**Total de Popups Substituídos**: ~20 / ~130

## 📝 Próximos Passos
Continuar implementando as substituições nos arquivos restantes seguindo o padrão estabelecido.

