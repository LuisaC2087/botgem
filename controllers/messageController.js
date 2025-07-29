const { getGeminiResponse } = require('../models/geminiModel');
const axios = require('axios');

const handleIncomingMessage = async (req, res) => {
  try {
    const msg = req.body.payload.payload.text;
    const from = req.body.payload.sender.phone;

    const respuesta = await getGeminiResponse(msg);
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
