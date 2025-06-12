import express from "express";
import { createServer } from "http";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

const app: express.Application = express();
const server = createServer(app);

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");

function startServer() {
  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (error: Error) => {
    console.error(`Server error: ${error.message}`);
  });
}

function stopServer() {
  server.close((error: Error | undefined) => {
    if (error) {
      console.error(`Error stopping server: ${error.message}`);
    } else {
      console.log("Server stopped successfully");
    }
  });
}

export { startServer, stopServer };
