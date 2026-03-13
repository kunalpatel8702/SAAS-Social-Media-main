FROM node:22-alpine

WORKDIR /app

# Install ffmpeg and python3 (yt-dlp requirements for audio/video merging)
RUN apk update && \
    apk add --no-cache ffmpeg python3

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Use nodemon with legacy watch (polling) for hot-reload on Windows/Docker
CMD ["npm", "run", "dev"]
