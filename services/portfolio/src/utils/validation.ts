import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import ApiError from './ApiError';

export const validateHolding = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    ticker: Joi.string().uppercase().required(),
    quantity: Joi.number().integer().positive().required(),
    buyPrice: Joi.number().positive().required(),
    category: Joi.string().valid('SWING', 'LONG_TERM').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail: any) => detail.message);
    throw ApiError.badRequest('Validation failed', errorMessages);
  }
  next();
};
