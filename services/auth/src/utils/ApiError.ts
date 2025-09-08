/**
 * Custom API Error class for standardized error handling
 * Extends the base Error class with additional properties for HTTP status codes and structured error data
 */
class ApiError extends Error {
  statusCode: number;
  message: string;
  errors: string[];
  stack: string;
  isSuccess: boolean;

  /**
   * Creates an instance of ApiError
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param errors - Array of error details
   * @param stack - Error stack trace
   */
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = [],
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isSuccess = false;
    this.stack = stack || "";

    if (!stack && (Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Creates a Bad Request error (400)
   */
  static badRequest(message: string = "Bad Request", errors: string[] = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Creates an Unauthorized error (401)
   */
  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  /**
   * Creates a Forbidden error (403)
   */
  static forbidden(message: string = "Forbidden") {
    return new ApiError(403, message);
  }

  /**
   * Creates a Not Found error (404)
   */
  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  /**
   * Creates a Conflict error (409)
   */
  static conflict(message: string = "Conflict") {
    return new ApiError(409, message);
  }

  /**
   * Creates an Internal Server Error (500)
   */
  static internal(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

export default ApiError;
