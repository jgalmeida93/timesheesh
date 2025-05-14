const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

router.post("/", webhookController.handleMessage.bind(webhookController));

module.exports = router;
