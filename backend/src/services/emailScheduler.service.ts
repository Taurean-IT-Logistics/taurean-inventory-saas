import * as cron from 'node-cron';
import { BookingModel } from '../models/booking.model';
import { CompanyModel } from '../models/company.model';
import { emailService } from './email.service';

class EmailSchedulerService {
  private isInitialized = false;

  public initialize() {
    if (this.isInitialized) {
      console.log('Email scheduler already initialized');
      return;
    }

    console.log('Initializing email scheduler...');

    // Send booking reminders daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily booking reminder job...');
      await this.sendBookingReminders();
    });

    // Check subscription expiry daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running subscription expiry check...');
      await this.checkSubscriptionExpiry();
    });

    // Send weekly summary emails on Mondays at 10 AM
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly summary job...');
      await this.sendWeeklySummaries();
    });

    this.isInitialized = true;
    console.log('Email scheduler initialized successfully');
  }

  private async sendBookingReminders() {
    try {
      // Find bookings starting tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const upcomingBookings = await BookingModel.find({
        startDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow,
        },
        status: { $in: ['confirmed', 'pending'] },
        isDeleted: false,
      }).populate('user company').lean();

      console.log(`Found ${upcomingBookings.length} bookings for tomorrow`);

      for (const booking of upcomingBookings) {
        try {
          const user = booking.user as any;
          const company = booking.company as any;

          // Check if company has email reminders enabled
          if (company.emailSettings?.sendBookingReminders !== false) {
            await emailService.sendBookingReminder(booking._id.toString());
            console.log(`Sent booking reminder for booking ${booking._id} to ${user.email}`);
          }
        } catch (error) {
          console.error(`Failed to send booking reminder for ${booking._id}:`, error);
        }

        // Small delay between emails to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error in booking reminder job:', error);
    }
  }

  private async checkSubscriptionExpiry() {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);

      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(now.getDate() + 1);

      // Find companies with subscriptions expiring in 30, 7, or 1 day
      const expiringCompanies = await CompanyModel.find({
        'subscription.expiresAt': {
          $gte: now,
          $lte: thirtyDaysFromNow,
        },
        'subscription.status': 'active',
        isActive: true,
      }).populate('owner').lean();

      console.log(`Found ${expiringCompanies.length} companies with expiring subscriptions`);

      for (const company of expiringCompanies) {
        try {
          const expiryDate = new Date((company as any).subscription.expiresAt);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Send notifications at 30, 7, and 1 day intervals
          if ([30, 7, 1].includes(daysUntilExpiry)) {
            await emailService.sendSubscriptionExpiryEmail(company._id.toString(), daysUntilExpiry);
            console.log(`Sent subscription expiry notification to ${company.name} (${daysUntilExpiry} days remaining)`);
          }
        } catch (error) {
          console.error(`Failed to send expiry notification for company ${company._id}:`, error);
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error in subscription expiry check:', error);
    }
  }

  private async sendWeeklySummaries() {
    try {
      // This could be expanded to send weekly business summaries
      // For now, just log that the job ran
      console.log('Weekly summary job completed (feature can be expanded)');
    } catch (error) {
      console.error('Error in weekly summary job:', error);
    }
  }

  public async sendImmediateBookingReminder(bookingId: string): Promise<boolean> {
    try {
      return await emailService.sendBookingReminder(bookingId);
    } catch (error) {
      console.error('Failed to send immediate booking reminder:', error);
      return false;
    }
  }

  public async sendImmediateSubscriptionNotice(companyId: string, daysRemaining: number): Promise<boolean> {
    try {
      return await emailService.sendSubscriptionExpiryEmail(companyId, daysRemaining);
    } catch (error) {
      console.error('Failed to send immediate subscription notice:', error);
      return false;
    }
  }

  public getSchedulerStatus() {
    return {
      initialized: this.isInitialized,
      activeJobs: cron.getTasks().size,
    };
  }
}

// Export singleton instance
export const emailScheduler = new EmailSchedulerService();