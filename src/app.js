const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

const prisma = new PrismaClient();
global.prisma = prisma;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;
