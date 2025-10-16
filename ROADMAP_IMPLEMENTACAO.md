# 🚀 Roadmap de Implementação - Funcionalidades Prioritárias

Este documento detalha a implementação das 5 funcionalidades prioritárias para completar o sistema.

---

## ✅ STATUS ATUAL

### Módulos Implementados (100%)
- ✅ Sistema de Anamneses (completo)
- ✅ Gestão Financeira (completo)
  - Contas a Pagar/Receber
  - Fluxo de Caixa
  - Plano de Contas (DRE)
  - Relatório DRE com gráficos
  - Análise de Tendências
  - Exportação PDF
- ✅ Multi-tenancy (SaaS)
- ✅ Autenticação e Planos
- ✅ Upload de Imagens (Cloudinary)

### Em Andamento
- 🔄 **useAgendamento.js** - Composable criado (70%)

---

## 📋 FUNCIONALIDADES A IMPLEMENTAR

### 1️⃣ Sistema de Agendamento/Calendário ⭐⭐⭐⭐⭐

**Status:** 🔄 Em desenvolvimento (30% concluído)

**Arquivos a criar:**
- `src/views/Agenda.vue` - Calendário visual
- `src/views/NovoAgendamento.vue` - Formulário de agendamento
- `src/components/CalendarioSemanal.vue` - Componente de calendário

**Funcionalidades:**
```javascript
// Principais features:
- Visualização em calendário (dia/semana/mês)
- Criar/editar/cancelar agendamentos
- Verificação de conflitos de horário
- Status: Confirmado, Aguardando, Realizado, Cancelado
- Cores por tipo de procedimento
- Notificações de lembretes
- Busca de horários disponíveis
- Bloqueio de horários
- Reagendamento com drag-and-drop
```

**Estrutura de Dados (Firestore):**
```javascript
agendamentos: {
  clinicaId: string,
  pacienteNome: string,
  pacienteTelefone: string,
  pacienteEmail: string,
  profissional: string,
  procedimento: string,
  dataHora: timestamp,
  duracao: number, // minutos
  status: 'confirmado' | 'aguardando' | 'realizado' | 'cancelado',
  observacoes: string,
  valorEstimado: number,
  dataCriacao: timestamp,
  motivoCancelamento: string,
  dataRealizacao: timestamp
}
```

**Dependências:**
```json
{
  "@fullcalendar/core": "^6.1.0",
  "@fullcalendar/vue3": "^6.1.0",
  "@fullcalendar/daygrid": "^6.1.0",
  "@fullcalendar/timegrid": "^6.1.0",
  "@fullcalendar/interaction": "^6.1.0"
}
```

---

### 2️⃣ Orçamento Financeiro ⭐⭐⭐⭐⭐

**Status:** ⏳ Aguardando (0%)

**Arquivos a criar:**
- `src/composables/useOrcamento.js`
- `src/views/Orcamento.vue`
- `src/views/OrcamentoVsRealizado.vue`

**Funcionalidades:**
```javascript
// Features principais:
- Definir orçamento mensal por categoria
- Definir orçamento anual
- Comparar orçado vs realizado
- Alertas de estouro (80%, 100%, 120%)
- Projeções baseadas em histórico
- Gráficos de acompanhamento
- Ajustes mensais
- Exportação de relatórios
```

**Estrutura de Dados:**
```javascript
orcamentos: {
  clinicaId: string,
  ano: number,
  mes: number,
  categorias: {
    [categoriaCodigo]: {
      orcado: number,
      realizado: number,
      percentual: number,
      status: 'ok' | 'alerta' | 'estourado'
    }
  },
  totalOrcado: number,
  totalRealizado: number,
  observacoes: string,
  dataCriacao: timestamp,
  dataAtualizacao: timestamp
}
```

**Cálculos Automáticos:**
- Percentual utilizado = (Realizado / Orçado) * 100
- Projeção fim do mês = Realizado / DiasDecorridos * TotalDiasMes
- Alertas automáticos por email/SMS

---

### 3️⃣ Dashboard Analítico com KPIs ⭐⭐⭐⭐

**Status:** ⏳ Aguardando (0%)

**Arquivos a criar:**
- `src/views/DashboardAnalitico.vue`
- `src/composables/useKPIs.js`
- `src/components/CardKPI.vue`
- `src/components/GraficoEvolution.vue`

