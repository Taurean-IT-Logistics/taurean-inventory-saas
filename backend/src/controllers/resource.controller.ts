import { Request, Response } from "express";
import { ResourceService } from "../services";
import { sendError } from "../utils";
import mime from "mime-types";

export const getResource = async (req: Request, res: Response) => {
  try {
    const filePath = req.params[0];

    if (!filePath) {
      sendError(res, "File path is required");
      return;
    }

    const resource = await ResourceService.fetchResource(filePath);

    if (!resource) {
      sendError(res, `Resource ${filePath} not found`);
      return;
    }

    // Detect MIME type from file extension
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    // CORS headers for browser access
    res.setHeader("Access-Control-Allow-Origin", "*"); // Or your frontend domain
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Set Content-Type and inline disposition
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");

    res.send(resource);
  } catch (error) {
    console.error("Resource fetch failed:", error);
    sendError(res, "Failed to fetch resource");
  }
};
