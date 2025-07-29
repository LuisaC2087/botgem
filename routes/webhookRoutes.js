const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../controllers/messageController');

router.post('/', handleIncomingMessage);

module.exports = router;
