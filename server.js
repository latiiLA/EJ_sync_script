import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import { syncTerminals } from "./ejsync.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);

console.log("MongoDB connected");

// Run cron job

let isSyncRunning = false;

cron.schedule("*/1 * * * *", async () => {
    if (isSyncRunning) {
        console.log("Previous sync still running. Skipping...");
        return;
    }

    isSyncRunning = true;

    try {
        console.log("Running sync...");
        await syncTerminals();
    } catch (err) {
        console.error(err);
    } finally {
        isSyncRunning = false;
    }
});