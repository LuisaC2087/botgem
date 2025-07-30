const { getGeminiResponse } = require('../models/geminiModel');
const axios = require('axios');

const handleIncomingMessage = async (req, res) => {
  try {
    console.log('✅ BODY RECIBIDO:', JSON.stringify(req.body, null, 2));

    // 🟡 SOPORTE PARA FORMATO V2
    if (req.body.version === 2 && req.body.type === 'message') {
      const payload = req.body.payload;
      const msg = payload?.payload?.text;
      const from = payload?.source;

      if (!msg || !from) {
        console.log('❌ Faltan datos en el payload (v2).');
        return res.sendStatus(400);
      }

      console.log(`📩 [v2] Mensaje recibido de ${from}: "${msg}"`);
      const respuesta = await getGeminiResponse(msg);
      console.log(`🤖 Respuesta de Gemini: "${respuesta}"`);
      await enviarRespuestaGupshup(from, respuesta);
      console.log('📤 [v2] Respuesta enviada correctamente.');
      return res.sendStatus(200);
    }

    // 🟢 FORMATO ORIGINAL (v1)
    const event = req.body.events?.[0];

    if (!event || event.type !== 'message' || !event.payload) {
      console.log('❌ No se recibió un evento de mensaje válido.');
      return res.status(200).send('No es mensaje válido, pero OK');
    }

    const msg = event.payload.text;
    const from = event.payload.source;

    if (!msg || !from) {
      console.log('❌ Faltan datos en el payload (v1).');
      return res.sendStatus(400);
    }

    console.log(`📩 [v1] Mensaje recibido de ${from}: "${msg}"`);

    const respuesta = await getGeminiResponse(msg);
    console.log(`🤖 Respuesta de Gemini: "${respuesta}"`);
    await enviarRespuestaGupshup(from, respuesta);
    console.log('📤 [v1] Respuesta enviada correctamente.');
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
        source: process.env.GUPSHUP_SANDBOX_NUMBER,
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
