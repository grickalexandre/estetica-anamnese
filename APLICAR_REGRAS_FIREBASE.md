# 🚨 URGENTE: Como Aplicar as Regras do Firestore

## ⚡ PASSO A PASSO RÁPIDO

### 1. Acesse o Firebase Console
🔗 **Link**: https://console.firebase.google.com

### 2. Selecione Seu Projeto
Clique no projeto da clínica

### 3. Vá em Firestore Database
- No menu lateral esquerdo, clique em **"Firestore Database"**
- Clique na aba **"Regras"** (ou **"Rules"**)

### 4. Copie as Regras
Copie **TODO** o conteúdo do arquivo `firestore.rules` deste projeto

### 5. Cole no Firebase
- Cole o conteúdo no editor de regras do Firebase
- **SUBSTITUA** todo o conteúdo existente

### 6. Publique
- Clique no botão **"Publicar"** (ou **"Publish"**)
- Aguarde a confirmação (alguns segundos)

### 7. Teste
- Faça **logout** do sistema
- Faça **login** novamente
- Tente salvar um profissional

---

## 🔧 O Que Foi Corrigido

✅ Corrigido nome da coleção: `usuarios` (era `users`)  
✅ Simplificadas as regras para usuários autenticados  
✅ Removidas verificações complexas de `clinicaId`  
✅ Permitida leitura e escrita para todos usuários autenticados  

---

## 📝 Regras Aplicadas

```javascript
// Para TODAS as coleções do sistema:
- profissionais ✅
- fornecedores ✅
- produtos ✅
- procedimentos ✅
- atendimentos ✅
- contas_pagar ✅
- contas_receber ✅
- comissões ✅
- etc...

// Permissão:
allow read, write: if isAuthenticated()
```

---

## ❌ Se Ainda Não Funcionar

1. **Limpe o cache do navegador** (Ctrl + Shift + Delete)
2. **Faça logout completo** do sistema
3. **Feche e abra o navegador**
4. **Faça login novamente**
5. **Tente salvar**

---

## 🆘 Debug no Console

Abra o console do navegador (F12) e execute:

```javascript
// Verificar autenticação
firebase.auth().currentUser

// Se retornar null, você NÃO está autenticado
// Se retornar um objeto com uid, você ESTÁ autenticado
```

---

## ✅ Checklist Final

- [ ] Regras copiadas do arquivo `firestore.rules`
- [ ] Regras coladas no Firebase Console
- [ ] Botão "Publicar" clicado
- [ ] Logout e login feitos
- [ ] Profissional salvou com sucesso!

---

**Depois de aplicar, o erro "Missing or insufficient permissions" deve desaparecer! 🎉**

