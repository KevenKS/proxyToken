# Proxy Token Validator

Servidor proxy Express.js com validação reCAPTCHA para requisições a API do GitHub para exploração de repositorios.

## Funcionalidades

- Rate limiting (30 requisições por minuto por IP)
- Validação reCAPTCHA v3
- Proteção CORS
- Endpoints proxy para API do GitHub

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
PORT=3000
ALLOWED_ORIGIN=ponto_de_origem_permitido
API_URL=https://api.github.com
API_TOKEN=seu_token_github
RECAPTCHA_SECRET=sua_chave_secreta_recaptcha
```

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

## Endpoints

### POST /api/repositories
Busca repositórios por linguagem

### POST /api/repos/pulls
Busca pull requests de um repositório

## Tecnologias

- Express.js
- Axios
- CORS
- Express Rate Limit
- dotenv
```
