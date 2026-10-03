# 🎮 Game Backlog API

API REST para organizar sua biblioteca de jogos pessoal. Integra com a [RAWG Video Games API](https://rawg.io/apidocs) para busca de jogos.

> Projeto de estudo para consolidar conhecimentos de backend com Node.js — desenvolvido com foco em boas práticas e qualidade de portfólio.

---

## 🚀 Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose 9**
- **JWT** (access + refresh token) + **bcrypt**
- **Axios** (integração com a RAWG)
- **Redis** (cache opcional das respostas da RAWG)
- **Helmet** + **express-rate-limit** (segurança)
- **Swagger** (`swagger-jsdoc` + `swagger-ui-express`)
- **Jest** (testes unitários com mocks)
- **GitHub Actions** (CI)

---

## ✨ Funcionalidades

- Cadastro, login e renovação de token (JWT)
- Backlog pessoal com CRUD, filtros (`status`, `priority`) e paginação
- Busca de jogos e detalhes via RAWG, com cache em Redis (opcional)
- Favoritos (adicionar, remover, listar, verificar)
- Estatísticas do backlog via aggregation pipeline do MongoDB
- Rate limiting (geral e mais restrito no login/registro)
- Documentação interativa em `/api-docs`

---

## ⚙️ Como rodar

### Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- Chave gratuita da [RAWG API](https://rawg.io/apidocs)

### Instalação

```bash
git clone https://github.com/suricatstar/BackLogGamer.git
cd BackLogGamer
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (ex: `3001`) |
| `MONGODB_URI` | String de conexão do MongoDB |
| `JWT_SECRET` | Segredo do access token |
| `JWT_REFRESH_SECRET` | Segredo do refresh token |
| `JWT_EXPIRES_IN` | Validade do access token (ex: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token (ex: `7d`) |
| `RAWG_API_KEY` | Chave da RAWG API |
| `REDIS_URL` | *(opcional)* URL do Redis. Sem ela, a API roda sem cache |

> **Cache:** buscas ficam 10 min em cache e detalhes de jogos 1 h. Se o Redis estiver fora do ar, a API continua funcionando normalmente (*fail-open*).

### Rodar em desenvolvimento

```bash
npm run dev
```

Documentação Swagger: `http://localhost:3001/api-docs`

---

## 🔌 Endpoints

Todas as rotas, exceto `/api/auth/*` e `/api/status`, exigem o header `Authorization: Bearer <accessToken>`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastra usuário |
| `POST` | `/api/auth/login` | Autentica e retorna tokens |
| `POST` | `/api/auth/refresh` | Gera novo access token |
| `GET` | `/api/backlog` | Lista backlog (filtros + paginação) |
| `POST` | `/api/backlog` | Adiciona jogo ao backlog |
| `GET` | `/api/backlog/:id` | Detalhe de um item |
| `PATCH` | `/api/backlog/:id` | Atualiza item |
| `DELETE` | `/api/backlog/:id` | Remove item |
| `GET` | `/api/games/search?query=` | Busca jogos na RAWG |
| `GET` | `/api/games/:id` | Detalhes de um jogo |
| `GET` | `/api/games/:gameId/favorite` | Verifica se é favorito |
| `POST` | `/api/games/:gameId/favorite` | Favorita um jogo |
| `DELETE` | `/api/games/:gameId/favorite` | Remove dos favoritos |
| `GET` | `/api/favorites` | Lista favoritos |
| `GET` | `/api/me/stats` | Estatísticas do backlog |

---

## 📁 Estrutura

```
src/
├── config/          # database, swagger
├── controllers/     # camada HTTP (fina)
├── integrations/    # clientes de APIs externas (RAWG)
├── middlewares/     # authenticate, errorHandler, rateLimiter
├── models/          # schemas Mongoose
├── routes/          # rotas + anotações Swagger
├── services/        # regras de negócio
├── app.js           # configuração do Express
└── server.js        # inicialização
tests/
└── unit/            # services isolados com mocks
```

**Arquitetura em camadas:** `route → controller → service → model/integration`.
Controllers apenas extraem dados da requisição; as regras de negócio ficam nos services.

---

## 🧪 Testes

```bash
npm run test:unit   # sem banco, usa mocks
```

---

## 🛣️ Próximos passos

- Validação de entrada com Zod
- Logout real (blacklist de refresh tokens)
- Deploy

---

## 📄 Licença

ISC
