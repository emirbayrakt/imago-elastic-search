# ---- 1) Builder ----
FROM node:20-alpine AS builder

# Recommended system deps for sharp/canvas etc. (Next uses sharp)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Leverage cached deps layers
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
# Disable telemetry & ensure prod build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ---- 2) Runner ----
FROM node:20-alpine AS runner
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
WORKDIR /app

# Copy package files and install production deps to run "next start"
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the built app artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./   
COPY --from=builder /app/package.json ./   

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

USER nextjs
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT||3000), r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Use next start (needs Next installed in deps)
CMD ["npx", "next", "start"]