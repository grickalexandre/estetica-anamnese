# 📊 Análise do Diagrama ER - Ajustes Necessários

**Data**: 22/10/2025  
**Objetivo**: Ajustar implementação atual para estar 100% conforme diagrama ER fornecido

---

## 🔍 Análise Comparativa

### ✅ Coleções JÁ IMPLEMENTADAS (Corretas)

1. ✅ **CLINICAS** - Implementado via `clinicaId` (multi-tenancy)
2. ✅ **USERS** - Implementado (Firebase Auth + collection `users`)
3. ✅ **CLIENTES** - Implementado
4. ✅ **PROFISSIONAIS** - Implementado
5. ✅ **ANAMNESES** - Implementado
6. ✅ **AGENDAMENTOS** - Implementado
7. ✅ **ATENDIMENTOS** - Implementado
8. ✅ **CATALOGO_PROCEDIMENTOS** - Implementado
9. ✅ **PRODUTOS** - Implementado
10. ✅ **FORNECEDORES** - Implementado
11. ✅ **ESTOQUE_MOVIMENTACOES** - Implementado
12. ✅ **CONTAS_RECEBER** - Implementado
13. ✅ **CONTAS_PAGAR** - Implementado
14. ✅ **COMISSOES** - Implementado

---

## 🆕 Coleções FALTANTES (A Implementar)

### 1. **USUARIOS_CLINICA** ⚠️ PRIORITÁRIO
**Descrição**: Vincular múltiplos usuários a uma clínica com roles  
**Status**: NÃO IMPLEMENTADO

**Campos Necessários**:
```javascript
{
  id: string,
  userId: string,        // FK para users
  clinicaId: string,     // FK para clinicas
  role: string,          // admin, profissional, recepcionista, etc
  ativo: boolean,
  dataCriacao: timestamp,
  dataAtualizacao: timestamp
}
```

**Motivo**: Permitir múltiplos usuários por clínica com diferentes permissões

---

### 2. **PAGAMENTOS** ⚠️ PRIORITÁRIO
**Descrição**: Registro detalhado de pagamentos/recebimentos  
**Status**: PARCIALMENTE IMPLEMENTADO (dados dentro de contas)

**Campos Necessários**:
```javascript
{
  id: string,
  contaId: string,           // FK para contas_pagar ou contas_receber
  tipo: string,              // 'recebimento' ou 'pagamento'
  valor: number,
  formaPagamento: string,    // dinheiro, pix, cartao, etc
  dataPagamento: timestamp,
  usuarioId: string,         // Quem registrou o pagamento
  observacoes: string,
  clinicaId: string,
  dataCriacao: timestamp
}
```

**Motivo**: Histórico detalhado de transações e rastreabilidade

---

### 3. **AVALIACOES** 🌟 IMPORTANTE
**Descrição**: Avaliações dos clientes sobre atendimentos  
**Status**: NÃO IMPLEMENTADO

**Campos Necessários**:
```javascript
{
  id: string,
  clienteId: string,         // FK para clientes
  atendimentoId: string,     // FK para atendimentos
  nota: number,              // 1-5 estrelas
  comentario: string,
  data: timestamp,
  clinicaId: string,
  respondido: boolean,
  respostaClinica: string,
  dataResposta: timestamp
}
```

**Motivo**: Feedback dos clientes e melhoria contínua

---

### 4. **AUDITORIA** 🔒 IMPORTANTE
**Descrição**: Log de todas as ações no sistema  
**Status**: NÃO IMPLEMENTADO

**Campos Necessários**:
```javascript
{
  id: string,
  entidade: string,          // 'clientes', 'atendimentos', etc
  documentoId: string,       // ID do documento modificado
  acao: string,              // 'create', 'update', 'delete'
  usuarioId: string,         // Quem fez a ação
  dadosAntigos: object,      // Snapshot antes da mudança
  dadosNovos: object,        // Snapshot depois da mudança
  data: timestamp,
  clinicaId: string
}
```

**Motivo**: Rastreabilidade, segurança e compliance

