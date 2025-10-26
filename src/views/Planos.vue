<template>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-crown"></i> Planos e Assinaturas</h1>
        <div class="header-actions">
          <button @click="voltarHome" class="btn-secondary">
            <i class="fas fa-home"></i> Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Carregando planos...
    </div>

    <!-- Planos -->
    <div v-else>
      <!-- Toggle Período -->
      <div class="periodo-toggle">
        <div class="toggle-wrapper">
          <button 
            :class="['toggle-btn', { active: periodoSelecionado === 'mensal' }]"
            @click="periodoSelecionado = 'mensal'"
          >
            Mensal
          </button>
          <button 
            :class="['toggle-btn', { active: periodoSelecionado === 'anual' }]"
            @click="periodoSelecionado = 'anual'"
          >
            Anual
            <span class="badge-desconto">-20%</span>
          </button>
        </div>
        <p class="economia" v-if="periodoSelecionado === 'anual'">
          <i class="fas fa-piggy-bank"></i>
          Economize até 20% pagando anualmente!
        </p>
      </div>

      <!-- Grade de Planos -->
      <div class="planos-grid">
        <div 
          v-for="plano in planos" 
          :key="plano.id"
          :class="['plano-card', { destaque: plano.destaque, atual: isPlanoAtual(plano) }]"
        >
          <!-- Badge -->
          <div class="plano-badge" v-if="plano.destaque">
            <i class="fas fa-star"></i> Mais Popular
          </div>
          <div class="plano-badge atual-badge" v-else-if="isPlanoAtual(plano)">
            <i class="fas fa-check-circle"></i> Plano Atual
          </div>

          <!-- Header -->
          <div class="plano-header">
            <div class="plano-icone" :class="`icone-${plano.nome.toLowerCase()}`">
              <i :class="getPlanoIcon(plano.nome)"></i>
            </div>
            <h2>{{ plano.nome }}</h2>
            <p class="descricao">{{ plano.descricao }}</p>
          </div>

          <!-- Preço -->
          <div class="plano-preco">
            <div class="preco-valor">
              <span class="moeda">R$</span>
              <span class="valor">{{ getValorPlano(plano) }}</span>
              <span class="periodo">/mês</span>
            </div>
            <div class="preco-info" v-if="periodoSelecionado === 'anual'">
              Cobrado R$ {{ formatarMoeda(plano.valorAnual) }} por ano
            </div>
          </div>

          <!-- Recursos -->
          <div class="plano-recursos">
            <div class="recurso-item">
              <i class="fas fa-users"></i>
              <span>
                {{ plano.limiteUsuarios === -1 ? 'Usuários ilimitados' : `Até ${plano.limiteUsuarios} usuário${plano.limiteUsuarios > 1 ? 's' : ''}` }}
              </span>
            </div>

            <div class="recurso-item">
              <i class="fas fa-user-injured"></i>
              <span>
                {{ plano.limitePacientes === -1 ? 'Pacientes ilimitados' : `Até ${plano.limitePacientes} pacientes` }}
              </span>
            </div>

            <div class="recurso-item">
              <i class="fas fa-calendar-alt"></i>
              <span>
                {{ plano.limiteAgendamentos === -1 ? 'Agendamentos ilimitados' : `Até ${plano.limiteAgendamentos} agendamentos/mês` }}
              </span>
            </div>

            <div class="recurso-item">
              <i class="fas fa-hdd"></i>
              <span>{{ plano.limiteArmazenamento }} GB de armazenamento</span>
            </div>

            <div class="recursos-extras">
              <div 
                v-for="recurso in plano.recursos" 
                :key="recurso"
                class="recurso-item extra"
              >
                <i class="fas fa-check-circle"></i>
                <span>{{ formatarRecurso(recurso) }}</span>
              </div>
            </div>
          </div>

          <!-- Ação -->
          <div class="plano-action">
            <button 
              v-if="isPlanoAtual(plano)"
              class="btn-plano atual"
              disabled
            >
              <i class="fas fa-check"></i> Plano Atual
            </button>
            <button 
              v-else-if="podeUpgrade(plano)"
              @click="selecionarPlano(plano)"
              class="btn-plano upgrade"
            >
              <i class="fas fa-arrow-up"></i> Fazer Upgrade
            </button>
            <button 
              v-else-if="podeDowngrade(plano)"
              @click="selecionarPlano(plano)"
              class="btn-plano downgrade"
            >
              <i class="fas fa-arrow-down"></i> Mudar para este plano
            </button>
            <button 
              v-else
              @click="selecionarPlano(plano)"
              class="btn-plano"
            >
              <i class="fas fa-shopping-cart"></i> Escolher Plano
            </button>
          </div>
        </div>
      </div>

      <!-- Comparação -->
      <div class="card">
        <h2><i class="fas fa-balance-scale"></i> Comparação Detalhada</h2>
        <div class="comparacao-table">
          <table>
            <thead>
              <tr>
                <th>Recurso</th>
                <th v-for="plano in planos" :key="plano.id">{{ plano.nome }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="feature-name">Usuários</td>
                <td v-for="plano in planos" :key="plano.id">
                  {{ plano.limiteUsuarios === -1 ? 'Ilimitado' : plano.limiteUsuarios }}
                </td>
              </tr>
              <tr>
                <td class="feature-name">Pacientes</td>
                <td v-for="plano in planos" :key="plano.id">
                  {{ plano.limitePacientes === -1 ? 'Ilimitado' : plano.limitePacientes }}
                </td>
              </tr>
              <tr>
                <td class="feature-name">Agendamentos/mês</td>
                <td v-for="plano in planos" :key="plano.id">
                  {{ plano.limiteAgendamentos === -1 ? 'Ilimitado' : plano.limiteAgendamentos }}
                </td>
              </tr>
              <tr>
                <td class="feature-name">Armazenamento</td>
                <td v-for="plano in planos" :key="plano.id">
                  {{ plano.limiteArmazenamento }} GB
                </td>
              </tr>
              <tr v-for="recurso in todosRecursos" :key="recurso">
                <td class="feature-name">{{ formatarRecurso(recurso) }}</td>
                <td v-for="plano in planos" :key="plano.id">
                  <i 
                    :class="['fas', plano.recursos.includes(recurso) ? 'fa-check-circle check' : 'fa-times-circle times']"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ -->
      <div class="card">
        <h2><i class="fas fa-question-circle"></i> Perguntas Frequentes</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3><i class="fas fa-check"></i> Posso mudar de plano a qualquer momento?</h3>
            <p>Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor no próximo ciclo de cobrança.</p>
          </div>

          <div class="faq-item">
            <h3><i class="fas fa-credit-card"></i> Quais formas de pagamento são aceitas?</h3>
            <p>Aceitamos cartão de crédito, boleto bancário e PIX. Para planos anuais, oferecemos desconto adicional no pagamento via PIX ou boleto.</p>
          </div>

          <div class="faq-item">
            <h3><i class="fas fa-undo"></i> Existe reembolso?</h3>
            <p>Sim, oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos 100% do seu investimento.</p>
          </div>

          <div class="faq-item">
            <h3><i class="fas fa-headset"></i> Existe suporte técnico?</h3>
            <p>Todos os planos incluem suporte por email. Planos Premium e Enterprise incluem suporte prioritário via WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanos } from '../composables/usePlanos.js'
