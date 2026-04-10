FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package*.json tailwind.config.cjs postcss.config.cjs vite.config.ts tsconfig*.json ./
RUN npm install

EXPOSE 3003

CMD ["npm", "run", "dev", "--", "--host"]
