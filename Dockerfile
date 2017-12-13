FROM node:8.9.3-alpine as build
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN apk add --no-cache python alpine-sdk && \
    yarn install --ignore-engines
COPY . /usr/src/app

FROM node:8.9.3-alpine as app
COPY --from=build /usr/src/app /usr/src/app
ENTRYPOINT [ "/usr/src/app/bin/torrentflix" ]
