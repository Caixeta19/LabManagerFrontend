# ---------- Etapa 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Instala as dependências antes de copiar o código, para reaproveitar o cache
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O Vite grava a URL da API no bundle durante o build: é o endereço que o NAVEGADOR usa
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- Etapa 2: servidor ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
