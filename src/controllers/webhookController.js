const webhookService = require("../services/webhookService");
const logger = require("../observability/logger");

class WebhookController {
  async handleMessage(req, res, next) {
    try {
      const { From, Body } = req.body;
      logger.info(`Incoming message from ${From}: "${Body}"`);

      const twimlResponse = await webhookService.processMessage(From, Body);
      logger.info(`Response sent to ${From}`);

      res.type("text/xml").send(twimlResponse);
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new WebhookController();
