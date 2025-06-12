
# Stage 1: Installer - Build the Next.js application
FROM node:20-alpine AS installer
WORKDIR /app

# Copy tsconfig first if it affects subsequent steps, otherwise can be part of COPY . .
COPY tsconfig.json ./

# Copy package.json and lock files
# Prefer copying specific lock files to avoid issues if multiple exist
COPY package.json yarn.lock* pnpm-lock.yaml* package-lock.json* ./

# Install dependencies using Yarn
# Using --frozen-lockfile to ensure reproducible builds
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy the rest of the application source code
# This includes your 'src' directory, 'public' (if it exists and not ignored),
# next.config.js, and any other necessary files.
COPY . .

# Diagnostic: List files in /app to verify COPY . .
RUN echo "--- Content of /app (after COPY . .) ---" && ls -A /app
# Diagnostic: List files in /app/src
RUN echo "--- Content of /app/src ---" && ls -A /app/src || echo "/app/src directory NOT FOUND"
# Diagnostic: List files in /app/src/components
RUN echo "--- Content of /app/src/components ---" && ls -A /app/src/components || echo "/app/src/components directory NOT FOUND"
# Diagnostic: List files in /app/src/components/ui
RUN echo "--- Content of /app/src/components/ui ---" && ls -A /app/src/components/ui || echo "/app/src/components/ui directory NOT FOUND"

# Ensure /app/public exists for the build process, as Next.js might expect it.
# If your project has a 'public' folder, COPY . . should have brought it.
# This mkdir -p ensures it exists even if your project doesn't have one.
RUN mkdir -p /app/public && chown -R $(id -u):$(id -g) /app/public
# Diagnostic: Check if /app/public exists after potential creation
RUN echo "--- Content of /app/public (in installer stage, after mkdir -p) ---" && ls -A /app/public || echo "/app/public directory was not found or is empty (created by mkdir)"

# Diagnostic: Display tsconfig.json content
RUN echo "--- Content of /app/tsconfig.json ---" && cat /app/tsconfig.json || echo "/app/tsconfig.json NOT FOUND"

# Build the Next.js application
# The build process will use tsconfig.json for path aliases.
# Ensure your Docker build environment has internet access if your build fetches external resources.
# If you encounter timeouts (ETIMEDOUT) during 'yarn build' for other network requests (not fonts),
# it's likely a network issue from within Docker on your Ubuntu server.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone Next.js output from the installer stage
# This includes the .next/standalone directory which has server.js and minimal dependencies.
COPY --from=installer --chown=nextjs:nodejs /app/.next/standalone ./

# Create the target public directory in the runner stage.
# Next.js server might expect this directory to exist, even if empty.
# Assets from a local 'public' directory are NOT copied by this Dockerfile.
RUN mkdir -p ./public && chown nextjs:nodejs ./public

# Create the target .next/static directory in the runner stage
RUN mkdir -p ./.next/static && chown nextjs:nodejs ./.next/static
# Copy the static assets (.next/static) from the installer stage
COPY --from=installer --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
# PORT is already set in next.config.js or by the start command, but can be overridden.
# ENV PORT=3000

# Command to run the Next.js application
# This uses the server.js from the standalone output.
CMD ["node", "server.js"]
