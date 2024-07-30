const fs = require('fs');
const path = require('path');

// Ensure the logs directory exists asynchronously
async function ensureLogsDir() {
  const logsDir = path.join(__dirname, '../logs');
  try {
    await fs.promises.mkdir(logsDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function setupLogger() {
  try {
    await ensureLogsDir();

    const logFilePath = path.join(__dirname, '../logs', 'logs.txt');
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    const originalConsoleLog = console.log;
    console.log = function (...args) {
      const logMessage = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2); // Convert objects to JSON string with indentation
        }
        return arg;
      }).join(' ') + '\n';
      logStream.write(logMessage);
      originalConsoleLog.apply(console, args);
    };
  } catch (err) {
    console.error('Failed to set up logger:', err);
  }
}

module.exports = setupLogger;
