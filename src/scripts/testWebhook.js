#!/usr/bin/env node
const webhookService = require("../services/webhookService");
const logger = require("../observability/logger");

process.env.LOG_LEVEL = "debug";

async function testWebhook() {
  try {
    console.log("Testing webhook service...");

    console.log("\n--- Testing help command ---");
    const helpResponse = await webhookService.processMessage(
      "whatsapp:+5511999999999",
      "help"
    );
    console.log("Response:", helpResponse);

    console.log("\n--- Testing projects command ---");
    const projectsResponse = await webhookService.processMessage(
      "whatsapp:+5511999999999",
      "projects"
    );
    console.log("Response:", projectsResponse);

    console.log("\n--- Testing logging hours ---");
    const logHoursResponse = await webhookService.processMessage(
      "whatsapp:+5511999999999",
      "2hrs Pagday"
    );
    console.log("Response:", logHoursResponse);

    console.log("\n--- Testing with different case ---");
    const logHoursResponse2 = await webhookService.processMessage(
      "whatsapp:+5511999999999",
      "2hrs pagday"
    );
    console.log("Response:", logHoursResponse2);

    console.log("\nTest complete. Check app.log for detailed logs.");
  } catch (error) {
    console.error("Error during test:", error);
    logger.error(`Test error: ${error.message}`, { error });
  }
}

testWebhook().catch(console.error);
