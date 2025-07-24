#!/bin/sh

echo "🔧 Verificando diretório de dados..."
mkdir -p /app/data

echo "📊 Informações do banco de dados:"
echo "DATABASE_URL: $DATABASE_URL"
ls -la /app/data/

echo "🔐 Verificando variáveis de ambiente críticas..."
if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERRO: JWT_SECRET não está definido!"
    echo "Configure a variável JWT_SECRET antes de iniciar a aplicação."
    exit 1
else
    echo "✅ JWT_SECRET está definido (${#JWT_SECRET} caracteres)"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não está definido!"
    exit 1
else
    echo "✅ DATABASE_URL está definido"
fi

echo "📦 Rodando Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
