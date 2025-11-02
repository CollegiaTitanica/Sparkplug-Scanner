# Base Node.js image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package.json first for caching npm install
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Railway provides PORT dynamically, no need to ENV
# Expose optional (for Docker clarity)
EXPOSE 8080

# Start the backend
CMD ["node", "index.js"]
