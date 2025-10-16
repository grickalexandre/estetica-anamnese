import { ref } from 'vue'

export function useFormasPagamento() {
  const formasPagamento = ref([
    { id: 'dinheiro', nome: 'Dinheiro', taxa: 0, diasRecebimento: 0, permiteParcelar: false },
    { id: 'pix', nome: 'PIX', taxa: 0, diasRecebimento: 0, permiteParcelar: false },
    { id: 'debito', nome: 'Débito', taxa: 2.5, diasRecebimento: 1, permiteParcelar: false },
    { id: 'credito-vista', nome: 'Crédito à Vista', taxa: 3.5, diasRecebimento: 30, permiteParcelar: false },
    { id: 'credito-2x', nome: 'Crédito 2x', taxa: 4.0, diasRecebimento: 30, permiteParcelar: true, parcelas: 2 },
    { id: 'credito-3x', nome: 'Crédito 3x', taxa: 4.5, diasRecebimento: 30, permiteParcelar: true, parcelas: 3 },
    { id: 'credito-4x', nome: 'Crédito 4x', taxa: 5.0, diasRecebimento: 30, permiteParcelar: true, parcelas: 4 },
    { id: 'credito-5x', nome: 'Crédito 5x', taxa: 5.5, diasRecebimento: 30, permiteParcelar: true, parcelas: 5 },
    { id: 'credito-6x', nome: 'Crédito 6x', taxa: 6.0, diasRecebimento: 30, permiteParcelar: true, parcelas: 6 },
    { id: 'boleto', nome: 'Boleto', taxa: 2.0, diasRecebimento: 2, permiteParcelar: false },
    { id: 'transferencia', nome: 'Transferência', taxa: 0, diasRecebimento: 1, permiteParcelar: false }
  ])

  const calcularValorLiquido = (valorBruto, formaPagamentoId) => {
    const forma = formasPagamento.value.find(f => f.id === formaPagamentoId)
    if (!forma) return valorBruto

    const taxa = (valorBruto * forma.taxa) / 100
    return valorBruto - taxa
  }

  const calcularDataRecebimento = (dataVenda, formaPagamentoId) => {
    const forma = formasPagamento.value.find(f => f.id === formaPagamentoId)
    if (!forma) return dataVenda

    const data = new Date(dataVenda)
    data.setDate(data.getDate() + forma.diasRecebimento)
    return data.toISOString().split('T')[0]
  }

  const gerarParcelas = (valorTotal, formaPagamentoId, dataVenda) => {
    const forma = formasPagamento.value.find(f => f.id === formaPagamentoId)
    if (!forma || !forma.permiteParcelar) {
      return [{
        numero: 1,
        valor: valorTotal,
        vencimento: calcularDataRecebimento(dataVenda, formaPagamentoId),
        status: 'pendente'
      }]
    }

    const parcelas = []
    const valorParcela = valorTotal / forma.parcelas
    
    for (let i = 0; i < forma.parcelas; i++) {
      const vencimento = new Date(dataVenda)
      vencimento.setMonth(vencimento.getMonth() + i)
      vencimento.setDate(vencimento.getDate() + forma.diasRecebimento)
      
      parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        vencimento: vencimento.toISOString().split('T')[0],
        status: 'pendente'
      })
    }

    return parcelas
  }

  return { formasPagamento, calcularValorLiquido, calcularDataRecebimento, gerarParcelas }
}

