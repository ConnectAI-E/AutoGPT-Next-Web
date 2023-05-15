# Use the official Node.js image
FROM node:19-alpine


RUN apk update && apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code
COPY . .
COPY entrypoint.sh ./

# Ensure correct line endings after these files are edited by windows
RUN apk add --no-cache dos2unix\
  && dos2unix entrypoint.sh


# Expose the port the app will run on
EXPOSE 3000

# Prevent Husky errors by disabling the `prepare` script
RUN npm pkg set scripts.prepare="exit 0"

# set npm registry
RUN npm config set registry 'https://registry.npmmirror.com/'

# Install dependencies
RUN npm ci


ENTRYPOINT ["sh", "entrypoint.sh"]

# Build the Next.js app
RUN npm run build


# Start the application
CMD ["npm", "start"]
