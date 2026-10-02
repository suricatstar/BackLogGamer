const rateLimit = require('express-rate-limit');

/**
 * Rate limiting — limita quantas requisições um IP pode fazer por janela de tempo.
 *
 * Por que precisamos disso?
 * Sem rate limit, qualquer pessoa pode fazer milhares de requisições por segundo:
 * - Ataques de força bruta no login (testar senhas em loop)
 * - Abuso da nossa chave da RAWG (cada req nossa custa quota deles)
 * - DDoS simples que derruba o servidor
 *
 * Usamos limitadores diferentes por rota porque a tolerância varia:
 * - Auth: muito restritivo (previne brute force de senha)
 * - API geral: mais permissivo (uso legítimo normal)
 */

/**
 * Limitador geral — aplicado em toda a API.
 * 100 requisições por IP a cada 15 minutos.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,  // inclui headers RateLimit-* na resposta
  legacyHeaders: false,
  message: {
    error: {
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
    },
  },
});

/**
 * Limitador de autenticação — aplicado em /auth/login e /auth/register.
 * 10 tentativas por IP a cada 15 minutos.
 *
 * Por que tão restritivo?
 * Ataques de brute force tentam milhares de senhas automaticamente.
 * 10 tentativas em 15 min é o suficiente para uso legítimo
 * e inviabiliza qualquer ataque automatizado.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
  },
});

module.exports = { generalLimiter, authLimiter };
