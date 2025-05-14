const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const timesheetRepository = require("../repositories/timesheetRepository");
const userRepository = require("../repositories/userRepository");

async function generateMonthlyReport(userId, year, month) {
  const parsedYear = parseInt(year);
  const parsedMonth = parseInt(month);

  if (isNaN(parsedYear) || isNaN(parsedMonth)) {
    throw new Error(`Invalid year or month: year=${year}, month=${month}`);
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const entries = await timesheetRepository.getMonthlyReport(
    userId,
    parsedYear,
    parsedMonth
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

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  const reportFileName = `timesheet_${user.id}_${year}_${month}.pdf`;
  const reportPath = path.join(reportsDir, reportFileName);
  const writeStream = fs.createWriteStream(reportPath);

  doc.pipe(writeStream);

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(`Timesheet Report - ${monthNames[parsedMonth - 1]} ${parsedYear}`, {
      align: "center",
    })
    .moveDown(1);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`User: ${user.name || user.phone}`)
    .text(`Period: ${monthNames[parsedMonth - 1]} ${parsedYear}`)
    .text(`Total Hours: ${totalHours}`)
    .moveDown(1);

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Project Summary", { underline: true })
    .moveDown(0.5);

  const projectTableTop = doc.y;
  const projectTableLeft = 50;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Project", projectTableLeft, projectTableTop)
    .text("Hours", 350, projectTableTop);

  doc
    .moveTo(projectTableLeft, projectTableTop + 20)
    .lineTo(550, projectTableTop + 20)
    .stroke();

  let projectTableY = projectTableTop + 30;

  Object.entries(projectSummary).forEach(([project, hours], index) => {
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(project, projectTableLeft, projectTableY)
      .text(hours.toString(), 350, projectTableY);

    projectTableY += 20;
  });

  doc
    .moveTo(projectTableLeft, projectTableY)
    .lineTo(550, projectTableY)
    .stroke();

  projectTableY += 10;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Total", projectTableLeft, projectTableY)
    .text(totalHours.toString(), 350, projectTableY);

  doc.moveDown(2);

  if (doc.y > 500) {
    doc.addPage();
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Daily Entries", { underline: true })
    .moveDown(0.5);

  const entriesTableTop = doc.y;
  const entriesTableLeft = 50;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Date", entriesTableLeft, entriesTableTop)
    .text("Project", 150, entriesTableTop)
    .text("Hours", 350, entriesTableTop)
    .text("Notes", 450, entriesTableTop);

  doc
    .moveTo(entriesTableLeft, entriesTableTop + 20)
    .lineTo(550, entriesTableTop + 20)
    .stroke();

  let entriesTableY = entriesTableTop + 30;

  entries.forEach((entry, index) => {
    if (entriesTableY > 750) {
      doc.addPage();
      entriesTableY = 50;

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Date", entriesTableLeft, entriesTableY)
        .text("Project", 150, entriesTableY)
        .text("Hours", 350, entriesTableY)
        .text("Notes", 450, entriesTableY);

      doc
        .moveTo(entriesTableLeft, entriesTableY + 20)
        .lineTo(550, entriesTableY + 20)
        .stroke();

      entriesTableY += 30;
    }

    const dateStr = entry.date.toLocaleDateString();
    const notesStr = entry.notes
      ? entry.notes.length > 15
        ? entry.notes.substring(0, 15) + "..."
        : entry.notes
      : "";

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(dateStr, entriesTableLeft, entriesTableY)
      .text(entry.project.name, 150, entriesTableY)
      .text(entry.hours.toString(), 350, entriesTableY)
      .text(notesStr, 450, entriesTableY);

    entriesTableY += 20;
  });

  doc
    .moveTo(entriesTableLeft, entriesTableY)
    .lineTo(550, entriesTableY)
    .stroke();

  entriesTableY += 10;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Total", entriesTableLeft, entriesTableY)
    .text(totalHours.toString(), 350, entriesTableY);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      resolve(reportPath);
    });
    writeStream.on("error", reject);
  });
}

module.exports = { generateMonthlyReport };
