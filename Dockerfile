# Use an official Node.js runtime with necessary system libraries
FROM node:18-bookworm

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers and system dependencies
# We only install Chromium to keep the image smaller
RUN npx playwright install --with-deps chromium

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port (default 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
