import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import emailService from './email.service.js';

/**
 * Cron Job Scheduler for subscription notifications
 */
class CronScheduler {
  /**
   * Start all scheduled jobs
   */
  static startSchedules() {
    // Run every day at 8:00 AM to check expiring subscriptions
    this.scheduleExpiryNotifications();
    
    // Run every day at 2:00 AM to check and mark expired subscriptions
    this.scheduleExpirationCheck();

    console.log('✅ All cron jobs scheduled');
  }

  /**
   * Schedule expiry notifications (3 days before expiry)
   * Runs daily at 8:00 AM
   */
  static scheduleExpiryNotifications() {
    cron.schedule('0 8 * * *', async () => {
      console.log('🕐 [CRON] Running expiry notification check...');
      
      try {
        const daysUntilExpiry = 3;
        const now = new Date();
        const expiryDate = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

        // Find subscriptions expiring in 3 days that haven't been notified
        const subscriptions = await Subscription.find({
          status: 'active',
          endDate: { $lte: expiryDate, $gte: now },
          expiryNotificationSent: false
        })
          .populate('userId', 'name email')
          .populate('planId', 'name');

        for (const subscription of subscriptions) {
          if (subscription.userId && subscription.userId.email) {
            const daysLeft = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
            
            // Send email
            const result = await emailService.sendExpiryReminder(
              subscription.userId.email,
              subscription.userId.name,
              subscription.planName,
              daysLeft,
              subscription.endDate
            );

            // Mark notification as sent
            if (result.success) {
              await Subscription.findByIdAndUpdate(
                subscription._id,
                {
                  expiryNotificationSent: true,
                  notificationSentAt: new Date()
                }
              );
              console.log(`✅ Notification sent to ${subscription.userId.email}`);
            }
          }
        }

        console.log(`✅ [CRON] Expiry notification check completed. ${subscriptions.length} reminders sent.`);
      } catch (error) {
        console.error('❌ [CRON] Error in expiry notification schedule:', error.message);
      }
    });
  }

  /**
   * Schedule expiration check
   * Runs daily at 2:00 AM to mark subscriptions as expired
   */
  static scheduleExpirationCheck() {
    cron.schedule('0 2 * * *', async () => {
      console.log('🕐 [CRON] Running expiration check...');
      
      try {
        const now = new Date();

        // Find subscriptions that have expired
        const result = await Subscription.updateMany(
          {
            status: 'active',
            endDate: { $lt: now }
          },
          {
            status: 'expired',
            updatedAt: new Date()
          }
        );

        console.log(`✅ [CRON] Expiration check completed. ${result.modifiedCount} subscriptions marked as expired.`);
      } catch (error) {
        console.error('❌ [CRON] Error in expiration check schedule:', error.message);
      }
    });
  }

  /**
   * Manual trigger for testing - send expiry notifications
   */
  static async triggerExpiryNotifications() {
    console.log('🚀 Manually triggering expiry notification check...');
    
    try {
      const daysUntilExpiry = 3;
      const now = new Date();
      const expiryDate = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

      const subscriptions = await Subscription.find({
        status: 'active',
        endDate: { $lte: expiryDate, $gte: now },
        expiryNotificationSent: false
      })
        .populate('userId', 'name email')
        .populate('planId', 'name');

      let sent = 0;
      for (const subscription of subscriptions) {
        if (subscription.userId && subscription.userId.email) {
          const daysLeft = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
          
          const result = await emailService.sendExpiryReminder(
            subscription.userId.email,
            subscription.userId.name,
            subscription.planName,
            daysLeft,
            subscription.endDate
          );

          if (result.success) {
            await Subscription.findByIdAndUpdate(
              subscription._id,
              {
                expiryNotificationSent: true,
                notificationSentAt: new Date()
              }
            );
            sent++;
          }
        }
      }

      console.log(`✅ Manual trigger completed. ${sent} notifications sent.`);
      return { success: true, sent };
    } catch (error) {
      console.error('❌ Error in manual trigger:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual trigger for expiration check
   */
  static async triggerExpirationCheck() {
    console.log('🚀 Manually triggering expiration check...');
    
    try {
      const now = new Date();

      const result = await Subscription.updateMany(
        {
          status: 'active',
          endDate: { $lt: now }
        },
        {
          status: 'expired',
          updatedAt: new Date()
        }
      );

      console.log(`✅ Manual expiration check completed. ${result.modifiedCount} subscriptions marked as expired.`);
      return { success: true, marked: result.modifiedCount };
    } catch (error) {
      console.error('❌ Error in expiration check:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default CronScheduler;
