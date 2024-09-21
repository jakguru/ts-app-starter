# Jak Guru's Typescript Script and Application Starter

A starter template which can be used as a quick and easy starter for getting a project up and running.

## Usage

From your command line, run:

```bash
curl -sL https://raw.githubusercontent.com/jakguru/ts-app-starter/refs/heads/main/bin/init.cjs | node
```

Provide the script with the answers and let it create the folder and initialise the dependancies for you

## Customization

You can search and replace all instances of `@example/script` within the project, but the main files which should be customized are:

* `./package.json`
* `./vite.config.mts`
* `./src/services/cli.ts`

These are the main files which handle the naming of the project. Additionally, you can customize the `./src/env.ts` file which is used to provide a validated and sanitized version of the environmental variables.

## Example Dockerfile

```dockerfile
ARG IMAGE_PREFIX=
ARG NODE_IMAGE=node:22-alpine
FROM ${IMAGE_PREFIX}${NODE_IMAGE} as base

##################################################
# Setup the Base Container
##################################################
ENV LC_ALL=C.UTF-8
RUN apk --no-cache add dumb-init postgresql-dev
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node

##################################################
# Setup Dependencies & Build
##################################################
FROM base AS build
ENV NODE_ENV=development
USER root
RUN apk --no-cache add python3 g++ make
COPY --chown=node:node ./package*.json ./
COPY --chown=node:node ./npm* ./
COPY --chown=node:node ./yarn* ./
COPY --chown=node:node ./.yarn* ./
RUN yarn install --frozen-lockfile --production=false
COPY --chown=node:node . .
RUN yarn build
RUN yarn package
USER node

##################################################
# Wrap for Production
##################################################
FROM base AS production
ARG VERSION=master
ENV NODE_ENV=production
COPY --chown=node:node --from=build /home/node/app/dist ./package*.json ./
COPY --chown=node:node --from=build /home/node/app/dist ./npm* ./
COPY --chown=node:node --from=build /home/node/app/dist ./yarn* ./
COPY --chown=node:node --from=build /home/node/app/dist ./.yarn* ./
USER root
RUN apk --no-cache add python3 g++ make
USER node
RUN yarn install --frozen-lockfile --production
USER root
RUN apk del python3 g++ make
COPY --chown=node:node --from=build /home/node/app/dist .
USER node
CMD [ "dumb-init", "node", "index.mjs" ]
```
