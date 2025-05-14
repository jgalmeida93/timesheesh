const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { generateMonthlyReport } = require("./utils/reportGenerator");

const prisma = new PrismaClient();

module.exports = { generateMonthlyReport };
