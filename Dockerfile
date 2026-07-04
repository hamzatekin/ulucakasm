# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build

# MAPS_API_KEY is read via import.meta.env at build time and baked into the
# static output, so it must be supplied as a build arg (Coolify: Build Args).
ARG MAPS_API_KEY
ENV MAPS_API_KEY=${MAPS_API_KEY}

# Enable pnpm via corepack
RUN corepack enable

WORKDIR /app

# Install deps first for better layer caching
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Build the static site
COPY . .
RUN pnpm build

# ---- Runtime stage ----
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
