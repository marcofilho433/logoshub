#!/bin/bash

echo "🧪 Testando build de produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Limpar instalação anterior
print_status "Limpando instalação anterior..."
rm -rf node_modules package-lock.json

# Instalar apenas dependências de produção
print_status "Instalando dependências de produção (--omit=dev)..."
npm ci --omit=dev

if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências de produção"
    exit 1
fi

# Verificar se as dependências de desenvolvimento não foram instaladas
print_status "Verificando se devDependencies não foram instaladas..."
if [ -d "node_modules/@angular/cli" ]; then
    print_warning "devDependencies foram instaladas (isso não deveria acontecer)"
else
    print_success "devDependencies não foram instaladas (correto)"
fi

# Tentar build de produção
print_status "Testando build de produção..."
npm run build:prod

if [ $? -ne 0 ]; then
    print_error "Falha no build de produção"
    print_warning "Isso pode indicar que algumas devDependencies são necessárias para o build"
    exit 1
fi

print_success "✅ Build de produção bem-sucedido!"

# Verificar tamanho do build
print_status "Verificando tamanho do build..."
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    print_success "Tamanho do build: $BUILD_SIZE"
else
    print_error "Diretório dist não encontrado"
    exit 1
fi

# Limpar e reinstalar todas as dependências para desenvolvimento
print_status "Reinstalando todas as dependências para desenvolvimento..."
rm -rf node_modules package-lock.json
npm install

print_success "✅ Teste de build de produção concluído!"
echo ""
echo "📊 Resumo:"
echo "  - Instalação com --omit=dev: ✅"
echo "  - Build de produção: ✅"
echo "  - Tamanho do build: $BUILD_SIZE"
echo ""
echo "💡 Dica: Use 'npm ci --omit=dev' em ambientes de produção para otimizar o tempo de build."

# Voltar para o diretório raiz
cd ..

print_success "🎉 Teste concluído com sucesso!"
