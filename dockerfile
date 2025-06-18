FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app /app

ENV NODE_ENV=production
EXPOSE 1234

CMD ["npm", "start"]