**KPIs Principais:**
```javascript
// Financeiros:
- Faturamento do mês
- Ticket médio
- Receita por dia útil
- Margem de lucro
- Inadimplência
- Fluxo de caixa projetado

// Operacionais:
- Total de atendimentos
- Taxa de ocupação da agenda
- Taxa de cancelamento
- Taxa de comparecimento
- Tempo médio de atendimento
- Procedimentos mais realizados

// Clientes:
- Novos clientes no mês
- Clientes ativos
- Taxa de retorno
- NPS (satisfação)
- Clientes inativos
- Taxa de conversão

// Profissionais:
- Produtividade por profissional
- Faturamento por profissional
- Procedimentos por profissional
```

**Visualizações:**
- Cards com indicadores
- Gráficos de linha (evolução)
- Gráficos de pizza (distribuição)
- Gráficos de barras (comparativos)
- Heatmaps (dias/horários mais ocupados)
- Funil de conversão

**Comparativos:**
- Mês atual vs mês anterior
- Mês atual vs mesmo mês ano passado
- Acumulado do ano
- Projeções

---

### 4️⃣ Formas de Pagamento ⭐⭐⭐⭐

**Status:** ⏳ Aguardando (0%)

**Arquivos a criar:**
- `src/composables/useFormasPagamento.js`
- `src/views/FormasPagamento.vue`
- Atualizar `ContasPagar.vue` e `ContasReceber.vue`

**Formas de Pagamento:**
```javascript
formasPagamento: [
  { id: 'dinheiro', nome: 'Dinheiro', taxa: 0, diasRecebimento: 0 },
  { id: 'pix', nome: 'PIX', taxa: 0, diasRecebimento: 0 },
  { id: 'debito', nome: 'Débito', taxa: 2.5, diasRecebimento: 1 },
  { id: 'credito-vista', nome: 'Crédito à Vista', taxa: 3.5, diasRecebimento: 30 },
  { id: 'credito-2x', nome: 'Crédito 2x', taxa: 4.0, diasRecebimento: 30 },
  { id: 'credito-3x', nome: 'Crédito 3x', taxa: 4.5, diasRecebimento: 30 },
  { id: 'boleto', nome: 'Boleto', taxa: 2.0, diasRecebimento: 2 },
  { id: 'transferencia', nome: 'Transferência', taxa: 0, diasRecebimento: 1 }
]
```

**Funcionalidades:**
- Cadastro de formas de pagamento
- Configuração de taxas por forma
- Parcelamento (até 12x)
- Cálculo automático de taxas
- Previsão de recebimento
- Conciliação bancária
- Relatório por forma de pagamento
- Antecipação de recebíveis

**Estrutura Atualizada:**
```javascript
contas_receber: {
  // ... campos existentes
  formaPagamento: string,
  numeroParcelas: number,
  valorBruto: number, // valor antes das taxas
  valorTaxas: number,
  valorLiquido: number, // valor após taxas
  parcelas: [{
    numero: number,
    valor: number,
    vencimento: timestamp,
    recebimento: timestamp,
    status: 'pendente' | 'recebido'
  }]
}
```

---

### 5️⃣ Prontuário Eletrônico do Paciente ⭐⭐⭐⭐

**Status:** ⏳ Aguardando (0%)

**Arquivos a criar:**
- `src/composables/useProntuario.js`
- `src/views/Prontuario.vue`
- `src/views/EvoluçãoPaciente.vue`
- `src/components/TimelineProcedimentos.vue`
- `src/components/ComparadorFotos.vue`

**Funcionalidades:**
```javascript
// Dados do Prontuário:
- Ficha completa do paciente
- Histórico de anamneses
- Evolução por procedimento
- Fotos de antes/depois
- Timeline de atendimentos
- Prescrições e orientações
- Próximos procedimentos recomendados
- Alertas e observações
- Documentos anexos
- Termos de consentimento assinados
```

**Estrutura de Dados:**
```javascript
prontuarios: {
  clinicaId: string,
  pacienteId: string,
  pacienteNome: string,
  dataNascimento: timestamp,
  
  // Ficha Médica
  alergias: [],
  medicamentos: [],
  condicoesMedicas: [],
  cirurgiasAnteriores: [],
  
  // Histórico
  atendimentos: [{
    id: string,
    data: timestamp,
    profissional: string,
    procedimento: string,
    observacoes: string,
    fotosAntes: [],
    fotosDepois: [],
    evolucao: string,
    proximaConsulta: timestamp
  }],
  
  // Documentos
  documentos: [{
    tipo: 'termo' | 'exame' | 'prescricao' | 'outro',
    nome: string,
    url: string,
    data: timestamp
  }],
  
  // Estatísticas
  totalAtendimentos: number,
  procedimentosRealizados: {},
  ultimoAtendimento: timestamp,
  proximoAtendimento: timestamp,
  
  // Status
  ativo: boolean,
  observacoesGerais: string,
  dataCriacao: timestamp,
  dataAtualizacao: timestamp
}
```

