# Use a node base image
FROM node:18-alpine as builder

ARG GH_TOKEN
ENV GH_TOKEN=$GH_TOKEN

# Set the working directory
WORKDIR /app

# Copy the source code to the container
COPY package.json .
COPY tsconfig.json .

# Install the node dependencies
RUN npm i

# Copy the source code to the container
COPY src src
#COPY config.js .

RUN npm run build

# Use a node base image
FROM node:18-alpine as runner

WORKDIR /app

COPY --from=builder /app/dist/app.js dist/app.js
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

CMD ["npm", "run", "start"]