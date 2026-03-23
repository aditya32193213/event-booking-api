# ─────────────────────────────────────────────
# Stage 1: Base image
# ─────────────────────────────────────────────
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (better layer caching —
# npm install only re-runs when package.json changes)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
