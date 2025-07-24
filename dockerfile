# Etapa de build
FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências de sistema (incluindo OpenSSL)
RUN apt-get update -y && apt-get install -y openssl

# Instala dependências do projeto
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# Etapa final (runtime)
FROM node:20-slim

WORKDIR /app

# Instala dependências de sistema no container final também
RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app /app

# 🔥 COPIA O .env PARA O CONTAINER
COPY .env .env

# Script de entrada
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 1234

CMD ["/app/entrypoint.sh"]
