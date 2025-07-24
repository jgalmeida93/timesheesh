# Etapa de build
FROM node:20-slim AS builder

WORKDIR /app

# Copia somente os arquivos de dependência para melhor aproveitamento do cache
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera os arquivos do Prisma Client
RUN npx prisma generate

# Etapa final (runtime)
FROM node:20-slim

WORKDIR /app

# Copia apenas o que foi gerado na etapa de build
COPY --from=builder /app /app

# Garante que a pasta de dados exista (volume irá sobrescrever, mas evita erros de path)
RUN mkdir -p /app/data

# Variáveis e porta
ENV NODE_ENV=production
EXPOSE 1234

CMD ["/app/entrypoint.sh"]

