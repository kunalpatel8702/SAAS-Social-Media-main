FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Expose Vite dev server to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
