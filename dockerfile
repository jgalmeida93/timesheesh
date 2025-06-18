
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .


FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app /app

ENV NODE_ENV=production
EXPOSE 1234

CMD ["npm", "start"]
