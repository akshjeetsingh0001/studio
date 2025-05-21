# Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using npm ci for cleaner, reproducible installs in CI/build environments
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# NEXT_PUBLIC_ environment variables needed at build time should be set here
# e.g., using ARG in combination with ENV if passed during docker build
# ARG NEXT_PUBLIC_MY_VAR
# ENV NEXT_PUBLIC_MY_VAR=${NEXT_PUBLIC_MY_VAR}
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Set a default port. This can be overridden by the PORT environment variable at runtime.
# Next.js will automatically use this PORT.
ENV PORT=3000

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from the builder stage
# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone server and static assets
# The --chown flag sets the owner of the copied files to the non-root user
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

# Expose the port the app will run on. This is documentation for the operator.
# The actual port mapping is done when running the container (e.g., docker run -p <host_port>:3000).
EXPOSE 3000

# Healthcheck
# This checks if the server is responding on the port defined by the PORT environment variable.
# wget is generally available on alpine images.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Start the Next.js application
# server.js is at the root of the standalone directory.
CMD ["node", "server.js"]
