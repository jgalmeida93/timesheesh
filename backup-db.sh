#!/bin/bash

# Script de backup do banco de dados
BACKUP_DIR="/var/lib/timesheesh/backups"
DB_PATH="/var/lib/timesheesh/data/prod.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🔧 Criando backup do banco de dados..."

# Cria diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verifica se o banco existe
if [ -f "$DB_PATH" ]; then
    echo "📁 Banco encontrado, criando backup..."
    cp "$DB_PATH" "$BACKUP_DIR/prod.db.backup.$TIMESTAMP"
    echo "✅ Backup criado: $BACKUP_DIR/prod.db.backup.$TIMESTAMP"
    echo "📊 Tamanho do backup: $(du -h "$BACKUP_DIR/prod.db.backup.$TIMESTAMP" | cut -f1)"
else
    echo "⚠️ Banco não encontrado em $DB_PATH"
fi

# Lista backups existentes
echo "📋 Backups disponíveis:"
ls -la "$BACKUP_DIR" | grep "prod.db.backup" || echo "Nenhum backup encontrado" 