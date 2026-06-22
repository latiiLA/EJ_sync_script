import axios from "axios";
import fs from "fs/promises";
import Terminal from "./terminalModel.js";
import Branch from "./branchModel.js";
import District from "./districtModel.js";
import logger from "./log.js";

const api = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        "x-api-key": process.env.API_KEY,
        "Content-Type": "application/json",
    },
});

const LAST_SYNC_FILE = "./lastSync.json";

async function getLastSync() {
    try {
        const data = await fs.readFile(LAST_SYNC_FILE, "utf8");
        return new Date(JSON.parse(data).lastSync);
    } catch {
        return new Date(0);
    }
}

async function saveLastSync(date) {
    await fs.writeFile(
        LAST_SYNC_FILE,
        JSON.stringify({ lastSync: date.toISOString() }, null, 2)
    );
}

export async function syncTerminals() {
    const lastSync = await getLastSync();

    const terminals = (
    await Terminal.find({
        updatedAt: { $gt: lastSync },
    })
    .populate({
        path: "district",
        select: "districtName -_id",
    })
    .populate({
        path: "branchName",
        select: "companyName -_id",
    })
    .lean()
    ).map(terminal => ({
        ...terminal,
        district: terminal.district?.districtName ?? null,
        branchName: terminal.branchName?.companyName ?? null,
    }));

    if (terminals.length === 0) {
        logger.info("Nothing to sync.");
        return;
    }

    logger.info(`Found ${terminals.length} updated terminals.`);

    const results = await Promise.allSettled(
        terminals.map(t => api.post("/ejsync_update/", t))
    );

    results.forEach((result, i) => {
        if (result.status === "rejected") {
            logger.error(`Failed: ${terminals[i].terminalId}`, result.reason?.message);
        } else {
            logger.info(`Synced: ${terminals[i].terminalId}`);
        }
    });

    const failed = results.filter(r => r.status === "rejected");
    if (failed.length === 0) {
        await saveLastSync(new Date());
        logger.info("Sync complete. lastSync updated.");
    } else {
        logger.warn(`${failed.length} terminal(s) failed. lastSync not updated.`);
    }
}