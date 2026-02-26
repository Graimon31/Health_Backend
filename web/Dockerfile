# Dockerfile for Frontend (Web)

FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
