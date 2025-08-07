#!/bin/bash

echo "🚀 Configurando CI/CD para LogosHub..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "logoshub-app/package.json" ]; then
    print_error "Execute este script na raiz do projeto LogosHub"
    exit 1
fi

print_status "Navegando para o diretório do projeto..."
cd logoshub-app

# Instalar dependências
print_status "Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências"
    exit 1
fi

# Configurar Husky
print_status "Configurando Husky..."
npx husky install

if [ $? -ne 0 ]; then
    print_warning "Falha ao configurar Husky. Tentando instalar..."
    npm install husky --save-dev
    npx husky install
fi

# Tornar o hook executável
chmod +x .husky/pre-commit

# Verificar se o ESLint está configurado
print_status "Verificando configuração do ESLint..."
if [ ! -f ".eslintrc.json" ]; then
    print_error "Arquivo .eslintrc.json não encontrado"
    exit 1
fi

# Verificar se o Prettier está configurado
print_status "Verificando configuração do Prettier..."
if [ ! -f ".prettierrc" ]; then
    print_error "Arquivo .prettierrc não encontrado"
    exit 1
fi

# Testar as configurações
print_status "Testando configurações..."

print_status "Executando verificação de formatação..."
npm run format:check
if [ $? -ne 0 ]; then
    print_warning "Problemas de formatação encontrados. Execute 'npm run format' para corrigir"
fi

print_status "Executando linting..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Problemas de linting encontrados. Execute 'npm run lint:fix' para corrigir"
fi

print_status "Testando build..."
npm run build:prod
if [ $? -ne 0 ]; then
    print_error "Falha no build de produção"
    exit 1
fi

print_success "✅ Configuração de CI/CD concluída com sucesso!"

echo ""
echo "📋 Próximos passos:"
echo "1. Configure as secrets do GitHub (se necessário)"
echo "2. Configure o deploy para seu ambiente (Firebase, Vercel, etc.)"
echo "3. Teste o pipeline fazendo um commit"
echo ""
echo "🔧 Comandos úteis:"
echo "  npm run dev          - Servidor de desenvolvimento"
echo "  npm run test         - Executar testes"
echo "  npm run lint         - Verificar qualidade do código"
echo "  npm run format       - Formatar código"
echo "  npm run ci:check     - Executar todas as verificações"
echo ""
echo "🚀 Otimizações de CI/CD:"
echo "  - Build de produção usa --omit=dev para otimizar"
echo "  - Deploy de produção com dependências mínimas"
echo "  - Cache de dependências configurado"
echo ""
echo "📚 Documentação: CI_CD_SETUP.md"

# Voltar para o diretório raiz
cd ..

print_success "🎉 Setup concluído! O projeto está pronto para CI/CD."
