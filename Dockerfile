# Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=${PORT}

EXPOSE $PORT

CMD ["node", "index.js"]
