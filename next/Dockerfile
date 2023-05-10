# Use the official Node.js image
FROM node:19-alpine


RUN apk update && apk add --no-cache openssl


ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NODE_ENV=production
ARG SKIP_ENV_VALIDATION
ENV SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION

# Needed for the wait-for-db script
RUN apk add --no-cache netcat-openbsd

# Set the working directory
WORKDIR /next

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Ensure correct line endings after these files are edited by windows
RUN apk add --no-cache dos2unix netcat-openbsd \
  && dos2unix /next/wait-for-db.sh \
  && dos2unix /next/entrypoint.sh

# Expose the port the app will run on
EXPOSE 3000

# Prevent Husky errors by disabling the `prepare` script
RUN npm pkg set scripts.prepare="exit 0"

# set npm registry
RUN npm config set registry 'https://registry.npmmirror.com/'

# Install dependencies
RUN npm ci

# Copy the wait-for-db.sh script
COPY wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

# FIXME
# # Build the Next.js app
# RUN npm run build

ENTRYPOINT ["sh", "entrypoint.sh"]

# FIXME
# # Start the application
# CMD ["npm", "start"]

CMD ["npm", "run", "dev"]
