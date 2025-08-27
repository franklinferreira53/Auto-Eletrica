/**
 * Middleware para manipulação de funções assíncronas em controllers
 * Elimina a necessidade de try/catch em cada controller
 * @param {Function} fn - Função assíncrona a ser executada
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;