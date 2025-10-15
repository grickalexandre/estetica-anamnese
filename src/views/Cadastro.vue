<template>
  <div class="auth-container">
    <div class="auth-card large">
      <div class="auth-header">
        <h1>🌸 Criar sua Clínica</h1>
        <p>Comece grátis e atualize quando precisar</p>
      </div>

      <!-- Seleção de Plano -->
      <div class="plans-selector">
        <div 
          class="plan-card" 
          :class="{ active: planoSelecionado === 'free' }"
          @click="planoSelecionado = 'free'"
        >
          <div class="plan-badge">Grátis</div>
          <h3>Plano Free</h3>
          <div class="plan-price">R$ 0<span>/mês</span></div>
          <ul class="plan-features">
            <li><i class="fas fa-check"></i> Até 100 anamneses</li>
            <li><i class="fas fa-check"></i> 1 usuário</li>
            <li><i class="fas fa-check"></i> 4 fotos por paciente</li>
            <li><i class="fas fa-check"></i> Upload até 10MB</li>
            <li><i class="fas fa-check"></i> Relatórios básicos</li>
          </ul>
        </div>

        <div 
          class="plan-card premium" 
          :class="{ active: planoSelecionado === 'premium' }"
          @click="planoSelecionado = 'premium'"
        >
          <div class="plan-badge premium-badge">Recomendado</div>
          <h3>Plano Premium</h3>
          <div class="plan-price">R$ 49<span>/mês</span></div>
          <ul class="plan-features">
            <li><i class="fas fa-check"></i> Anamneses ilimitadas</li>
            <li><i class="fas fa-check"></i> Até 10 usuários</li>
            <li><i class="fas fa-check"></i> 20 fotos por paciente</li>
            <li><i class="fas fa-check"></i> Upload até 50MB</li>
            <li><i class="fas fa-check"></i> Relatórios avançados</li>
            <li><i class="fas fa-check"></i> Suporte prioritário</li>
          </ul>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>

      <form @submit.prevent="handleCadastro">
        <h3 style="margin: 30px 0 20px 0; color: #1d1d1f;">Dados da Clínica</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nome da Clínica *</label>
            <input 
              v-model="form.nomeClinica" 
              type="text" 
              placeholder="Clínica Bella"
              required
            >
          </div>

          <div class="form-group">
            <label>Telefone</label>
            <input 
              v-model="form.telefone" 
              type="tel" 
              placeholder="(11) 99999-9999"
            >
          </div>
        </div>

        <h3 style="margin: 20px 0; color: #1d1d1f;">Seus Dados</h3>

        <div class="form-group">
          <label>Seu Nome *</label>
          <input 
            v-model="form.nome" 
            type="text" 
            placeholder="Maria Silva"
            required
          >
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="maria@clinica.com"
            required
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Senha *</label>
            <input 
              v-model="form.senha" 
              type="password" 
              placeholder="••••••••"
              minlength="6"
              required
            >
          </div>

          <div class="form-group">
            <label>Confirmar Senha *</label>
            <input 
              v-model="form.confirmarSenha" 
              type="password" 
              placeholder="••••••••"
              required
            >
          </div>
        </div>

        <div class="form-group checkbox-group">
          <input 
            v-model="form.aceitarTermos" 
            type="checkbox" 
            id="termos"
            required
          >
          <label for="termos">
            Aceito os <a href="#" class="link">termos de uso</a> e 
            <a href="#" class="link">política de privacidade</a>
          </label>
        </div>

        <button type="submit" class="btn btn-primary btn-large" :disabled="loading">
          <i v-if="!loading" class="fas fa-rocket"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ loading ? 'Criando conta...' : 'Criar Conta ' + (planoSelecionado === 'free' ? 'Grátis' : 'Premium') }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Já tem uma conta?</p>
        <router-link to="/login" class="link">
          <i class="fas fa-sign-in-alt"></i>
          Fazer login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { register } = useAuth()

const planoSelecionado = ref('free')
const error = ref('')
const success = ref('')
const loading = ref(false)

const form = ref({
  nomeClinica: '',
  telefone: '',
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  aceitarTermos: false
})

const handleCadastro = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    // Validações
    if (form.value.senha !== form.value.confirmarSenha) {
      error.value = 'As senhas não coincidem'
      loading.value = false
      return
    }

    if (form.value.senha.length < 6) {
      error.value = 'A senha deve ter no mínimo 6 caracteres'
      loading.value = false
      return
    }

    if (!form.value.aceitarTermos) {
      error.value = 'Você deve aceitar os termos de uso'
      loading.value = false
      return
    }

    // Registrar
    const result = await register({
      nomeClinica: form.value.nomeClinica,
      telefone: form.value.telefone,
      nome: form.value.nome,
      email: form.value.email,
      senha: form.value.senha,
      plano: planoSelecionado.value
    })

    if (result.success) {
      success.value = 'Conta criada com sucesso! Redirecionando...'
      
      setTimeout(() => {
        router.push('/?clinica=' + result.clinicaId)
      }, 2000)
    }
  } catch (err) {
    console.error('Erro ao cadastrar:', err)
    
    // Traduzir erros do Firebase
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'Este email já está em uso'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Email inválido'
    } else if (err.code === 'auth/weak-password') {
      error.value = 'Senha muito fraca'
    } else {
      error.value = 'Erro ao criar conta. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-card.large {
  max-width: 900px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 28px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.auth-header p {
  color: #6b7280;
  font-size: 14px;
}

.plans-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.plan-card {
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.plan-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.plan-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.plan-card.premium {
  border-color: #f59e0b;
}

.plan-card.premium.active {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 146, 60, 0.05) 100%);
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.premium-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
}

.plan-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #1d1d1f;
}

.plan-price {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.plan-price span {
  font-size: 16px;
  color: #6b7280;
  font-weight: 400;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-features i {
  color: #10b981;
  font-size: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-top: 4px;
}

.checkbox-group label {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
}

.btn {
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

.btn-large {
  width: 100%;
  padding: 16px;
  font-size: 18px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  border-left: 4px solid #dc2626;
  font-size: 14px;
}

.success {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  border-left: 4px solid #10b981;
  font-size: 14px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 10px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.link:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .plans-selector {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .auth-card {
    padding: 30px 20px;
  }
}
</style>

