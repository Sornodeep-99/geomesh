# frontend/Dockerfile

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

# This command builds the optimized production app
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port the production server runs on
EXPOSE 3000

# The command to start the production server
# It needs HOST=0.0.0.0 to be accessible from outside the container
ENV HOST=0.0.0.0
CMD ["node", "build"]