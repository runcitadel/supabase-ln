FROM node:16-bullseye-slim as builder

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml tsconfig.json ./

RUN mkdir -p .yarn/releases && mkdir -p .yarn/plugins/@yarnpkg/  && mkdir -p src

COPY .yarn/releases/* ./.yarn/releases/
COPY .yarn/plugins/@yarnpkg/* ./.yarn/plugins/@yarnpkg/

RUN yarn

COPY src/*.ts ./src/

RUN yarn build

FROM node:16-bullseye-slim as dependencies

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN mkdir -p .yarn/releases && mkdir -p .yarn/plugins/@yarnpkg/

COPY .yarn/releases/* ./.yarn/releases/
COPY .yarn/plugins/@yarnpkg/* ./.yarn/plugins/@yarnpkg/

RUN yarn workspaces focus -A --production

FROM gcr.io/distroless/nodejs:16

WORKDIR /app

COPY --from=dependencies /app/node_modules /app/node_modules

COPY --from=builder /app/package.json /app/
COPY --from=builder /app/dist /app/dist

CMD [ "dist/index.js" ]
