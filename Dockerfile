
# Stage 1: Installer - Install dependencies and build the application
FROM node:20-alpine AS installer
WORKDIR /app

# Set NODE_ENV to production for installing only production dependencies
ENV NODE_ENV production

# Copy package.json and lock file
COPY package.json yarn.lock* pnpm-lock.yaml* ./
# If you're using npm, uncomment the line below and comment out the yarn/pnpm lines
# COPY package-lock.json ./

# Install dependencies
# If using npm:
# RUN npm ci
# If using yarn:
RUN yarn install --frozen-lockfile
# If using pnpm:
# RUN apk add --no-cache libc6-compat
# RUN corepack enable
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# The --no-lint and --no-typecheck flags are optional, remove if you want these checks during build
RUN yarn build

# Stage 2: Runner - Create the final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the next line if you need to change the timezone, e.g., for Asia/Kolkata
# ENV TZ Asia/Kolkata

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the installer stage
COPY --from=installer /app/.next/standalone ./

# Copy the public folder
COPY --from=installer /app/public ./public

# Copy the static assets (if any are served from _next/static directly and not part of standalone)
# This is generally needed for Next.js 13+ App Router static assets
COPY --from=installer /app/.next/static ./.next/static

# Set ownership to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

EXPOSE 3000

# Set the HOSTNAME to 0.0.0.0 to accept connections from any IP address
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Command to run the Next.js server
# The server.js file is created by the standalone output
CMD ["node", "server.js"]
