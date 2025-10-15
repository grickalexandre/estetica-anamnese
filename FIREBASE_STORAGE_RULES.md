# 🔐 Regras de Segurança do Firebase Storage

## 📋 Como Configurar

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto: `estetica-anamnese`

2. **Vá para Storage:**
   - No menu lateral, clique em **"Storage"**
   - Clique na aba **"Rules"** (Regras)

3. **Cole as regras abaixo:**

## 🔒 Regras de Segurança (Para Desenvolvimento)

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Regras para fotos de profissionais
    match /profissionais/{fileName} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita (upload)
      allow write: if request.resource.size < 10 * 1024 * 1024 // Máx 10MB
                   && request.resource.contentType.matches('image/.*'); // Apenas imagens
    }
    
    // Regras para fotos de anamneses
    match /anamneses/{fileName} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita (upload)
      allow write: if request.resource.size < 10 * 1024 * 1024 // Máx 10MB
                   && request.resource.contentType.matches('image/.*'); // Apenas imagens
    }
  }
}
```

## 🔐 Regras de Segurança (Para Produção - Mais Restritivas)

**⚠️ Use estas regras quando for para produção:**

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Regras para fotos de profissionais
    match /profissionais/{fileName} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita apenas para usuários autenticados (quando implementar auth)
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024 // Máx 10MB
                   && request.resource.contentType.matches('image/(jpeg|jpg|png|webp)'); // Apenas imagens
    }
    
    // Regras para fotos de anamneses
    match /anamneses/{fileName} {
      // Permitir leitura para todos
      allow read: if true;
      
      // Permitir escrita com limite de tamanho e tipo
      allow write: if request.resource.size < 10 * 1024 * 1024 // Máx 10MB
                   && request.resource.contentType.matches('image/(jpeg|jpg|png|webp)') // Apenas imagens
                   && fileName.matches('.*\\.(jpg|jpeg|png|webp)$'); // Validar extensão
    }
  }
}
```

## 📊 Limites do Plano Gratuito do Firebase Storage

- **Armazenamento**: 5 GB gratuitos
- **Downloads**: 1 GB/dia
- **Uploads**: 20K operações/dia
- **Downloads**: 50K operações/dia

## 💡 Dicas de Otimização

1. **Compressão de Imagens:**
   - ✅ Já implementado com CompressorJS
   - ✅ Converte para WebP automaticamente
   - ✅ Reduz tamanho em até 80%

2. **Limitar Número de Fotos:**
   - ✅ Máximo 4 fotos por anamnese
   - ✅ Máximo 1 foto de perfil

3. **Monitoramento:**
   - Verifique o uso no Firebase Console
   - Configure alertas de uso

## 🚀 Estrutura de Pastas no Storage

```
estetica-anamnese.appspot.com/
├── profissionais/
│   └── foto_1234567890.webp
└── anamneses/
    ├── 5511999999999_1234567890_0.webp
    ├── 5511999999999_1234567890_1.webp
    └── 5511999999999_1234567890_2.webp
```

## ⚙️ Como Aplicar as Regras

1. Copie as regras (Desenvolvimento ou Produção)
2. Cole no Firebase Console → Storage → Rules
3. Clique em **"Publicar"**
4. Aguarde alguns segundos para propagar

## ✅ Testando

Após configurar:
1. Tente fazer upload de uma foto em Configurações
2. Tente fazer upload de fotos na Anamnese do Cliente
3. Verifique se as imagens aparecem corretamente

## 🔍 Solução de Problemas

### Erro: "Permission denied"
- Verifique se as regras foram publicadas
- Certifique-se de que o Storage está ativado no Firebase

### Erro: "File too large"
- Imagens maiores que 10MB não são permitidas
- O CompressorJS deve reduzir automaticamente

### Imagens não aparecem
- Verifique as regras de leitura (`allow read: if true`)
- Confira o console do navegador para erros

---

**✅ Após configurar as regras, seu sistema estará pronto para upload de imagens!**

