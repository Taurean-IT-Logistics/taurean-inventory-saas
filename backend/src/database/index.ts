import mongoose from "mongoose";
import { CONFIG } from "../config";
import { Logger } from "../utils";

/**
 * Connects to the MongoDB database using Mongoose.
 * @returns A promise that resolves when the connection is successful.
 */

async function connectToMongoDB(): Promise<void> {
  try {
    Logger("Connecting to MongoDB...", null, "db-core", "info");
    await mongoose.connect(CONFIG.MONGO_URI!);
    console.log("Connected to MongoDB successfully.");
  } catch (error: any) {
    Logger("Failed to connect to MongoDB", null, "db-core", "error", error);
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
    process.exit(1);
  }
}

/**
 * Disconnects from the MongoDB database.
 * @returns A promise that resolves when the disconnection is successful.
 */

async function disconnectFromMongoDB(): Promise<void> {
  try {
    Logger("Disconnecting from MongoDB...", null, "db-core", "info");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB successfully.");
  } catch (error: any) {
    Logger(
      "Failed to disconnect from MongoDB",
      null,
      "db-core",
      "error",
      error
    );
    console.error(`Failed to disconnect from MongoDB: ${error.message}`);
    throw error;
  }
}

export { connectToMongoDB, disconnectFromMongoDB };
