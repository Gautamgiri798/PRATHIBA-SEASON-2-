# Stage 1: Build the Next.js bundle
FROM node:20-slim AS builder
WORKDIR /app

# Install build dependencies for compiling native C++ addons (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm ci

# Copy codebase and compile Next.js production build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Production runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create the folder where the SQLite votes.db will be persistently stored
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy built outputs and node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/next.config.js ./

# Run container as a non-root node user for safety
USER node

EXPOSE 3000

ENV PORT 3000
# Tell the app to store the SQLite database inside the persistent container volume
ENV DATABASE_URL /app/data/votes.db

CMD ["npm", "run", "start"]
