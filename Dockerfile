
# Stage 1: Builder
# This stage installs dependencies and builds the Next.js application.
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# The build process will use the .env.production file if it exists,
# but environment variables injected at runtime will take precedence.
RUN pnpm build

# Stage 2: Runner
# This stage takes the built application from the builder stage
# and sets up a minimal environment to run it.
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production
# Default port, can be overridden by environment variable at runtime
ENV PORT 3000

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage.
# This includes the .next/standalone directory and static assets.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# If you have a .next/static directory from a non-standalone build, copy it too.
# However, with `output: 'standalone'`, this is usually handled.
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Healthcheck to ensure the application is running
# Uses wget to ping the /api/health (or any simple, lightweight) endpoint.
# Adjust the path if your health check endpoint is different.
# Create a basic health check endpoint in your Next.js app if you don't have one.
# For now, we'll check the base path. It's better to have a dedicated health endpoint.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://localhost:${PORT}/ || exit 1

# Command to run the application
# Note: For AI features to work, AI_PROVIDER_API_KEY must be passed as an environment variable
# when running the container, e.g., docker run -e AI_PROVIDER_API_KEY="your_key_here" ...
CMD ["node", "server.js"]
