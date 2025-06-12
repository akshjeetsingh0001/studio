
# Stage 1: Installer/Builder - Install dependencies and build the application
FROM node:20-alpine AS installer
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# Explicitly set TSCONFIG_PATH, though Next.js should pick up tsconfig.json by default
ENV TSCONFIG_PATH=/app/tsconfig.json

# Copy tsconfig.json first to ensure it's available for any pre-build steps
COPY tsconfig.json ./

# Copy package.json and lock files
COPY package.json yarn.lock* pnpm-lock.yaml* ./

# Install dependencies
# Choose the command that matches your package manager
# RUN npm ci --only=production
RUN yarn install --frozen-lockfile --production
# RUN pnpm install --prod --frozen-lockfile

# Copy the rest of the application source code
# This includes the 'src' directory and any other necessary files like 'public'
COPY . .

# Diagnostic: List files to verify structure (especially tsconfig.json and src)
RUN echo "--- Content of /app ---" && ls -la
RUN echo "--- Content of /app/src ---" && ls -la src
RUN echo "--- Content of /app/src/components ---" && ls -la src/components
RUN echo "--- Content of /app/src/components/ui ---" && ls -la src/components/ui
RUN echo "--- Content of /app/tsconfig.json ---" && cat tsconfig.json

# Build the Next.js application
# If you encounter timeouts (ETIMEDOUT) during 'yarn build' for other network requests (not fonts),
# it's likely a network issue from within Docker on your Ubuntu server.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# HOSTNAME "0.0.0.0" is important for the app to be reachable from outside the container
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the installer stage
# Copy the standalone Next.js server output
COPY --from=installer /app/.next/standalone ./
# Copy the public folder
COPY --from=installer /app/public ./public
# Copy the static assets from .next/static
COPY --from=installer /app/.next/static ./.next/static

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# server.js is the entry point for a Next.js standalone application
CMD ["node", "server.js"]
