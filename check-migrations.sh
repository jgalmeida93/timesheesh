#!/bin/bash

# Script para verificar migrações de forma segura
echo "🔍 Verificando migrações do banco de dados..."

# Verifica se o banco existe
DB_FILE=$(echo $DATABASE_URL | sed 's/file://')
if [ ! -f "$DB_FILE" ]; then
    echo "📁 Banco não existe, precisa criar"
    exit 1
fi

echo "📊 Verificando status das migrações..."
MIGRATION_STATUS=$(npx prisma migrate status --schema=./prisma/schema.prisma 2>&1)

echo "📋 Status completo:"
echo "$MIGRATION_STATUS"

# Verifica se há migrações pendentes
if echo "$MIGRATION_STATUS" | grep -q "Database schema is out of sync"; then
    echo "⚠️ Banco precisa de migrações"
    exit 1
elif echo "$MIGRATION_STATUS" | grep -q "migrations pending"; then
    echo "⚠️ Há migrações pendentes"
    exit 1
elif echo "$MIGRATION_STATUS" | grep -q "All migrations have been applied"; then
    echo "✅ Banco está atualizado"
    exit 0
else
    echo "❓ Status desconhecido"
    exit 1
fi 