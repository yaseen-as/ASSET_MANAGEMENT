# Testing Infrastructure

## Unit Tests
- Jest + @types/jest for backend services
- React Testing Library + Jest for frontend
- Coverage reports with nyc/istanbul

## Integration Tests
- Supertest for API endpoint testing
- Test containers with dedicated PostgreSQL instances
- Isolated test environments

## E2E Tests
- Playwright for comprehensive end-to-end testing
- Full user journey testing
- Visual regression testing

## Test Commands
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```
