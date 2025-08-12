import { connectToMongoDB, disconnectFromMongoDB } from "./database";
import { startServer, stopServer } from "./server";
import { Logger } from "./utils";
import { startDeletionWorker } from "./queues";

async function initApp() {
  try {
    Logger("Initializing application...", null, "api-core", "info");
    await connectToMongoDB();
    startDeletionWorker();
    startServer();
  } catch (error) {
    Logger("Error initializing application", null, "api-core", "error", error);
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    Logger("Shutting down application...", null, "api-core", "info");
    await disconnectFromMongoDB();
    stopServer();
  } catch (error) {
    Logger("Error during shutdown", null, "api-core", "error", error);
    console.error("Error during shutdown:", error);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

initApp();
