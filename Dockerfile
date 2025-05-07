FROM node:18

# Install MySQL client and netcat
RUN apt-get update && \
    apt-get install -y default-mysql-client netcat-openbsd

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create directory for uploaded images
RUN mkdir -p public/images

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["sh", "-c", "node app.js"]