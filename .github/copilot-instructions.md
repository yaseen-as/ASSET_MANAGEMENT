<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Asset Management Software MVP - Copilot Instructions

This is a comprehensive Asset Management Software MVP built with a microservices architecture.

## Project Architecture
- **Monorepo Structure**: All services are in a single repository
- **Frontend**: React TypeScript with TailwindCSS, shadcn/ui, and Redux Toolkit
- **Backend**: Node.js TypeScript microservices with Express, Prisma ORM, and PostgreSQL
- **Infrastructure**: Docker, Docker Compose, and Nginx reverse proxy

## Key Technologies
- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui, Redux Toolkit, Axios
- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL, JWT
- **DevOps**: Docker, Docker Compose, Nginx

## Services Structure
1. **Auth Service** (Port 3001): User authentication, JWT tokens, Angel One API credentials
2. **Portfolio Service** (Port 3002): Holdings CRUD, P&L calculations, portfolio sync
3. **Market Data Service** (Port 3003): Stock prices, historical data from Angel One API
4. **Frontend** (Port 3000): React SPA with modern UI components

## Code Style Guidelines
- Use **TypeScript** throughout the project
- Follow **clean architecture** principles (controllers, services, repositories)
- Use **async/await** for asynchronous operations
- Implement proper **error handling** with try-catch blocks
- Use **JSDoc comments** for complex functions
- Follow **RESTful API** conventions
- Use **Prisma ORM** for database operations
- Implement **proper validation** with Joi

## File Organization
- Each service follows: `src/{controllers,services,repositories,routes,utils}`
- Frontend follows: `src/{components,pages,services,store,lib}`
- Use **absolute imports** where possible
- Keep components **small and focused**

## Database Guidelines
- Each microservice has its **own PostgreSQL database**
- Use **Prisma migrations** for schema changes
- Follow **proper database naming** conventions (snake_case for tables/columns)
- Implement **proper indexing** for frequently queried fields

## Security Practices
- Use **JWT tokens** for authentication
- Hash passwords with **bcrypt**
- Validate **all input data**
- Use **environment variables** for sensitive data
- Implement **CORS** and **security headers**

## API Design
- Use **consistent response formats**
- Implement **proper HTTP status codes**
- Use **RESTful resource naming**
- Include **success/error indicators**
- Provide **meaningful error messages**

## Frontend Guidelines
- Use **shadcn/ui components** for consistent UI
- Implement **responsive design** with TailwindCSS
- Use **Redux Toolkit** for state management
- Create **reusable custom hooks**
- Follow **React best practices** (functional components, hooks)

## Development Workflow
- Use **Docker Compose** for local development
- Run services individually during development
- Use **hot reloading** for faster development
- Implement **proper logging** for debugging
- Write **self-documenting code**

## Integration Notes
- All services communicate via **HTTP APIs**
- Use **Nginx** as reverse proxy for routing
- Frontend communicates with services through `/auth`, `/portfolio`, `/market` prefixes
- Implement **proper error handling** for service communication failures
