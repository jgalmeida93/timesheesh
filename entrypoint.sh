#!/bin/sh

echo "📦 Rodando Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
