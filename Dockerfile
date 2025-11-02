# Use an official Node.js runtime as a parent image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of your app
COPY . .

# Railway automatically sets PORT, but default to 8080
ENV PORT=8080
EXPOSE 8080

# Start your app
CMD ["node", "index.js"]
