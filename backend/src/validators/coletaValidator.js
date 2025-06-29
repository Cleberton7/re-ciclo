import { body } from 'express-validator';

export const validarConclusaoColeta = [
  body('materiaisSeparados.eletronicos.quantidade')
    .isFloat({ min: 0.1 })
    .withMessage('Quantidade de eletrônicos deve ser pelo menos 0.1 kg'),
  body('materiaisSeparados.metais.quantidade')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantidade de metais não pode ser negativa'),
  body('materiaisSeparados.plasticos.quantidade')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantidade de plásticos não pode ser negativa')
];