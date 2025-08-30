import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateHolding = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    ticker: Joi.string().uppercase().required(),
    quantity: Joi.number().integer().positive().required(),
    buyPrice: Joi.number().positive().required(),
    category: Joi.string().valid('SWING', 'LONG_TERM').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
