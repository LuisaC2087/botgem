const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function getGeminiResponse(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent([message]);
    return result.response.text();
  } catch (error) {
    if (error.status === 503) {
      console.log("Gemini está saturado. Reintentando en 5 segundos...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const retryResult = await model.generateContent([message]);
        return retryResult.response.text();
      } catch (retryError) {
        console.error("Segundo intento falló:", retryError);
        throw retryError;
      }
    }

    throw error;
  }
}

module.exports = { getGeminiResponse };
