// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Não encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Verificar erro de cast do Mongoose (ObjectId inválido)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Recurso não encontrado';
    statusCode = 404;
  }

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
    statusCode = 400;
  }

  // Erro de duplicação (chaves únicas)
  if (err.code === 11000) {
    message = `Valor duplicado para o campo ${Object.keys(
      err.keyValue
    )}. Por favor, escolha outro valor.`;
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Middleware para lidar com operações assíncronas
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };