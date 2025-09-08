import { NextFunction, Request, Response } from "express";

/**
 * Generic async handler type for request handlers
 */
type AsyncRequestHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper function to handle async route handlers and catch errors
 * Automatically forwards any caught errors to the global error handler
 * 
 * @param requestHandler - The async request handler function
 * @returns - Wrapped handler with error catching
 */
const asyncHandler = (requestHandler: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export default asyncHandler;
