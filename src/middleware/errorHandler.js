const logger = require("../observability/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  // Log request details to help with debugging
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
  };

  logger.error(`Request details: ${JSON.stringify(requestInfo)}`);

  if (err.code === "P2002") {
    return res.status(400).json({ error: "Unique constraint violation" });
  }

  res.status(500).json({ error: "Something went wrong" });
};

module.exports = { errorHandler };
