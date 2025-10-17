<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1><i class="fas fa-sitemap"></i> Plano de Contas</h1>
        <p>Gerencie as categorias de receitas e despesas da sua clínica</p>
      </div>
      <div class="header-actions">
        <button @click="inicializar" class="btn btn-secondary" v-if="categorias.length === 0">
          <i class="fas fa-magic"></i>
          Criar Plano Padrão
        </button>
        <button @click="abrirModalNova" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Nova Categoria
        </button>
      </div>
    </div>

    <!-- Tabs: Receitas / Despesas -->
    <div class="tabs">
      <button 
        @click="tipoSelecionado = 'receita'" 
        :class="['tab', { active: tipoSelecionado === 'receita' }]"
      >
        <i class="fas fa-arrow-up"></i>
        Receitas
      </button>
      <button 
        @click="tipoSelecionado = 'despesa'" 
        :class="['tab', { active: tipoSelecionado === 'despesa' }]"
      >
        <i class="fas fa-arrow-down"></i>
        Despesas
      </button>
    </div>

    <!-- Lista de Categorias -->
    <div class="card">
      <div v-if="carregando" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando plano de contas...
      </div>

      <div v-else-if="categoriasFiltradas.length === 0" class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Nenhuma categoria cadastrada</p>
        <button @click="inicializar" class="btn btn-primary">
          <i class="fas fa-magic"></i>
          Criar Plano de Contas Padrão
        </button>
      </div>

      <div v-else class="categorias-tree">
        <div 
          v-for="categoria in arvoreCategorias" 
          :key="categoria.id"
          :class="['categoria-item', `nivel-${categoria.nivel}`, { inativa: !categoria.ativa }]"
        >
          <div class="categoria-info">
            <span class="codigo">{{ categoria.codigo }}</span>
            <strong>{{ categoria.nome }}</strong>
            <span v-if="categoria.descricao" class="descricao">{{ categoria.descricao }}</span>
            <span v-if="!categoria.ativa" class="badge-inativa">Inativa</span>
          </div>
          <div class="categoria-acoes" v-if="categoria.editavel">
            <button 
              @click="editarCategoria(categoria)" 
              class="btn-icon btn-edit"
              title="Editar"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              v-if="categoria.ativa"
              @click="desativar(categoria)" 
              class="btn-icon btn-disable"
              title="Desativar"
            >
              <i class="fas fa-ban"></i>
            </button>
            <button 
              v-else
              @click="ativar(categoria)" 
              class="btn-icon btn-success"
              title="Ativar"
            >
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Legenda -->
    <div class="card legenda-card">
      <h3><i class="fas fa-info-circle"></i> Legenda</h3>
      <div class="legenda">
        <div class="legenda-item">
          <div class="nivel-box nivel-1"></div>
          <span>Nível 1: Grupo Principal</span>
        </div>
        <div class="legenda-item">
          <div class="nivel-box nivel-2"></div>
          <span>Nível 2: Subgrupo</span>
        </div>
        <div class="legenda-item">
          <div class="nivel-box nivel-3"></div>
          <span>Nível 3: Categoria (utilizável)</span>
        </div>
      </div>
    </div>

    <!-- Modal Nova/Editar Categoria -->
    <div v-if="modalCategoria" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas fa-folder-plus"></i>
            {{ categoriaEditando ? 'Editar' : 'Nova' }} Categoria
          </h2>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarCategoria">
          <div class="form-group">
            <label>Tipo *</label>
            <div class="tipo-selector">
              <label class="tipo-option receita" :class="{ active: formulario.tipo === 'receita' }">
                <input type="radio" v-model="formulario.tipo" value="receita" required>
                <i class="fas fa-arrow-up"></i>
                <span>Receita</span>
              </label>
              <label class="tipo-option despesa" :class="{ active: formulario.tipo === 'despesa' }">
                <input type="radio" v-model="formulario.tipo" value="despesa" required>
                <i class="fas fa-arrow-down"></i>
                <span>Despesa</span>
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Código *</label>
              <input 
                v-model="formulario.codigo" 
                type="text" 
                required 
                placeholder="Ex: 3.1.4"
                pattern="[0-9]+\.[0-9]+(\.[0-9]+)?"
              >
              <small>Formato: X.Y ou X.Y.Z</small>
            </div>

            <div class="form-group">
              <label>Nível *</label>
              <select v-model.number="formulario.nivel" required>
                <option value="2">Nível 2 - Subgrupo</option>
                <option value="3">Nível 3 - Categoria</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Nome *</label>
            <input v-model="formulario.nome" type="text" required placeholder="Nome da categoria">
          </div>

          <div class="form-group">
            <label>Categoria Pai</label>
            <select v-model="formulario.pai">
              <option value="">Nenhuma (raiz)</option>
              <optgroup v-if="formulario.tipo === 'receita'" label="Receitas">
                <option 
                  v-for="cat in categoriasPai.filter(c => c.tipo === 'receita')" 
                  :key="cat.id"
                  :value="cat.codigo"
                >
                  {{ cat.codigo }} - {{ cat.nome }}
                </option>
              </optgroup>
              <optgroup v-if="formulario.tipo === 'despesa'" label="Despesas">
                <option 
                  v-for="cat in categoriasPai.filter(c => c.tipo === 'despesa')" 
                  :key="cat.id"
                  :value="cat.codigo"
                >
                  {{ cat.codigo }} - {{ cat.nome }}
                </option>
              </optgroup>
            </select>
            <small>Selecione a categoria pai na hierarquia</small>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea 
              v-model="formulario.descricao" 
              rows="3" 
              placeholder="Descrição opcional da categoria"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <i class="fas fa-save"></i>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlanoContas } from '../composables/usePlanoContas.js'

