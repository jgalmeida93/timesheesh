require("dotenv").config();
const app = require("./app");
const prisma = require("./lib/prisma");
const logger = require("./observability/logger");

const PORT = process.env.PORT || 1234;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connection established");

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully");
      await prisma.$disconnect();
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully");
      await prisma.$disconnect();
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer().catch(async (e) => {
  logger.error(`Unhandled error: ${e.message}`);
  await prisma.$disconnect();
  process.exit(1);
});

// TQ5VW96NMVUXE2NJC7D1AJLH
