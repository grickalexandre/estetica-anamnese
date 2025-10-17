<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-users"></i> Clientes</h1>
      <button @click="abrirModal" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Cliente</button>
    </div>

    <div class="card">
      <div v-if="carregando" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      <div v-else-if="clientes.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <p>Nenhum cliente cadastrado</p>
        <button @click="abrirModal" class="btn btn-primary">Cadastrar Primeiro Cliente</button>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Data Nasc.</th>
            <th>Atendimentos</th>
            <th>Total Gasto</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cli in clientes" :key="cli.id">
            <td><strong>{{ cli.nome }}</strong></td>
            <td>{{ cli.telefone }}</td>
            <td>{{ cli.email || '-' }}</td>
            <td>{{ formatarData(cli.dataNascimento) }}</td>
            <td>{{ cli.totalAtendimentos || 0 }}</td>
            <td class="valor">R$ {{ formatarMoeda(cli.totalGasto || 0) }}</td>
            <td><span :class="['status-badge', cli.ativo ? 'ativo' : 'inativo']">{{ cli.ativo ? 'Ativo' : 'Inativo' }}</span></td>
            <td class="acoes">
              <button @click="verHistorico(cli)" class="btn-icon btn-info" title="Histórico"><i class="fas fa-history"></i></button>
              <button @click="editar(cli)" class="btn-icon btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Cliente -->
    <div v-if="modal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-user-plus"></i> {{ clienteEditando ? 'Editar' : 'Novo' }} Cliente</h2>
          <button @click="fecharModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input v-model="form.nome" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefone *</label>
              <input v-model="form.telefone" type="tel" required placeholder="(00) 00000-0000">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data Nascimento</label>
              <input v-model="form.dataNascimento" type="date">
            </div>
            <div class="form-group">
              <label>CPF</label>
              <input v-model="form.cpf" placeholder="000.000.000-00">
            </div>
          </div>
          <div class="form-group">
            <label>Endereço</label>
            <input v-model="form.endereco">
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClientes } from '../composables/useClientes.js'

const { clientes, carregando, buscarClientes, adicionarCliente, atualizarCliente } = useClientes()

const modal = ref(false)
const clienteEditando = ref(null)
const form = ref({ nome: '', telefone: '', email: '', dataNascimento: '', cpf: '', endereco: '', observacoes: '' })

onMounted(() => buscarClientes())

const abrirModal = () => {
  modal.value = true
  clienteEditando.value = null
  form.value = { nome: '', telefone: '', email: '', dataNascimento: '', cpf: '', endereco: '', observacoes: '' }
}

const editar = (cli) => {
  modal.value = true
  clienteEditando.value = cli
  form.value = { ...cli }
}

const salvar = async () => {
  const resultado = clienteEditando.value
    ? await atualizarCliente(clienteEditando.value.id, form.value)
    : await adicionarCliente(form.value)
  
  if (resultado.success) {
    await buscarClientes()
    fecharModal()
    alert('Cliente salvo!')
  }
}

const verHistorico = (cli) => {
  alert(`Histórico de ${cli.nome}\n\nAtendimentos: ${cli.totalAtendimentos || 0}\nTotal Gasto: R$ ${formatarMoeda(cli.totalGasto || 0)}`)
}

const fecharModal = () => { modal.value = false }

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor || 0)
}

const formatarData = (data) => {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; color: #1d1d1f; display: flex; align-items: center; gap: 12px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; padding: 12px; background: #f5f5f7; font-weight: 600; font-size: 13px; }
.data-table tbody td { padding: 14px 12px; border-bottom: 1px solid #e5e5ea; }
.valor { font-weight: 600; color: #667eea; }
.status-badge { padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-badge.ativo { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.inativo { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.acoes { display: flex; gap: 8px; }
.btn-icon { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; color: white; }
.btn-icon.btn-info { background: #667eea; }
.btn-icon.btn-edit { background: #007aff; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e5e5ea; }
.modal-header h2 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f7; cursor: pointer; }
.modal-content form { padding: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5ea; }
.loading, .empty-state { text-align: center; padding: 60px; color: #6e6e73; }
.empty-state i { font-size: 64px; color: #d2d2d7; margin-bottom: 16px; }
</style>

