FROM node:lts-slim
WORKDIR /app
COPY package*.json ./
RUN npm set registry https://registry.npmmirror.com && npm install
COPY . .
EXPOSE 3000
CMD node server.js