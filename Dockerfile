
##### Dockerfile #####
## build stage ##
FROM node:20.0.0-alpine  as build
WORKDIR /app
COPY . .
#COPY .env.example .env
RUN yarn install
RUN  yarn run build

## run stage ##
FROM nginx:alpine
COPY  --from=build /app/dist  /run
COPY nginx.conf /etc/nginx/nginx.conf