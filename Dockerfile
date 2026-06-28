FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

CMD ["node", "server.js"]
