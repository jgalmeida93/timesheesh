#!/bin/bash

# Script para debug do banco de dados
echo "🔍 Debug do banco de dados..."

DB_FILE=$(echo $DATABASE_URL | sed 's/file://')
echo "📁 Arquivo do banco: $DB_FILE"

if [ -f "$DB_FILE" ]; then
    echo "✅ Banco existe"
    echo "📊 Tamanho: $(du -h "$DB_FILE" | cut -f1)"
    echo "📅 Última modificação: $(stat -c %y "$DB_FILE")"
    
    # Verifica se há dados no banco
    echo "🔍 Verificando dados no banco..."
    sqlite3 "$DB_FILE" "SELECT COUNT(*) as total_users FROM User;" 2>/dev/null || echo "❌ Erro ao consultar User"
    sqlite3 "$DB_FILE" "SELECT COUNT(*) as total_projects FROM Project;" 2>/dev/null || echo "❌ Erro ao consultar Project"
    sqlite3 "$DB_FILE" "SELECT COUNT(*) as total_timesheets FROM Timesheet;" 2>/dev/null || echo "❌ Erro ao consultar Timesheet"
    
    # Verifica estrutura das tabelas
    echo "📋 Estrutura das tabelas:"
    sqlite3 "$DB_FILE" ".schema" 2>/dev/null || echo "❌ Erro ao verificar schema"
    
else
    echo "❌ Banco não existe"
fi

echo "📊 Status das migrações:"
npx prisma migrate status --schema=./prisma/schema.prisma 2>&1

echo "🔍 Verificando logs do container..."
docker logs timesheesh-backend --tail 50 2>/dev/null || echo "❌ Container não encontrado" 