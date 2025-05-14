const express = require("express");
const { PrismaClient } = require("@prisma/client");

const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const reportRoutes = require("./routes/reportRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

const prisma = new PrismaClient();
global.prisma = prisma;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/webhook", webhookRoutes);

app.use(errorHandler);

module.exports = app;
