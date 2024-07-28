const fs = require('fs');
const path = require('path');


function logger() {

    const logFilePath = path.join(__dirname, '../logs', 'logs.txt');
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    const originalConsoleLog = console.log;
    console.log = function (...args) {
        const logMessage = args.join(' ') + '\n';
        logStream.write(logMessage);
        originalConsoleLog.apply(console, args);
    };

    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
}

module.exports = logger