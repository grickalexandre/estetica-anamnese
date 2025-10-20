// Script de debug para verificar dados no Firestore
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "estetica-anamnese.firebaseapp.com",
  projectId: "estetica-anamnese",
  storageBucket: "estetica-anamnese.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugFirestore() {
  console.log('=== DEBUG FIRESTORE ===')
  
  try {
    // Verificar clientes
    console.log('\n--- CLIENTES ---')
    const clientesSnapshot = await getDocs(collection(db, 'clientes'))
    console.log('Total de clientes:', clientesSnapshot.size)
    clientesSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${doc.id}: ${data.nome} (clinicaId: ${data.clinicaId}, ativo: ${data.ativo})`)
    })
    
    // Verificar procedimentos
    console.log('\n--- PROCEDIMENTOS ---')
    const procedimentosSnapshot = await getDocs(collection(db, 'catalogo_procedimentos'))
    console.log('Total de procedimentos:', procedimentosSnapshot.size)
    procedimentosSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${doc.id}: ${data.nome} (clinicaId: ${data.clinicaId}, ativo: ${data.ativo}, valor: ${data.valor})`)
    })
    
    // Verificar anamneses
    console.log('\n--- ANAMNESES ---')
    const anamnesesSnapshot = await getDocs(collection(db, 'anamneses'))
    console.log('Total de anamneses:', anamnesesSnapshot.size)
    anamnesesSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`- ${doc.id}: ${data.nome} (clinicaId: ${data.clinicaId}, status: ${data.status})`)
    })
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
}

debugFirestore()
