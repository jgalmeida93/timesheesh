require("dotenv").config();
const app = require("./app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PORT = 1234;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// TQ5VW96NMVUXE2NJC7D1AJLH