---

### 5. **PLANOS** 📦 OPCIONAL
**Descrição**: Planos de assinatura disponíveis  
**Status**: PARCIALMENTE IMPLEMENTADO (removido anteriormente)

**Campos Necessários**:
```javascript
{
  id: string,
  nome: string,              // 'Básico', 'Profissional', 'Premium'
  limiteUsuarios: number,
  limitePacientes: number,
  limiteAgendamentos: number,
  valorMensal: number,
  valorAnual: number,
  recursos: array,           // Lista de recursos incluídos
  ativo: boolean,
  dataCriacao: timestamp
}
```

**Motivo**: Monetização e controle de recursos

---

### 6. **ASSINATURAS** 📦 OPCIONAL
**Descrição**: Assinaturas ativas das clínicas  
**Status**: NÃO IMPLEMENTADO

**Campos Necessários**:
```javascript
{
  id: string,
  clinicaId: string,         // FK para clinicas
  planoId: string,           // FK para planos
  status: string,            // 'ativa', 'cancelada', 'suspensa', 'trial'
  dataInicio: timestamp,
  dataExpiracao: timestamp,
  formaPagamento: string,
  valorMensal: number,
  proximaCobranca: timestamp,
  dataCriacao: timestamp,
  dataAtualizacao: timestamp
}
```

**Motivo**: Gestão de assinaturas e pagamentos recorrentes

---

## 🔧 Campos FALTANTES em Coleções Existentes

### AGENDAMENTOS
**Adicionar**:
- ✅ `origem` - string ('online', 'presencial', 'telefone', 'whatsapp')
  - **Status**: Campo útil para analytics
  - **Ação**: Adicionar ao schema e composable

### ATENDIMENTOS
**Adicionar**:
- ✅ `agendamentoId` - string (FK para agendamentos)
  - **Status**: Já implementado como referência
  - **Ação**: Garantir que está sendo salvo corretamente
  
- ✅ `pagamentoStatus` - string ('pendente', 'pago', 'parcial')
  - **Status**: Implementado indiretamente via contas_receber
  - **Ação**: Adicionar campo direto para facilitar queries
  
- ✅ `contaReceberId` - string (FK para contas_receber)
  - **Status**: NÃO IMPLEMENTADO explicitamente
  - **Ação**: Adicionar referência bidirecional

### COMISSOES
**Adicionar**:
- ✅ Campo `pago` já existe como `status`
- ✅ Relacionamento com PAGAMENTOS via `pagamentoId`
  - **Ação**: Adicionar quando implementar collection PAGAMENTOS

---

## 🎯 Plano de Implementação

### Fase 1: PRIORITÁRIO (Implementar Agora) ⚡

#### 1.1 Collection PAGAMENTOS
- ✅ Criar composable `usePagamentos.js`
- ✅ Implementar CRUD de pagamentos
- ✅ Integrar com baixa de contas
- ✅ Criar histórico de pagamentos

#### 1.2 Collection USUARIOS_CLINICA
- ✅ Criar composable `useUsuariosClinica.js`
- ✅ Sistema de convites para múltiplos usuários
- ✅ Gerenciamento de roles e permissões
- ✅ View para gestão de equipe

#### 1.3 Campos Faltantes
- ✅ Adicionar `origem` em AGENDAMENTOS
- ✅ Adicionar `pagamentoStatus` em ATENDIMENTOS
- ✅ Adicionar `contaReceberId` em ATENDIMENTOS

---

### Fase 2: IMPORTANTE (Implementar Em Seguida) 🌟

#### 2.1 Collection AVALIACOES
- ✅ Criar composable `useAvaliacoes.js`
- ✅ View para cliente deixar avaliação
- ✅ View para clínica responder avaliações
- ✅ Dashboard com NPS e média de avaliações

#### 2.2 Collection AUDITORIA
- ✅ Criar composable `useAuditoria.js`
- ✅ Middleware para log automático de ações
- ✅ View de histórico de alterações
- ✅ Filtros por entidade, usuário, data

