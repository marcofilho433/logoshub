# 🚀 Configuração de CI/CD - LogosHub

Este documento descreve a configuração completa de CI/CD (Continuous Integration/Continuous Deployment) para o projeto LogosHub.

## 📋 Visão Geral

O pipeline de CI/CD está configurado para automatizar:
- ✅ Verificação de qualidade do código
- ✅ Execução de testes
- ✅ Build de produção
- ✅ Deploy automático para desenvolvimento
- ✅ Verificação de segurança

## 🏗️ Estrutura do Pipeline

### 1. **GitHub Actions Workflows**

#### `ci-dev.yml` - Pipeline Principal
- **Trigger**: Push para `main`, `develop`, `feature/*` e Pull Requests
- **Jobs**:
  - `code-quality`: Verificação de formatação e linting
  - `test`: Execução de testes unitários
  - `build`: Build de produção (otimizado com `--omit=dev`)
  - `deploy-dev`: Deploy automático para desenvolvimento (apenas em `develop`)
  - `security`: Verificação de vulnerabilidades

#### `production-deploy.yml` - Deploy de Produção
- **Trigger**: Push para `main` e releases
- **Jobs**:
  - `build-production`: Build otimizado para produção
  - `deploy-production`: Deploy para ambiente de produção
- **Otimizações**: Usa `--omit=dev` para instalação mais rápida

#### `pr-check.yml` - Verificação de Pull Requests
- **Trigger**: Pull Requests para `main` e `develop`
- **Funcionalidades**:
  - Verificação rápida de qualidade
  - Comentários automáticos no PR
  - Status checks obrigatórios

## 🛠️ Scripts NPM Configurados

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de desenvolvimento
npm run build:prod   # Build de produção

# Qualidade do Código
npm run lint         # Executar ESLint
npm run lint:fix     # Corrigir problemas de linting automaticamente
npm run format       # Formatar código com Prettier
npm run format:check # Verificar formatação

# Testes
npm run test         # Executar testes em modo watch
npm run test:ci      # Executar testes para CI
npm run test:prod-build # Testar build de produção com --omit=dev

# CI/CD
npm run ci:check     # Executar todas as verificações de CI
```

## 🔧 Ferramentas Configuradas

### ESLint
- **Configuração**: `.eslintrc.json`
- **Plugins**: Angular ESLint, TypeScript ESLint, Prettier
- **Regras**: Padrões de qualidade para Angular e TypeScript

### Prettier
- **Configuração**: `.prettierrc`
- **Integração**: Com ESLint para formatação consistente
- **Arquivos**: TypeScript, HTML, SCSS, JSON

### Angular CLI
- **Builder**: Configurado para usar ESLint
- **Testes**: Karma com cobertura
- **Build**: Otimizado para produção

## 🌐 Ambientes

### Desenvolvimento
- **Branch**: `develop`
- **Deploy**: Automático após push
- **URL**: `https://dev.logoshub.com` (configurável)

### Produção
- **Branch**: `main`
- **Deploy**: Manual ou via release
- **URL**: `https://logoshub.com` (configurável)

## 🚀 Otimizações de Performance

### Instalação de Dependências
- **Desenvolvimento**: Instala todas as dependências (incluindo devDependencies)
- **Produção**: Usa `npm ci --omit=dev` para instalação mais rápida
- **Cache**: Configurado para reutilizar dependências entre builds

### Build Otimizado
- **Desenvolvimento**: Build completo com source maps
- **Produção**: Build otimizado sem devDependencies
- **Artefatos**: Retenção configurada (7 dias para dev, 30 dias para produção)

## 🔐 Segurança

### Verificações Automáticas
- `npm audit`: Verificação de vulnerabilidades
- `license-checker`: Verificação de licenças
- Cobertura de testes mínima configurável

### Variáveis de Ambiente
- Configurações sensíveis via GitHub Secrets
- Separação de ambientes (dev/prod)

## 📊 Monitoramento

### Métricas de Qualidade
- Cobertura de testes
- Qualidade do código (ESLint)
- Formatação (Prettier)
- Vulnerabilidades de segurança

### Notificações
- Status checks no GitHub
- Comentários automáticos em PRs
- Notificações de deploy

## 🚀 Como Usar

### Para Desenvolvedores

1. **Clone o repositório**:
   ```bash
   git clone <repository-url>
   cd logoshub-app
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Antes de fazer commit**:
   ```bash
   npm run ci:check
   ```

### Para Pull Requests

1. **Crie uma branch**:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Desenvolva e teste**:
   ```bash
   npm run dev
   npm run test
   npm run lint
   ```

3. **Faça commit e push**:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin feature/nova-funcionalidade
   ```

4. **Crie o Pull Request**:
   - O pipeline será executado automaticamente
   - Aguarde a aprovação dos status checks
   - Merge quando aprovado

## 🔧 Configurações Adicionais

### Firebase (Opcional)
Se você estiver usando Firebase Hosting, adicione ao workflow:

```yaml
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    channelId: live
    projectId: your-project-id
```

### Vercel (Opcional)
Para deploy no Vercel:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    working-directory: ./logoshub-app
```

## 📝 Troubleshooting

### Problemas Comuns

1. **ESLint falhando**:
   ```bash
   npm run lint:fix
   ```

2. **Prettier falhando**:
   ```bash
   npm run format
   ```

3. **Testes falhando**:
   ```bash
   npm run test:ci
   ```

4. **Build falhando**:
   ```bash
   npm run build:prod
   ```

### Logs e Debug
- GitHub Actions logs disponíveis na aba "Actions"
- Logs locais em `npm-debug.log*`
- Cobertura de testes em `coverage/`

## 🤝 Contribuição

Para contribuir com melhorias no CI/CD:

1. Crie uma issue descrevendo a melhoria
2. Implemente as mudanças
3. Teste localmente
4. Crie um PR com documentação atualizada

## 📞 Suporte

Para dúvidas sobre o CI/CD:
- Consulte este documento
- Verifique os logs do GitHub Actions
- Abra uma issue no repositório

---

**Última atualização**: $(date)
**Versão**: 1.0.0
