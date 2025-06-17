#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Configuration
const LOG_FILE = path.join(process.cwd(), "app.log");
const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  debug: "\x1b[36m", // Cyan
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  level: null,
  search: null,
  tail: false,
  lines: 20,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--level" && i + 1 < args.length) {
    options.level = args[++i].toUpperCase();
  } else if (arg === "--search" && i + 1 < args.length) {
    options.search = args[++i];
  } else if (arg === "--tail") {
    options.tail = true;
  } else if (arg === "--lines" && i + 1 < args.length) {
    options.lines = parseInt(args[++i], 10);
  } else if (arg === "--help") {
    console.log(`
Usage: node viewLogs.js [options]

Options:
  --level LEVEL    Filter logs by level (INFO, WARN, ERROR, DEBUG)
  --search TEXT    Search for specific text in logs
  --tail           Watch for new log entries (like tail -f)
  --lines N        Show last N lines (default: 20)
  --help           Show this help message
    `);
    process.exit(0);
  }
}

// Function to colorize log line based on level
function colorize(line) {
  try {
    const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]/);
    if (match && match[2]) {
      const level = match[2];
      const color = COLORS[level.toLowerCase()] || COLORS.reset;
      return color + line + COLORS.reset;
    }
  } catch (e) {
    // If any error in parsing, return the original line
  }
  return line;
}

// Function to filter log lines
function filterLine(line) {
  // Filter by level if specified
  if (options.level && !line.includes(`[${options.level}]`)) {
    return false;
  }

  // Filter by search text if specified
  if (
    options.search &&
    !line.toLowerCase().includes(options.search.toLowerCase())
  ) {
    return false;
  }

  return true;
}

// Function to display logs
async function displayLogs() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error(`Log file not found: ${LOG_FILE}`);
    process.exit(1);
  }

  // If not tailing, just read and display logs
  if (!options.tail) {
    const lines = [];
    const fileStream = fs.createReadStream(LOG_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (filterLine(line)) {
        lines.push(line);
        // Keep only the last N lines
        if (lines.length > options.lines) {
          lines.shift();
        }
      }
    }

    lines.forEach((line) => console.log(colorize(line)));
    return;
  }

  // Tail mode - watch for new log entries
  console.log("Watching for new log entries. Press Ctrl+C to exit.");

  // First, display the last N lines
  const lines = [];
  const fileStream = fs.createReadStream(LOG_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (filterLine(line)) {
      lines.push(line);
      // Keep only the last N lines
      if (lines.length > options.lines) {
        lines.shift();
      }
    }
  }

  lines.forEach((line) => console.log(colorize(line)));

  // Then, watch for new entries
  const watcher = fs.watch(LOG_FILE, (eventType) => {
    if (eventType === "change") {
      const stats = fs.statSync(LOG_FILE);
      const fileSize = stats.size;

      fs.open(LOG_FILE, "r", (err, fd) => {
        if (err) throw err;

        // Read from the current position to the end
        const buffer = Buffer.alloc(fileSize);
        fs.read(fd, buffer, 0, fileSize, 0, (err, bytesRead) => {
          if (err) throw err;

          const content = buffer.toString("utf8", 0, bytesRead);
          const newLines = content.split("\n").slice(-2);

          newLines.forEach((line) => {
            if (line && filterLine(line)) {
              console.log(colorize(line));
            }
          });

          fs.close(fd, (err) => {
            if (err) throw err;
          });
        });
      });
    }
  });

  // Handle Ctrl+C to exit gracefully
  process.on("SIGINT", () => {
    watcher.close();
    console.log("\nStopped watching logs.");
    process.exit(0);
  });
}

// Run the script
displayLogs().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