const {
  categorias,
  carregando,
  inicializarPlanoContas,
  buscarCategorias,
  adicionarCategoria,
  atualizarCategoria,
  desativarCategoria
} = usePlanoContas()

const tipoSelecionado = ref('receita')
const modalCategoria = ref(false)
const salvando = ref(false)
const categoriaEditando = ref(null)

const formulario = ref({
  tipo: 'receita',
  codigo: '',
  nivel: 3,
  nome: '',
  pai: '',
  descricao: ''
})

onMounted(async () => {
  await buscarCategorias()
})

const categoriasFiltradas = computed(() => {
  return categorias.value.filter(c => c.tipo === tipoSelecionado.value)
})

const arvoreCategorias = computed(() => {
  return categoriasFiltradas.value.sort((a, b) => {
    return a.codigo.localeCompare(b.codigo)
  })
})

const categoriasPai = computed(() => {
  return categorias.value.filter(c => c.nivel < 3)
})

const inicializar = async () => {
  if (!confirm('Deseja criar o plano de contas padrão? Isso criará categorias pré-definidas.')) {
    return
  }

  const resultado = await inicializarPlanoContas()
  
  if (resultado.success) {
    alert('Plano de contas criado com sucesso!')
    await buscarCategorias()
  } else {
    alert('Erro ao criar plano de contas: ' + resultado.error)
  }
}

const abrirModalNova = () => {
  modalCategoria.value = true
  categoriaEditando.value = null
  formulario.value = {
    tipo: tipoSelecionado.value,
    codigo: '',
    nivel: 3,
    nome: '',
    pai: '',
    descricao: ''
  }
}

const editarCategoria = (categoria) => {
  modalCategoria.value = true
  categoriaEditando.value = categoria
  formulario.value = {
    tipo: categoria.tipo,
    codigo: categoria.codigo,
    nivel: categoria.nivel,
    nome: categoria.nome,
    pai: categoria.pai || '',
    descricao: categoria.descricao || ''
  }
}

const fecharModal = () => {
  modalCategoria.value = false
  categoriaEditando.value = null
}

