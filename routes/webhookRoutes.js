const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../controllers/messageController');

app.use(express.json());
router.post('/', handleIncomingMessage);

module.exports = router;
