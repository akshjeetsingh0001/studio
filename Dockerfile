# Dockerfile for Next.js Seera Application

# ---- Builder Stage ----
# Use a specific version of Node.js for reproducibility, Alpine for smaller image size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
# This allows Docker to cache the npm install step if these files haven't changed
COPY package.json ./
# If you use package-lock.json, ensure it's part of your project or generated before build.
# COPY package-lock.json ./

# Install dependencies
# Using --frozen-lockfile to ensure reproducible builds based on package-lock.json (if present) or package.json
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Environment variables can be set here if needed for the build process
# Example: ENV NEXT_PUBLIC_API_URL_BUILDTIME=https://api.example.com
# Ensure GOOGLE_AI_API_KEY is available if build-time Genkit operations need it,
# though it's better to have it as a runtime variable for the deployed app.

# Build the Next.js application for production
# This will leverage the `output: 'standalone'` in next.config.ts
RUN npm run build

# ---- Runner Stage ----
# Use a slim, secure base image for the runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production
# The Next.js app inside a container will listen on 0.0.0.0 by default.
# You can set the PORT environment variable if you want to run on a different port.
# Example: ENV PORT=8080

# Copy the standalone output from the builder stage
# This includes the server.js, .next/static, public, and minimal node_modules
COPY --from=builder /app/.next/standalone ./

# Expose the port the app runs on (Next.js default for production is 3000)
# This should match the PORT environment variable if you set one.
EXPOSE 3000

# Command to run the Next.js standalone server
# This server.js is created by the `output: 'standalone'` build.
CMD ["node", "server.js"]
