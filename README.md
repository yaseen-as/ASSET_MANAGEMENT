# Asset Management System

A comprehensive, enterprise-grade asset management platform built with microservices architecture, featuring complete testing coverage, CI/CD pipeline, observability stack, and production-ready deployment.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based secure authentication with refresh tokens
- **Portfolio Management** - Track and manage investment portfolios with real-time updates
- **Market Data Integration** - Live market data from Angel One API
- **Real-time Updates** - WebSocket connections for live price feeds
- **Responsive UI** - Modern React-based frontend with TypeScript

### Enterprise Features
- **Comprehensive Testing** - Unit, Integration, and E2E tests with >90% coverage
- **Observability Stack** - Prometheus metrics, Grafana dashboards, structured logging
- **CI/CD Pipeline** - Automated Jenkins pipeline with multi-stage deployment
- **Docker Profiles** - Separate configurations for dev/test/prod environments
- **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- **Security** - Rate limiting, input validation, SQL injection protection

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Nginx     │    │  Jenkins    │
│   (React)   │◄──►│ (Reverse    │    │   (CI/CD)   │
│             │    │  Proxy)     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    Auth     │ │  Portfolio  │ │ Market Data │
    │   Service   │ │   Service   │ │   Service   │
    │             │ │             │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
          │               │               │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Auth DB    │ │Portfolio DB │ │ Market DB   │
    │(PostgreSQL) │ │(PostgreSQL) │ │(PostgreSQL) │
    └─────────────┘ └─────────────┘ └─────────────┘

    ┌─────────────┐    ┌─────────────┐
    │ Prometheus  │◄──►│   Grafana   │
    │ (Metrics)   │    │(Dashboards) │
    └─────────────┘    └─────────────┘
```

## 🛠️ Technology Stack

### Backend Services
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL 15 with optimized queries
- **Authentication**: JWT with refresh token strategy
- **API Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston with structured JSON logging
- **Metrics**: Prometheus with custom business metrics

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Context API + Hooks
- **Styling**: Modern CSS with responsive design
- **API Communication**: Axios with interceptors
- **Real-time**: WebSocket connections

### DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose with profiles
- **CI/CD**: Jenkins with automated pipelines
- **Monitoring**: Prometheus + Grafana stack
- **Reverse Proxy**: Nginx with SSL termination
- **Testing**: Jest + React Testing Library + Playwright

## � Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd asset-management-system

# Run the setup script
./scripts/setup.sh

# Start development environment
./scripts/manage.sh dev
```

The application will be available at:
- **Frontend**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Monitoring**: http://localhost:9090 (Prometheus), http://localhost:3100 (Grafana)

## � Environment Management

The system supports three distinct environments with separate configurations:

### Development Environment
```bash
# Start development environment with hot reload
./scripts/manage.sh dev

# Features enabled:
# - Hot reload for all services
# - Debug logging
# - Swagger documentation
# - Metrics collection
# - Volume mounts for live editing
```

### Test Environment
```bash
# Start test environment
./scripts/manage.sh test

# Run all tests
./scripts/manage.sh test-all

# Features:
# - Separate test databases
# - Minimal logging
# - Isolated test data
# - E2E testing setup
```

### Production Environment
```bash
# Start production environment
./scripts/manage.sh prod

# Features:
# - Optimized builds
# - Security hardening
# - Performance monitoring
# - SSL/HTTPS ready
# - Secrets management
```

## 🧪 Testing Strategy

### Unit Tests
- **Coverage**: >90% code coverage
- **Framework**: Jest with TypeScript support
- **Mocking**: Comprehensive service and database mocks
- **Location**: `services/*/tests/unit/`

```bash
# Run unit tests for all services
docker-compose exec auth-service npm run test:unit
docker-compose exec portfolio-service npm run test:unit
docker-compose exec market-service npm run test:unit
```

### Integration Tests
- **API Testing**: Supertest for HTTP endpoint testing
- **Database**: Real database integration with cleanup
- **Authentication**: JWT token validation
- **Location**: `services/*/tests/integration/`

```bash
# Run integration tests
docker-compose exec auth-service npm run test:integration
```

### End-to-End Tests
- **Framework**: Playwright for cross-browser testing
- **Coverage**: Complete user journeys
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Location**: `e2e/tests/`

```bash
# Run E2E tests
docker-compose run --rm e2e-tests npm run test:e2e
```

## 📊 Observability

### Logging
- **Format**: Structured JSON logging with Winston
- **Levels**: Debug, Info, Warn, Error with appropriate filtering
- **Context**: Request IDs, user IDs, correlation tracking
- **Storage**: File rotation + stdout for container logs

