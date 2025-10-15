# 🚀 Guia para Subir o Projeto no Git

## ⚠️ Git não está instalado

Para subir o projeto no GitHub, você precisa instalar o Git primeiro.

## 1. 📥 Instalar o Git

### Opção 1: Download Direto
1. Acesse: https://git-scm.com/download/win
2. Baixe o instalador para Windows
3. Execute o instalador com as configurações padrão
4. **Reinicie o PowerShell** após a instalação

### Opção 2: Via Chocolatey (se tiver)
```powershell
choco install git
```

### Opção 3: Via Winget (Windows 10/11)
```powershell
winget install --id Git.Git -e --source winget
```

## 2. 🔧 Configurar o Git (após instalação)

Abra um novo PowerShell e execute:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## 3. 📁 Inicializar o Repositório

No diretório do projeto:

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: implementação completa do sistema SaaS com autenticação e upload de imagens"
```

## 4. 🔗 Conectar ao GitHub

### Criar repositório no GitHub:
1. Acesse: https://github.com
2. Clique em "New repository"
3. Nome: `estetica-anamnese`
4. Deixe público ou privado
5. **NÃO** marque "Initialize with README"

### Conectar repositório local:
```bash
# Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/estetica-anamnese.git

# Subir para o GitHub
git branch -M main
git push -u origin main
```

## 5. 🚀 Deploy Automático no Vercel

Após subir no GitHub:
1. Acesse: https://vercel.com
2. Clique em "New Project"
3. Importe o repositório `estetica-anamnese`
4. Deploy automático! 🎉

## 📋 Checklist

- [ ] Git instalado
- [ ] PowerShell reiniciado
- [ ] Git configurado (nome e email)
- [ ] Repositório inicializado
- [ ] Arquivos commitados
- [ ] Repositório criado no GitHub
- [ ] Remote adicionado
- [ ] Código enviado para GitHub
- [ ] Deploy no Vercel configurado

## 🔍 Verificar se funcionou

```bash
git status
git log --oneline
```

## ⚡ Comandos Rápidos

```bash
# Status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "descrição da mudança"

# Push
git push
```

---

**Após instalar o Git, me avise que eu ajudo a subir o projeto! 🚀**
