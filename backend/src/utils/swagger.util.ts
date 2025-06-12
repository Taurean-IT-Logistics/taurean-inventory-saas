import swaggerJSdoc from "swagger-jsdoc";
import { CONFIG } from "../config";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TAUREAN API BACKEND",
      version: require("../../package.json").version,
      description: "API FOR TAUREAN INVENTORY MANAGEMENT SYSTEM",
    },
    servers: [
      {
        url: `http://localhost:${CONFIG.PORT}`,
        description: `${
          CONFIG.IS_PRODUCTION ? "Production" : "Development"
        } Server`,
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

const swaggerSpec = swaggerJSdoc(swaggerOptions);

export default swaggerSpec;
