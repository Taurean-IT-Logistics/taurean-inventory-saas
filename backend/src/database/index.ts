import mongoose from "mongoose";
import { CONFIG } from "../config";

/**
 * Connects to the MongoDB database using Mongoose.
 * @returns A promise that resolves when the connection is successful.
 */

async function connectToMongoDB(): Promise<void> {
  try {
    await mongoose.connect(CONFIG.MONGO_URI!);
    console.log("Connected to MongoDB successfully.");
  } catch (error: any) {
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
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB successfully.");
  } catch (error: any) {
    console.error(`Failed to disconnect from MongoDB: ${error.message}`);
    throw error;
  }
}

export { connectToMongoDB, disconnectFromMongoDB };
