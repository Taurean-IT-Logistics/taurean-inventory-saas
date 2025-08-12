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
import {
  userRoutes,
  authRoutes,
  facilityRoutes,
  inventoryItemRoutes,
  transactionRoutes,
  bookingRoutes,
  resourceRoutes,
  taxRoutes,
  companyRoutes,
  invoiceRoutes,
  taxScheduleRoutes,
  cartRoutes,
  cashflowRoutes,
} from "./routes";
import { initSocket } from "./realtime/socket";

const app: express.Application = express();
const server = createServer(app);
initSocket(server);

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");
app.use(LoggerMiddleware);
app.use(ErrorMiddleware);
app.use(APIRateLimiter);

const swaggerDocument = YAML.load("./src/utils/swagger/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/facilities", facilityRoutes);
app.use("/api/v1/inventory-items", inventoryItemRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/taxes", taxRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/tax-schedules", taxScheduleRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/cashflow", cashflowRoutes);

function startServer() {
  Logger("Initializing Server...", null, "server-core", "info");
  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (error: Error) => {
    console.error(`Server error: ${error.message}`);
  });
}

function stopServer() {
  Logger("Stopping Server...", null, "server-core", "info");
  server.close((error: Error | undefined) => {
    if (error) {
      console.error(`Error stopping server: ${error.message}`);
    } else {
      console.log("Server stopped successfully");
    }
  });
}

export { startServer, stopServer };
