# ---- Stage 1: Build ----
# Use a Node.js image to install dependencies
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# ---- Stage 2: Production ----
# Use a smaller "slim" image for the final container
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy dependencies and source code from the 'builder' stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Expose the port the app runs on to the container
EXPOSE 3000

# The command to start the application when the container starts
CMD [ "node", "index.js" ]