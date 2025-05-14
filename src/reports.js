const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function generateMonthlyReport(userId, year, month) {
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const entries = await prisma.timesheet.findMany({
    where: {
      userId: parseInt(userId),
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  const projectSummary = entries.reduce((acc, entry) => {
    const projectName = entry.project.name;
    if (!acc[projectName]) {
      acc[projectName] = 0;
    }
    acc[projectName] += entry.hours;
    return acc;
  }, {});

  const reportsDir = path.join(__dirname, "../reports");
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
      <h1>Timesheet Report</h1>
      <p><strong>User:</strong> ${user.name || user.phone}</p>
      <p><strong>Period:</strong> ${monthNames[month - 1]} ${year}</p>
      <p><strong>Total Hours:</strong> ${totalHours}</p>
      
      <h2>Project Summary</h2>
      <table>
        <tr>
          <th>Project</th>
          <th>Hours</th>
        </tr>
        ${Object.entries(projectSummary)
          .map(
            ([project, hours]) => `
          <tr>
            <td>${project}</td>
            <td>${hours}</td>
          </tr>
        `,
          )
          .join("")}
        <tr class="total">
          <td>Total</td>
          <td>${totalHours}</td>
        </tr>
      </table>
      
      <h2>Daily Entries</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Project</th>
          <th>Hours</th>
          <th>Notes</th>
        </tr>
        ${entries
          .map(
            (entry) => `
          <tr>
            <td>${entry.date.toLocaleDateString()}</td>
            <td>${entry.project.name}</td>
            <td>${entry.hours}</td>
            <td>${entry.notes || ""}</td>
          </tr>
        `,
          )
          .join("")}
        <tr class="total">
          <td colspan="2">Total</td>
          <td>${totalHours}</td>
          <td></td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const filename = `${user.phone.replace(/\D/g, "")}_${year}_${month}.html`;
  const filePath = path.join(reportsDir, filename);
  fs.writeFileSync(filePath, html);

  return filePath;
}

module.exports = { generateMonthlyReport };
