require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// CORS só permite seu site
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
}));

// Rate limiting: 30 requisições por IP por minuto
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use(limiter);

// Rota proxy com validação de reCAPTCHA opcional
app.post('/api/repositories', async (req, res) => {
  try {
    const { recaptchaToken, language, page } = req.body;

    if (!recaptchaToken || !language || !page) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    // Validar reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    const recaptchaResponse = await axios.post(verifyUrl);
    const { success, score, action } = recaptchaResponse.data;
    console.log('[reCAPTCHA] Verificação:', recaptchaResponse.data);

    if (!success || score < 0.5 || action !== 'consulta_api') {
        return res.status(403).json({ error: 'reCAPTCHA inválido ou suspeito' });
    }

    // Montar URL da API externa com parâmetros recebidos
    const url = `${process.env.API_URL}/search/repositories?q=${language}+language:${language}&sort=stars&per_page=12&page=${page}`;

    // Fazer a chamada para a API real
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Erro no proxy:', err.message);
    res.status(500).json({ error: 'Erro no servidor proxy' });
  }
});

app.post('/api/repos/pulls', async (req, res) => {
  try {
    const { owner, repo, page, state, recaptchaToken } = req.body;

    if (!owner || !repo || !page || !state || !recaptchaToken) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    const recaptchaResponse = await axios.post(verifyUrl);
    const { success, score, action } = recaptchaResponse.data;

    console.log('[reCAPTCHA] Verificação:', recaptchaResponse.data);

    if (!success || score < 0.5 || action !== 'consulta_api') {
        return res.status(403).json({ error: 'reCAPTCHA inválido ou suspeito' });
    }


    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=12&page=${page}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Erro no proxy:', err.message);
    res.status(500).json({ error: 'Erro no servidor proxy' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
