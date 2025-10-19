# 📋 Guia: Onde Fica a Ficha do Cliente (Anamnese)

## 🎯 **Visão Geral:**

A **ficha do cliente** é chamada de **ANAMNESE** no sistema. Existem várias formas de acessar, criar e visualizar as fichas.

---

## 📱 **1. PARA CLIENTES PREENCHEREM (Público)**

### **🔗 Link Direto:**
```
https://estetica-rho.vercel.app/anamnese-cliente
```

### **Como Obter o Link:**
1. **Home da Clínica** (painel principal)
2. Botão **"Copiar Link Cliente"**
3. Copiar e enviar para o cliente (WhatsApp, Email, SMS)

### **Como Funciona:**
- Cliente recebe o link
- Preenche a ficha online
- Envia fotos (opcional)
- Sistema cria/atualiza o registro do paciente automaticamente
- Ficha fica disponível para a clínica

---

## 🏥 **2. PARA A CLÍNICA PREENCHER (Interno)**

### **Opção A - Home:**
```
Home → Botão "Nova Anamnese"
```

### **Opção B - Menu Sidebar:**
```
Menu Lateral → Pacientes → Nova Anamnese
ou
Menu Lateral → Pacientes
```

### **Opção C - Lista de Anamneses:**
```
Menu → Pacientes (ícone de usuários) → Nova Anamnese
```

---

## 👀 **3. VER FICHAS PREENCHIDAS**

### **Lista Completa:**
```
Menu → Pacientes (ícone de usuários)
ou
Sidebar → Pacientes
```

**Nesta tela você vê:**
- Todas as anamneses cadastradas
- Status (Pendente/Analisada)
- Nome, telefone, data
- Botão "Ver Detalhes" para cada uma

### **Detalhes de Uma Ficha:**
```
Lista de Anamneses → Clicar na ficha → Detalhes
```

**Você vê:**
- Todos os dados preenchidos
- Fotos do cliente
- Histórico de tipo de pele
- Alergias, medicamentos, etc
- Botão para "Marcar como Analisada"

---

## ⚡ **4. ACESSO RÁPIDO (NOVO!)**

### **Durante o Atendimento:**
```
Registrar Atendimento → Selecionar Cliente → "Ver Ficha Completa"
```

**Vantagem:**
- Acesso rápido durante atendimento
- Não precisa sair da tela
- Consulta informações importantes antes do procedimento

---

## 🔍 **5. BUSCAR FICHA ESPECÍFICA**

### **Por Cliente:**
```
Lista de Anamneses → Pesquisar por nome, telefone ou email
```

### **Por CPF:**
- Sistema já vincula automaticamente
- Mesmo CPF = mesmo paciente
- Histórico completo consolidado

---

## 📊 **Estrutura da Ficha (ANAMNESE):**

### **Dados Pessoais:**
- Nome completo
- CPF
- Data de nascimento
- Telefone
- Email
- Endereço

### **Dados Estéticos:**
- Tipo de pele
- Alergias
- Uso de protetor solar
- Exposição ao sol
- Produtos cosméticos
- Procedimentos anteriores

### **Saúde:**
- Medicamentos
- Doenças
- Gestante/Lactante
- Fumante

### **Hábitos:**
- Alimentação
- Ingestão de água
- Exercícios
- Sono

### **Estética:**
- Objetivos
- Observações
- Fotos (múltiplas)

---

## 🔗 **Relacionamento da Ficha:**

```
ANAMNESE
   ↓ CPF/Telefone (deduplicação)
PACIENTE (criado/atualizado automaticamente)
   ↓ clienteId
ATENDIMENTOS (histórico)
CONTAS A RECEBER (financeiro)
AGENDAMENTOS (agenda)
```

---

## 📋 **Fluxo Completo:**

### **1️⃣ Cliente Preenche Ficha:**
```
Cliente → Link → Preenche → Envia
   ↓
Sistema cria/atualiza PACIENTE
   ↓
Anamnese fica "Pendente"
   ↓
Clínica vê notificação
```

### **2️⃣ Clínica Analisa:**
```
Menu → Pacientes → Ver Ficha
   ↓
Analisa informações
   ↓
Marca como "Analisada"
```

### **3️⃣ Durante Atendimento:**
```
Registrar Atendimento
   ↓
Seleciona Cliente
   ↓
Clica "Ver Ficha Completa"
   ↓
Consulta alergias, tipo de pele, etc
   ↓
Volta e registra atendimento
```

---

## 💡 **Dicas:**

### **🎯 Para Facilitar o Acesso:**

1. **Manter aba aberta** com Lista de Anamneses
2. **Usar busca rápida** por nome/telefone
3. **Atalho durante atendimento** (botão "Ver Ficha")
4. **Notificações** mostram fichas pendentes

### **📱 Para Enviar aos Clientes:**

1. **Home** → "Copiar Link Cliente"
2. **WhatsApp:** Cole o link
3. **Email:** Cole o link
4. **QR Code:** (futuro) Pode gerar QR Code do link

---

## 🗂️ **Onde os Dados Ficam Salvos:**

### **Firebase Firestore:**

**Coleção: `anamneses`**
```javascript
{
  id: "anamnese-123",
  clinicaId: "estetica-rho",
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  // ... todos os campos da ficha
  status: "pendente" ou "analisada",
  origem: "cliente" ou "profissional"
}
```

**Coleção: `pacientes`** (criado automaticamente)
```javascript
{
  id: "paciente-456",
  clinicaId: "estetica-rho",
  nome: "Maria Silva",
  cpf: "123.456.789-00",
  telefone: "(14) 99999-9999",
  totalAnamneses: 1,
  totalAtendimentos: 0,
  totalGasto: 0
}
```

---

## 🚀 **Resumo de Acessos:**

| Onde | Caminho | Função |
|------|---------|--------|
| **Home** | `/` | Link copiável + Nova Anamnese |
| **Menu Pacientes** | `/lista` | Ver todas as fichas |
| **Detalhes** | `/detalhes/:id` | Ver ficha específica |
| **Cliente (público)** | `/anamnese-cliente` | Cliente preenche |
| **Nova (interna)** | `/nova` | Clínica preenche |
| **Durante Atendimento** | Botão "Ver Ficha" | Acesso rápido ⭐ NOVO! |

---

## 📈 **Estatísticas:**

Cada paciente tem:
- **totalAnamneses**: Quantas fichas preencheu
- **totalAtendimentos**: Quantos procedimentos fez
- **totalGasto**: Quanto gastou total

Tudo visível ao selecionar o cliente!

---

## ✅ **Conclusão:**

**A ficha do cliente está em:**
1. ✅ Menu **Pacientes** (lista completa)
2. ✅ Botão **"Ver Ficha"** durante atendimento
3. ✅ Link **público** para clientes preencherem
4. ✅ **Home** (nova anamnese + copiar link)

**Acesso fácil e rápido de qualquer lugar do sistema!** 🎉

