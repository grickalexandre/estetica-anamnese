import { ref, computed } from 'vue'

export function usePaginacao(itemsPerPage = 10) {
  const paginaAtual = ref(1)
  const totalItens = ref(0)
  const itensPorPagina = ref(itemsPerPage)
  const carregando = ref(false)

  // Computed properties
  const totalPaginas = computed(() => {
    return Math.ceil(totalItens.value / itensPorPagina.value)
  })

  const temProximaPagina = computed(() => {
    return paginaAtual.value < totalPaginas.value
  })

  const temPaginaAnterior = computed(() => {
    return paginaAtual.value > 1
  })

  const itensVisiveis = computed(() => {
    const inicio = (paginaAtual.value - 1) * itensPorPagina.value
    const fim = inicio + itensPorPagina.value
    return { inicio, fim }
  })

  // Métodos
  const irParaPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas.value) {
      paginaAtual.value = pagina
    }
  }

  const proximaPagina = () => {
    if (temProximaPagina.value) {
      paginaAtual.value++
    }
  }

  const paginaAnterior = () => {
    if (temPaginaAnterior.value) {
      paginaAtual.value--
    }
  }

  const primeiraPagina = () => {
    paginaAtual.value = 1
  }

  const ultimaPagina = () => {
    paginaAtual.value = totalPaginas.value
  }

  const resetarPaginacao = () => {
    paginaAtual.value = 1
    totalItens.value = 0
  }

  const atualizarTotalItens = (total) => {
    totalItens.value = total
    // Se a página atual for maior que o total de páginas, voltar para a primeira
    if (paginaAtual.value > totalPaginas.value && totalPaginas.value > 0) {
      paginaAtual.value = 1
    }
  }

  const alterarItensPorPagina = (novoValor) => {
    itensPorPagina.value = novoValor
    paginaAtual.value = 1 // Reset para primeira página
  }

  // Gerar array de páginas para exibição
  const paginasVisiveis = computed(() => {
    const paginas = []
    const total = totalPaginas.value
    const atual = paginaAtual.value

    if (total <= 7) {
      // Se tem 7 ou menos páginas, mostrar todas
      for (let i = 1; i <= total; i++) {
        paginas.push(i)
      }
    } else {
      // Lógica para mostrar páginas com ellipsis
      if (atual <= 4) {
        // Mostrar primeiras páginas
        for (let i = 1; i <= 5; i++) {
          paginas.push(i)
        }
        paginas.push('...')
        paginas.push(total)
      } else if (atual >= total - 3) {
        // Mostrar últimas páginas
        paginas.push(1)
        paginas.push('...')
        for (let i = total - 4; i <= total; i++) {
          paginas.push(i)
        }
      } else {
        // Mostrar páginas do meio
        paginas.push(1)
        paginas.push('...')
        for (let i = atual - 1; i <= atual + 1; i++) {
          paginas.push(i)
        }
        paginas.push('...')
        paginas.push(total)
      }
    }

    return paginas
  })

  return {
    // Estado
    paginaAtual,
    totalItens,
    itensPorPagina,
    carregando,
    
    // Computed
    totalPaginas,
    temProximaPagina,
    temPaginaAnterior,
    itensVisiveis,
    paginasVisiveis,
    
    // Métodos
    irParaPagina,
    proximaPagina,
    paginaAnterior,
    primeiraPagina,
    ultimaPagina,
    resetarPaginacao,
    atualizarTotalItens,
    alterarItensPorPagina
  }
}
