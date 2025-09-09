import { NextFunction, Request, Response, RequestHandler } from "express";

/**
 * Generic async handler type for request handlers
 * Uses generic type T to allow different request types
 */
type AsyncRequestHandler<T extends Request = Request> = (
  req: T, 
  res: Response, 
  next?: NextFunction
) => Promise<any>;

/**
 * Wrapper function to handle async route handlers and catch errors
 * Automatically forwards any caught errors to the global error handler
 * 
 * @param requestHandler - The async request handler function
 * @returns - Wrapped handler with error catching
 */
const asyncHandler = <T extends Request = Request>(requestHandler: AsyncRequestHandler<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req as T, res, next)).catch((error) => {
      next(error);
    });
  };
};

export default asyncHandler;
