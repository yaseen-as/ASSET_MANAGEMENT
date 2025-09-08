/**
 * Standardized API Response class for consistent response formatting
 * @template T - Type of the data payload
 */
class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  isSuccess: boolean;
  timestamp: string;

  /**
   * Creates an instance of ApiResponse
   * @param statusCode - HTTP status code
   * @param data - Response data payload
   * @param message - Response message
   */
  constructor(
    statusCode: number,
    data: T,
    message: string = "Success"
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.isSuccess = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a successful response (200)
   */
  static success<T>(data: T, message: string = "Success") {
    return new ApiResponse(200, data, message);
  }

  /**
   * Creates a created response (201)
   */
  static created<T>(data: T, message: string = "Created successfully") {
    return new ApiResponse(201, data, message);
  }

  /**
   * Creates an accepted response (202)
   */
  static accepted<T>(data: T, message: string = "Accepted") {
    return new ApiResponse(202, data, message);
  }

  /**
   * Creates a no content response (204)
   */
  static noContent(message: string = "No content") {
    return new ApiResponse(204, null, message);
  }
}

export default ApiResponse;
