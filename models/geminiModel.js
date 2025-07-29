const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const getGeminiResponse = async (texto) => {
  const result = await model.generateContent(texto);
  return result.response.text();
};

module.exports = { getGeminiResponse };
