FROM node:20
WORKDIR /app

# Install dependencies for Puppeteer (used by whatsapp-web.js)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libexpat1 \
    libfontconfig1 \
    libfreetype6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lockb ./
RUN curl -fsSL https://bun.sh/install | bash
# Ensure Bun is available in the path
ENV PATH="/root/.bun/bin:$PATH"
RUN bun install
COPY . .
RUN chmod +x ./run.sh
CMD ["./run.sh", "up"]
