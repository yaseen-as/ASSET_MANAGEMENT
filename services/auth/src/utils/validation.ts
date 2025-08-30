import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).required(),
    angelOneApiKey: Joi.string().optional(),
    angelOneClientId: Joi.string().optional(),
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

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
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

export const validateRefresh = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
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
