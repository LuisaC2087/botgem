require('dotenv').config();
const express = require('express');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
app.use(express.json());

app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => res.send('Bot activo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