---

### Fase 3: OPCIONAL (Futuro) 📦

#### 3.1 Collections PLANOS e ASSINATURAS
- ⏸️ Reativar sistema de planos
- ⏸️ Integração com gateway de pagamento
- ⏸️ Controle de limites por plano
- ⏸️ Dashboard de assinaturas

---

## 📋 Checklist de Implementação

### Coleções
- [ ] `pagamentos` - Collection criada
- [ ] `usuarios_clinica` - Collection criada
- [ ] `avaliacoes` - Collection criada
- [ ] `auditoria` - Collection criada
- [ ] `planos` - Collection criada (opcional)
- [ ] `assinaturas` - Collection criada (opcional)

### Composables
- [ ] `usePagamentos.js`
- [ ] `useUsuariosClinica.js`
- [ ] `useAvaliacoes.js`
- [ ] `useAuditoria.js`
- [ ] `usePlanos.js` (opcional)
- [ ] `useAssinaturas.js` (opcional)

### Views
- [ ] `Pagamentos.vue` - Histórico de pagamentos
- [ ] `EquipeClinica.vue` - Gestão de usuários
- [ ] `Avaliacoes.vue` - Avaliações dos clientes
- [ ] `Auditoria.vue` - Log de ações
- [ ] `Planos.vue` - Gestão de planos (opcional)
- [ ] `MinhaAssinatura.vue` - Status da assinatura (opcional)

### Integrações
- [ ] Atualizar `useFinanceiro.js` para usar `pagamentos`
- [ ] Atualizar `useAuth.js` para usar `usuarios_clinica`
- [ ] Atualizar componentes de atendimento para gerar avaliações
- [ ] Criar middleware de auditoria global

### Firestore Rules
- [ ] Regras para `pagamentos`
- [ ] Regras para `usuarios_clinica`
- [ ] Regras para `avaliacoes`
- [ ] Regras para `auditoria`
- [ ] Regras para `planos` e `assinaturas`

### Documentação
- [ ] Atualizar `RELACIONAMENTO_FIREBASE.md`
- [ ] Atualizar `DIAGRAMA_IMPLEMENTADO.md`
- [ ] Atualizar `DOCUMENTACAO_COMPLETA_PROJETO.md`
- [ ] Criar `SISTEMA_PAGAMENTOS.md`
- [ ] Criar `SISTEMA_AVALIACOES.md`
- [ ] Criar `SISTEMA_AUDITORIA.md`

---

## 🚀 Próximos Passos

1. ✅ **Criar composable `usePagamentos.js`**
2. ✅ **Adicionar campos faltantes nos composables existentes**
3. ✅ **Atualizar views de financeiro para usar pagamentos**
4. ✅ **Criar composable `useUsuariosClinica.js`**
5. ✅ **Criar view de gestão de equipe**
6. ✅ **Implementar avaliacoes e auditoria**
7. ✅ **Atualizar Firestore rules**
8. ✅ **Atualizar documentação**

---

## 💡 Observações Importantes

### Multi-tenancy
- ✅ **Atual**: Implementado via `clinicaId` em todas as collections
- ✅ **Diagrama**: Confirma o padrão atual
- ✅ **Ação**: Manter implementação atual

### Relacionamentos
- ✅ **Firestore é NoSQL**: Não tem foreign keys nativas
- ✅ **Implementação**: Usar campos de referência (IDs) + validação na aplicação
- ✅ **Diagrama**: Mostra relacionamentos lógicos que serão mantidos via IDs

### Performance
- ⚠️ **Collection AUDITORIA**: Pode crescer muito
  - Implementar TTL (Time to Live) automático
  - Manter apenas últimos 90 dias
  - Exportar dados antigos para arquivo

### Segurança
- 🔒 **AVALIACOES**: Permitir que clientes criem sem autenticação?
  - Opção 1: Link único por atendimento
  - Opção 2: Cliente precisa fazer login
  - **Recomendação**: Link único (melhor UX)

---

*Documento criado: 22/10/2025*

