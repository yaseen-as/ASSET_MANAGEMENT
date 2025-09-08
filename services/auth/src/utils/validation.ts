import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import ApiError from './ApiError';

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
    const errorMessages = error.details.map((detail: any) => detail.message);
    throw ApiError.badRequest('Validation failed', errorMessages);
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
    const errorMessages = error.details.map((detail: any) => detail.message);
    throw ApiError.badRequest('Validation failed', errorMessages);
  }
  next();
};

export const validateRefresh = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail: any) => detail.message);
    throw ApiError.badRequest('Validation failed', errorMessages);
  }
  next();
};
