import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import NovaAnamnese from './views/NovaAnamnese.vue'
import ListaAnamneses from './views/ListaAnamneses.vue'
import DetalhesAnamnese from './views/DetalhesAnamnese.vue'
import AnamneseCliente from './views/AnamneseCliente.vue'
import Configuracoes from './views/Configuracoes.vue'
import Relatorios from './views/Relatorios.vue'
import Login from './views/Login.vue'
import Cadastro from './views/Cadastro.vue'
import Financeiro from './views/Financeiro.vue'
import ContasPagar from './views/ContasPagar.vue'
import ContasReceber from './views/ContasReceber.vue'
import FluxoCaixa from './views/FluxoCaixa.vue'
import PlanoContas from './views/PlanoContas.vue'
import RelatorioDRE from './views/RelatorioDRE.vue'
import AnaliseTendencias from './views/AnaliseTendencias.vue'
import Agenda from './views/Agenda.vue'
import DashboardAnalitico from './views/DashboardAnalitico.vue'
import Fornecedores from './views/Fornecedores.vue'
import Produtos from './views/Produtos.vue'
import CatalogoProcedimentos from './views/CatalogoProcedimentos.vue'
import RegistrarAtendimentoAgendado from './views/RegistrarAtendimentoAgendado.vue'
import EditarPaciente from './views/EditarPaciente.vue'
import RelatorioAtendimentos from './views/RelatorioAtendimentos.vue'
import EntradaProdutos from './views/EntradaProdutos.vue'
import DespesasRecorrentes from './views/DespesasRecorrentes.vue'
import Profissionais from './views/Profissionais.vue'
import Comissoes from './views/Comissoes.vue'
import LimpezaDados from './views/LimpezaDados.vue'
import Pagamentos from './views/Pagamentos.vue'
import EquipeClinica from './views/EquipeClinica.vue'
import Auditoria from './views/Auditoria.vue'
import Avaliacoes from './views/Avaliacoes.vue'
import AvaliacaoCliente from './views/AvaliacaoCliente.vue'
import Planos from './views/Planos.vue'
import MinhaAssinatura from './views/MinhaAssinatura.vue'
import PrecificacaoProcedimentos from './views/PrecificacaoProcedimentos.vue'
import AgendamentoOnline from './views/AgendamentoOnline.vue'
import { auth } from './firebase.js'
import './style.css'
import './utils/notificationUtils.js'

const routes = [
  // Rotas públicas
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/cadastro', component: Cadastro, meta: { public: true } },
  { path: '/anamnese-cliente', component: AnamneseCliente, meta: { public: true } },
  
  // Rotas protegidas
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/nova', component: NovaAnamnese, meta: { requiresAuth: true } },
  { path: '/lista', component: ListaAnamneses, meta: { requiresAuth: true } },
  { path: '/detalhes/:id', component: DetalhesAnamnese, meta: { requiresAuth: true } },
  { path: '/configuracoes', component: Configuracoes, meta: { requiresAuth: true } },
  { path: '/relatorios', component: Relatorios, meta: { requiresAuth: true } },
  
  // Rotas financeiras
  { path: '/financeiro', component: Financeiro, meta: { requiresAuth: true } },
  { path: '/financeiro/contas-pagar', component: ContasPagar, meta: { requiresAuth: true } },
  { path: '/financeiro/contas-receber', component: ContasReceber, meta: { requiresAuth: true } },
  { path: '/financeiro/fluxo-caixa', component: FluxoCaixa, meta: { requiresAuth: true } },
  { path: '/financeiro/plano-contas', component: PlanoContas, meta: { requiresAuth: true } },
  { path: '/financeiro/relatorio-dre', component: RelatorioDRE, meta: { requiresAuth: true } },
  { path: '/financeiro/analise-tendencias', component: AnaliseTendencias, meta: { requiresAuth: true } },
  { path: '/financeiro/despesas-recorrentes', component: DespesasRecorrentes, meta: { requiresAuth: true } },
  
  // Rotas de agendamento
  { path: '/agenda', component: Agenda, meta: { requiresAuth: true } },
  
  // Rotas de análise
  { path: '/dashboard', component: DashboardAnalitico, meta: { requiresAuth: true } },
  
  // Rotas de cadastros
  { path: '/fornecedores', component: Fornecedores, meta: { requiresAuth: true } },
  { path: '/produtos', component: Produtos, meta: { requiresAuth: true } },
  { path: '/entrada-produtos', component: EntradaProdutos, meta: { requiresAuth: true } },
  { path: '/procedimentos', component: CatalogoProcedimentos, meta: { requiresAuth: true } },
  { path: '/profissionais', component: Profissionais, meta: { requiresAuth: true } },
  { path: '/comissoes', component: Comissoes, meta: { requiresAuth: true } },
  
  // Rotas de atendimento
  { path: '/registrar-atendimento-agendado', component: RegistrarAtendimentoAgendado, meta: { requiresAuth: true } },
  { path: '/editar-paciente/:id', component: EditarPaciente, meta: { requiresAuth: true } },
  { path: '/relatorio-atendimentos', component: RelatorioAtendimentos, meta: { requiresAuth: true } },
  
  // Rotas de administração
  { path: '/limpeza-dados', component: LimpezaDados, meta: { requiresAuth: true } },
  
  // Rotas de pagamentos
  { path: '/pagamentos', component: Pagamentos, meta: { requiresAuth: true } },
  
  // Rotas de equipe
  { path: '/equipe-clinica', component: EquipeClinica, meta: { requiresAuth: true } },
  
  // Rotas de auditoria
  { path: '/auditoria', component: Auditoria, meta: { requiresAuth: true } },
  
  // Rotas de avaliações
  { path: '/avaliacoes', component: Avaliacoes, meta: { requiresAuth: true } },
  { path: '/avaliacao-cliente', component: AvaliacaoCliente, meta: { public: true } },
  
  // Rotas de planos e assinaturas
  { path: '/planos', component: Planos, meta: { requiresAuth: true } },
  { path: '/minha-assinatura', component: MinhaAssinatura, meta: { requiresAuth: true } },
  
  // Rotas de precificação
  { path: '/precificacao-procedimentos', component: PrecificacaoProcedimentos, meta: { requiresAuth: true } },
  
  
  // Rotas de agendamento
  { path: '/agendamento-online', component: AgendamentoOnline, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegação para proteger rotas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublic = to.matched.some(record => record.meta.public)
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    // Rota protegida e usuário não autenticado
    next('/login')
  } else if (isPublic && currentUser && (to.path === '/login' || to.path === '/cadastro')) {
    // Usuário autenticado tentando acessar login/cadastro
    next('/')
  } else {
    // Permitir navegação
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}


