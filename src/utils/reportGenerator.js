const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const timesheetRepository = require("../repositories/timesheetRepository");
const userRepository = require("../repositories/userRepository");

const HOURLY_RATE = 45.0;

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
  const totalEarnings = totalHours * HOURLY_RATE;

  const projectSummary = entries.reduce((acc, entry) => {
    const projectName = entry.project.name;
    if (!acc[projectName]) {
      acc[projectName] = 0;
    }
    acc[projectName] += entry.hours;
    return acc;
  }, {});

  const projectEarnings = {};
  Object.entries(projectSummary).forEach(([project, hours]) => {
    projectEarnings[project] = hours * HOURLY_RATE;
  });

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

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const formatNotes = (notes) => {
    if (!notes) return "";
    return notes.replace(/\s+/g, " ").trim();
  };

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
    .text(`Hourly Rate: ${formatCurrency(HOURLY_RATE)}`)
    .text(`Total Earnings: ${formatCurrency(totalEarnings)}`)
    .moveDown(1);

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Project Summary", { underline: true })
    .moveDown(0.5);

  const projectCol = {
    x: 50,
    width: 200,
  };

  const hoursCol = {
    x: 260,
    width: 80,
  };

  const earningsCol = {
    x: 350,
    width: 120,
  };

  const projectTableTop = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Project", projectCol.x, projectTableTop)
    .text("Hours", hoursCol.x, projectTableTop)
    .text("Earnings", earningsCol.x, projectTableTop);

  doc
    .moveTo(50, projectTableTop + 20)
    .lineTo(550, projectTableTop + 20)
    .stroke();

  let projectTableY = projectTableTop + 30;

  Object.entries(projectSummary).forEach(([project, hours], index) => {
    const earnings = projectEarnings[project];

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(project, projectCol.x, projectTableY, { width: projectCol.width })
      .text(hours.toString(), hoursCol.x, projectTableY)
      .text(formatCurrency(earnings), earningsCol.x, projectTableY);

    projectTableY += 25;
  });

  doc.moveTo(50, projectTableY).lineTo(550, projectTableY).stroke();

  projectTableY += 10;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Total", projectCol.x, projectTableY)
    .text(totalHours.toString(), hoursCol.x, projectTableY)
    .text(formatCurrency(totalEarnings), earningsCol.x, projectTableY);

  doc.moveDown(2);

  if (doc.y > 500) {
    doc.addPage();
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Financial Summary", { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Hourly Rate: ${formatCurrency(HOURLY_RATE)}`)
    .text(`Total Hours: ${totalHours}`)
    .text(`Total Earnings: ${formatCurrency(totalEarnings)}`)
    .moveDown(1);

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Daily Entries", { underline: true })
    .moveDown(0.5);

  const dateCol = {
    x: 50,
    width: 90,
  };

  const entryProjectCol = {
    x: 150,
    width: 120,
  };

  const entryHoursCol = {
    x: 280,
    width: 50,
  };

  const entryEarningsCol = {
    x: 340,
    width: 70,
  };

  const notesCol = {
    x: 420,
    width: 130,
  };

  const entriesTableTop = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Date", dateCol.x, entriesTableTop)
    .text("Project", entryProjectCol.x, entriesTableTop)
    .text("Hours", entryHoursCol.x, entriesTableTop)
    .text("Earnings", entryEarningsCol.x, entriesTableTop)
    .text("Notes", notesCol.x, entriesTableTop);

  doc
    .moveTo(50, entriesTableTop + 20)
    .lineTo(550, entriesTableTop + 20)
    .stroke();

  let entriesTableY = entriesTableTop + 30;

  entries.forEach((entry, index) => {
    const notesText = formatNotes(entry.notes);
    const notesHeight = notesText
      ? doc.heightOfString(notesText, {
          width: notesCol.width,
          align: "left",
          lineGap: 2,
        })
      : 15;
    const rowHeight = Math.max(25, notesHeight + 5);

    if (entriesTableY + rowHeight > 750) {
      doc.addPage();
      entriesTableY = 50;

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Date", dateCol.x, entriesTableY)
        .text("Project", entryProjectCol.x, entriesTableY)
        .text("Hours", entryHoursCol.x, entriesTableY)
        .text("Earnings", entryEarningsCol.x, entriesTableY)
        .text("Notes", notesCol.x, entriesTableY);

      doc
        .moveTo(50, entriesTableY + 20)
        .lineTo(550, entriesTableY + 20)
        .stroke();

      entriesTableY += 30;
    }

    const dateStr = entry.date.toLocaleDateString();
    const entryEarnings = entry.hours * HOURLY_RATE;

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(dateStr, dateCol.x, entriesTableY, { width: dateCol.width })
      .text(entry.project.name, entryProjectCol.x, entriesTableY, {
        width: entryProjectCol.width,
      })
      .text(entry.hours.toString(), entryHoursCol.x, entriesTableY, {
        width: entryHoursCol.width,
      })
      .text(formatCurrency(entryEarnings), entryEarningsCol.x, entriesTableY, {
        width: entryEarningsCol.width,
      })
      .text(notesText, notesCol.x, entriesTableY, {
        width: notesCol.width,
        align: "left",
        lineGap: 2,
      });

    entriesTableY += rowHeight;
  });

  doc.moveTo(50, entriesTableY).lineTo(550, entriesTableY).stroke();

  entriesTableY += 10;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Total", dateCol.x, entriesTableY)
    .text(totalHours.toString(), entryHoursCol.x, entriesTableY)
    .text(formatCurrency(totalEarnings), entryEarningsCol.x, entriesTableY);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      resolve(reportPath);
    });
    writeStream.on("error", reject);
  });
}

module.exports = { generateMonthlyReport };
