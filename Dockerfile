# Backend Dockerfile (Node.js placeholder)
FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"] 