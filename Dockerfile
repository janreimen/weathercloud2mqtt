#FROM node:24-slim 
FROM node:20-alpine

WORKDIR /app

#RUN apt-get update \
#	&& apt-get install -y --no-install-recommends cron \
#	&& rm -rf /var/lib/apt/lists/*
RUN apk add --no-cache dcron

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

COPY --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh

# Build dependencies
RUN npm run builddev
RUN npx tsc


# Default schedule: every minute. Set RUN_ON_START=true to run once at container start.
ENV CRON_SCHEDULE="*/1 * * * *" \
	RUN_ON_START="true"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
