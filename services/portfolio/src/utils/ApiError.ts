class ApiError extends Error {
  statusCode: number;
  message: string;
  errors: string[];
  stack: string;
  isSuccess: boolean;

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: string[] = [],
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isSuccess = false;
    this.stack = stack || "";

    if (!stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}