**Visualizações:**
- Ficha completa do paciente
- Timeline de procedimentos
- Galeria de fotos (antes/depois)
- Comparador de fotos lado a lado
- Gráficos de evolução
- Histórico de pagamentos
- Documentos e termos

---

## 🗂️ ESTRUTURA DE FIRESTORE ATUALIZADA

```
/clinicas
  - configurações da clínica

/configuracoes
  - configurações do usuário

/anamneses
  - fichas de anamnese

/agendamentos ⭐ NOVO
  - agendamentos da agenda

/contas_pagar
  - despesas
  
/contas_receber
  - receitas
  
/movimentacoes
  - fluxo de caixa

/plano_contas
  - categorias DRE

/orcamentos ⭐ NOVO
  - orçamentos mensais/anuais

/formas_pagamento ⭐ NOVO
  - configuração de formas de pagamento

/prontuarios ⭐ NOVO
  - prontuários eletrônicos

/pacientes ⭐ NOVO
  - cadastro de pacientes

/procedimentos ⭐ NOVO
  - catálogo de procedimentos

/profissionais ⭐ NOVO
  - cadastro de profissionais
```

---

## 📊 FIRESTORE SECURITY RULES ATUALIZADAS

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function belongsToClinic(clinicaId) {
      return isSignedIn() && 
             get(/databases/$(database)/documents/configuracoes/$(clinicaId)).data.userId == request.auth.uid;
    }
    
    // Agendamentos
    match /agendamentos/{agendamentoId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
    
    // Orçamentos
    match /orcamentos/{orcamentoId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
    
    // Prontuários
    match /prontuarios/{prontuarioId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
    
    // Pacientes
    match /pacientes/{pacienteId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
    
    // Procedimentos
    match /procedimentos/{procedimentoId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
    
    // Profissionais
    match /profissionais/{profissionalId} {
      allow read: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
      allow create: if isSignedIn() && belongsToClinic(request.resource.data.clinicaId);
      allow update, delete: if isSignedIn() && belongsToClinic(resource.data.clinicaId);
    }
  }
}
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Fase 1 - Base (Semana 1-2)
1. ✅ useAgendamento.js (criado)
2. Agenda.vue - Calendário visual
3. NovoAgendamento.vue - Formulário
4. Integração com menu

### Fase 2 - Orçamento (Semana 3)
1. useOrcamento.js
2. Orcamento.vue
3. OrcamentoVsRealizado.vue
4. Integração com financeiro

### Fase 3 - Dashboard (Semana 4)
1. useKPIs.js
2. DashboardAnalitico.vue
3. Componentes de gráficos
4. Definir como página inicial

### Fase 4 - Pagamentos (Semana 5)
1. useFormasPagamento.js
2. FormasPagamento.vue
3. Atualizar contas a pagar/receber
4. Sistema de parcelamento

### Fase 5 - Prontuário (Semana 6-7)
1. useProntuario.js
2. usePacientes.js
3. Prontuario.vue
4. Timeline e comparador de fotos
5. Integração com agendamentos

---

## 📦 DEPENDÊNCIAS ADICIONAIS NECESSÁRIAS

```json
{
  "@fullcalendar/core": "^6.1.0",
  "@fullcalendar/vue3": "^6.1.0",
  "@fullcalendar/daygrid": "^6.1.0",
  "@fullcalendar/timegrid": "^6.1.0",
  "@fullcalendar/interaction": "^6.1.0",
  "@vueuse/core": "^10.0.0",
  "date-fns": "^3.0.0",
  "vue-advanced-cropper": "^2.8.0"
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Instalar dependências do calendário:**
   ```bash
   npm install @fullcalendar/core @fullcalendar/vue3 @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
   ```

2. **Criar views de agendamento**
3. **Testar funcionalidade completa**
4. **Passar para próxima fase**

---

## 📝 NOTAS IMPORTANTES

- Todas as funcionalidades devem respeitar o **multi-tenancy** (clinicaId)
- Manter consistência visual com o design atual
- Exportação PDF para todos os relatórios
- Notificações via email/SMS (futuro)
- Backup automático diário
- Logs de auditoria

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
**Status do Projeto:** 75% completo