import { useAssinaturas } from '../composables/useAssinaturas.js'

const router = useRouter()
const { buscarPlanos } = usePlanos()
const { obterAssinaturaAtiva } = useAssinaturas()

// Estado
const planos = ref([])
const assinaturaAtual = ref(null)
const carregando = ref(false)
const periodoSelecionado = ref('mensal')

// Computed
const todosRecursos = computed(() => {
  const recursos = new Set()
  planos.value.forEach(plano => {
    plano.recursos.forEach(r => recursos.add(r))
  })
  return Array.from(recursos)
})

// Métodos
const carregarDados = async () => {
  carregando.value = true
  try {
    // Buscar planos
    const resultadoPlanos = await buscarPlanos()
    if (resultadoPlanos.success) {
      planos.value = resultadoPlanos.data.sort((a, b) => a.ordem - b.ordem)
      
      // Marcar plano destaque (geralmente o Premium)
      const indexDestaque = planos.value.findIndex(p => p.nome === 'Premium')
      if (indexDestaque !== -1) {
        planos.value[indexDestaque].destaque = true
      }
    }

    // Buscar assinatura atual
    const resultadoAssinatura = await obterAssinaturaAtiva()
    if (resultadoAssinatura.success) {
      assinaturaAtual.value = resultadoAssinatura.data
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    alert('Erro ao carregar planos')
  } finally {
    carregando.value = false
  }
}

const getValorPlano = (plano) => {
  if (periodoSelecionado.value === 'anual') {
    return (plano.valorAnual / 12).toFixed(2).replace('.', ',')
  }
  return plano.valorMensal.toFixed(2).replace('.', ',')
}

const formatarMoeda = (valor) => {
  return valor.toFixed(2).replace('.', ',')
}

const getPlanoIcon = (nome) => {
  const icons = {
    'Básico': 'fas fa-seedling',
    'Profissional': 'fas fa-briefcase',
    'Premium': 'fas fa-gem',
    'Enterprise': 'fas fa-crown'
  }
  return icons[nome] || 'fas fa-box'
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
    'suporte_prioritario': 'Suporte Prioritário',
    'api_acesso': 'Acesso à API',
    'personalizacao': 'Personalização Completa',
    'treinamento': 'Treinamento Dedicado'
  }
  return labels[recurso] || recurso
}

