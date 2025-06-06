# --- Base image ---
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV production

RUN npm install -g pnpm

COPY . .
RUN chmod +x docker-entrypoint.sh
RUN pnpm install

EXPOSE 3000
CMD ["sh", "-c", "/app/docker-entrypoint.sh"]
