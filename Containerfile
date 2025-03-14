FROM node:23.9 AS builder
COPY . /build
WORKDIR /build
RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=builder /build/dist /usr/share/nginx/html
