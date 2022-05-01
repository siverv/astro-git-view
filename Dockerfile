FROM alpine
WORKDIR /app
RUN apk add --update git npm
COPY package*.json ./
RUN npm ci --ignore-scripts
ADD . ./
CMD ./docker.sh