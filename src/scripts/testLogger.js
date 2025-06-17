#!/usr/bin/env node
const logger = require("../observability/logger");

console.log("Testing logger...");

logger.debug("This is a debug message");
logger.info("This is an info message");
logger.warn("This is a warning message");
logger.error("This is an error message");

try {
  throw new Error("Test error with stack trace");
} catch (error) {
  logger.error(`Caught error: ${error.message}`, { error });
}

logger.info("User action", {
  userId: "12345",
  action: "login",
  timestamp: new Date().toISOString(),
});

logger.info('Incoming message from whatsapp:+5511999999999: "2hrs Project1"');
logger.debug('Processing message from +5511999999999: "2hrs Project1"');
logger.debug("User identified: 123 (John Doe)");
logger.debug('Parsed hours: 2, remaining text: "Project1"');
logger.info(
  "User 123 logged 2 hours to project 456 (Project1) for date 2023-05-15"
);

console.log("Logger test complete. Check app.log for results.");
