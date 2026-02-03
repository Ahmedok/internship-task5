# --- Stage 1: Build Shared Custom Lib ---
FROM node:24-alpine AS lib-builder
WORKDIR /app/src/lib
COPY src/lib/package*.json ./
RUN npm install
COPY src/lib . 
RUN npm run build 2>/dev/null || npx tsc

# --- Stage 2: Build Frontend ---
FROM node:24-alpine AS client-builder
WORKDIR /app/src/client
COPY src/client/package*.json ./
RUN npm install
COPY src/client .
RUN npm run build

# --- Stage 3: Build Server ---
FROM node:24-alpine AS server-builder
WORKDIR /app/src/server
COPY src/server/package*.json ./
RUN npm install
COPY src/server .
COPY --from=lib-builder /app/src/lib/dist ../lib/dist
RUN npm run build
RUN npm prune --production

# --- Stage 4: Runtime ---
FROM node:24-alpine
WORKDIR /app
ENV PORT=3000
ENV NODE_ENV=production
ENV STATIC_PATH=public
COPY --from=server-builder /app/src/server/dist ./dist
COPY --from=server-builder /app/src/server/package*.json ./
COPY --from=server-builder /app/src/lib/dist ./lib/dist
COPY --from=client-builder /app/src/client/dist ./public
COPY --from=server-builder /app/src/server/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]