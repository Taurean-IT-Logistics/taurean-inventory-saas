import { Router, Request, Response } from "express";
import { connect } from "mongoose";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbState = (global as any).mongoose?.connection?.readyState;
    const dbStatus = dbState === 1 ? "connected" : "disconnected";
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: "running"
      },
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;