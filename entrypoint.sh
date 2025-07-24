#!/bin/sh

export DATABASE_URL="file:./data/dev.db"
export JWT_SECRET="your_jwt_secret_key"

echo "📦 Rodando Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."
exec npm start
