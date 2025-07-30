const { getGeminiResponse } = require('../models/geminiModel');
const axios = require('axios');

const handleIncomingMessage = async (req, res) => {
  try {
    console.log('✅ BODY RECIBIDO:', JSON.stringify(req.body, null, 2));

    const event = req.body.events?.[0];

    if (!event || event.type !== 'message' || !event.payload) {
    console.log('❌ No se recibió un evento de mensaje válido.');
    return res.status(200).send('No es mensaje válido, pero OK'); // 👈 CAMBIADO
  }

    const msg = event.payload.text;
    const from = event.payload.source;

    if (!msg || !from) {
      console.log('❌ Faltan datos en el payload (texto o número de origen).');
      return res.sendStatus(400);
    }

    console.log(`📩 Mensaje recibido de ${from}: "${msg}"`);

    // Obtener respuesta del modelo Gemini
    const respuesta = await getGeminiResponse(msg);

    console.log(`🤖 Respuesta de Gemini: "${respuesta}"`);

    // Enviar la respuesta por Gupshup
    await enviarRespuestaGupshup(from, respuesta);

    console.log('📤 Respuesta enviada correctamente.');
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en controller:', error);
    res.sendStatus(500);
  }
};

const enviarRespuestaGupshup = async (to, message) => {
  try {
    await axios.post('https://api.gupshup.io/sm/api/v1/msg', null, {
      params: {
        channel: 'whatsapp',
        source: process.env.GUPSHUP_SANDBOX_NUMBER, // ejemplo: '917834811114'
        destination: to,
        message: JSON.stringify({ type: 'text', text: message }),
        'src.name': process.env.GUPSHUP_BOT_NAME
      },
      headers: {
        apikey: process.env.GUPSHUP_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  } catch (error) {
    console.error('❌ Error al enviar mensaje a Gupshup:', error?.response?.data || error);
  }
};

module.exports = { handleIncomingMessage };