const isPlanoAtual = (plano) => {
  return assinaturaAtual.value?.planoId === plano.id
}

const podeUpgrade = (plano) => {
  if (!assinaturaAtual.value) return false
  const planoAtualIndex = planos.value.findIndex(p => p.id === assinaturaAtual.value.planoId)
  const novoPlanoIndex = planos.value.findIndex(p => p.id === plano.id)
  return novoPlanoIndex > planoAtualIndex
}

const podeDowngrade = (plano) => {
  if (!assinaturaAtual.value) return false
  const planoAtualIndex = planos.value.findIndex(p => p.id === assinaturaAtual.value.planoId)
  const novoPlanoIndex = planos.value.findIndex(p => p.id === plano.id)
  return novoPlanoIndex < planoAtualIndex
}

const selecionarPlano = (plano) => {
  console.log('Plano selecionado:', plano.nome)
  // Redirecionar para página de assinatura com o plano selecionado
  router.push({
    path: '/minha-assinatura',
    query: {
      planoId: plano.id,
      periodo: periodoSelecionado.value
    }
  })
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

/* Toggle Período */
.periodo-toggle {
  text-align: center;
  margin-bottom: 3rem;
}

.toggle-wrapper {
  display: inline-flex;
  background: #f0f0f0;
  border-radius: 50px;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.toggle-btn {
  padding: 0.75rem 2rem;
  border: none;
  background: transparent;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  transition: all 0.3s;
  position: relative;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-desconto {
  position: absolute;
  top: -8px;
  right: 0;
  background: #28a745;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.economia {
  color: #28a745;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
}

/* Planos Grid */
.planos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plano-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  border: 3px solid transparent;
}

.plano-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.plano-card.destaque {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.plano-card.atual {
  border-color: #28a745;
}

.plano-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.plano-badge.atual-badge {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.plano-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.plano-icone {
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.icone-básico {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
}

.icone-profissional {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.icone-premium {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

.icone-enterprise {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
}

.plano-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.descricao {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.plano-preco {
  text-align: center;
  margin-bottom: 2rem;
}

.preco-valor {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.moeda {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 0.5rem;
}

.valor {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0.25rem;
}

.periodo {
  font-size: 1.2rem;
  color: #666;
  margin-top: 1rem;
}

.preco-info {
  font-size: 0.875rem;
  color: #666;
}

.plano-recursos {
  margin-bottom: 2rem;
}

.recurso-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: #2c3e50;
}

.recurso-item i {
  color: #667eea;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.recursos-extras {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.recurso-item.extra i {
  color: #28a745;
}

.btn-plano {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-plano:not(.atual) {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
}

.btn-plano:not(.atual):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-plano.atual {
  background: #e0e0e0;
  color: #666;
  cursor: not-allowed;
}

.btn-plano.upgrade {
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
}

.btn-plano.downgrade {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  color: #000;
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

/* Tabela Comparação */
.comparacao-table {
  overflow-x: auto;
}

.comparacao-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparacao-table th,
.comparacao-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.comparacao-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.comparacao-table td.feature-name {
  text-align: left;
  font-weight: 500;
  color: #2c3e50;
}

.comparacao-table i.check {
  color: #28a745;
  font-size: 1.2rem;
}

.comparacao-table i.times {
  color: #dc3545;
  font-size: 1.2rem;
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.faq-item h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.faq-item h3 i {
  color: #667eea;
}

.faq-item p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* Botão */
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

  .planos-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .plano-card:hover {
    transform: none;
  }

  .comparacao-table {
    font-size: 0.875rem;
  }

  .comparacao-table th,
  .comparacao-table td {
    padding: 0.5rem;
  }

  .valor {
    font-size: 2.5rem;
  }
}
</style>

