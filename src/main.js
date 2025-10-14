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
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/nova', component: NovaAnamnese },
  { path: '/lista', component: ListaAnamneses },
  { path: '/detalhes/:id', component: DetalhesAnamnese },
  { path: '/anamnese-cliente', component: AnamneseCliente },
  { path: '/configuracoes', component: Configuracoes },
  { path: '/relatorios', component: Relatorios }
]

const router = createRouter({
  history: createWebHistory(),
  routes
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


