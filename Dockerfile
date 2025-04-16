FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN touch state.json && chown bun:bun state.json

CMD ["bun", "run", "index.js"] 