#!/bin/sh

echo "🔧 Verificando diretório de dados..."
mkdir -p /app/data

echo "📊 Informações do banco de dados:"
echo "DATABASE_URL: $DATABASE_URL"
ls -la /app/data/

echo "📦 Rodando Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
