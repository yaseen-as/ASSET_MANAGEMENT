# E2E Testing Dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy test files
COPY . .

# Install browsers
RUN npx playwright install

# Create directories for reports
RUN mkdir -p test-results reports

# Run tests
CMD ["npm", "run", "test:e2e"]
