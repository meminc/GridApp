# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install && npm install -g nodemon
COPY . .
CMD ["npx", "nodemon", "index.js"] 