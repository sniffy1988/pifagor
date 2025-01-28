# Use an official Node.js image with Alpine
FROM arm32v7/node:18-alpine

# Set build arguments and environment variables
ARG TARGETOS=TARGETARCH
ENV NODE_ENV=production
ENV TZ="Europe/Kyiv"

# Set the working directory
WORKDIR /usr/src/app

# Copy only package-related files to leverage caching
COPY package.json .
COPY package-lock.json .

# Install dependencies (only production dependencies if NODE_ENV is production)
RUN npm ci

# Move node_modules to a higher level to allow sharing across layers

# Copy application code
COPY . .

# Define the command to run the application
CMD ["node", "./build/index.js"]