const salvarCategoria = async () => {
  try {
    salvando.value = true

    const dados = {
      tipo: formulario.value.tipo,
      codigo: formulario.value.codigo,
      nivel: formulario.value.nivel,
      nome: formulario.value.nome,
      pai: formulario.value.pai || null,
      descricao: formulario.value.descricao
    }

    let resultado
    if (categoriaEditando.value) {
      resultado = await atualizarCategoria(categoriaEditando.value.id, dados)
    } else {
      resultado = await adicionarCategoria(dados)
    }

    if (resultado.success) {
      await buscarCategorias()
      fecharModal()
      alert(categoriaEditando.value ? 'Categoria atualizada!' : 'Categoria criada!')
    } else {
      alert('Erro: ' + resultado.error)
    }
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar categoria')
  } finally {
    salvando.value = false
  }
}

const desativar = async (categoria) => {
  if (!confirm(`Deseja desativar a categoria "${categoria.nome}"?`)) {
    return
  }

  const resultado = await desativarCategoria(categoria.id)
  if (resultado.success) {
    await buscarCategorias()
    alert('Categoria desativada!')
  } else {
    alert('Erro ao desativar categoria')
  }
}

const ativar = async (categoria) => {
  const resultado = await atualizarCategoria(categoria.id, { ativa: true })
  if (resultado.success) {
    await buscarCategorias()
    alert('Categoria ativada!')
  } else {
    alert('Erro ao ativar categoria')
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-header p {
  color: #6e6e73;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e5ea;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #6e6e73;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab:hover {
  color: #1d1d1f;
}

.tab.active {
  color: #1d1d1f;
  border-bottom-color: #1d1d1f;
}

/* Árvore de Categorias */
.categorias-tree {
  display: flex;
  flex-direction: column;
}

.categoria-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-left: 4px solid;
  margin-bottom: 1px;
  background: white;
  transition: background 0.2s;
}

.categoria-item:hover {
  background: #f9f9f9;
}

.categoria-item.inativa {
  opacity: 0.5;
}

.categoria-item.nivel-1 {
  border-left-color: #1d1d1f;
  background: #f5f5f7;
  font-weight: 700;
  padding-left: 16px;
}

.categoria-item.nivel-2 {
  border-left-color: #6e6e73;
  font-weight: 600;
  padding-left: 32px;
}

.categoria-item.nivel-3 {
  border-left-color: #d2d2d7;
  padding-left: 48px;
}

.categoria-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.codigo {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #1d1d1f;
  min-width: 60px;
}

.descricao {
  font-size: 13px;
  color: #86868b;
  font-style: italic;
}

.badge-inativa {
  background: #ff3b30;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.categoria-acoes {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon.btn-edit {
  background: #007aff;
  color: white;
}

.btn-icon.btn-disable {
  background: #ff9500;
  color: white;
}

.btn-icon.btn-success {
  background: #34c759;
  color: white;
}

.btn-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Legenda */
.legenda-card {
  margin-top: 24px;
}

.legenda-card h3 {
  font-size: 16px;
  color: #1d1d1f;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legenda {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legenda-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nivel-box {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border-left: 4px solid;
}

.nivel-box.nivel-1 {
  background: #f5f5f7;
  border-left-color: #1d1d1f;
}

.nivel-box.nivel-2 {
  background: white;
  border-left-color: #6e6e73;
}

.nivel-box.nivel-3 {
  background: white;
  border-left-color: #d2d2d7;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h2 {
  font-size: 20px;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f7;
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e5ea;
}

.modal-content form {
  padding: 24px;
}

.tipo-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tipo-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tipo-option input[type="radio"] {
  display: none;
}

.tipo-option i {
  font-size: 32px;
}

.tipo-option span {
  font-weight: 600;
  font-size: 15px;
}

.tipo-option.receita {
  color: #667eea;
}

.tipo-option.despesa {
  color: #ff6b6b;
}

.tipo-option.active {
  border-width: 3px;
}

.tipo-option.receita.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tipo-option.despesa.active {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

.empty-state i {
  font-size: 64px;
  color: #d2d2d7;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .categoria-item.nivel-2 {
    padding-left: 24px;
  }

  .categoria-item.nivel-3 {
    padding-left: 36px;
  }

  .categoria-info {
    flex-wrap: wrap;
  }

  .descricao {
    flex-basis: 100%;
  }
}
</style>

