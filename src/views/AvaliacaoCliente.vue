<template>
  <div class="avaliacao-container">
    <div class="avaliacao-wrapper">
      <!-- Header -->
      <div class="avaliacao-header">
        <div class="logo">
          <i class="fas fa-spa"></i>
        </div>
        <h1>Avalie seu Atendimento</h1>
        <p class="subtitle">Sua opinião é muito importante para nós!</p>
      </div>

      <!-- Sucesso -->
      <div v-if="enviado" class="sucesso-card">
        <div class="sucesso-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Obrigado pela sua avaliação!</h2>
        <p>Sua opinião nos ajuda a melhorar cada dia mais.</p>
        <p class="agradecimento">
          <i class="fas fa-heart"></i>
          Esperamos vê-lo(a) novamente em breve!
        </p>
      </div>

      <!-- Formulário -->
      <form v-else @submit.prevent="enviarAvaliacao" class="avaliacao-form">
        <!-- Dados do Cliente -->
        <div class="form-section">
          <h2><i class="fas fa-user"></i> Seus Dados</h2>
          
          <div class="form-group">
            <label>Nome Completo *</label>
            <input 
              type="text" 
              v-model="form.clienteNome" 
              placeholder="Digite seu nome"
              required
            >
          </div>

          <div class="form-group">
            <label>Procedimento Realizado *</label>
            <input 
              type="text" 
              v-model="form.procedimentoNome" 
              placeholder="Ex: Limpeza de Pele"
              required
            >
          </div>
        </div>

        <!-- Nota Geral -->
        <div class="form-section">
          <h2><i class="fas fa-star"></i> Avaliação Geral</h2>
          <p class="helper">Como você avalia sua experiência de forma geral?</p>
          
          <div class="estrelas-input">
            <button 
              v-for="n in 5" 
              :key="n"
              type="button"
              @click="form.nota = n"
              :class="['estrela-btn', { active: n <= form.nota }]"
            >
              <i class="fas fa-star"></i>
            </button>
          </div>
          <div class="nota-texto">
            <span v-if="form.nota === 1">😞 Insatisfeito</span>
            <span v-else-if="form.nota === 2">😐 Pouco Satisfeito</span>
            <span v-else-if="form.nota === 3">🙂 Satisfeito</span>
            <span v-else-if="form.nota === 4">😃 Muito Satisfeito</span>
            <span v-else-if="form.nota === 5">😍 Extremamente Satisfeito</span>
            <span v-else class="selecione">Selecione uma nota</span>
          </div>
        </div>

        <!-- Avaliação por Aspectos -->
        <div class="form-section">
          <h2><i class="fas fa-chart-bar"></i> Avaliação Detalhada</h2>
          <p class="helper">Avalie aspectos específicos do seu atendimento:</p>

          <!-- Atendimento -->
          <div class="aspecto-grupo">
            <div class="aspecto-label">
              <i class="fas fa-hand-holding-heart"></i>
              <span>Qualidade do Atendimento</span>
            </div>
            <div class="estrelas-mini">
              <button 
                v-for="n in 5" 
                :key="`atendimento-${n}`"
                type="button"
                @click="form.aspectos.atendimento = n"
                :class="['estrela-btn-mini', { active: n <= form.aspectos.atendimento }]"
              >
                <i class="fas fa-star"></i>
              </button>
            </div>
          </div>

          <!-- Ambiente -->
          <div class="aspecto-grupo">
            <div class="aspecto-label">
              <i class="fas fa-building"></i>
              <span>Limpeza e Ambiente</span>
            </div>
            <div class="estrelas-mini">
              <button 
                v-for="n in 5" 
                :key="`ambiente-${n}`"
                type="button"
                @click="form.aspectos.ambiente = n"
                :class="['estrela-btn-mini', { active: n <= form.aspectos.ambiente }]"
              >
                <i class="fas fa-star"></i>
              </button>
            </div>
          </div>

          <!-- Resultado -->
          <div class="aspecto-grupo">
            <div class="aspecto-label">
              <i class="fas fa-check-circle"></i>
              <span>Resultado do Procedimento</span>
            </div>
            <div class="estrelas-mini">
              <button 
                v-for="n in 5" 
                :key="`resultado-${n}`"
                type="button"
                @click="form.aspectos.resultado = n"
                :class="['estrela-btn-mini', { active: n <= form.aspectos.resultado }]"
              >
                <i class="fas fa-star"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Comentário -->
        <div class="form-section">
          <h2><i class="fas fa-comment"></i> Comentário (Opcional)</h2>
          <p class="helper">Compartilhe mais detalhes sobre sua experiência:</p>
          
          <div class="form-group">
            <textarea 
              v-model="form.comentario" 
              rows="5"
              placeholder="Conte-nos sobre sua experiência, o que você mais gostou ou o que podemos melhorar..."
            ></textarea>
          </div>
        </div>

        <!-- Recomendação -->
        <div class="form-section">
          <h2><i class="fas fa-thumbs-up"></i> Recomendação</h2>
          <p class="helper">Você recomendaria nossa clínica para amigos e familiares?</p>
          
          <div class="recomendacao-buttons">
            <button 
              type="button"
              :class="['btn-recomendacao', { active: form.recomendaria === true }]"
              @click="form.recomendaria = true"
            >
              <i class="fas fa-thumbs-up"></i>
              Sim, recomendaria
            </button>
            <button 
              type="button"
              :class="['btn-recomendacao negativo', { active: form.recomendaria === false }]"
              @click="form.recomendaria = false"
            >
              <i class="fas fa-thumbs-down"></i>
              Não recomendaria
            </button>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button type="submit" class="btn-enviar" :disabled="!validarForm() || enviando">
            <i class="fas fa-paper-plane"></i>
            {{ enviando ? 'Enviando...' : 'Enviar Avaliação' }}
          </button>
        </div>

        <p class="privacy-text">
          <i class="fas fa-lock"></i>
          Suas informações são confidenciais e usadas apenas para melhorar nossos serviços.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAvaliacoes } from '../composables/useAvaliacoes.js'

