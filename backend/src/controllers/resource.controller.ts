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

    // Detect the MIME type based on file extension
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);

    // Optionally: display inline instead of download
    res.setHeader("Content-Disposition", "inline");

    res.send(resource);
  } catch (error) {
    sendError(res, "Failed to fetch resource");
  }
};
