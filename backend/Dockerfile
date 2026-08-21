FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json tsconfig.node.json tsconfig.app.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /usr/src/app/dist ./dist
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /usr/src/app
USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]
