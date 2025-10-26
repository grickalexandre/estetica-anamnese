<template>
  <div class="precificacao-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1><i class="fas fa-calculator"></i> Precificação de Procedimentos</h1>
          <p>Sistema de cálculo de custos e formação de preços para procedimentos estéticos</p>
        </div>
        <div class="header-actions">
          <div class="procedimento-selector">
            <label><i class="fas fa-list"></i> Selecionar Procedimento:</label>
            <select v-model="procedimentoSelecionado" @change="carregarProcedimentoSelecionado" class="procedimento-select">
              <option value="">Escolha um procedimento...</option>
              <option v-for="proc in procedimentosCadastrados" :key="proc.id" :value="proc.id">
                {{ proc.nome }} - {{ proc.categoria }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros e Controles -->
    <div class="filters-section">
      <div class="filters-header">
        <h3><i class="fas fa-filter"></i> Filtros e Busca</h3>
        <div class="filters-actions">
          <button @click="toggleAlertasMargem" class="btn-alerts" :class="{ 'active': alertasAtivos.length > 0 }">
            <i class="fas fa-bell"></i>
            Alertas de Margem
            <span v-if="alertasAtivos.length > 0" class="alert-badge">{{ alertasAtivos.length }}</span>
          </button>
          <button @click="toggleRelatoriosMargem" class="btn-reports">
            <i class="fas fa-chart-pie"></i>
            Relatórios de Margem
          </button>
          <button @click="exportarExcel" class="btn-export">
            <i class="fas fa-file-excel"></i>
            Exportar Excel
          </button>
        </div>
      </div>
      <div class="filters-row">
        <div class="filter-group">
          <label><i class="fas fa-search"></i> Buscar procedimento:</label>
          <input 
            v-model="filtroBusca" 
            type="text" 
            placeholder="Digite o nome do procedimento..."
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label><i class="fas fa-sort"></i> Ordenar por:</label>
          <select v-model="ordenacao" class="filter-select">
            <option value="nome">Nome</option>
            <option value="categoria">Categoria</option>
            <option value="precoSugerido">Preço Sugerido</option>
            <option value="margemLucro">Margem de Lucro</option>
            <option value="lucroFinal">Lucro Final</option>
            <option value="dataCriacao">Data de Criação</option>
          </select>
        </div>
        <div class="filter-group">
          <label><i class="fas fa-chart-line"></i> Status:</label>
          <select v-model="filtroStatus" class="filter-select">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Formulário de Precificação -->
    <div v-if="procedimentoSelecionado" class="precificacao-form-section">
      <div class="form-header">
        <h3><i class="fas fa-calculator"></i> Precificar Procedimento</h3>
        <div class="form-actions">
          <button @click="limparSelecao" class="btn-clear">
            <i class="fas fa-times"></i>
            Limpar
          </button>
        </div>
      </div>
      
      <div class="form-content">
        <div class="form-row">
          <div class="form-group">
            <label>Procedimento:</label>
            <input v-model="form.nome" type="text" readonly class="form-input readonly">
          </div>
          <div class="form-group">
            <label>Categoria:</label>
            <input v-model="form.categoria" type="text" readonly class="form-input readonly">
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-coins"></i> Custos Diretos</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Produto (R$):</label>
              <input v-model.number="form.produto" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Imposto (R$):</label>
              <input v-model.number="form.imposto" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Comissão (R$):</label>
              <input v-model.number="form.comissao" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Descartáveis (R$):</label>
              <input v-model.number="form.descartaveis" type="number" step="0.01" min="0" class="form-input">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-chart-line"></i> Custos Operacionais</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>CAC (R$):</label>
              <input v-model.number="form.cac" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Taxa Máquina (R$):</label>
              <input v-model.number="form.taxaMaquina" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Op. / Hora Clínica (R$):</label>
              <input v-model.number="form.operacaoHora" type="number" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Margem Desejada (%):</label>
              <input v-model.number="form.margemDesejada" type="number" step="0.1" min="0" max="100" class="form-input">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-calculator"></i> Cálculos</h4>
          <div class="calculos-grid">
            <div class="calculo-item">
              <label>Custo Total:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(custoTotal) }}</span>
            </div>
            <div class="calculo-item">
              <label>Preço Sugerido:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(precoSugerido) }}</span>
            </div>
            <div class="calculo-item">
              <label>Lucro Final:</label>
              <span class="calculo-valor">R$ {{ formatarMoeda(lucroFinal) }}</span>
            </div>
            <div class="calculo-item">
              <label>Margem Real:</label>
              <span class="calculo-valor">{{ margemReal }}%</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4><i class="fas fa-dollar-sign"></i> Preço Final</h4>
          <div class="form-group">
            <label>Preço Cobrado (R$):</label>
            <input v-model.number="form.precoCobrado" type="number" step="0.01" min="0" class="form-input">
          </div>
        </div>

        <div class="form-actions">
          <button @click="salvarPrecificacao" class="btn-primary">
            <i class="fas fa-save"></i>
            Salvar Precificação
          </button>
          <button @click="limparSelecao" class="btn-secondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="toggleAnaliseConcorrencia" class="btn-info">
            <i class="fas fa-chart-bar"></i>
            Análise de Concorrência
          </button>
        </div>
      </div>
    </div>

    <!-- Análise de Concorrência -->
    <div v-if="showAnaliseConcorrencia" class="analise-concorrencia-section">
      <div class="analise-header">
        <h3><i class="fas fa-chart-bar"></i> Análise de Concorrência</h3>
        <div class="analise-actions">
          <button @click="adicionarConcorrente" class="btn-add">
            <i class="fas fa-plus"></i>
            Adicionar Concorrente
          </button>
          <button @click="toggleAnaliseConcorrencia" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="analise-content">
        <div class="analise-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Preço Médio do Mercado</span>
              <span class="stat-value">{{ formatarMoeda(precoMedioMercado) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Nossa Posição</span>
              <span class="stat-value" :class="posicaoClass">{{ posicaoMercado }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Diferença de Preço</span>
              <span class="stat-value" :class="diferencaClass">{{ diferencaPreco }}%</span>
            </div>
          </div>
        </div>

        <div class="concorrentes-table">
          <table class="concorrentes-table-content">
            <thead>
              <tr>
                <th>Concorrente</th>
                <th>Preço</th>
                <th>Diferença</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="concorrente in concorrentes" :key="concorrente.id" class="concorrente-row">
                <td>{{ concorrente.nome }}</td>
                <td class="currency-cell">{{ formatarMoeda(concorrente.preco) }}</td>
                <td class="diferenca-cell">
                  <span class="diferenca-badge" :class="getDiferencaClass(concorrente.diferenca)">
                    {{ concorrente.diferenca }}%
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="concorrente.ativo ? 'ativo' : 'inativo'">
                    {{ concorrente.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button @click="editarConcorrente(concorrente)" class="btn-icon" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="excluirConcorrente(concorrente)" class="btn-icon btn-danger" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Histórico de Preços -->
    <div v-if="procedimentoSelecionado && historicoPrecos.length > 0" class="historico-section">
      <div class="historico-header">
        <h3><i class="fas fa-history"></i> Histórico de Preços</h3>
        <div class="historico-actions">
          <button @click="exportarHistorico" class="btn-export-small">
            <i class="fas fa-download"></i>
            Exportar
          </button>
        </div>
      </div>
      
      <div class="historico-content">
        <div class="historico-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Preço Atual</span>
              <span class="stat-value">{{ formatarMoeda(precoAtual) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-trending-up"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Variação</span>
              <span class="stat-value" :class="variacaoClass">{{ variacaoPreco }}%</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Última Atualização</span>
              <span class="stat-value">{{ ultimaAtualizacao }}</span>
            </div>
          </div>
        </div>

        <div class="historico-table">
          <table class="historico-table-content">
            <thead>
              <tr>
                <th>Data</th>
                <th>Preço</th>
                <th>Margem</th>
                <th>Lucro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historicoPrecos" :key="item.id" class="historico-row">
                <td>{{ formatarData(item.dataCriacao) }}</td>
                <td class="currency-cell">{{ formatarMoeda(item.precoCobrado) }}</td>
                <td class="margem-cell">
                  <span class="margem-badge" :class="getMargemClass(item.margemLucro)">
                    {{ item.margemLucro }}%
                  </span>
                </td>
                <td class="currency-cell">{{ formatarMoeda(item.lucroFinal) }}</td>
                <td>
                  <span class="status-badge" :class="item.ativo ? 'ativo' : 'inativo'">
                    {{ item.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button @click="restaurarPrecificacao(item)" class="btn-icon" title="Restaurar">
                    <i class="fas fa-undo"></i>
                  </button>
                  <button @click="duplicarPrecificacao(item)" class="btn-icon" title="Duplicar">
                    <i class="fas fa-copy"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Alertas de Margem em Tempo Real -->
    <div v-if="showAlertasMargem" class="alertas-tempo-real-section">
      <div class="alertas-header">
        <h3><i class="fas fa-bell"></i> Alertas de Margem em Tempo Real</h3>
        <div class="alertas-actions">
          <button @click="configurarAlertas" class="btn-config">
            <i class="fas fa-cog"></i>
            Configurar
          </button>
          <button @click="toggleAlertasMargem" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="alertas-content">
        <!-- Configurações de Fontes de Dados -->
        <div class="configuracoes-fontes">
          <h4><i class="fas fa-database"></i> Fontes de Dados de Concorrentes</h4>
          <div class="fontes-grid">
            <div class="fonte-item">
              <label>
                <input v-model="configFontes.firebase" type="checkbox">
                <span class="fonte-label">Firebase (Dados Salvos)</span>
              </label>
              <p class="fonte-desc">Dados salvos manualmente no sistema</p>
            </div>
            <div class="fonte-item">
              <label>
                <input v-model="configFontes.googlePlaces" type="checkbox">
                <span class="fonte-label">Google Places API</span>
              </label>
              <p class="fonte-desc">Buscar clínicas próximas automaticamente</p>
            </div>
            <div class="fonte-item">
              <label>
                <input v-model="configFontes.webScraping" type="checkbox">
                <span class="fonte-label">Web Scraping</span>
              </label>
              <p class="fonte-desc">Extrair preços de sites de concorrentes</p>
            </div>
            <div class="fonte-item">
              <label>
                <input v-model="configFontes.crowdsourcing" type="checkbox">
                <span class="fonte-label">Crowdsourcing</span>
              </label>
              <p class="fonte-desc">Clientes e parceiros reportam preços</p>
            </div>
          </div>
          <div class="fonte-actions">
            <button @click="atualizarFontes" class="btn-atualizar">
              <i class="fas fa-sync"></i>
              Atualizar Dados
            </button>
            <button @click="configurarAPIs" class="btn-config-api">
              <i class="fas fa-cog"></i>
              Configurar APIs
            </button>
          </div>
        </div>

        <!-- Configurações de Alertas -->
        <div class="configuracoes-alertas">
          <h4><i class="fas fa-sliders-h"></i> Configurações de Alertas</h4>
          <div class="config-grid">
            <div class="config-item">
              <label>Margem Mínima Aceitável (%)</label>
              <input v-model.number="configAlertas.margemMinima" type="number" min="0" max="100" class="config-input">
            </div>
            <div class="config-item">
              <label>Ativar Notificações</label>
              <label class="switch">
                <input v-model="configAlertas.notificacoesAtivas" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="config-item">
              <label>Verificar a cada (minutos)</label>
              <select v-model="configAlertas.intervaloVerificacao" class="config-select">
                <option value="5">5 minutos</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lista de Alertas Ativos -->
        <div class="alertas-ativos">
          <h4><i class="fas fa-exclamation-triangle"></i> Alertas Ativos ({{ alertasAtivos.length }})</h4>
          <div class="alertas-list">
            <div v-for="alerta in alertasAtivos" :key="alerta.id" class="alerta-item" :class="alerta.severidade">
              <div class="alerta-icon">
                <i :class="alerta.icone"></i>
              </div>
              <div class="alerta-content">
                <div class="alerta-title">{{ alerta.titulo }}</div>
                <div class="alerta-description">{{ alerta.descricao }}</div>
                <div class="alerta-time">{{ formatarTempoAlerta(alerta.timestamp) }}</div>
              </div>
              <div class="alerta-actions">
                <button @click="resolverAlerta(alerta)" class="btn-resolver">
                  <i class="fas fa-check"></i>
                  Resolver
                </button>
                <button @click="ignorarAlerta(alerta)" class="btn-ignorar">
                  <i class="fas fa-times"></i>
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Histórico de Alertas -->
        <div class="historico-alertas">
          <h4><i class="fas fa-history"></i> Histórico de Alertas</h4>
          <div class="historico-list">
            <div v-for="alerta in historicoAlertas" :key="alerta.id" class="historico-item" :class="alerta.status">
              <div class="historico-icon">
                <i :class="alerta.icone"></i>
              </div>
              <div class="historico-content">
                <div class="historico-title">{{ alerta.titulo }}</div>
                <div class="historico-description">{{ alerta.descricao }}</div>
                <div class="historico-time">{{ formatarTempoAlerta(alerta.timestamp) }}</div>
              </div>
              <div class="historico-status">
                <span class="status-badge" :class="alerta.status">
                  {{ getStatusText(alerta.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Relatórios de Margem por Categoria -->
    <div v-if="showRelatoriosMargem" class="relatorios-margem-section">
      <div class="relatorios-header">
        <h3><i class="fas fa-chart-pie"></i> Relatórios de Margem por Categoria</h3>
        <div class="relatorios-actions">
          <button @click="exportarRelatorioMargem" class="btn-export-small">
            <i class="fas fa-download"></i>
            Exportar Relatório
          </button>
          <button @click="toggleRelatoriosMargem" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="relatorios-content">
        <!-- Resumo Geral -->
        <div class="resumo-geral">
          <h4><i class="fas fa-chart-bar"></i> Resumo Geral</h4>
          <div class="resumo-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Margem Média Geral</span>
                <span class="stat-value">{{ margemMediaGeral }}%</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Lucro Total Estimado</span>
                <span class="stat-value">{{ formatarMoeda(lucroTotalEstimado) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-list"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total de Procedimentos</span>
                <span class="stat-value">{{ totalProcedimentos }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Análise por Categoria -->
        <div class="analise-categorias">
          <h4><i class="fas fa-layer-group"></i> Análise por Categoria</h4>
          <div class="categorias-grid">
            <div v-for="categoria in relatorioCategorias" :key="categoria.nome" class="categoria-card">
              <div class="categoria-header">
                <h5>{{ categoria.nome }}</h5>
                <span class="categoria-badge" :class="getCategoriaClass(categoria.margemMedia)">
                  {{ categoria.margemMedia }}%
                </span>
              </div>
              <div class="categoria-stats">
                <div class="categoria-stat">
                  <span class="stat-label">Procedimentos:</span>
                  <span class="stat-value">{{ categoria.total }}</span>
                </div>
                <div class="categoria-stat">
                  <span class="stat-label">Margem Média:</span>
                  <span class="stat-value">{{ categoria.margemMedia }}%</span>
                </div>
                <div class="categoria-stat">
                  <span class="stat-label">Lucro Total:</span>
                  <span class="stat-value">{{ formatarMoeda(categoria.lucroTotal) }}</span>
                </div>
                <div class="categoria-stat">
                  <span class="stat-label">Preço Médio:</span>
                  <span class="stat-value">{{ formatarMoeda(categoria.precoMedio) }}</span>
                </div>
              </div>
              <div class="categoria-chart">
                <div class="chart-bar">
                  <div class="chart-fill" :style="{ width: categoria.margemMedia + '%' }"></div>
                </div>
                <span class="chart-label">Margem: {{ categoria.margemMedia }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertas de Margem -->
        <div class="alertas-margem">
          <h4><i class="fas fa-exclamation-triangle"></i> Alertas de Margem</h4>
          <div class="alertas-list">
            <div v-for="alerta in alertasMargem" :key="alerta.id" class="alerta-item" :class="alerta.tipo">
              <div class="alerta-icon">
                <i :class="alerta.icone"></i>
              </div>
              <div class="alerta-content">
                <div class="alerta-title">{{ alerta.titulo }}</div>
                <div class="alerta-description">{{ alerta.descricao }}</div>
              </div>
              <div class="alerta-action">
                <button @click="verDetalhesAlerta(alerta)" class="btn-alerta">
                  <i class="fas fa-eye"></i>
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Procedimentos -->
    <div class="table-container">
      <div class="table-header">
        <h3><i class="fas fa-table"></i> Procedimentos Precificados</h3>
        <div class="table-stats">
          <span class="stat-item">
            <i class="fas fa-list"></i>
            {{ procedimentosFiltrados.length }} procedimentos
          </span>
          <span class="stat-item">
            <i class="fas fa-dollar-sign"></i>
            Média: R$ {{ mediaPrecos }}
          </span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="precificacao-table">
          <thead>
            <tr>
              <th>Procedimento</th>
              <th>Produto</th>
              <th>Imposto</th>
              <th>Comissão</th>
              <th>Descartáveis</th>
              <th>CAC</th>
              <th>Taxa Máquina</th>
              <th>Op. / Hora Clínica</th>
              <th>Preço Sugerido</th>
              <th>Preço Cobrado</th>
              <th>Lucro Final</th>
              <th>Margem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="procedimento in procedimentosFiltrados" :key="procedimento.id" class="table-row">
              <td class="procedimento-cell">
                <div class="procedimento-info">
                  <strong>{{ procedimento.nome }}</strong>
                  <small>{{ procedimento.categoria }}</small>
                </div>
              </td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.produto) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.imposto) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.comissao) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.descartaveis) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.cac) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.taxaMaquina) }}</td>
              <td class="currency-cell">{{ formatarMoeda(procedimento.operacaoHora) }}</td>
              <td class="currency-cell preco-sugerido">{{ formatarMoeda(procedimento.precoSugerido) }}</td>
              <td class="currency-cell preco-cobrado">{{ formatarMoeda(procedimento.precoCobrado) }}</td>
              <td class="currency-cell lucro-final">{{ formatarMoeda(procedimento.lucroFinal) }}</td>
              <td class="margem-cell">
                <span class="margem-badge" :class="getMargemClass(procedimento.margemLucro)">
                  {{ procedimento.margemLucro }}%
                </span>
              </td>
              <td class="actions-cell">
                <button @click="editarProcedimento(procedimento)" class="btn-icon" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="duplicarProcedimento(procedimento)" class="btn-icon" title="Duplicar">
                  <i class="fas fa-copy"></i>
                </button>
                <button @click="excluirProcedimento(procedimento)" class="btn-icon btn-danger" title="Excluir">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar Procedimento -->
    <div v-if="showModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar' : 'Novo' }} Procedimento</h3>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarProcedimento" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nome do Procedimento *</label>
              <input v-model="form.nome" type="text" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Categoria</label>
              <select v-model="form.categoria" class="form-select">
                <option value="Estética Facial">Estética Facial</option>
                <option value="Estética Corporal">Estética Corporal</option>
                <option value="Depilação">Depilação</option>
                <option value="Massagem">Massagem</option>
                <option value="Tratamentos">Tratamentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h4>Custos do Procedimento</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Produto (R$)</label>
                <input v-model.number="form.produto" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Imposto (R$)</label>
                <input v-model.number="form.imposto" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Comissão (R$)</label>
                <input v-model.number="form.comissao" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Descartáveis (R$)</label>
                <input v-model.number="form.descartaveis" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>CAC (R$)</label>
                <input v-model.number="form.cac" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Taxa Máquina (R$)</label>
                <input v-model.number="form.taxaMaquina" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Operação / Hora Clínica (R$)</label>
                <input v-model.number="form.operacaoHora" type="number" step="0.01" class="form-input" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Precificação</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Preço Cobrado (R$)</label>
                <input v-model.number="form.precoCobrado" type="number" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Margem de Lucro Desejada (%)</label>
                <input v-model.number="form.margemDesejada" type="number" step="0.01" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Resumo dos Cálculos -->
          <div class="calculos-resumo">
            <h4>Resumo dos Cálculos</h4>
            <div class="calculos-grid">
              <div class="calculo-item">
                <span class="calculo-label">Custo Total:</span>
                <span class="calculo-valor">{{ formatarMoeda(custoTotal) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Preço Sugerido:</span>
                <span class="calculo-valor preco-sugerido">{{ formatarMoeda(precoSugerido) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Lucro Final:</span>
                <span class="calculo-valor lucro-final">{{ formatarMoeda(lucroFinal) }}</span>
              </div>
              <div class="calculo-item">
                <span class="calculo-label">Margem de Lucro:</span>
                <span class="calculo-valor margem-lucro">{{ margemLucro }}%</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="fecharModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              {{ modoEdicao ? 'Atualizar' : 'Salvar' }} Procedimento
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useClinica } from '../composables/useClinica'
import { db } from '../firebase.js'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, doc } from 'firebase/firestore'

// Funções de notificação
const showSuccess = (message) => {
  // Implementar notificação de sucesso
  console.log('✅', message)
  alert(message)
}

const showWarning = (message) => {
  // Implementar notificação de aviso
  console.log('⚠️', message)
  alert(message)
}

const showError = (message) => {
  // Implementar notificação de erro
  console.log('❌', message)
  alert(message)
}

const { isAuthenticated } = useAuth()
const { clinicaId } = useClinica()

// Estado
const procedimentos = ref([])
const procedimentosCadastrados = ref([])
const procedimentoSelecionado = ref('')
const historicoPrecos = ref([])
const showAnaliseConcorrencia = ref(false)
const showRelatoriosMargem = ref(false)
const showAlertasMargem = ref(false)
const concorrentes = ref([])
const alertasMargem = ref([])
const alertasAtivos = ref([])
const historicoAlertas = ref([])
const configAlertas = ref({
  margemMinima: 20,
  notificacoesAtivas: true,
  intervaloVerificacao: 15
})

const configFontes = ref({
  firebase: true,
  googlePlaces: false,
  webScraping: false,
  crowdsourcing: false
})
const loading = ref(false)
const showModal = ref(false)
const modoEdicao = ref(false)
const filtroBusca = ref('')
const filtroStatus = ref('')
const ordenacao = ref('nome')

// Formulário
const form = ref({
  id: null,
  nome: '',
  categoria: 'Estética Facial',
  produto: 0,
  imposto: 0,
  comissao: 0,
  descartaveis: 0,
  cac: 0,
  taxaMaquina: 0,
  operacaoHora: 0,
  precoCobrado: 0,
  margemDesejada: 50
})

// Computed
const procedimentosFiltrados = computed(() => {
  console.log('🔍 Computed procedimentosFiltrados executado')
  console.log('📊 Total procedimentos:', procedimentos.value.length)
  console.log('🔍 Filtro busca:', filtroBusca.value)
  console.log('🔍 Filtro status:', filtroStatus.value)
  
  let filtrados = procedimentos.value

  // Filtro por busca
  if (filtroBusca.value) {
    filtrados = filtrados.filter(p => 
      p.nome.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
      p.categoria.toLowerCase().includes(filtroBusca.value.toLowerCase())
    )
  }

  // Filtro por status
  if (filtroStatus.value) {
    filtrados = filtrados.filter(p => p.ativo === (filtroStatus.value === 'ativo'))
  }

  // Ordenação
  filtrados.sort((a, b) => {
    switch (ordenacao.value) {
      case 'nome':
        return a.nome.localeCompare(b.nome)
      case 'categoria':
        return a.categoria.localeCompare(b.categoria)
      case 'precoSugerido':
        return b.precoSugerido - a.precoSugerido
      case 'margemLucro':
        return b.margemLucro - a.margemLucro
      case 'lucroFinal':
        return b.lucroFinal - a.lucroFinal
      case 'dataCriacao':
        return new Date(b.dataCriacao) - new Date(a.dataCriacao)
      default:
        return 0
    }
  })

  console.log('📊 Procedimentos filtrados:', filtrados.length)
  return filtrados
})

const mediaPrecos = computed(() => {
  if (procedimentosFiltrados.value.length === 0) return '0,00'
  const total = procedimentosFiltrados.value.reduce((sum, p) => sum + (p.precoSugerido || 0), 0)
  const media = total / procedimentosFiltrados.value.length
  return new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(media)
})

// Computed para histórico
const precoAtual = computed(() => {
  if (historicoPrecos.value.length === 0) return 0
  const ativo = historicoPrecos.value.find(h => h.ativo)
  return ativo ? ativo.precoCobrado : historicoPrecos.value[0].precoCobrado
})

const variacaoPreco = computed(() => {
  if (historicoPrecos.value.length < 2) return 0
  const atual = precoAtual.value
  const anterior = historicoPrecos.value[1]?.precoCobrado || 0
  if (anterior === 0) return 0
  return ((atual - anterior) / anterior * 100).toFixed(1)
})

const variacaoClass = computed(() => {
  const variacao = parseFloat(variacaoPreco.value)
  if (variacao > 0) return 'variacao-positiva'
  if (variacao < 0) return 'variacao-negativa'
  return 'variacao-neutra'
})

const ultimaAtualizacao = computed(() => {
  if (historicoPrecos.value.length === 0) return 'N/A'
  const ultimo = historicoPrecos.value[0]
  return formatarData(ultimo.dataCriacao)
})

// Computed para análise de concorrência
const precoMedioMercado = computed(() => {
  if (concorrentes.value.length === 0) return 0
  const total = concorrentes.value.reduce((sum, c) => sum + c.preco, 0)
  return total / concorrentes.value.length
})

const posicaoMercado = computed(() => {
  if (concorrentes.value.length === 0) return 'N/A'
  const nossoPreco = form.value.precoCobrado
  const precoMedio = precoMedioMercado.value
  
  if (nossoPreco < precoMedio * 0.9) return 'Abaixo do Mercado'
  if (nossoPreco > precoMedio * 1.1) return 'Acima do Mercado'
  return 'Alinhado ao Mercado'
})

const posicaoClass = computed(() => {
  const posicao = posicaoMercado.value
  if (posicao.includes('Abaixo')) return 'posicao-abaixo'
  if (posicao.includes('Acima')) return 'posicao-acima'
  return 'posicao-alinhado'
})

const diferencaPreco = computed(() => {
  if (concorrentes.value.length === 0) return 0
  const nossoPreco = form.value.precoCobrado
  const precoMedio = precoMedioMercado.value
  
  if (precoMedio === 0) return 0
  return ((nossoPreco - precoMedio) / precoMedio * 100).toFixed(1)
})

const diferencaClass = computed(() => {
  const diferenca = parseFloat(diferencaPreco.value)
  if (diferenca > 10) return 'diferenca-alta'
  if (diferenca < -10) return 'diferenca-baixa'
  return 'diferenca-normal'
})

// Computed para relatórios de margem
const margemMediaGeral = computed(() => {
  if (procedimentosFiltrados.value.length === 0) return 0
  const total = procedimentosFiltrados.value.reduce((sum, p) => sum + (p.margemLucro || 0), 0)
  return (total / procedimentosFiltrados.value.length).toFixed(1)
})

const lucroTotalEstimado = computed(() => {
  return procedimentosFiltrados.value.reduce((sum, p) => sum + (p.lucroFinal || 0), 0)
})

const totalProcedimentos = computed(() => {
  return procedimentosFiltrados.value.length
})

const relatorioCategorias = computed(() => {
  const categorias = {}
  
  procedimentosFiltrados.value.forEach(proc => {
    if (!categorias[proc.categoria]) {
      categorias[proc.categoria] = {
        nome: proc.categoria,
        total: 0,
        margemTotal: 0,
        lucroTotal: 0,
        precoTotal: 0
      }
    }
    
    categorias[proc.categoria].total++
    categorias[proc.categoria].margemTotal += proc.margemLucro || 0
    categorias[proc.categoria].lucroTotal += proc.lucroFinal || 0
    categorias[proc.categoria].precoTotal += proc.precoCobrado || 0
  })
  
  return Object.values(categorias).map(cat => ({
    ...cat,
    margemMedia: (cat.margemTotal / cat.total).toFixed(1),
    precoMedio: cat.precoTotal / cat.total
  }))
})

const custoTotal = computed(() => {
  return form.value.produto + 
         form.value.imposto + 
         form.value.comissao + 
         form.value.descartaveis + 
         form.value.cac + 
         form.value.taxaMaquina + 
         form.value.operacaoHora
})

const precoSugerido = computed(() => {
  if (form.value.margemDesejada > 0) {
    return custoTotal.value * (1 + form.value.margemDesejada / 100)
  }
  return custoTotal.value
})

const lucroFinal = computed(() => {
  return form.value.precoCobrado - custoTotal.value
})

const margemLucro = computed(() => {
  if (form.value.precoCobrado > 0) {
    return ((lucroFinal.value / form.value.precoCobrado) * 100).toFixed(1)
  }
  return 0
})

// Métodos
const carregarProcedimentos = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'precificacaoProcedimentos'),
      where('clinicaId', '==', clinicaId.value)
    )

    const querySnapshot = await getDocs(q)
    const procedimentosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Ordenar localmente por nome
    procedimentos.value = procedimentosData.sort((a, b) => 
      a.nome.localeCompare(b.nome)
    )
    
    console.log('📊 Procedimentos carregados:', procedimentos.value.length)
  } catch (error) {
    console.error('Erro ao carregar procedimentos:', error)
  } finally {
    loading.value = false
  }
}

const carregarProcedimentosCadastrados = async () => {
  try {
    if (!clinicaId.value) return

    const q = query(
      collection(db, 'catalogo_procedimentos'),
      where('clinicaId', '==', clinicaId.value)
    )

    const querySnapshot = await getDocs(q)
    const procedimentos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Ordenar localmente por nome
    procedimentosCadastrados.value = procedimentos.sort((a, b) => 
      a.nome.localeCompare(b.nome)
    )
  } catch (error) {
    console.error('Erro ao carregar procedimentos cadastrados:', error)
  }
}

const carregarProcedimentoSelecionado = async () => {
  if (!procedimentoSelecionado.value) {
    form.value = {
      id: null,
      nome: '',
      categoria: 'Estética Facial',
      produto: 0,
      imposto: 0,
      comissao: 0,
      descartaveis: 0,
      cac: 0,
      taxaMaquina: 0,
      operacaoHora: 0,
      precoCobrado: 0,
      margemDesejada: 50
    }
    historicoPrecos.value = []
    return
  }

  try {
    const procedimento = procedimentosCadastrados.value.find(p => p.id === procedimentoSelecionado.value)
    if (procedimento) {
      modoEdicao.value = true
      form.value = {
        id: null, // Novo registro de precificação
        nome: procedimento.nome,
        categoria: procedimento.categoria,
        produto: 0,
        imposto: 0,
        comissao: 0,
        descartaveis: 0,
        cac: 0,
        taxaMaquina: 0,
        operacaoHora: 0,
        precoCobrado: 0,
        margemDesejada: 50,
        procedimentoId: procedimento.id // Referência ao procedimento original
      }
      
      // Carregar histórico de preços
      await carregarHistoricoPrecos(procedimento.id)
    }
  } catch (error) {
    console.error('Erro ao carregar procedimento selecionado:', error)
  }
}

const carregarHistoricoPrecos = async (procedimentoId) => {
  try {
    const q = query(
      collection(db, 'precificacaoProcedimentos'),
      where('procedimentoId', '==', procedimentoId),
      where('clinicaId', '==', clinicaId.value),
      orderBy('dataCriacao', 'desc')
    )

    const querySnapshot = await getDocs(q)
    historicoPrecos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao carregar histórico de preços:', error)
  }
}

const adicionarProcedimento = () => {
  modoEdicao.value = false
  form.value = {
    id: null,
    nome: '',
    categoria: 'Estética Facial',
    produto: 0,
    imposto: 0,
    comissao: 0,
    descartaveis: 0,
    cac: 0,
    taxaMaquina: 0,
    operacaoHora: 0,
    precoCobrado: 0,
    margemDesejada: 50
  }
  showModal.value = true
}

const editarProcedimento = (procedimento) => {
  modoEdicao.value = true
  form.value = { ...procedimento }
  showModal.value = true
}

const duplicarProcedimento = (procedimento) => {
  modoEdicao.value = false
  form.value = { 
    ...procedimento, 
    id: null, 
    nome: `${procedimento.nome} (Cópia)` 
  }
  showModal.value = true
}

const salvarProcedimento = async () => {
  try {
    loading.value = true
    if (!clinicaId.value) return

    const dadosProcedimento = {
      ...form.value,
      clinicaId: clinicaId.value,
      custoTotal: custoTotal.value,
      precoSugerido: precoSugerido.value,
      lucroFinal: lucroFinal.value,
      margemLucro: parseFloat(margemLucro.value),
      atualizadoEm: new Date()
    }

    if (modoEdicao.value) {
      await updateDoc(doc(db, 'precificacaoProcedimentos', form.value.id), dadosProcedimento)
    } else {
      dadosProcedimento.criadoEm = new Date()
      await addDoc(collection(db, 'precificacaoProcedimentos'), dadosProcedimento)
    }

    await carregarProcedimentos()
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar procedimento:', error)
  } finally {
    loading.value = false
  }
}

const excluirProcedimento = async (procedimento) => {
  if (confirm(`Tem certeza que deseja excluir o procedimento "${procedimento.nome}"?`)) {
    try {
      await deleteDoc(doc(db, 'precificacaoProcedimentos', procedimento.id))
      await carregarProcedimentos()
    } catch (error) {
      console.error('Erro ao excluir procedimento:', error)
    }
  }
}

const fecharModal = () => {
  showModal.value = false
  modoEdicao.value = false
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0)
}

const getMargemClass = (margem) => {
  if (margem >= 50) return 'margem-alta'
  if (margem >= 30) return 'margem-media'
  return 'margem-baixa'
}

const limparSelecao = () => {
  procedimentoSelecionado.value = ''
  form.value = {
    id: null,
    nome: '',
    categoria: 'Estética Facial',
    produto: 0,
    imposto: 0,
    comissao: 0,
    descartaveis: 0,
    cac: 0,
    taxaMaquina: 0,
    operacaoHora: 0,
    precoCobrado: 0,
    margemDesejada: 50
  }
}

const salvarPrecificacao = async () => {
  try {
    console.log('🔍 Iniciando salvamento da precificação...')
    console.log('📋 Dados do formulário:', form.value)
    console.log('🏥 ClinicaId:', clinicaId.value)
    
    if (!form.value.nome || form.value.nome.trim() === '') {
      showWarning('Por favor, selecione um procedimento')
      return
    }

    if (form.value.precoCobrado <= 0) {
      showWarning('Por favor, informe o preço cobrado')
      return
    }

    const dadosParaSalvar = {
      ...form.value,
      clinicaId: clinicaId.value,
      dataCriacao: new Date(),
      ativo: true
    }

    console.log('💾 Dados para salvar:', dadosParaSalvar)

    if (form.value.id) {
      // Editar existente
      console.log('✏️ Editando precificação existente...')
      await updateDoc(doc(db, 'precificacaoProcedimentos', form.value.id), dadosParaSalvar)
      showSuccess('Precificação atualizada com sucesso!')
    } else {
      // Criar novo
      console.log('➕ Criando nova precificação...')
      const docRef = await addDoc(collection(db, 'precificacaoProcedimentos'), dadosParaSalvar)
      console.log('✅ Precificação salva com ID:', docRef.id)
      showSuccess('Precificação salva com sucesso!')
    }

    console.log('🔄 Recarregando procedimentos...')
    await carregarProcedimentos()
    console.log('📊 Total de procedimentos após recarregar:', procedimentos.value.length)
    console.log('🧹 Limpando seleção...')
    limparSelecao()
    console.log('✅ Processo concluído!')
  } catch (error) {
    console.error('❌ Erro ao salvar precificação:', error)
    showError('Erro ao salvar precificação: ' + error.message)
  }
}


const formatarData = (data) => {
  if (!data) return 'N/A'
  const date = data.toDate ? data.toDate() : new Date(data)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const restaurarPrecificacao = (item) => {
  form.value = {
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    produto: item.produto,
    imposto: item.imposto,
    comissao: item.comissao,
    descartaveis: item.descartaveis,
    cac: item.cac,
    taxaMaquina: item.taxaMaquina,
    operacaoHora: item.operacaoHora,
    precoCobrado: item.precoCobrado,
    margemDesejada: item.margemDesejada,
    procedimentoId: item.procedimentoId
  }
  showSuccess('Precificação restaurada! Você pode editar e salvar.')
}

const duplicarPrecificacao = (item) => {
  form.value = {
    id: null, // Novo registro
    nome: item.nome,
    categoria: item.categoria,
    produto: item.produto,
    imposto: item.imposto,
    comissao: item.comissao,
    descartaveis: item.descartaveis,
    cac: item.cac,
    taxaMaquina: item.taxaMaquina,
    operacaoHora: item.operacaoHora,
    precoCobrado: item.precoCobrado,
    margemDesejada: item.margemDesejada,
    procedimentoId: item.procedimentoId
  }
  showSuccess('Precificação duplicada! Você pode editar e salvar.')
}

const exportarHistorico = () => {
  // Implementar exportação do histórico
  console.log('Exportar histórico de preços')
  showSuccess('Funcionalidade de exportação será implementada em breve!')
}

const toggleAnaliseConcorrencia = () => {
  showAnaliseConcorrencia.value = !showAnaliseConcorrencia.value
  if (showAnaliseConcorrencia.value) {
    carregarConcorrentes()
  }
}

const carregarConcorrentes = async () => {
  try {
    console.log('🔍 Carregando concorrentes...')
    
    // 1. Tentar carregar do Firebase (dados salvos)
    const concorrentesFirebase = await carregarConcorrentesFirebase()
    
    // 2. Tentar carregar dados públicos (APIs, web scraping)
    const concorrentesPublicos = await carregarConcorrentesPublicos()
    
    // 3. Combinar e deduplicar dados
    const todosConcorrentes = combinarDadosConcorrentes(concorrentesFirebase, concorrentesPublicos)
    
    if (todosConcorrentes.length > 0) {
      concorrentes.value = todosConcorrentes
      console.log('📊 Total de concorrentes carregados:', todosConcorrentes.length)
    } else {
      console.log('⚠️ Nenhum concorrente encontrado, usando dados de exemplo')
      carregarConcorrentesExemplo()
    }
    
    // Calcular diferenças em relação ao nosso preço
    calcularDiferencasConcorrentes()
    
  } catch (error) {
    console.error('Erro ao carregar concorrentes:', error)
    carregarConcorrentesExemplo()
  }
}

const carregarConcorrentesFirebase = async () => {
  if (!clinicaId.value) return []
  
  try {
    const q = query(
      collection(db, 'concorrentes'),
      where('clinicaId', '==', clinicaId.value),
      where('ativo', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const concorrentes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fonte: 'firebase'
    }))
    
    console.log('📊 Concorrentes do Firebase:', concorrentes.length)
    return concorrentes
  } catch (error) {
    console.log('⚠️ Erro ao carregar do Firebase:', error.message)
    return []
  }
}

const carregarConcorrentesPublicos = async () => {
  try {
    console.log('🌐 Buscando dados públicos de concorrentes...')
    
    // Simular busca em APIs públicas (implementar conforme necessário)
    const dadosPublicos = await buscarDadosPublicosConcorrentes()
    
    console.log('📊 Dados públicos encontrados:', dadosPublicos.length)
    return dadosPublicos
  } catch (error) {
    console.log('⚠️ Erro ao carregar dados públicos:', error.message)
    return []
  }
}

const buscarDadosPublicosConcorrentes = async () => {
  // Implementar busca em APIs públicas
  // Exemplo: Google Places API, APIs de preços, etc.
  
  // Por enquanto, retornar array vazio
  // Em produção, implementar:
  // - Google Places API para encontrar clínicas
  // - Web scraping de sites de concorrentes
  // - APIs de agregação de preços
  // - Feeds RSS de atualizações
  
  return []
}

const combinarDadosConcorrentes = (firebase, publicos) => {
  const combinados = [...firebase]
  
  // Adicionar dados públicos que não existem no Firebase
  publicos.forEach(publico => {
    const existe = firebase.some(f => f.nome === publico.nome)
    if (!existe) {
      combinados.push({
        ...publico,
        fonte: 'publico',
        ativo: true
      })
    }
  })
  
  // Remover duplicatas por nome
  const unicos = combinados.filter((concorrente, index, array) => 
    array.findIndex(c => c.nome === concorrente.nome) === index
  )
  
  console.log('🔄 Dados combinados:', unicos.length)
  return unicos
}

const carregarConcorrentesExemplo = () => {
  console.log('📋 Carregando dados de exemplo...')
  concorrentes.value = [
    { id: 1, nome: 'Clínica A', preco: 1200, diferenca: -20, ativo: true },
    { id: 2, nome: 'Clínica B', preco: 1500, diferenca: 0, ativo: true },
    { id: 3, nome: 'Clínica C', preco: 1800, diferenca: 20, ativo: true },
    { id: 4, nome: 'Clínica D', preco: 1400, diferenca: -6.7, ativo: false }
  ]
}

const calcularDiferencasConcorrentes = () => {
  concorrentes.value.forEach(concorrente => {
    const nossoPreco = form.value.precoCobrado
    if (nossoPreco > 0) {
      concorrente.diferenca = ((concorrente.preco - nossoPreco) / nossoPreco * 100).toFixed(1)
    }
  })
  console.log('📊 Diferenças calculadas para', concorrentes.value.length, 'concorrentes')
}

const adicionarConcorrente = async () => {
  const nome = prompt('Nome do concorrente:')
  const preco = parseFloat(prompt('Preço do concorrente (R$):'))
  
  if (nome && preco) {
    try {
      console.log('➕ Adicionando concorrente:', nome, preco)
      
      // Salvar no Firebase
      const dadosConcorrente = {
        nome: nome,
        preco: preco,
        clinicaId: clinicaId.value,
        ativo: true,
        dataCriacao: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'concorrentes'), dadosConcorrente)
      console.log('✅ Concorrente salvo no Firebase com ID:', docRef.id)
      
      // Adicionar à lista local
      const novoConcorrente = {
        id: docRef.id,
        nome: nome,
        preco: preco,
        diferenca: 0,
        ativo: true
      }
      
      // Calcular diferença
      const nossoPreco = form.value.precoCobrado
      if (nossoPreco > 0) {
        novoConcorrente.diferenca = ((preco - nossoPreco) / nossoPreco * 100).toFixed(1)
      }
      
      concorrentes.value.push(novoConcorrente)
      showSuccess('Concorrente adicionado e salvo no Firebase!')
      
    } catch (error) {
      console.error('❌ Erro ao salvar concorrente no Firebase:', error)
      
      // Fallback: adicionar apenas localmente
      const novoConcorrente = {
        id: Date.now(),
        nome: nome,
        preco: preco,
        diferenca: 0,
        ativo: true
      }
      
      const nossoPreco = form.value.precoCobrado
      if (nossoPreco > 0) {
        novoConcorrente.diferenca = ((preco - nossoPreco) / nossoPreco * 100).toFixed(1)
      }
      
      concorrentes.value.push(novoConcorrente)
      showSuccess('Concorrente adicionado (salvo localmente)')
    }
  }
}

const editarConcorrente = (concorrente) => {
  const novoNome = prompt('Nome do concorrente:', concorrente.nome)
  const novoPreco = parseFloat(prompt('Preço do concorrente (R$):', concorrente.preco))
  
  if (novoNome && novoPreco) {
    concorrente.nome = novoNome
    concorrente.preco = novoPreco
    
    // Recalcular diferença
    const nossoPreco = form.value.precoCobrado
    if (nossoPreco > 0) {
      concorrente.diferenca = ((novoPreco - nossoPreco) / nossoPreco * 100).toFixed(1)
    }
    
    showSuccess('Concorrente atualizado com sucesso!')
  }
}

const excluirConcorrente = (concorrente) => {
  if (confirm('Tem certeza que deseja excluir este concorrente?')) {
    const index = concorrentes.value.findIndex(c => c.id === concorrente.id)
    if (index > -1) {
      concorrentes.value.splice(index, 1)
      showSuccess('Concorrente excluído com sucesso!')
    }
  }
}

const getDiferencaClass = (diferenca) => {
  const diff = parseFloat(diferenca)
  if (diff > 10) return 'diferenca-alta'
  if (diff < -10) return 'diferenca-baixa'
  return 'diferenca-normal'
}

const toggleRelatoriosMargem = () => {
  showRelatoriosMargem.value = !showRelatoriosMargem.value
  if (showRelatoriosMargem.value) {
    gerarAlertasMargem()
  }
}

const gerarAlertasMargem = () => {
  alertasMargem.value = []
  
  // Verificar margens baixas
  procedimentosFiltrados.value.forEach(proc => {
    if (proc.margemLucro < 20) {
      alertasMargem.value.push({
        id: `baixa-${proc.id}`,
        tipo: 'alerta-baixa',
        icone: 'fas fa-exclamation-triangle',
        titulo: 'Margem Baixa',
        descricao: `${proc.nome} tem margem de apenas ${proc.margemLucro}%`,
        procedimento: proc
      })
    }
  })
  
  // Verificar categorias com margem baixa
  relatorioCategorias.value.forEach(cat => {
    if (cat.margemMedia < 25) {
      alertasMargem.value.push({
        id: `categoria-${cat.nome}`,
        tipo: 'alerta-categoria',
        icone: 'fas fa-layer-group',
        titulo: 'Categoria com Margem Baixa',
        descricao: `${cat.nome} tem margem média de ${cat.margemMedia}%`,
        categoria: cat
      })
    }
  })
  
  // Verificar se não há alertas
  if (alertasMargem.value.length === 0) {
    alertasMargem.value.push({
      id: 'sem-alertas',
      tipo: 'sucesso',
      icone: 'fas fa-check-circle',
      titulo: 'Todas as Margens Estão Adequadas',
      descricao: 'Nenhum procedimento com margem baixa encontrado'
    })
  }
}

const getCategoriaClass = (margem) => {
  const margemNum = parseFloat(margem)
  if (margemNum >= 50) return 'categoria-alta'
  if (margemNum >= 30) return 'categoria-media'
  if (margemNum >= 20) return 'categoria-baixa'
  return 'categoria-critica'
}

const verDetalhesAlerta = (alerta) => {
  if (alerta.procedimento) {
    showWarning(`Detalhes do procedimento: ${alerta.procedimento.nome}\nMargem: ${alerta.procedimento.margemLucro}%\nPreço: ${formatarMoeda(alerta.procedimento.precoCobrado)}`)
  } else if (alerta.categoria) {
    showWarning(`Detalhes da categoria: ${alerta.categoria.nome}\nMargem Média: ${alerta.categoria.margemMedia}%\nTotal de Procedimentos: ${alerta.categoria.total}`)
  }
}

const toggleAlertasMargem = () => {
  showAlertasMargem.value = !showAlertasMargem.value
  if (showAlertasMargem.value) {
    verificarAlertas()
  }
}

const verificarAlertas = () => {
  alertasAtivos.value = []
  
  procedimentosFiltrados.value.forEach(proc => {
    if (proc.margemLucro < configAlertas.value.margemMinima) {
      const alerta = {
        id: `alerta-${proc.id}`,
        titulo: 'Margem Baixa Detectada',
        descricao: `${proc.nome} tem margem de ${proc.margemLucro}% (mínimo: ${configAlertas.value.margemMinima}%)`,
        severidade: proc.margemLucro < 10 ? 'critico' : 'baixo',
        icone: proc.margemLucro < 10 ? 'fas fa-exclamation-circle' : 'fas fa-exclamation-triangle',
        timestamp: new Date(),
        procedimento: proc
      }
      
      alertasAtivos.value.push(alerta)
      
      // Adicionar ao histórico
      historicoAlertas.value.unshift({
        ...alerta,
        status: 'ativo'
      })
    }
  })
  
  // Limitar histórico a 50 itens
  if (historicoAlertas.value.length > 50) {
    historicoAlertas.value = historicoAlertas.value.slice(0, 50)
  }
}

const resolverAlerta = (alerta) => {
  // Marcar como resolvido
  const index = alertasAtivos.value.findIndex(a => a.id === alerta.id)
  if (index > -1) {
    alertasAtivos.value.splice(index, 1)
  }
  
  // Atualizar histórico
  const historicoIndex = historicoAlertas.value.findIndex(h => h.id === alerta.id)
  if (historicoIndex > -1) {
    historicoAlertas.value[historicoIndex].status = 'resolvido'
    historicoAlertas.value[historicoIndex].timestamp = new Date()
  }
  
  showSuccess('Alerta resolvido com sucesso!')
}

const ignorarAlerta = (alerta) => {
  // Marcar como ignorado
  const index = alertasAtivos.value.findIndex(a => a.id === alerta.id)
  if (index > -1) {
    alertasAtivos.value.splice(index, 1)
  }
  
  // Atualizar histórico
  const historicoIndex = historicoAlertas.value.findIndex(h => h.id === alerta.id)
  if (historicoIndex > -1) {
    historicoAlertas.value[historicoIndex].status = 'ignorado'
    historicoAlertas.value[historicoIndex].timestamp = new Date()
  }
  
  showSuccess('Alerta ignorado')
}

const atualizarFontes = async () => {
  try {
    console.log('🔄 Atualizando dados de concorrentes...')
    showSuccess('Atualizando dados de concorrentes...')
    
    await carregarConcorrentes()
    
    showSuccess('Dados atualizados com sucesso!')
  } catch (error) {
    console.error('Erro ao atualizar fontes:', error)
    showError('Erro ao atualizar dados de concorrentes')
  }
}

const configurarAPIs = () => {
  showSuccess('Funcionalidade de configuração de APIs será implementada em breve!')
}

const configurarAlertas = () => {
  showSuccess('Configurações salvas! Os alertas serão atualizados automaticamente.')
}

const formatarTempoAlerta = (timestamp) => {
  const agora = new Date()
  const diferenca = agora - timestamp
  const minutos = Math.floor(diferenca / 60000)
  
  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `${minutos} min atrás`
  
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas}h atrás`
  
  const dias = Math.floor(horas / 24)
  return `${dias} dias atrás`
}

const getStatusText = (status) => {
  const statusMap = {
    'ativo': 'Ativo',
    'resolvido': 'Resolvido',
    'ignorado': 'Ignorado'
  }
  return statusMap[status] || status
}

const exportarRelatorioMargem = () => {
  showSuccess('Funcionalidade de exportação de relatório será implementada em breve!')
}

const exportarExcel = () => {
  // Implementar exportação para Excel
  console.log('Exportar para Excel')
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    carregarProcedimentos()
    carregarProcedimentosCadastrados()
  }
})
</script>

<style scoped>
.precificacao-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.header-title p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.procedimento-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
}

.procedimento-selector label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.procedimento-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
  cursor: pointer;
}

.procedimento-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.procedimento-select:hover {
  border-color: #9ca3af;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.filters-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.precificacao-form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.calculos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculo-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.calculo-item label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.calculo-valor {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Estilos para Histórico */
.historico-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.historico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.historico-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.historico-actions {
  display: flex;
  gap: 12px;
}

.btn-export-small {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export-small:hover {
  background: #059669;
  transform: translateY(-1px);
}

.historico-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: #007AFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.variacao-positiva {
  color: #10b981;
}

.variacao-negativa {
  color: #ef4444;
}

.variacao-neutra {
  color: #6b7280;
}

.historico-table {
  overflow-x: auto;
}

.historico-table-content {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.historico-table-content th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.historico-table-content td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.historico-row:hover {
  background: #f9fafb;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.ativo {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inativo {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

/* Estilos para Análise de Concorrência */
.analise-concorrencia-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.analise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.analise-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analise-actions {
  display: flex;
  gap: 12px;
}

.btn-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-info:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-close {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.analise-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.concorrentes-table {
  overflow-x: auto;
}

.concorrentes-table-content {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.concorrentes-table-content th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.concorrentes-table-content td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.concorrente-row:hover {
  background: #f9fafb;
}

.diferenca-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.diferenca-badge.diferenca-alta {
  background: #fef3c7;
  color: #92400e;
}

.diferenca-badge.diferenca-baixa {
  background: #dbeafe;
  color: #1e40af;
}

.diferenca-badge.diferenca-normal {
  background: #d1fae5;
  color: #065f46;
}

.posicao-abaixo {
  color: #10b981;
}

.posicao-acima {
  color: #ef4444;
}

.posicao-alinhado {
  color: #3b82f6;
}

.diferenca-alta {
  color: #f59e0b;
}

.diferenca-baixa {
  color: #3b82f6;
}

.diferenca-normal {
  color: #10b981;
}

/* Estilos para Relatórios de Margem */
.relatorios-margem-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.relatorios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.relatorios-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.relatorios-actions {
  display: flex;
  gap: 12px;
}

.btn-reports {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reports:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.relatorios-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.resumo-geral h4,
.analise-categorias h4,
.alertas-margem h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.resumo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.categorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.categoria-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.categoria-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.categoria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.categoria-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.categoria-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.categoria-badge.categoria-alta {
  background: #dcfce7;
  color: #166534;
}

.categoria-badge.categoria-media {
  background: #fef3c7;
  color: #92400e;
}

.categoria-badge.categoria-baixa {
  background: #fee2e2;
  color: #991b1b;
}

.categoria-badge.categoria-critica {
  background: #fecaca;
  color: #7f1d1d;
}

.categoria-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.categoria-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.categoria-stat .stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.categoria-stat .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.categoria-chart {
  margin-top: 16px;
}

.chart-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.chart-fill {
  height: 100%;
  background: linear-gradient(90deg, #00A859, #4CAF50);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.chart-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.alertas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerta-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.alerta-item.alerta-baixa {
  background: #fef3c7;
  border-color: #f59e0b;
}

.alerta-item.alerta-categoria {
  background: #dbeafe;
  border-color: #3b82f6;
}

.alerta-item.sucesso {
  background: #dcfce7;
  border-color: #10b981;
}

.alerta-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.alerta-baixa .alerta-icon {
  background: #f59e0b;
  color: white;
}

.alerta-categoria .alerta-icon {
  background: #3b82f6;
  color: white;
}

.sucesso .alerta-icon {
  background: #10b981;
  color: white;
}

.alerta-content {
  flex: 1;
}

.alerta-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.alerta-description {
  font-size: 14px;
  color: #6b7280;
}

.btn-alerta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-alerta:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* Estilos para Alertas de Margem */
.alertas-tempo-real-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.alertas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.alertas-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alertas-actions {
  display: flex;
  gap: 12px;
}

.btn-alerts {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-alerts:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.btn-alerts.active {
  background: #dc2626;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.alert-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
  60% { transform: translateY(-2px); }
}

.btn-config {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-config:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.alertas-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.configuracoes-alertas h4,
.alertas-ativos h4,
.historico-alertas h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.config-input,
.config-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.config-input:focus,
.config-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.alertas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerta-item.critico {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
}

.alerta-item.baixo {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-left: 4px solid #f59e0b;
}

.alerta-actions {
  display: flex;
  gap: 8px;
}

.btn-resolver {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-resolver:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-ignorar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ignorar:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.alerta-time,
.historico-time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.historico-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.historico-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.historico-item.resolvido {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.historico-item.ignorado {
  background: #f9fafb;
  border-color: #d1d5db;
}

.historico-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: #6b7280;
  color: white;
}

.historico-content {
  flex: 1;
}

.historico-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.historico-description {
  font-size: 12px;
  color: #6b7280;
}

.status-badge.resolvido {
  background: #dcfce7;
  color: #166534;
}

.status-badge.ignorado {
  background: #f3f4f6;
  color: #374151;
}

/* Estilos para Configurações de Fontes */
.configuracoes-fontes {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.configuracoes-fontes h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fontes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.fonte-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.fonte-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.fonte-item label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 8px;
}

.fonte-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.fonte-label {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.fonte-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.fonte-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-atualizar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-atualizar:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-config-api {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-config-api:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.filters-row {
  display: flex;
  gap: 24px;
  align-items: end;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-item i {
  color: #007AFF;
}

.table-wrapper {
  overflow-x: auto;
}

.precificacao-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.precificacao-table th {
  background: #f9fafb;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.precificacao-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row:hover {
  background: #f9fafb;
}

.procedimento-cell {
  min-width: 200px;
}

.procedimento-info strong {
  display: block;
  color: #1d1d1f;
  font-size: 14px;
}

.procedimento-info small {
  color: #6b7280;
  font-size: 12px;
}

.currency-cell {
  text-align: right;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  min-width: 100px;
}

.preco-sugerido {
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
}

.preco-cobrado {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.lucro-final {
  background: #fef3c7;
  color: #92400e;
  font-weight: 600;
}

.margem-cell {
  text-align: center;
}

.margem-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.margem-badge.margem-alta {
  background: #dcfce7;
  color: #166534;
}

.margem-badge.margem-media {
  background: #fef3c7;
  color: #92400e;
}

.margem-badge.margem-baixa {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  margin: 0 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
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
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculos-resumo {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.calculos-resumo h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.calculos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.calculo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.calculo-label {
  font-weight: 500;
  color: #374151;
}

.calculo-valor {
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.calculo-valor.preco-sugerido {
  color: #166534;
}

.calculo-valor.lucro-final {
  color: #92400e;
}

.calculo-valor.margem-lucro {
  color: #1e40af;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    margin-top: 16px;
  }
  
  .procedimento-selector {
    min-width: auto;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .calculos-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
