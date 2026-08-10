# Base Image: Lightweight Node.js Linux distribution
# System Analogy: Selecting a clean, minimal OS ISO image (like Debian or Alpine) for a virtual machine template.
FROM node:18-alpine

# Working Directory: Sets internal container folder path
WORKDIR /usr/src/app

# Package Ingestion: Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install Dependencies
RUN npm install

# Application Payload: Copy remaining source code files
COPY . .

# Ingress Port Exposure: Exposes internal port socket
EXPOSE 3000

# Entrypoint Execution: Boot command executed when container initializes
CMD ["node", "index.js"]