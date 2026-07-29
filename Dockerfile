# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Add build-time arguments
ARG VITE_LOGO_PATH
ARG VITE_NAME
ARG VITE_DOMAIN
ARG VITE_CLOUDNET_ADDRESS
ARG VITE_CLOUDNET_ADDRESS_HIDDEN
ARG VITE_SENTRY_DSN

# Set them as environment variables for later stages
ENV VITE_LOGO_PATH=${VITE_LOGO_PATH}
ENV VITE_NAME=${VITE_NAME}
ENV VITE_DOMAIN=${VITE_DOMAIN}
ENV VITE_CLOUDNET_ADDRESS=${VITE_CLOUDNET_ADDRESS}
ENV VITE_CLOUDNET_ADDRESS_HIDDEN=${VITE_CLOUDNET_ADDRESS_HIDDEN}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Source map upload only. Scoped to this stage so the auth token stays out of the
# final image.
ARG SENTRY_URL
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_URL=${SENTRY_URL}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy the Nitro output and run it
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Read at runtime on sign in; override with -e to enable SSRF protection
ENV BLOCK_PRIVATE_ADDRESSES=false

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cloudnet

# .output is self-contained: bundled server plus the public assets it serves
COPY --from=builder --chown=cloudnet:nodejs /app/.output ./.output

USER cloudnet

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"

CMD ["node", ".output/server/index.mjs"]
