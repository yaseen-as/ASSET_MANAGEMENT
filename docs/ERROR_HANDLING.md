# Error Handling Documentation

This document outlines the standardized error handling approach implemented across all microservices in the Asset Management System.

## Overview

All services now use a consistent error handling pattern with:
- **ApiError** class for structured error creation
- **ApiResponse** class for standardized response formatting  
- **Global error handler middleware** for centralized error processing
- **AsyncHandler** utility for automatic error catching

## ApiError Class

### Purpose
Custom error class that extends the native Error with additional properties for HTTP status codes and structured error data.

### Constructor
```typescript
new ApiError(statusCode: number, message: string, errors?: string[], stack?: string)
```

### Static Methods
- `ApiError.badRequest(message, errors)` - Creates 400 error
- `ApiError.unauthorized(message)` - Creates 401 error  
- `ApiError.forbidden(message)` - Creates 403 error
- `ApiError.notFound(message)` - Creates 404 error
- `ApiError.conflict(message)` - Creates 409 error
- `ApiError.internal(message)` - Creates 500 error
- `ApiError.serviceUnavailable(message)` - Creates 503 error (Market Data Service)

### Usage Examples
```typescript
// In service methods
if (!user) {
  throw ApiError.notFound('User not found');
}

if (existingUser) {
  throw ApiError.conflict('User already exists');
}

if (!validPassword) {
  throw ApiError.unauthorized('Invalid credentials');
}

// With validation errors
if (validationResult.error) {
  throw ApiError.badRequest('Validation failed', validationResult.error.details);
}
```

## ApiResponse Class

### Purpose
Standardizes successful response formatting across all services.

### Constructor
```typescript
new ApiResponse<T>(statusCode: number, data: T, message: string)
```

### Static Methods
- `ApiResponse.success(data, message)` - Creates 200 response
- `ApiResponse.created(data, message)` - Creates 201 response
- `ApiResponse.accepted(data, message)` - Creates 202 response
- `ApiResponse.noContent(message)` - Creates 204 response

### Response Structure
```typescript
{
  statusCode: number;
  data: T;
  message: string;
  isSuccess: boolean;
  timestamp: string;
}
```

### Usage Examples
```typescript
// In controllers
const user = await userService.createUser(userData);
const response = ApiResponse.created(user, 'User created successfully');
res.status(response.statusCode).json(response);

// For simple success responses
const holdings = await portfolioService.getHoldings();
const response = ApiResponse.success(holdings, 'Holdings retrieved successfully');
res.status(response.statusCode).json(response);
```

## Global Error Handler

### Features
- Handles all error types (ApiError, Joi validation, Prisma, JWT, Axios)
- Structured error logging with request context
- Consistent error response format
- Environment-aware error details (development vs production)
- Service-specific error handling (external APIs, database, etc.)

### Error Response Structure
```typescript
{
  success: false;
  message: string;
  errors?: string[];
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  stack?: string; // Only in development
}
```

### Handled Error Types
1. **ApiError instances** - Custom application errors
2. **Joi ValidationError** - Input validation errors  
3. **Prisma errors** - Database operation errors
4. **JWT errors** - Token validation errors
5. **Axios errors** - External API call errors
6. **Network errors** - Connection and timeout errors

## AsyncHandler Utility

### Purpose
Wraps async route handlers to automatically catch and forward errors to the global error handler.

### Usage
```typescript
import asyncHandler from '../utils/asyncHandler';

export const someController = asyncHandler(async (req, res, next) => {
  // Any thrown error will be automatically caught and forwarded
  const data = await someAsyncOperation();
  
  if (!data) {
    throw ApiError.notFound('Data not found');
  }
  
  const response = ApiResponse.success(data);
  res.status(response.statusCode).json(response);
});
```

## Service-Specific Error Handling

### Auth Service
- User authentication errors
- JWT token errors
- Password validation errors
- Duplicate user registration

### Portfolio Service  
- Portfolio not found errors
- Holding validation errors
- External market data service errors
- P&L calculation errors

### Market Data Service
- External API integration errors
- Rate limiting errors
- Data parsing errors
- Cache miss errors

## Migration Guide

### For Existing Controllers
1. Replace try-catch blocks with asyncHandler wrapper
2. Use ApiResponse for successful responses  
3. Throw ApiError instances instead of generic errors
4. Remove manual error handling - let global handler manage it

### Before (Old Pattern)
```typescript
login = async (req: Request, res: Response) => {
  try {
    const result = await this.authService.login(email, password);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
```

### After (New Pattern)
```typescript
login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const result = await this.authService.login(email, password);
  
  const response = ApiResponse.success(result, 'Login successful');
  res.status(response.statusCode).json(response);
});
```

## Benefits

1. **Consistency** - All services use the same error format
2. **Maintainability** - Centralized error handling logic
3. **Logging** - Automatic structured error logging
4. **Type Safety** - Strong typing for errors and responses
5. **Developer Experience** - Clear error messages and stack traces in development
6. **Production Ready** - Sanitized error messages in production
7. **Monitoring** - Structured errors for better observability

## Best Practices

1. Always use asyncHandler for async route handlers
2. Throw specific ApiError types rather than generic errors
3. Include relevant context in error messages
4. Use appropriate HTTP status codes
5. Log errors with sufficient context for debugging
6. Don't expose sensitive information in error messages
7. Handle external service errors gracefully
8. Validate input data and throw descriptive validation errors
