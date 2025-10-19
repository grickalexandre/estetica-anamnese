import { ref, computed } from 'vue'

export function useFiltros() {
  const filtros = ref({
    busca: '',
    status: '',
    categoria: '',
    dataInicio: '',
    dataFim: '',
    ordenacao: 'nome',
    ordem: 'asc'
  })

  const filtrosAtivos = computed(() => {
    const ativos = []
    if (filtros.value.busca) ativos.push(`Busca: "${filtros.value.busca}"`)
    if (filtros.value.status) ativos.push(`Status: ${filtros.value.status}`)
    if (filtros.value.categoria) ativos.push(`Categoria: ${filtros.value.categoria}`)
    if (filtros.value.dataInicio) ativos.push(`De: ${filtros.value.dataInicio}`)
    if (filtros.value.dataFim) ativos.push(`Até: ${filtros.value.dataFim}`)
    return ativos
  })

  const temFiltrosAtivos = computed(() => {
    return filtrosAtivos.value.length > 0
  })

  // Aplicar filtros a uma lista de itens
  const aplicarFiltros = (itens, camposBusca = ['nome']) => {
    let itensFiltrados = [...itens]

    // Filtro de busca
    if (filtros.value.busca) {
      const busca = filtros.value.busca.toLowerCase()
      itensFiltrados = itensFiltrados.filter(item => {
        return camposBusca.some(campo => {
          const valor = item[campo]
          return valor && valor.toString().toLowerCase().includes(busca)
        })
      })
    }

    // Filtro de status
    if (filtros.value.status) {
      itensFiltrados = itensFiltrados.filter(item => {
        return item.status === filtros.value.status || 
               item.ativo === (filtros.value.status === 'ativo')
      })
    }

    // Filtro de categoria
    if (filtros.value.categoria) {
      itensFiltrados = itensFiltrados.filter(item => {
        return item.categoria === filtros.value.categoria
      })
    }

    // Filtro de data
    if (filtros.value.dataInicio || filtros.value.dataFim) {
      itensFiltrados = itensFiltrados.filter(item => {
        const dataItem = new Date(item.dataCriacao?.toDate?.() || item.dataCriacao || item.data)
        const dataInicio = filtros.value.dataInicio ? new Date(filtros.value.dataInicio) : null
        const dataFim = filtros.value.dataFim ? new Date(filtros.value.dataFim) : null

        if (dataInicio && dataItem < dataInicio) return false
        if (dataFim && dataItem > dataFim) return false
        return true
      })
    }

    // Ordenação
    itensFiltrados.sort((a, b) => {
      let valorA = a[filtros.value.ordenacao]
      let valorB = b[filtros.value.ordenacao]

      // Converter datas
      if (filtros.value.ordenacao.includes('data') || filtros.value.ordenacao.includes('Data')) {
        valorA = new Date(valorA?.toDate?.() || valorA)
        valorB = new Date(valorB?.toDate?.() || valorB)
      }

      // Converter para string para comparação
      if (typeof valorA === 'string') valorA = valorA.toLowerCase()
      if (typeof valorB === 'string') valorB = valorB.toLowerCase()

      if (filtros.value.ordem === 'asc') {
        return valorA > valorB ? 1 : -1
      } else {
        return valorA < valorB ? 1 : -1
      }
    })

    return itensFiltrados
  }

  // Limpar todos os filtros
  const limparFiltros = () => {
    filtros.value = {
      busca: '',
      status: '',
      categoria: '',
      dataInicio: '',
      dataFim: '',
      ordenacao: 'nome',
      ordem: 'asc'
    }
  }

  // Limpar filtro específico
  const limparFiltro = (campo) => {
    if (filtros.value[campo] !== undefined) {
      filtros.value[campo] = ''
    }
  }

  // Definir filtro
  const definirFiltro = (campo, valor) => {
    if (filtros.value[campo] !== undefined) {
      filtros.value[campo] = valor
    }
  }

  // Obter valor do filtro
  const obterFiltro = (campo) => {
    return filtros.value[campo] || ''
  }

  return {
    filtros,
    filtrosAtivos,
    temFiltrosAtivos,
    aplicarFiltros,
    limparFiltros,
    limparFiltro,
    definirFiltro,
    obterFiltro
  }
}
