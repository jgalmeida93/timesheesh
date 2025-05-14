const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === "P2002") {
    return res.status(400).json({ error: "Unique constraint violation" });
  }

  res.status(500).json({ error: "Something went wrong" });
};

module.exports = { errorHandler };
