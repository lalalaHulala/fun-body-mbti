FROM node:18-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --production
COPY . .
CMD ["node", "server/index.js"]
EXPOSE 3001
