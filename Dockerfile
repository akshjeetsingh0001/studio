# Stage 1: Installer - Build the Next.js application
FROM node:20-alpine AS installer
WORKDIR /app

# Set NODE_ENV to production for this stage to ensure only prod dependencies are installed (if applicable to 'yarn install')
# And also for the 'next build' command to run in production mode.
ENV NODE_ENV=production

# Copy package.json and lock file
# This order helps leverage Docker's layer caching.
COPY package.json yarn.lock* pnpm-lock.yaml* ./

# Install dependencies
# Choose the command that matches your package manager
# RUN npm ci
RUN yarn install --frozen-lockfile
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
# The --no-lint and --no-typecheck flags are optional, remove if you want these checks during build
# Ensure your Docker build environment has internet access, especially for 'next/font/google'.
# If you encounter timeouts (ETIMEDOUT) here, it's likely a network issue from within Docker.
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the installer stage
# This includes the server.js, .next/standalone/node_modules, and other necessary files.
COPY --from=installer /app/.next/standalone ./

# Copy the public folder from the installer stage
COPY --from=installer /app/public ./public

# Copy the .next/static folder from the installer stage (contains CSS, JS chunks, etc.)
COPY --from=installer /app/.next/static ./.next/static

# Set correct ownership for the app directory
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set HOSTNAME and PORT for Next.js. 
# HOSTNAME 0.0.0.0 is important for Docker to expose the app correctly.
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Command to run the
CMD ["node", "server.js"]
