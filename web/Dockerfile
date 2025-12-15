FROM node:18-bullseye-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_HOST
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DJANGO_BASE_URL
ARG NEXT_PUBLIC_TEMPLATE_ID
ARG NEXT_PUBLIC_ADMIN_BASE_PATH

ENV NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DJANGO_BASE_URL=$NEXT_PUBLIC_DJANGO_BASE_URL \
    NEXT_PUBLIC_TEMPLATE_ID=$NEXT_PUBLIC_TEMPLATE_ID \
    NEXT_PUBLIC_ADMIN_BASE_PATH=$NEXT_PUBLIC_ADMIN_BASE_PATH

RUN npm run build

FROM node:18-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "run", "start"]