### Metrics
- **Collection**: Prometheus with custom business metrics
- **HTTP Metrics**: Request duration, status codes, throughput
- **Business Metrics**: Login attempts, portfolio operations, market data calls
- **Visualization**: Pre-configured Grafana dashboards

### Monitoring Dashboards
Access Grafana at http://localhost:3100 (admin/admin):
- **System Overview**: Infrastructure metrics and health
- **API Performance**: Request latency, error rates, throughput
- **Business Metrics**: User activity, portfolio performance
- **Alert Rules**: Automated alerts for critical issues

## 🔄 CI/CD Pipeline

The Jenkins pipeline provides automated:
- **Code Quality**: ESLint, TypeScript compilation
- **Security**: Dependency auditing, vulnerability scanning
- **Testing**: Unit, Integration, and E2E test execution
- **Building**: Multi-architecture Docker images
- **Deployment**: Environment-specific deployments

### Pipeline Stages
1. **Checkout & Setup** - Code checkout and environment preparation
2. **Install Dependencies** - Parallel npm installation for all services
3. **Lint & Code Quality** - Static analysis and code formatting
4. **Unit Tests** - Fast feedback with coverage reports
5. **Build Images** - Docker image creation and tagging
6. **Integration Tests** - API and service integration testing
7. **E2E Tests** - Full user journey validation
8. **Security Scan** - Vulnerability and dependency auditing
9. **Deploy** - Automated deployment to target environment

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal
- **Password Security**: Bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks

### API Security
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin setup
- **Headers Security**: Security headers middleware

### Infrastructure Security
- **Container Security**: Non-root user execution
- **Secrets Management**: Environment-based secret handling
- **SSL/TLS**: HTTPS encryption for production
- **Network Isolation**: Docker network segmentation

## 📁 Project Structure

```
asset-management-system/
├── services/
│   ├── auth/                 # Authentication service
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   ├── portfolio/            # Portfolio management service
│   └── market-data/          # Market data service
├── frontend/                 # React frontend application
├── nginx/                    # Reverse proxy configuration
├── monitoring/              # Observability stack
│   ├── prometheus/          # Metrics collection
│   └── grafana/             # Dashboards and visualization
├── e2e/                     # End-to-end testing
├── scripts/                 # Management and utility scripts
├── .env.dev                 # Development environment variables
├── .env.test               # Test environment variables
├── .env.prod               # Production environment variables
├── docker-compose.yml       # Multi-environment orchestration
└── Jenkinsfile             # CI/CD pipeline definition
```

## 🔧 Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development mode with hot reload
./scripts/manage.sh dev

# View logs
./scripts/manage.sh logs [service-name]

# Check service status
./scripts/manage.sh status
```

### Code Quality
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration  
- **Type Checking**: Strict TypeScript compilation
- **Testing**: Comprehensive test coverage requirements

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`./scripts/manage.sh test-all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## � API Documentation

Interactive API documentation is available at `/api/docs` when running the services:
- **Auth Service**: http://localhost:3001/api/docs
- **Portfolio Service**: http://localhost:3002/api/docs  
- **Market Data Service**: http://localhost:3003/api/docs

## � Deployment

### Environment Variables
Ensure all required environment variables are set for your target environment:

```bash
# Required for all environments
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Required for production
PROD_JWT_SECRET=production-jwt-secret
PROD_JWT_REFRESH_SECRET=production-refresh-secret
ANGEL_ONE_API_KEY=your-production-api-key
ANGEL_ONE_CLIENT_ID=your-production-client-id
```

### Production Deployment
```bash
# Set production environment variables
export PROD_JWT_SECRET="your-secure-jwt-secret"
export PROD_JWT_REFRESH_SECRET="your-secure-refresh-secret"

# Deploy to production
./scripts/manage.sh prod

# Verify deployment
curl -f http://localhost/health
```

## 🤝 Support

### Documentation
- API documentation available at `/api/docs`
- Architecture diagrams in `/docs/architecture/`
- Deployment guides in `/docs/deployment/`

### Troubleshooting
- Check service logs: `./scripts/manage.sh logs [service]`
- Verify service health: `./scripts/manage.sh status`
- Review monitoring dashboards at http://localhost:3100

### Common Issues
1. **Port Conflicts**: Ensure ports 80, 3000-3003, 5432-5437, 8080, 9090, 3100 are available
2. **Memory Issues**: Docker requires at least 4GB RAM for full stack
3. **SSL Issues**: Regenerate certificates with `openssl` commands in setup script

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for enterprise-grade asset management
