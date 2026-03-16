FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create storage directories
RUN mkdir -p storage/auth storage/logs

# Expose web port
EXPOSE 3000

# Start the bot
CMD ["node", "src/index.js"]
