FROM node:lts-alpine
ARG TARGETOS TARGETARCH
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
CMD ["npx", "ts-node", "index.ts"]
