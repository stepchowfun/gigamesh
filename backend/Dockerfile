FROM node:12-slim
WORKDIR /server
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist/
CMD ["node", "dist/entry/entry.js"]
