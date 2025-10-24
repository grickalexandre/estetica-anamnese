<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-credit-card"></i> Minha Assinatura</h1>
        <div class="header-actions">
          <button @click="irParaPlanos" class="btn-secondary">
            <i class="fas fa-exchange-alt"></i> Ver Planos
          </button>
          <button @click="voltarHome" class="btn-secondary">
            <i class="fas fa-home"></i> Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Carregando...
    </div>

    <!-- Conteúdo -->
    <div v-else>
      <!-- Status da Assinatura -->
      <div class="card status-card" v-if="assinatura">
        <div class="status-header">
          <div class="status-icon" :class="`status-${assinatura.status}`">
            <i :class="getStatusIcon(assinatura.status)"></i>
          </div>
          <div class="status-info">
            <h2>Plano {{ assinatura.planoNome }}</h2>
            <span :class="['status-badge', `badge-${assinatura.status}`]">
              {{ getStatusLabel(assinatura.status) }}
            </span>
          </div>
          <div class="status-preco">
            <span class="valor">R$ {{ formatarValor(assinatura.valorMensal) }}</span>
            <span class="periodo">/mês</span>
          </div>
        </div>

        <div class="status-details">
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <div>
              <span class="label">Data de Início</span>
              <span class="value">{{ formatarData(assinatura.dataInicio) }}</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="fas fa-calendar-check"></i>
            <div>
              <span class="label">Próxima Cobrança</span>
              <span class="value">{{ formatarData(assinatura.proximaCobranca) }}</span>
            </div>
          </div>

          <div class="detail-item" v-if="assinatura.status === 'trial'">
            <i class="fas fa-gift"></i>
            <div>
              <span class="label">Dias Restantes (Trial)</span>
              <span class="value destaque">{{ assinatura.diasRestantesGratis }} dias</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="fas fa-credit-card"></i>
            <div>
              <span class="label">Forma de Pagamento</span>
              <span class="value">{{ getFormaPagamentoLabel(assinatura.formaPagamento) }}</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="fas fa-sync-alt"></i>
            <div>
              <span class="label">Renovação Automática</span>
              <span :class="['value', assinatura.pagamentoAutomatico ? 'ativa' : 'inativa']">
                {{ assinatura.pagamentoAutomatico ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
          </div>

          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <div>
              <span class="label">Período de Cobrança</span>
              <span class="value">{{ getPeriodoLabel(assinatura.periodo) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Uso vs Limites -->
      <div class="card">
        <h2><i class="fas fa-chart-pie"></i> Uso do Plano</h2>
        <div class="uso-grid">
          <!-- Usuários -->
          <div class="uso-item">
            <div class="uso-header">
              <i class="fas fa-users"></i>
              <span>Usuários</span>
            </div>
            <div class="uso-bar">
              <div 
                class="uso-progress"
                :style="{ width: calcularPercentual(usoAtual.usuarios, limites.usuarios) + '%' }"
                :class="{ alert: calcularPercentual(usoAtual.usuarios, limites.usuarios) > 80 }"
              ></div>
            </div>
            <div class="uso-text">
              {{ usoAtual.usuarios }} / {{ limites.usuarios === -1 ? 'Ilimitado' : limites.usuarios }}
            </div>
          </div>

          <!-- Pacientes -->
          <div class="uso-item">
            <div class="uso-header">
              <i class="fas fa-user-injured"></i>
              <span>Pacientes</span>
            </div>
            <div class="uso-bar">
              <div 
                class="uso-progress"
                :style="{ width: calcularPercentual(usoAtual.pacientes, limites.pacientes) + '%' }"
                :class="{ alert: calcularPercentual(usoAtual.pacientes, limites.pacientes) > 80 }"
              ></div>
            </div>
            <div class="uso-text">
              {{ usoAtual.pacientes }} / {{ limites.pacientes === -1 ? 'Ilimitado' : limites.pacientes }}
            </div>
          </div>

          <!-- Agendamentos -->
          <div class="uso-item">
            <div class="uso-header">
              <i class="fas fa-calendar-alt"></i>
              <span>Agendamentos (mês)</span>
            </div>
            <div class="uso-bar">
              <div 
                class="uso-progress"
                :style="{ width: calcularPercentual(usoAtual.agendamentos, limites.agendamentos) + '%' }"
                :class="{ alert: calcularPercentual(usoAtual.agendamentos, limites.agendamentos) > 80 }"
              ></div>
            </div>
            <div class="uso-text">
              {{ usoAtual.agendamentos }} / {{ limites.agendamentos === -1 ? 'Ilimitado' : limites.agendamentos }}
            </div>
          </div>

          <!-- Armazenamento -->
          <div class="uso-item">
            <div class="uso-header">
              <i class="fas fa-hdd"></i>
              <span>Armazenamento</span>
            </div>
            <div class="uso-bar">
              <div 
                class="uso-progress"
                :style="{ width: calcularPercentual(usoAtual.armazenamento, limites.armazenamento) + '%' }"
                :class="{ alert: calcularPercentual(usoAtual.armazenamento, limites.armazenamento) > 80 }"
              ></div>
            </div>
            <div class="uso-text">
              {{ usoAtual.armazenamento }} GB / {{ limites.armazenamento }} GB
            </div>
          </div>
        </div>

        <div class="alerta-limite" v-if="temLimiteProximo">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Você está próximo do limite do seu plano. Considere fazer upgrade para evitar interrupções.</span>
          <button @click="irParaPlanos" class="btn-upgrade-mini">
            <i class="fas fa-arrow-up"></i> Upgrade
          </button>
        </div>
      </div>

      <!-- Recursos do Plano -->
      <div class="card" v-if="assinatura">
        <h2><i class="fas fa-list-check"></i> Recursos Incluídos</h2>
        <div class="recursos-grid">
          <div 
            v-for="recurso in assinatura.recursos" 
            :key="recurso"
            class="recurso-card"
          >
            <i class="fas fa-check-circle"></i>
            <span>{{ formatarRecurso(recurso) }}</span>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="acoes-grid">
        <div class="card acao-card">
          <i class="fas fa-arrow-up"></i>
          <h3>Fazer Upgrade</h3>
          <p>Desbloqueie mais recursos e aumente seus limites</p>
          <button @click="irParaPlanos" class="btn-acao upgrade">
            Ver Planos
          </button>
        </div>

        <div class="card acao-card">
          <i class="fas fa-credit-card"></i>
          <h3>Forma de Pagamento</h3>
          <p>Atualize suas informações de pagamento</p>
          <button @click="alterarPagamento" class="btn-acao">
            Alterar
          </button>
        </div>

        <div class="card acao-card">
          <i class="fas fa-history"></i>
          <h3>Histórico de Faturas</h3>
          <p>Visualize todas as suas faturas anteriores</p>
          <button @click="verHistorico" class="btn-acao">
            Ver Histórico
          </button>
        </div>

        <div class="card acao-card danger">
          <i class="fas fa-times-circle"></i>
          <h3>Cancelar Assinatura</h3>
          <p>Cancele sua assinatura a qualquer momento</p>
          <button @click="cancelarAssinatura" class="btn-acao danger">
            Cancelar
          </button>
        </div>
      </div>

      <!-- Aviso Trial -->
      <div class="card aviso-trial" v-if="assinatura && assinatura.status === 'trial'">
        <i class="fas fa-info-circle"></i>
        <div>
          <h3>Você está em período de teste gratuito</h3>
          <p>Aproveite todos os recursos do plano {{ assinatura.planoNome }} por mais {{ assinatura.diasRestantesGratis }} dias. Após esse período, será cobrado R$ {{ formatarValor(assinatura.valorMensal) }}/mês.</p>
          <button @click="ativarAssinatura" class="btn-ativar">
            <i class="fas fa-bolt"></i> Ativar Assinatura Agora
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssinaturas } from '../composables/useAssinaturas.js'

const router = useRouter()
const { obterAssinaturaAtiva, verificarLimites, cancelarAssinatura: cancelar } = useAssinaturas()

// Estado
const assinatura = ref(null)
const limites = ref({
  usuarios: 0,
  pacientes: 0,
  agendamentos: 0,
  armazenamento: 0
})
const usoAtual = ref({
  usuarios: 0,
  pacientes: 0,
  agendamentos: 0,
  armazenamento: 0
})
const carregando = ref(false)

// Computed
const temLimiteProximo = computed(() => {
  return Object.keys(usoAtual.value).some(key => {
    const limite = limites.value[key]
    if (limite === -1) return false
    return calcularPercentual(usoAtual.value[key], limite) > 80
  })
})

// Métodos
const carregarDados = async () => {
  carregando.value = true
  try {
    // Buscar assinatura
    const resultado = await obterAssinaturaAtiva()
    if (resultado.success) {
      assinatura.value = resultado.data
      limites.value = resultado.data.limites || {}
    }

    // Verificar uso atual (mock - substituir por dados reais)
    const verificacao = await verificarLimites()
    if (verificacao.success) {
      usoAtual.value = verificacao.data
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    alert('Erro ao carregar assinatura')
  } finally {
    carregando.value = false
  }
}

const calcularPercentual = (usado, limite) => {
  if (limite === -1) return 0
  if (limite === 0) return 0
  return Math.min((usado / limite) * 100, 100)
}

const getStatusIcon = (status) => {
  const icons = {
    'ativa': 'fas fa-check-circle',
    'trial': 'fas fa-gift',
    'cancelada': 'fas fa-times-circle',
    'suspensa': 'fas fa-pause-circle',
    'inadimplente': 'fas fa-exclamation-circle'
  }
  return icons[status] || 'fas fa-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    'ativa': 'Ativa',
    'trial': 'Período de Teste',
    'cancelada': 'Cancelada',
    'suspensa': 'Suspensa',
    'inadimplente': 'Pagamento Pendente'
  }
  return labels[status] || status
}

const getFormaPagamentoLabel = (forma) => {
  const labels = {
    'cartao_credito': 'Cartão de Crédito',
    'boleto': 'Boleto Bancário',
    'pix': 'PIX'
  }
  return labels[forma] || forma
}

const getPeriodoLabel = (periodo) => {
  const labels = {
    'mensal': 'Mensal',
    'anual': 'Anual'
  }
  return labels[periodo] || periodo
}

const formatarRecurso = (recurso) => {
  const labels = {
    'whatsapp': 'Integração WhatsApp',
    'relatorios_avancados': 'Relatórios Avançados',
    'multi_usuario': 'Múltiplos Usuários',
    'auditoria': 'Log de Auditoria',
    'avaliacoes': 'Sistema de Avaliações',
    'comissoes': 'Gestão de Comissões',
    'estoque': 'Controle de Estoque',
    'financeiro_completo': 'Financeiro Completo',
    'backup_automatico': 'Backup Automático',
    'suporte_prioritario': 'Suporte Prioritário'
  }
  return labels[recurso] || recurso
}

const formatarValor = (valor) => {
  if (!valor) return '0,00'
  return valor.toFixed(2).replace('.', ',')
}

const formatarData = (data) => {
  if (!data) return '-'
  const date = data.toDate ? data.toDate() : new Date(data)
  return date.toLocaleDateString('pt-BR')
}

const irParaPlanos = () => {
  router.push('/planos')
}

const alterarPagamento = () => {
  alert('Funcionalidade em desenvolvimento: Alterar forma de pagamento')
}

const verHistorico = () => {
  alert('Funcionalidade em desenvolvimento: Histórico de faturas')
}

const ativarAssinatura = () => {
  alert('Funcionalidade em desenvolvimento: Ativar assinatura')
}

const cancelarAssinatura = async () => {
  if (!confirm('⚠️ Tem certeza que deseja cancelar sua assinatura?\n\nVocê perderá acesso a todos os recursos do plano ao final do período atual.')) {
    return
  }

  try {
    const resultado = await cancelar()
    
    if (resultado.success) {
      alert('Assinatura cancelada com sucesso. Você terá acesso até o final do período atual.')
      carregarDados()
    } else {
      alert('Erro ao cancelar assinatura: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    alert('Erro ao cancelar assinatura')
  }
}

const voltarHome = () => {
  router.push('/')
}

// Lifecycle
onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Card */
.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.card h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Card */
.status-card {
  border: 3px solid #28a745;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 1.5rem;
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  flex-shrink: 0;
}

.status-icon.status-ativa {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.status-icon.status-trial {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.status-icon.status-cancelada,
.status-icon.status-inadimplente {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.status-info {
  flex: 1;
}

.status-info h2 {
  margin: 0 0 0.5rem 0;
}

.status-badge {
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-ativa {
  background: #d4edda;
  color: #155724;
}

.badge-trial {
  background: #fff3cd;
  color: #856404;
}

.badge-cancelada,
.badge-inadimplente {
  background: #f8d7da;
  color: #721c24;
}

.status-preco {
  text-align: right;
}

.status-preco .valor {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: block;
  line-height: 1;
}

.status-preco .periodo {
  color: #666;
  font-size: 1rem;
}

.status-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.detail-item i {
  font-size: 1.5rem;
  color: #667eea;
  width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.detail-item .label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-item .value {
  display: block;
  font-weight: 600;
  color: #2c3e50;
}

.detail-item .value.destaque {
  color: #ffc107;
  font-size: 1.2rem;
}

.detail-item .value.ativa {
  color: #28a745;
}

.detail-item .value.inativa {
  color: #dc3545;
}

/* Uso */
.uso-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.uso-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.uso-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.uso-header i {
  color: #667eea;
}

.uso-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.uso-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
  border-radius: 10px;
}

.uso-progress.alert {
  background: linear-gradient(90deg, #dc3545 0%, #c82333 100%);
}

.uso-text {
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
}

.alerta-limite {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  color: #856404;
}

.alerta-limite i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alerta-limite span {
  flex: 1;
  font-weight: 500;
}

.btn-upgrade-mini {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

/* Recursos */
.recursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.recurso-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #28a745;
}

.recurso-card i {
  color: #28a745;
  font-size: 1.2rem;
}

.recurso-card span {
  font-weight: 500;
  color: #2c3e50;
}

/* Ações */
.acoes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.acao-card {
  text-align: center;
  padding: 2rem !important;
  transition: all 0.2s;
}

.acao-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.acao-card i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.acao-card.danger i {
  color: #dc3545;
}

.acao-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.acao-card p {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.btn-acao {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-acao:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-acao.upgrade {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.btn-acao.danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

/* Aviso Trial */
.aviso-trial {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.aviso-trial i {
  font-size: 3rem;
  flex-shrink: 0;
}

.aviso-trial h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.aviso-trial p {
  margin: 0 0 1rem 0;
  opacity: 0.95;
}

.btn-ativar {
  background: white;
  color: #ff9800;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-ativar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Botões */
.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem;
  color: #6c757d;
  font-size: 1.2rem;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .status-header {
    flex-direction: column;
    text-align: center;
  }

  .status-preco {
    text-align: center;
  }

  .status-details {
    grid-template-columns: 1fr;
  }

  .uso-grid {
    grid-template-columns: 1fr;
  }

  .recursos-grid {
    grid-template-columns: 1fr;
  }

  .acoes-grid {
    grid-template-columns: 1fr;
  }

  .aviso-trial {
    flex-direction: column;
    text-align: center;
  }
}
</style>

