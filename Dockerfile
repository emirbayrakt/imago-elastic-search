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

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

WORKDIR /app

# Copy the minimal standalone output
# - standalone server (includes only required node_modules)
# - static assets
# - public assets if you reference /public files
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Good defaults
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

# Optional: tighten security a bit
# (writeable tmp is sometimes needed by native libs)
RUN mkdir -p /app/.next/cache && chown -R nextjs:nextjs /app
USER nextjs

# Healthcheck: hit the root (or set to /api/health if you add one)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT||3000), r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the server produced by Next standalone
# (The standalone contains server.js at the root it copied above)
CMD ["node", "server.js"]
