const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create directory if it doesn't exist
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      // Print stack trace for errors
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default to info, can be overridden by env var
  format: logFormat,
  defaultMeta: { service: "timesheet-app" },
  transports: [
    // Write to all logs with level 'info' and below to app.log
    new winston.transports.File({
      filename: path.join(process.cwd(), "app.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Also write to console in development
    ...(process.env.NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              logFormat
            ),
          }),
        ]
      : []),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan HTTP logger integration
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

module.exports = logger;
