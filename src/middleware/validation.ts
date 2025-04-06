import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateEmailRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { recipient, context } = req.body;

  if (!recipient) {
    return next(new AppError(400, 'Recipient information is required'));
  }

  if (!context) {
    return next(new AppError(400, 'Email context is required'));
  }

  if (typeof recipient !== 'object') {
    return next(new AppError(400, 'Recipient must be an object'));
  }

  if (typeof context !== 'object') {
    return next(new AppError(400, 'Context must be an object'));
  }

  const { name, company, role } = recipient;
  if (!name || !company || !role) {
    return next(
      new AppError(
        400,
        'Recipient must include name, company, and role fields'
      )
    );
  }

  const { product, valueProposition } = context;
  if (!product || !valueProposition) {
    return next(
      new AppError(
        400,
        'Context must include product and valueProposition fields'
      )
    );
  }

  next();
}; 