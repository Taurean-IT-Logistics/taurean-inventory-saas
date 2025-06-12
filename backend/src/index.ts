import { connectToMongoDB, disconnectFromMongoDB } from "./database";
import { startServer, stopServer } from "./server";

async function initApp() {
  try {
    await connectToMongoDB();
    startServer();
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    await disconnectFromMongoDB();
    stopServer();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

initApp();
