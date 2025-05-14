const fs = require("fs");
const path = require("path");
const timesheetRepository = require("../repositories/timesheetRepository");
const userRepository = require("../repositories/userRepository");

async function generateMonthlyReport(userId, year, month) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const entries = await timesheetRepository.getMonthlyReport(
    userId,
    year,
    month,
  );

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  const projectSummary = entries.reduce((acc, entry) => {
    const projectName = entry.project.name;
    if (!acc[projectName]) {
      acc[projectName] = 0;
    }
    acc[projectName] += entry.hours;
    return acc;
  }, {});

  const reportsDir = path.join(__dirname, "../../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Timesheet Report - ${monthNames[month - 1]} ${year}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>
</body>
</html>`;

  const reportPath = path.join(reportsDir, `${year}-${month}-report.html`);
  fs.writeFileSync(reportPath, html);
  return reportPath;
}
