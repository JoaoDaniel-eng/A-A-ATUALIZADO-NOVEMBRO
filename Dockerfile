FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Instala somente as dependências declaradas e travadas pelo package-lock.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# O servidor depende apenas do código da aplicação e dos assets públicos.
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

USER node
EXPOSE 3000

CMD ["node", "src/server.js"]
