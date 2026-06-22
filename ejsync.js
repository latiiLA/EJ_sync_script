import axios from "axios";
import fs from "fs/promises";
import Terminal from "./terminalModel.js";
import Branch from "./branchModel.js";
import District from "./districtModel.js";

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

    console.log(`Found ${terminals.length} updated terminals.`);
    console.log("x-api-key", process.env.API_KEY)

    let allSuccessful = true;

    for (const terminal of terminals) {
        try {
            await api.post("/ejsync_update/", terminal);

            console.log(`Updated ${terminal.terminalId}`);
        } catch (error) {
            allSuccessful = false;

            console.error(
                `Update failed ${terminal.terminalId}`,
                error.response?.data || error.message
            );
        }
    }

    if (allSuccessful) {
        await saveLastSync(new Date());
    } else {
        console.log("Some terminals failed. lastSync not updated.");
    }
}