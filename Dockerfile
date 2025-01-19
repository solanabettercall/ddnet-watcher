FROM node:22

WORKDIR /usr/src/ddnet-watcher

RUN apt-get update

COPY package*.json ./
COPY tsconfig.json ./

COPY . .
RUN yarn && yarn build

CMD ["yarn", "start:prod"]