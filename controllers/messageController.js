const { getGeminiResponse } = require('../models/geminiModel');
const axios = require('axios');

const handleIncomingMessage = async (req, res) => {
  try {
    // Verifica el formato del body
    console.log('BODY RECIBIDO:', JSON.stringify(req.body, null, 2));

    const event = req.body.events?.[0];

    if (!event || event.type !== 'message') {
      console.log('No se recibió un evento de mensaje válido.');
      return res.sendStatus(400);
    }

    const msg = event.payload?.text;
    const from = event.payload?.source;

    if (!msg || !from) {
      console.log('Faltan datos en el payload.');
      return res.sendStatus(400);
    }

    // Obtiene la respuesta de Gemini
    const respuesta = await getGeminiResponse(msg);

    // Envía la respuesta por Gupshup
    await enviarRespuestaGupshup(from, respuesta);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error en controller:', error);
    res.sendStatus(500);
  }
};

const enviarRespuestaGupshup = async (to, message) => {
  await axios.post('https://api.gupshup.io/sm/api/v1/msg', null, {
    params: {
      channel: 'whatsapp',
      source: process.env.GUPSHUP_SANDBOX_NUMBER,
      destination: to,
      message,
      'src.name': process.env.GUPSHUP_BOT_NAME
    },
    headers: {
      apikey: process.env.GUPSHUP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

module.exports = { handleIncomingMessage };
