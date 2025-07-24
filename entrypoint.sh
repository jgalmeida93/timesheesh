#!/bin/sh

echo "📦 Rodando Prisma Migrate Deploy..."
npx dotenv -e .env -- prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
