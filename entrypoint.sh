#!/bin/sh

echo "🔧 Verificando diretório de dados..."
mkdir -p /app/data

echo "📊 Informações do banco de dados:"
echo "DATABASE_URL: $DATABASE_URL"
ls -la /app/data/

# Verifica se o banco de dados já existe
DB_FILE=$(echo $DATABASE_URL | sed 's/file://')
echo "🔍 Verificando arquivo do banco: $DB_FILE"

if [ -f "$DB_FILE" ]; then
    echo "📁 Banco de dados já existe (tamanho: $(du -h "$DB_FILE" | cut -f1))"
    echo "📅 Última modificação: $(stat -c %y "$DB_FILE")"
    
    echo "📁 Verificando status das migrações..."
    # Verifica o status das migrações de forma mais segura
    MIGRATION_STATUS=$(npx prisma migrate status --schema=./prisma/schema.prisma 2>&1)
    echo "📋 Status das migrações:"
    echo "$MIGRATION_STATUS"
    
    # Só executa migrate deploy se houver migrações pendentes E o banco não estiver vazio
    if echo "$MIGRATION_STATUS" | grep -q "Database schema is out of sync" || echo "$MIGRATION_STATUS" | grep -q "migrations pending"; then
        echo "⚠️ Migrações pendentes detectadas"
        
        # Verifica se o banco tem dados antes de aplicar migrações
        DB_SIZE=$(du -k "$DB_FILE" | cut -f1)
        if [ "$DB_SIZE" -gt 10 ]; then
            echo "📊 Banco tem dados ($DB_SIZE KB), fazendo backup antes das migrações..."
            
            # Cria backup antes de aplicar migrações
            BACKUP_FILE="/app/data/prod.db.backup.$(date +%Y%m%d_%H%M%S)"
            cp "$DB_FILE" "$BACKUP_FILE"
            echo "💾 Backup criado: $BACKUP_FILE"
            
            echo "🔄 Aplicando migrações com cuidado..."
            npx prisma migrate deploy
            
            # Verifica se a migração foi bem-sucedida
            if [ $? -eq 0 ]; then
                echo "✅ Migrações aplicadas com sucesso"
            else
                echo "❌ Erro nas migrações, restaurando backup..."
                cp "$BACKUP_FILE" "$DB_FILE"
                echo "🔄 Backup restaurado"
            fi
        else
            echo "📊 Banco parece vazio ($DB_SIZE KB), aplicando migrações..."
            npx prisma migrate deploy
        fi
    else
        echo "✅ Banco de dados está atualizado, pulando migrações"
    fi
else
    echo "🆕 Banco de dados não existe, criando e aplicando migrações..."
    npx prisma migrate deploy
fi

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

echo "🚀 Iniciando aplicação..."
exec npm start
