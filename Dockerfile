FROM node:20
WORKDIR /app
COPY package.json bun.lockb ./
RUN curl -fsSL https://bun.sh/install | bash
# Ensure Bun is available in the path
ENV PATH="/root/.bun/bin:$PATH"
RUN bun install
COPY . .
RUN chmod +x ./run.sh
CMD ["./run.sh", "up"]
