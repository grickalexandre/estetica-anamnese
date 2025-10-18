<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-user-md"></i> Profissionais</h1>
      <button @click="abrirModal" class="btn btn-primary">
        <i class="fas fa-plus"></i> Novo Profissional
      </button>
    </div>

    <div class="card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando...
      </div>
      
      <div v-else-if="profissionais.length === 0" class="empty-state">
        <i class="fas fa-user-md"></i>
        <p>Nenhum profissional cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Profissional</button>
      </div>
      
      <div v-else class="profissionais-grid">
        <div v-for="prof in profissionais" :key="prof.id" class="profissional-card">
          <div class="profissional-header">
            <div class="profissional-avatar">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="profissional-info">
              <h3>{{ prof.nome }}</h3>
              <span class="badge">{{ prof.especialidade }}</span>
            </div>
          </div>
          
          <div class="profissional-stats">
            <div class="stat-item">
              <i class="fas fa-calendar-check"></i>
              <div>
                <span class="stat-valor">{{ prof.totalAtendimentos || 0 }}</span>
                <span class="stat-label">Atendimentos</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-percentage"></i>
              <div>
                <span class="stat-valor">{{ prof.percentualComissao || 0 }}%</span>
                <span class="stat-label">Comissão</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-dollar-sign"></i>
              <div>
                <span class="stat-valor">R$ {{ formatarMoeda(prof.totalComissoes || 0) }}</span>
                <span class="stat-label">Total Comissões</span>
              </div>
            </div>
          </div>
          
          <div class="profissional-contato">
            <div class="contato-item" v-if="prof.telefone">
              <i class="fas fa-phone"></i>
              <span>{{ prof.telefone }}</span>
            </div>
            <div class="contato-item" v-if="prof.email">
              <i class="fas fa-envelope"></i>
              <span>{{ prof.email }}</span>
            </div>
            <div class="contato-item" v-if="prof.registroProfissional">
              <i class="fas fa-id-card"></i>
              <span>{{ prof.registroProfissional }}</span>
            </div>
          </div>
          
          <div class="profissional-acoes">
            <button @click="verComissoes(prof)" class="btn btn-secondary btn-small">
              <i class="fas fa-money-bill-wave"></i> Comissões
            </button>
            <button @click="editar(prof)" class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="desativar(prof.id)" class="btn-icon btn-disable" title="Desativar">
              <i class="fas fa-ban"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Profissional -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-user-md"></i> {{ profissionalEditando ? 'Editar' : 'Novo' }} Profissional</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input v-model="form.nome" required placeholder="Ex: Dr. João Silva">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Especialidade *</label>
              <select v-model="form.especialidade" required>
                <option value="esteticista">Esteticista</option>
                <option value="dermatologista">Dermatologista</option>
                <option value="fisioterapeuta">Fisioterapeuta</option>
                <option value="biomedicina">Biomedicina</option>
                <option value="enfermagem">Enfermagem</option>
                <option value="cosmetologo">Cosmetólogo</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Registro Profissional</label>
              <input v-model="form.registroProfissional" placeholder="Ex: CREFITO 123456">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.telefone" type="tel" placeholder="(14) 99999-9999">
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="profissional@email.com">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Percentual de Comissão (%)</label>
              <input v-model.number="form.percentualComissao" type="number" step="0.1" min="0" max="100" placeholder="0">
              <small class="form-help">Comissão sobre o valor do atendimento</small>
            </div>
            
            <div class="form-group">
              <label>Tipo de Comissão</label>
              <select v-model="form.tipoComissao">
                <option value="porcentagem">Porcentagem (%)</option>
                <option value="valor-fixo">Valor Fixo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfissionais } from '../composables/useProfissionais.js'

const router = useRouter()
const { 
  profissionais, 
  carregando, 
  buscarProfissionais, 
  adicionarProfissional, 
  atualizarProfissional,
  desativarProfissional
} = useProfissionais()

const modal = ref(false)
const profissionalEditando = ref(null)

const form = ref({
  nome: '',
  especialidade: 'esteticista',
  registroProfissional: '',
  telefone: '',
  email: '',
  percentualComissao: 0,
  tipoComissao: 'porcentagem',
  observacoes: ''
})

onMounted(() => {
  buscarProfissionais(true)
})

const abrirModal = () => {
  modal.value = true
  profissionalEditando.value = null
  form.value = {
    nome: '',
    especialidade: 'esteticista',
    registroProfissional: '',
    telefone: '',
    email: '',
    percentualComissao: 0,
    tipoComissao: 'porcentagem',
    observacoes: ''
  }
}

const editar = (prof) => {
  modal.value = true
  profissionalEditando.value = prof
  form.value = { ...prof }
}

const salvar = async () => {
  const resultado = profissionalEditando.value
    ? await atualizarProfissional(profissionalEditando.value.id, form.value)
    : await adicionarProfissional(form.value)
  
  if (resultado.success) {
    await buscarProfissionais(true)
    fecharModal()
    alert('Profissional salvo!')
  } else {
    alert('Erro: ' + resultado.error)
  }
}

const desativar = async (id) => {
  if (confirm('Desativar este profissional?')) {
    const resultado = await desativarProfissional(id)
    if (resultado.success) {
      await buscarProfissionais(true)
      alert('Profissional desativado!')
    }
  }
}

const verComissoes = (prof) => {
  router.push(`/comissoes?profissionalId=${prof.id}`)
}

const fecharModal = () => {
  modal.value = false
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }

.profissionais-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.profissional-card { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 1px solid #e5e5ea; transition: all 0.3s ease; }
.profissional-card:hover { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); transform: translateY(-4px); }

.profissional-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e5ea; }
.profissional-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
.profissional-info h3 { margin: 0 0 6px 0; font-size: 18px; color: #1d1d1f; }

.badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; background: #e5e5ea; color: #1d1d1f; display: inline-block; }

.profissional-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-item { display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 10px; border: 1px solid #e5e5ea; }
.stat-item i { font-size: 20px; color: #667eea; }
.stat-valor { display: block; font-size: 16px; font-weight: 700; color: #1d1d1f; }
.stat-label { display: block; font-size: 11px; color: #6e6e73; }

.profissional-contato { margin-bottom: 16px; }
.contato-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #6e6e73; }
.contato-item i { width: 16px; color: #667eea; }

.profissional-acoes { display: flex; gap: 8px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #e5e5ea; }
.btn-small { padding: 8px 12px; font-size: 13px; }
.btn-icon { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon.btn-edit { background: #007aff; color: white; }
.btn-icon.btn-disable { background: #ff9500; color: white; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; margin: 0; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }

.form-help { font-size: 12px; color: #8e8e93; margin-top: 4px; display: block; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }

@media (max-width: 768px) {
  .profissionais-grid { grid-template-columns: 1fr; }
  .profissional-stats { grid-template-columns: 1fr; }
}
</style>

