import mongoose from "mongoose";
import { CONFIG } from "../config";
import { Logger } from "../utils";

export async function connectToMongoDB(): Promise<void> {
  try {
    if (!CONFIG.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(CONFIG.MONGO_URI);
    Logger("Connected to MongoDB successfully", null, "database", "info");
  } catch (error) {
    Logger("Failed to connect to MongoDB", null, "database", "error", error);
    throw error;
  }
}

export async function disconnectFromMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    Logger("Disconnected from MongoDB successfully", null, "database", "info");
  } catch (error) {
    Logger(
      "Error disconnecting from MongoDB",
      null,
      "database",
      "error",
      error
    );
    throw error;
  }
}
