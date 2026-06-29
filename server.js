import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import { syncTerminals } from "./ejsync.js";
import logger from "./log.js";

dotenv.config();

const REQUIRED_ENV = ["MONGO_URL", "API_URL", "API_KEY"];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
    logger.error(`Missing env variables: ${missing.join(", ")}`);
    process.exit(1);
}

try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("MongoDB connected");
} catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
}

// Run cron job
let isSyncRunning = false;

async function runSync() {
    if (isSyncRunning) {
        logger.warn("Previous sync still running. Skipping...");
        return;
    }

    isSyncRunning = true;

    try {
        logger.info("Running sync...");
        await syncTerminals();
    } catch (err) {
        logger.error(`Sync crashed: ${err.message}`);
    } finally {
        isSyncRunning = false;
    }
}

await runSync();

// then schedule
cron.schedule("0 * * * *", runSync);