
import { body } from 'express-validator';

export const contactValidationRules = () => [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ max: 100 }).withMessage('O nome deve ter no máximo 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('telefone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Telefone muito longo'),

  body('assunto')
    .trim()
    .notEmpty().withMessage('O assunto é obrigatório')
    .isLength({ max: 100 }).withMessage('O assunto deve ter no máximo 100 caracteres'),

  body('mensagem')
    .trim()
    .notEmpty().withMessage('A mensagem é obrigatória')
    .isLength({ min: 10 }).withMessage('A mensagem deve ter pelo menos 10 caracteres')
    .isLength({ max: 2000 }).withMessage('A mensagem deve ter no máximo 2000 caracteres'),

  body('uf')
    .optional()
    .isLength({ max: 2 }).withMessage('UF inválida'),

  body('cidade')
    .optional()
    .isLength({ max: 100 }).withMessage('Cidade muito longa')
];
