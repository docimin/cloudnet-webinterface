# --- Base image ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV production

RUN npm install -g pnpm

COPY . .
RUN pnpm install
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
