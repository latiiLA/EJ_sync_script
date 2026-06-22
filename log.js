import winston from "winston";
import "winston-daily-rotate-file";

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            filename: "logs/sync-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "10m",    // rotate if file hits 10MB
            maxFiles: "14d",   // delete logs older than 14 days
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) =>
            `[${timestamp}] ${level.toUpperCase()}: ${message}`
        )
    ),
});

export default logger;