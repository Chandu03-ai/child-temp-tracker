# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Build admin panel
RUN npm run build

# Expose port 80
EXPOSE 80

# Start Strapi
CMD ["npm", "start"]