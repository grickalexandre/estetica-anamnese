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
import Planos from './views/Planos.vue'
import Financeiro from './views/Financeiro.vue'
import ContasPagar from './views/ContasPagar.vue'
import ContasReceber from './views/ContasReceber.vue'
import FluxoCaixa from './views/FluxoCaixa.vue'
import PlanoContas from './views/PlanoContas.vue'
import { auth } from './firebase.js'
import './style.css'

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
  { path: '/planos', component: Planos, meta: { requiresAuth: true } },
  
  // Rotas financeiras
  { path: '/financeiro', component: Financeiro, meta: { requiresAuth: true } },
  { path: '/financeiro/contas-pagar', component: ContasPagar, meta: { requiresAuth: true } },
  { path: '/financeiro/contas-receber', component: ContasReceber, meta: { requiresAuth: true } },
  { path: '/financeiro/fluxo-caixa', component: FluxoCaixa, meta: { requiresAuth: true } },
  { path: '/financeiro/plano-contas', component: PlanoContas, meta: { requiresAuth: true } }
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