const { criarAvaliacao } = useAvaliacoes()

// Estado
const enviando = ref(false)
const enviado = ref(false)

// Formulário
const form = ref({
  clienteNome: '',
  procedimentoNome: '',
  nota: 0,
  aspectos: {
    atendimento: 0,
    ambiente: 0,
    resultado: 0
  },
  comentario: '',
  recomendaria: null
})

// Métodos
const validarForm = () => {
  return (
    form.value.clienteNome.trim() !== '' &&
    form.value.procedimentoNome.trim() !== '' &&
    form.value.nota > 0 &&
    form.value.aspectos.atendimento > 0 &&
    form.value.aspectos.ambiente > 0 &&
    form.value.aspectos.resultado > 0 &&
    form.value.recomendaria !== null
  )
}

const enviarAvaliacao = async () => {
  if (!validarForm()) {
    alert('Por favor, preencha todos os campos obrigatórios')
    return
  }

  enviando.value = true
  try {
    console.log('Enviando avaliação:', form.value)
    
    const resultado = await criarAvaliacao({
      clienteNome: form.value.clienteNome,
      procedimentoNome: form.value.procedimentoNome,
      nota: form.value.nota,
      aspectos: form.value.aspectos,
      comentario: form.value.comentario,
      recomendaria: form.value.recomendaria
    })
    
    if (resultado.success) {
      console.log('Avaliação enviada com sucesso!')
      enviado.value = true
      
      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.error('Erro ao enviar avaliação:', resultado.error)
      alert('Erro ao enviar avaliação: ' + resultado.error)
    }
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error)
    alert('Erro ao enviar avaliação. Por favor, tente novamente.')
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.avaliacao-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avaliacao-wrapper {
  max-width: 700px;
  width: 100%;
}

/* Header */
.avaliacao-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  backdrop-filter: blur(10px);
}

.avaliacao-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.95;
  margin: 0;
}

/* Sucesso */
.sucesso-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.sucesso-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.sucesso-card h2 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.sucesso-card p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
}

.agradecimento {
  color: #667eea !important;
  font-weight: 600;
  font-size: 1.2rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.agradecimento i {
  color: #e74c3c;
  animation: heartbeat 1.5s infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
}

/* Formulário */
.avaliacao-form {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 1.5rem;
}

.form-section h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h2 i {
  color: #667eea;
}

.helper {
  color: #666;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

/* Estrelas Input */
.estrelas-input {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.estrela-btn {
  background: none;
  border: none;
  font-size: 3rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.25rem;
}

.estrela-btn:hover {
  transform: scale(1.2);
  color: #ffc107;
}

.estrela-btn.active {
  color: #ffc107;
  animation: starPop 0.3s ease-out;
}

@keyframes starPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.nota-texto {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  min-height: 1.5rem;
}

.nota-texto .selecione {
  color: #999;
  font-weight: normal;
  font-style: italic;
}

/* Aspectos */
.aspecto-grupo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.aspecto-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.aspecto-label i {
  color: #667eea;
  font-size: 1.2rem;
}

.estrelas-mini {
  display: flex;
  gap: 0.25rem;
}

.estrela-btn-mini {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.125rem;
}

.estrela-btn-mini:hover {
  transform: scale(1.1);
  color: #ffc107;
}

.estrela-btn-mini.active {
  color: #ffc107;
}

/* Recomendação */
.recomendacao-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.btn-recomendacao {
  padding: 1.5rem;
  border: 3px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-recomendacao i {
  font-size: 2rem;
}

.btn-recomendacao:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-recomendacao.active {
  border-color: #28a745;
  background: #d4edda;
  color: #155724;
}

.btn-recomendacao.negativo.active {
  border-color: #dc3545;
  background: #f8d7da;
  color: #721c24;
}

/* Actions */
.form-actions {
  margin-bottom: 1rem;
}

.btn-enviar {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #00A859 0%, #4CAF50 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-enviar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-enviar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.privacy-text {
  text-align: center;
  font-size: 0.875rem;
  color: #999;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.privacy-text i {
  color: #667eea;
}

/* Responsivo */
@media (max-width: 768px) {
  .avaliacao-container {
    padding: 1rem;
  }

  .avaliacao-header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .avaliacao-form {
    padding: 1.5rem;
  }

  .estrelas-input {
    gap: 0.25rem;
  }

  .estrela-btn {
    font-size: 2.5rem;
  }

  .aspecto-grupo {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .recomendacao-buttons {
    grid-template-columns: 1fr;
  }

  .sucesso-card {
    padding: 2rem 1.5rem;
  }

  .sucesso-card h2 {
    font-size: 1.5rem;
  }
}
</style>

