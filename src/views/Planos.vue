<template>
  <div class="container">
    <div class="card">
      <h1><i class="fas fa-crown"></i> Planos e Assinatura</h1>
      
      <div class="current-plan">
        <div class="plan-badge" :class="{ premium: isPaid }">
          {{ planoAtual.toUpperCase() }}
        </div>
        <h2>Plano Atual: {{ planoAtual === 'free' ? 'Gratuito' : 'Premium' }}</h2>
        <p v-if="isFree">Aproveite mais recursos com o plano Premium!</p>
        <p v-else>Você tem acesso a todos os recursos!</p>
      </div>

      <div class="plans-comparison">
        <div class="plan-column" :class="{ current: isFree }">
          <div class="plan-header">
            <h3>Plano Free</h3>
            <div class="price">
              <span class="currency">R$</span>
              <span class="value">0</span>
              <span class="period">/mês</span>
            </div>
          </div>

          <ul class="features">
            <li><i class="fas fa-check"></i> <strong>100</strong> anamneses</li>
            <li><i class="fas fa-check"></i> <strong>1</strong> usuário</li>
            <li><i class="fas fa-check"></i> <strong>4</strong> fotos por paciente</li>
            <li><i class="fas fa-check"></i> Upload até <strong>10MB</strong></li>
            <li><i class="fas fa-check"></i> Relatórios básicos</li>
            <li><i class="fas fa-check"></i> Formulário online</li>
            <li><i class="fas fa-times text-muted"></i> Suporte prioritário</li>
            <li><i class="fas fa-times text-muted"></i> Relatórios avançados</li>
            <li><i class="fas fa-times text-muted"></i> Logo personalizada</li>
          </ul>

          <button 
            v-if="!isFree" 
            class="btn btn-secondary"
            @click="downgradePlano"
            :disabled="loading"
          >
            Voltar para Free
          </button>
          <div v-else class="btn btn-current">
            <i class="fas fa-check-circle"></i>
            Plano Atual
          </div>
        </div>

        <div class="plan-column premium" :class="{ current: isPaid }">
          <div class="plan-badge-corner">RECOMENDADO</div>
          <div class="plan-header">
            <h3>Plano Premium</h3>
            <div class="price">
              <span class="currency">R$</span>
              <span class="value">49</span>
              <span class="period">/mês</span>
            </div>
            <p class="discount">ou R$ 490/ano (2 meses grátis)</p>
          </div>

          <ul class="features">
            <li><i class="fas fa-check"></i> Anamneses <strong>ilimitadas</strong></li>
            <li><i class="fas fa-check"></i> Até <strong>10</strong> usuários</li>
            <li><i class="fas fa-check"></i> <strong>20</strong> fotos por paciente</li>
            <li><i class="fas fa-check"></i> Upload até <strong>50MB</strong></li>
            <li><i class="fas fa-check"></i> Relatórios avançados</li>
            <li><i class="fas fa-check"></i> Formulário online</li>
            <li><i class="fas fa-check"></i> <strong>Suporte prioritário</strong></li>
            <li><i class="fas fa-check"></i> <strong>Dashboards completos</strong></li>
            <li><i class="fas fa-check"></i> <strong>Logo personalizada</strong></li>
            <li><i class="fas fa-check"></i> <strong>Domínio próprio</strong></li>
          </ul>

          <button 
            v-if="isFree" 
            class="btn btn-premium"
            @click="upgradePlano"
            :disabled="loading"
          >
            <i v-if="!loading" class="fas fa-crown"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ loading ? 'Processando...' : 'Fazer Upgrade' }}
          </button>
          <div v-else class="btn btn-current premium-current">
            <i class="fas fa-check-circle"></i>
            Plano Atual
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3><i class="fas fa-info-circle"></i> Informações Importantes</h3>
        <ul>
          <li>✅ Cancele a qualquer momento, sem multas</li>
          <li>✅ Pagamento seguro via cartão de crédito ou PIX</li>
          <li>✅ Seus dados são mantidos após o downgrade</li>
          <li>✅ Upgrade instantâneo, sem perda de dados</li>
          <li>✅ Suporte via WhatsApp para planos pagos</li>
        </ul>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { planoAtual, isFree, isPaid, userProfile } = useAuth()

const loading = ref(false)
const error = ref('')
const success = ref('')

const upgradePlano = () => {
  // TODO: Integrar com gateway de pagamento (Stripe, Mercado Pago, etc)
  alert('Em desenvolvimento: Integração com gateway de pagamento.\n\nEm produção, aqui seria redirecionado para o checkout.')
  
  // Simulação de upgrade
  // updatePlano('premium')
}

const downgradePlano = async () => {
  if (confirm('Tem certeza que deseja voltar para o plano gratuito? Seus dados serão mantidos, mas algumas funcionalidades ficarão limitadas.')) {
    // TODO: Implementar downgrade
    alert('Downgrade será implementado com a integração de pagamento')
  }
}
</script>

<style scoped>
.current-plan {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  margin-bottom: 40px;
  position: relative;
}

.plan-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.plan-badge.premium {
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
}

.current-plan h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.current-plan p {
  margin: 0;
  opacity: 0.9;
}

.plans-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.plan-column {
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  padding: 30px;
  position: relative;
  transition: all 0.3s ease;
}

.plan-column.current {
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.plan-column.premium {
  border-color: #f59e0b;
}

.plan-column.premium.current {
  border-color: #f59e0b;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
}

.plan-badge-corner {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.plan-header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.plan-header h3 {
  font-size: 22px;
  margin: 0 0 15px 0;
  color: #1d1d1f;
}

.price {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.currency {
  font-size: 20px;
  color: #6b7280;
  margin-top: 8px;
}

.value {
  font-size: 48px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}

.period {
  font-size: 16px;
  color: #6b7280;
  margin-top: 20px;
}

.discount {
  font-size: 13px;
  color: #10b981;
  margin: 8px 0 0 0;
  font-weight: 600;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 25px 0;
}

.features li {
  padding: 10px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.features i {
  font-size: 14px;
}

.features .fa-check {
  color: #10b981;
}

.features .fa-times {
  color: #d1d5db;
}

.text-muted {
  color: #9ca3af;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-premium {
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
  color: white;
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-current {
  background: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
}

.btn-current.premium-current {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%);
  color: #f59e0b;
  border: 2px solid #f59e0b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-section {
  background: #f9fafb;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.info-section h3 {
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #1d1d1f;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.success {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

@media (max-width: 968px) {
  .plans-comparison {
    grid-template-columns: 1fr;
  }
}
</style>

