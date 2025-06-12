
# Stage 1: Installer/Builder - Install dependencies and build the application
FROM node:20-alpine AS installer
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# Ensure tsconfig.json is copied for path alias resolution during build
COPY tsconfig.json ./

# Copy package manager files
COPY package.json yarn.lock* pnpm-lock.yaml* ./

# Install dependencies based on the lock file.
# Choose the command that matches your package manager.
# RUN npm ci
RUN yarn install --frozen-lockfile
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# ---- Diagnostics: Check file structure before build ----
RUN echo "--- Content of /app ---" && ls -A /app
RUN echo "--- Content of /app/src ---" && ls -A /app/src || echo "src directory not found"
RUN echo "--- Content of /app/src/components ---" && ls -A /app/src/components || echo "src/components directory not found"
RUN echo "--- Content of /app/src/components/ui ---" && ls -A /app/src/components/ui || echo "src/components/ui directory not found"
RUN echo "--- Content of /app/public (in installer stage) ---" && ls -A /app/public || echo "/app/public directory NOT FOUND in installer stage"
RUN echo "--- Content of /app/tsconfig.json ---" && cat /app/tsconfig.json || echo "tsconfig.json not found"
# ---- End Diagnostics ----

# Build the Next.js application
# The --no-lint and --no-typecheck flags are optional, remove if you want these checks during build
# If you encounter timeouts (ETIMEDOUT) during 'yarn build' for other network requests (not fonts),
# it's likely a network issue from within Docker on your Ubuntu server.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED 1 # Optional: uncomment to disable Next.js telemetry

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files for the standalone application from the installer stage
# This includes the server.js, .next/standalone folder, and minimal node_modules
COPY --from=installer --chown=nextjs:nodejs /app/.next/standalone ./

# Create the target public directory in the runner stage if it doesn't exist
RUN mkdir -p ./public && chown nextjs:nodejs ./public
# Copy the public folder from the installer stage
# This command will fail if /app/public does not exist in the installer stage
COPY --from=installer --chown=nextjs:nodejs /app/public ./public

# Create the target .next/static directory in the runner stage
RUN mkdir -p ./.next/static && chown nextjs:nodejs ./.next && chown nextjs:nodejs ./.next/static
# Copy the static assets from .next/static
COPY --from=installer --chown=nextjs:nodejs /app/.next/static ./.next/static


# Set ownership for the entire app directory (optional, but good practice if other files were copied)
# RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set hostname and port for the Next.js server
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the Next.js application
# server.js is the entry point for a standalone Next.js app
CMD ["node", "server.js"]
