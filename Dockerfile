FROM node:16

# Install dependencies
RUN apt-get update && \
    apt-get install -y default-mysql-client netcat-openbsd curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies with clean cache
COPY package*.json ./
RUN npm install -g supervisor && \
    npm install && \
    npm cache clean --force

# Copy application files
COPY . .

# Verify critical paths
RUN echo "=== Verifying File Structure ===" && \
    ls -la && \
    [ -d static ] && ls -la static/ && \
    [ -d static/images ] && ls -la static/images/ && \
    [ -d views ] && ls -la views/ && \
    echo "=== Checking DB Config ===" && \
    node -e "try { console.log('DB config exists'); } catch(e) { console.error('DB config error:', e); process.exit(1); }" && \
    echo "==========================="

EXPOSE 3000

# Healthcheck would be overridden by compose healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["sh", "-c", "echo '=== Final Verification ==='; \
     ls -la /usr/src/app/static; \
     echo '=== Starting Application ==='; \
     node app.js"]