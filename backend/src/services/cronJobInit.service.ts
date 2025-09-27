import CronJobService from "./cronJob.service";

export class CronJobInitService {
  private static instance: CronJobInitService;
  private cronJobService: CronJobService;

  private constructor() {
    this.cronJobService = CronJobService.getInstance();
  }

  public static getInstance(): CronJobInitService {
    if (!CronJobInitService.instance) {
      CronJobInitService.instance = new CronJobInitService();
    }
    return CronJobInitService.instance;
  }

  /**
   * Initialize and start all cron jobs
   */
  public async initializeCronJobs(): Promise<void> {
    try {
      console.log("Initializing cron jobs...");

      // Start all cron jobs
      this.cronJobService.startAllJobs();

      console.log("✅ All cron jobs initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize cron jobs:", error);
      throw error;
    }
  }

  /**
   * Stop all cron jobs (for graceful shutdown)
   */
  public async stopCronJobs(): Promise<void> {
    try {
      console.log("Stopping cron jobs...");
      this.cronJobService.stopAllJobs();
      console.log("✅ All cron jobs stopped successfully");
    } catch (error) {
      console.error("❌ Failed to stop cron jobs:", error);
    }
  }

  /**
   * Get cron job status
   */
  public getCronJobStatus(): { status: string; jobs: string[] } {
    return {
      status: "running",
      jobs: [
        "rentalDueNotifications",
        "bookingDueNotifications",
        "maintenanceDueNotifications",
        "overdueNotifications",
        "retryFailedNotifications",
      ],
    };
  }
}

export default CronJobInitService;
