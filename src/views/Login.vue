<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>🌸 Estética Anamnese</h1>
        <p>Sistema de Gestão de Anamneses</p>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required
          >
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input 
            v-model="senha" 
            type="password" 
            placeholder="••••••••"
            required
          >
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i v-if="!loading" class="fas fa-sign-in-alt"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Não tem uma conta?</p>
        <router-link to="/cadastro" class="link">
          <i class="fas fa-user-plus"></i>
          Criar conta grátis
        </router-link>
      </div>
    </div>

    <div class="auth-info">
      <h3>✨ Recursos Incluídos</h3>
      <ul>
        <li><i class="fas fa-check"></i> Anamneses ilimitadas (plano free: 100)</li>
        <li><i class="fas fa-check"></i> Upload de fotos</li>
        <li><i class="fas fa-check"></i> Relatórios e estatísticas</li>
        <li><i class="fas fa-check"></i> Formulário online para pacientes</li>
        <li><i class="fas fa-check"></i> Multi-clínica (SaaS)</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useClinica } from '../composables/useClinica.js'

const router = useRouter()
const { login } = useAuth()
const { setClinica } = useClinica()

const email = ref('')
const senha = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const result = await login(email.value, senha.value)
    
    if (result.success) {
      // Redirecionar para home
      router.push('/')
    }
  } catch (err) {
    console.error('Erro ao fazer login:', err)
    
    // Traduzir erros do Firebase
    if (err.code === 'auth/user-not-found') {
      error.value = 'Usuário não encontrado'
    } else if (err.code === 'auth/wrong-password') {
      error.value = 'Senha incorreta'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Email inválido'
    } else if (err.code === 'auth/too-many-requests') {
      error.value = 'Muitas tentativas. Tente novamente mais tarde.'
    } else {
      error.value = 'Erro ao fazer login. Tente novamente.'
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
  padding: 20px;
  gap: 40px;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  margin-bottom: 20px;
  border-left: 4px solid #dc2626;
  font-size: 14px;
}

.auth-footer {
  margin-top: 30px;
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
  transform: translateX(4px);
}

.auth-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 350px;
  color: white;
}

.auth-info h3 {
  font-size: 20px;
  margin-bottom: 20px;
}

.auth-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.auth-info li {
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-info li:last-child {
  border-bottom: none;
}

.auth-info li i {
  color: #4ade80;
  font-size: 16px;
}

@media (max-width: 968px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-info {
    max-width: 420px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }

  .auth-header h1 {
    font-size: 24px;
  }
}
</style>

