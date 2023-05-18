FROM node:19-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

RUN apk update && apk add --no-cache openssl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./


# Prevent Husky errors by disabling the `prepare` script
RUN npm pkg set scripts.prepare="exit 0"

# set npm registry
RUN npm config set registry 'https://registry.npmmirror.com/'

# Omit --production flag for TypeScript devDependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  # Allow install without lockfile, so example works even without Node.js installed locally
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

# Copy the rest of the application code
COPY . .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"$(openssl rand -base64 32)"}


ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL


ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

ARG NEXT_PUBLIC_WEB_SEARCH_ENABLED
ENV NEXT_PUBLIC_WEB_SEARCH_ENABLED=$NEXT_PUBLIC_WEB_SEARCH_ENABLED

ARG SERP_API_KEY
ENV SERP_API_KEY=$SERP_API_KEY

ARG NEXT_PUBLIC_GUEST_KEY
ENV NEXT_PUBLIC_GUEST_KEY=$NEXT_PUBLIC_GUEST_KEY

ARG NEXT_PUBLIC_FF_AUTH_ENABLED
ENV NEXT_PUBLIC_FF_AUTH_ENABLED=$NEXT_PUBLIC_FF_AUTH_ENABLED

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

ARG GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID

ARG GITHUB_CLIENT_SECRET
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET

ARG DISCORD_CLIENT_ID
ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1


# Build Next.js based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else yarn build; \
  fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma



# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"$(openssl rand -base64 32)"}



ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL


ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL


ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

ARG NEXT_PUBLIC_WEB_SEARCH_ENABLED
ENV NEXT_PUBLIC_WEB_SEARCH_ENABLED=$NEXT_PUBLIC_WEB_SEARCH_ENABLED

ARG SERP_API_KEY
ENV SERP_API_KEY=$SERP_API_KEY

ARG NEXT_PUBLIC_GUEST_KEY
ENV NEXT_PUBLIC_GUEST_KEY=$NEXT_PUBLIC_GUEST_KEY

ARG NEXT_PUBLIC_FF_AUTH_ENABLED
ENV NEXT_PUBLIC_FF_AUTH_ENABLED=$NEXT_PUBLIC_FF_AUTH_ENABLED

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

ARG GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID

ARG GITHUB_CLIENT_SECRET
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET

ARG DISCORD_CLIENT_ID
ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID

# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

ENTRYPOINT ["sh", "entrypoint.sh"]

CMD ["node", "server.js"]
