
##### Dockerfile #####
## build stage ##
FROM node:18.12.0-alpine  as build
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install  --non-interactive --ignore-scripts 
COPY . .
RUN yarn build
## run stage ##
FROM nginx:alpine
COPY  --from=build /app/dist  /run
COPY nginx.conf /etc/nginx/nginx.conf
