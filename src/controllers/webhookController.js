const webhookService = require("../services/webhookService");

class WebhookController {
  async handleMessage(req, res, next) {
    try {
      const { From, Body } = req.body;
      const twimlResponse = await webhookService.processMessage(From, Body);
      res.type("text/xml").send(twimlResponse);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WebhookController();
