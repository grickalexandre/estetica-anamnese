<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-broom"></i> Limpeza de Dados</h1>
      <p class="warning-text">⚠️ Use com cuidado! Esta ação não pode ser desfeita.</p>
    </div>

    <div class="card danger-zone">
      <h2><i class="fas fa-exclamation-triangle"></i> Zona de Perigo</h2>
      <p>Limpe dados específicos da sua clínica. Todos os dados serão permanentemente excluídos.</p>

      <div class="cleanup-options">
        <!-- Anamneses -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-clipboard-list"></i>
            <div>
              <h3>Anamneses</h3>
              <p>{{ totalAnamneses }} registro(s)</p>
            </div>
          </div>
          <button 
            @click="limparAnamneses" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Anamneses
          </button>
        </div>

        <!-- Clientes -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-users"></i>
            <div>
              <h3>Clientes/Pacientes</h3>
              <p>{{ totalClientes }} registro(s)</p>
            </div>
          </div>
          <button 
            @click="limparClientes" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Clientes
          </button>
        </div>

        <!-- Agendamentos -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-calendar"></i>
            <div>
              <h3>Agendamentos</h3>
              <p>{{ totalAgendamentos }} registro(s)</p>
            </div>
          </div>
          <button 
            @click="limparAgendamentos" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Agendamentos
          </button>
        </div>

        <!-- Atendimentos -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-user-md"></i>
            <div>
              <h3>Atendimentos</h3>
              <p>{{ totalAtendimentos }} registro(s)</p>
            </div>
          </div>
          <button 
            @click="limparAtendimentos" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Atendimentos
          </button>
        </div>

        <!-- Financeiro -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-dollar-sign"></i>
            <div>
              <h3>Dados Financeiros</h3>
              <p>Contas a pagar, receber e movimentações</p>
            </div>
          </div>
          <button 
            @click="limparFinanceiro" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Financeiro
          </button>
        </div>

        <!-- Produtos e Estoque -->
        <div class="cleanup-card">
          <div class="cleanup-header">
            <i class="fas fa-box"></i>
            <div>
              <h3>Produtos e Estoque</h3>
              <p>{{ totalProdutos }} produto(s)</p>
            </div>
          </div>
          <button 
            @click="limparProdutos" 
            class="btn btn-danger"
            :disabled="limpando"
          >
            <i class="fas fa-trash"></i>
            Limpar Produtos
          </button>
        </div>
      </div>

      <!-- Limpar Tudo -->
      <div class="cleanup-all">
        <h3><i class="fas fa-bomb"></i> Limpar TODOS os Dados</h3>
        <p>Remove TODOS os dados da clínica, exceto configurações. Use apenas se quiser recomeçar do zero.</p>
        <button 
          @click="limparTudo" 
          class="btn btn-danger btn-large"
          :disabled="limpando"
        >
          <i class="fas fa-exclamation-triangle"></i>
          LIMPAR TUDO
        </button>
      </div>
    </div>

    <!-- Status -->
    <div v-if="limpando" class="loading-overlay">
      <div class="loading-card">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ statusLimpeza }}</p>
      </div>
    </div>

    <div v-if="resultado" :class="['resultado-card', resultado.tipo]">
      <i :class="resultado.tipo === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
      <p>{{ resultado.mensagem }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase.js'
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore'
import { useClinica } from '../composables/useClinica.js'

const { clinicaId } = useClinica()
const limpando = ref(false)
const statusLimpeza = ref('')
const resultado = ref(null)

const totalAnamneses = ref(0)
const totalClientes = ref(0)
const totalAgendamentos = ref(0)
const totalAtendimentos = ref(0)
const totalProdutos = ref(0)

onMounted(async () => {
  await carregarTotais()
})

const carregarTotais = async () => {
  try {
    const collections = [
      { name: 'anamneses', ref: totalAnamneses },
      { name: 'clientes', ref: totalClientes },
      { name: 'agendamentos', ref: totalAgendamentos },
      { name: 'atendimentos', ref: totalAtendimentos },
      { name: 'produtos', ref: totalProdutos }
    ]

    for (const col of collections) {
      const q = query(collection(db, col.name), where('clinicaId', '==', clinicaId.value || 'demo'))
      const snapshot = await getDocs(q)
      col.ref.value = snapshot.size
    }
  } catch (err) {
    console.error('Erro ao carregar totais:', err)
  }
}

const limparCollection = async (collectionName, nomeExibicao) => {
  if (!confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente excluir TODOS os registros de ${nomeExibicao}?\n\nEsta ação NÃO pode ser desfeita!`)) {
    return
  }

  if (!confirm(`Última confirmação:\n\nVocê está prestes a excluir ${nomeExibicao}. Tem certeza absoluta?`)) {
    return
  }

  try {
    limpando.value = true
    statusLimpeza.value = `Limpando ${nomeExibicao}...`
    
    const q = query(
      collection(db, collectionName),
      where('clinicaId', '==', clinicaId.value || 'demo')
    )
    const snapshot = await getDocs(q)
    
    let deletados = 0
    for (const documento of snapshot.docs) {
      await deleteDoc(documento.ref)
      deletados++
      statusLimpeza.value = `Excluindo ${nomeExibicao}: ${deletados}/${snapshot.size}`
    }

    resultado.value = {
      tipo: 'success',
      mensagem: `✅ ${deletados} registro(s) de ${nomeExibicao} excluído(s) com sucesso!`
    }

    await carregarTotais()

    setTimeout(() => {
      resultado.value = null
    }, 5000)

  } catch (err) {
    console.error('Erro ao limpar:', err)
    resultado.value = {
      tipo: 'error',
      mensagem: `❌ Erro ao limpar ${nomeExibicao}: ${err.message}`
    }
  } finally {
    limpando.value = false
    statusLimpeza.value = ''
  }
}

const limparAnamneses = () => limparCollection('anamneses', 'Anamneses')
const limparClientes = () => limparCollection('clientes', 'Clientes/Pacientes')
const limparAgendamentos = () => limparCollection('agendamentos', 'Agendamentos')
const limparAtendimentos = () => limparCollection('atendimentos', 'Atendimentos')
const limparProdutos = () => limparCollection('produtos', 'Produtos')

const limparFinanceiro = async () => {
  if (!confirm('⚠️ Isso vai excluir TODAS as contas a pagar, contas a receber e movimentações!\n\nTem certeza?')) {
    return
  }

  try {
    limpando.value = true
    
    await limparCollection('contas_pagar', 'Contas a Pagar')
    await limparCollection('contas_receber', 'Contas a Receber')
    await limparCollection('movimentacoes', 'Movimentações')
    
    resultado.value = {
      tipo: 'success',
      mensagem: '✅ Dados financeiros limpos com sucesso!'
    }
  } catch (err) {
    resultado.value = {
      tipo: 'error',
      mensagem: '❌ Erro ao limpar dados financeiros'
    }
  } finally {
    limpando.value = false
  }
}

const limparTudo = async () => {
  if (!confirm('🚨 ATENÇÃO MÁXIMA!\n\nVocê está prestes a EXCLUIR TODOS OS DADOS:\n- Anamneses\n- Clientes\n- Agendamentos\n- Atendimentos\n- Produtos\n- Fornecedores\n- Dados Financeiros\n\nAPENAS as configurações da clínica serão mantidas.\n\nTem CERTEZA ABSOLUTA?')) {
    return
  }

  const confirmacao = prompt('Digite "LIMPAR TUDO" (em letras maiúsculas) para confirmar:')
  if (confirmacao !== 'LIMPAR TUDO') {
    alert('Cancelado. Confirmação incorreta.')
    return
  }

  try {
    limpando.value = true
    
    const collections = [
      'anamneses',
      'clientes',
      'agendamentos',
      'atendimentos',
      'produtos',
      'fornecedores',
      'contas_pagar',
      'contas_receber',
      'movimentacoes',
      'movimentacoes_estoque',
      'catalogo_procedimentos',
      'prontuarios'
    ]

    for (const col of collections) {
      statusLimpeza.value = `Limpando ${col}...`
      const q = query(collection(db, col), where('clinicaId', '==', clinicaId.value || 'demo'))
      const snapshot = await getDocs(q)
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref)
      }
    }

    resultado.value = {
      tipo: 'success',
      mensagem: '✅ TODOS os dados foram excluídos! Você pode recomeçar do zero.'
    }

    await carregarTotais()

  } catch (err) {
    resultado.value = {
      tipo: 'error',
      mensagem: '❌ Erro ao limpar dados: ' + err.message
    }
  } finally {
    limpando.value = false
    statusLimpeza.value = ''
  }
}
</script>

<style scoped>
.page-header {
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

.warning-text {
  color: #ff3b30;
  font-size: 15px;
  font-weight: 600;
}

.danger-zone {
  border: 2px solid #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.danger-zone h2 {
  color: #ff3b30;
  font-size: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cleanup-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.cleanup-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 20px;
}

.cleanup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.cleanup-header i {
  font-size: 32px;
  color: #ff3b30;
}

.cleanup-header h3 {
  font-size: 16px;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.cleanup-header p {
  font-size: 13px;
  color: #6e6e73;
  margin: 0;
}

.cleanup-all {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #ff3b30;
  text-align: center;
}

.cleanup-all h3 {
  color: #ff3b30;
  font-size: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.cleanup-all p {
  color: #6e6e73;
  margin-bottom: 24px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 700;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-card i {
  font-size: 48px;
  color: #ff3b30;
  margin-bottom: 16px;
}

.loading-card p {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 600;
}

.resultado-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.resultado-card.success {
  border-left: 4px solid #34c759;
}

.resultado-card.error {
  border-left: 4px solid #ff3b30;
}

.resultado-card i {
  font-size: 24px;
}

.resultado-card.success i {
  color: #34c759;
}

.resultado-card.error i {
  color: #ff3b30;
}

.resultado-card p {
  margin: 0;
  font-weight: 600;
  color: #1d1d1f;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .cleanup-options {
    grid-template-columns: 1fr;
  }

  .resultado-card {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
}
</style>

