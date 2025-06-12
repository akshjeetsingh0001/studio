
# Stage 1: Installer/Builder - Install dependencies and build the application
FROM node:20-alpine AS installer
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1 # Uncomment to disable Next.js telemetry

# Explicitly copy tsconfig.json first
COPY tsconfig.json ./

# Copy package.json and lock files
# Adjust if you use npm (package-lock.json) or pnpm (pnpm-lock.yaml)
COPY package.json yarn.lock* ./
# COPY package.json package-lock.json* ./
# COPY package.json pnpm-lock.yaml* ./

# Install dependencies
# Make sure to use the correct command for your package manager (npm, yarn, or pnpm)
RUN yarn install --frozen-lockfile
# RUN npm ci
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Add ls commands for diagnostics - check if files are where they should be
RUN echo "--- Contents of /app (root) ---" && ls -la /app
RUN echo "--- Contents of /app/src ---" && ls -la /app/src
RUN echo "--- Contents of /app/src/components ---" && ls -la /app/src/components
RUN echo "--- Contents of /app/src/components/ui ---" && ls -la /app/src/components/ui
RUN echo "--- Content of /app/tsconfig.json ---" && cat /app/tsconfig.json

# Build the Next.js application
# Ensure your Docker build environment has internet access, especially for 'next/font/google'.
# If you encounter timeouts (ETIMEDOUT) here, it's likely a network issue from within Docker.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1 # Uncomment to disable Next.js telemetry

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from the installer stage
# This includes the .next/standalone server and its dependencies
COPY --from=installer /app/.next/standalone ./

# Copy public assets
COPY --from=installer /app/public ./public

# Copy static build output from .next/static
COPY --from=installer /app/.next/static ./.next/static

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose port 3000 (or the port your app runs on)
EXPOSE 3000

# Set HOSTNAME and PORT environment variables
# HOSTNAME 0.0.0.0 is important for Docker to listen on all interfaces
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the Next.js application
# server.js is the entry point for 'standalone' output mode
CMD ["node", "server.js"]
