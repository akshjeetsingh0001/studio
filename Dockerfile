# Stage 1: Installer/Builder - Install dependencies and build the application
FROM node:20-alpine AS installer
WORKDIR /app

# Set NODE_ENV to production for this stage to ensure only prod dependencies are considered by some tools
# and to align with the build environment.
ENV NODE_ENV=production

# Copy tsconfig.json first, as it's needed for path aliases during build
COPY tsconfig.json ./

# Copy package.json and lock files
COPY package.json yarn.lock* pnpm-lock.yaml* ./

# Install dependencies using Yarn (adjust if using npm or pnpm)
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy the rest of the application source code
# This includes the 'src' directory, 'public', 'next.config.ts', etc.
COPY . .

# Diagnostic Steps: List files to verify they are correctly copied
RUN echo "--- Listing /app contents ---" && ls -A .
RUN echo "--- Listing /app/src contents ---" && ls -A src || echo "src directory not found"
RUN echo "--- Listing /app/src/components contents ---" && ls -A src/components || echo "src/components directory not found"
RUN echo "--- Listing /app/src/components/ui contents ---" && ls -A src/components/ui || echo "src/components/ui directory not found"
RUN echo "--- Content of /app/tsconfig.json ---" && cat tsconfig.json || echo "tsconfig.json not found"

# Build the Next.js application
# Ensure your Docker build environment has internet access, especially for 'next/font/google'.
# If you encounter timeouts (ETIMEDOUT) here, it's likely a network issue from within Docker.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production for the final running image
ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the installer stage
# Copy the standalone Next.js server output
COPY --from=installer --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the public folder
COPY --from=installer --chown=nextjs:nodejs /app/public ./public
# Copy the .next/static folder (generated JS, CSS, etc.)
COPY --from=installer --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Set HOSTNAME and PORT environment variables for the Next.js server
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Command to run the Next.js application
# server.js is the entry point for a standalone Next.js app
CMD ["node", "server.js"]
