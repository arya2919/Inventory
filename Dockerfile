FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:./prod.db"

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
