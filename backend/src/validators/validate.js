import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    code: 'VALIDATION_ERROR',
    errors: errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }))
  });
};
