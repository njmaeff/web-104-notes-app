FROM node:alpine
RUN apk add openjdk11
USER node
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN mkdir -p ~/.cache/firebase && npm install -g firebase-tools
