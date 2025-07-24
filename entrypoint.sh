#!/bin/sh

export DATABASE_URL="file:./data/dev.db"

echo "📦 Rodando Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
