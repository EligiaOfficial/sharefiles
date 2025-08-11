# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

RUN chown -R svelte:nodejs /app
USER svelte

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["serve", "-s", "build", "-l", "3000"]
