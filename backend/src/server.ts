import express from "express";
import { createServer } from "http";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import YAML from "yamljs";
import {
  LoggerMiddleware,
  ErrorMiddleware,
  APIRateLimiter,
} from "./middlewares";
import { Logger } from "./utils";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { initSocket } from "./realtime/socket";
import CronJobInitService from "./services/cronJobInit.service";

const app: express.Application = express();
const server = createServer(app);
initSocket(server);

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");

// Serve static files
app.use(express.static("public"));

app.use(LoggerMiddleware);
app.use(ErrorMiddleware);
app.use(APIRateLimiter);

const swaggerDocument = YAML.load("./src/utils/swagger/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", routes);

async function startServer() {
  Logger("Initializing Server...", null, "server-core", "info");
  const PORT = process.env.PORT || 3000;

  // Initialize cron jobs
  try {
    const cronJobService = CronJobInitService.getInstance();
    await cronJobService.initializeCronJobs();
    console.log("✅ Cron jobs initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize cron jobs:", error);
  }

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (error: Error) => {
    console.error(`Server error: ${error.message}`);
  });
}

async function stopServer() {
  Logger("Stopping Server...", null, "server-core", "info");

  // Stop cron jobs
  try {
    const cronJobService = CronJobInitService.getInstance();
    await cronJobService.stopCronJobs();
    console.log("✅ Cron jobs stopped successfully");
  } catch (error) {
    console.error("❌ Failed to stop cron jobs:", error);
  }

  server.close((error: Error | undefined) => {
    if (error) {
      console.error(`Error stopping server: ${error.message}`);
    } else {
      console.log("Server stopped successfully");
    }
  });
}

export { startServer, stopServer };

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}
