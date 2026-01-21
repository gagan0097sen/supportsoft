import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service for sending notifications
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service configured and ready');
    } catch (error) {
      console.error('❌ Email service error:', error.message);
      console.log('📧 Email notifications will be logged instead');
    }
  }

  /**
   * Send subscription expiry reminder
   */
  async sendExpiryReminder(email, firstName, planName, daysLeft, renewalDate) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `⏰ Your ${planName} Plan Expires in ${daysLeft} Days`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3B82F6; color: white; padding: 20px; border-radius: 5px; }
                .content { padding: 20px; background: #f9fafb; margin: 20px 0; border-radius: 5px; }
                .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Subscription Expiry Reminder</h2>
                </div>
                
                <div class="content">
                  <p>Hi <strong>${firstName}</strong>,</p>
                  
                  <p>Your <strong>${planName}</strong> plan will expire in <strong>${daysLeft} days</strong> on <strong>${new Date(renewalDate).toLocaleDateString()}</strong>.</p>
                  
                  <p>To ensure uninterrupted access to our services, please renew your subscription before the expiry date.</p>
                  
                  <a href="${process.env.FRONTEND_URL}/billing" class="button">Renew Subscription</a>
                  
                  <p>If you have any questions, feel free to contact our support team.</p>
                  
                  <p>Best regards,<br/>The SupportSoft Team</p>
                </div>
                
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} SupportSoft. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending email to ${email}:`, error.message);
      // Log email instead of throwing (graceful degradation)
      console.log(`📝 [EMAIL LOG] To: ${email} | Subject: Subscription Expiry Reminder for ${planName}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(email, firstName, planName, amount, endDate) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `✓ Subscription Confirmed - ${planName}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10B981; color: white; padding: 20px; border-radius: 5px; }
                .content { padding: 20px; background: #f9fafb; margin: 20px 0; border-radius: 5px; }
                .details { background: white; padding: 15px; border-left: 4px solid #10B981; margin: 10px 0; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Subscription Confirmed!</h2>
                </div>
                
                <div class="content">
                  <p>Hi <strong>${firstName}</strong>,</p>
                  
                  <p>Thank you for subscribing to our <strong>${planName}</strong> plan!</p>
                  
                  <div class="details">
                    <h4>Subscription Details</h4>
                    <p><strong>Plan:</strong> ${planName}</p>
                    <p><strong>Monthly Cost:</strong> $${amount}</p>
                    <p><strong>Valid Until:</strong> ${new Date(endDate).toLocaleDateString()}</p>
                  </div>
                  
                  <p>Your subscription is now active and you have full access to all features.</p>
                  
                  <p>Best regards,<br/>The SupportSoft Team</p>
                </div>
                
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} SupportSoft. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending confirmation email:`, error.message);
      console.log(`📝 [EMAIL LOG] To: ${email} | Subject: Subscription Confirmed - ${planName}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send cancellation confirmation
   */
  async sendCancellationConfirmation(email, firstName, planName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Subscription Cancelled - ${planName}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #EF4444; color: white; padding: 20px; border-radius: 5px; }
                .content { padding: 20px; background: #f9fafb; margin: 20px 0; border-radius: 5px; }
                .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Subscription Cancelled</h2>
                </div>
                
                <div class="content">
                  <p>Hi <strong>${firstName}</strong>,</p>
                  
                  <p>Your <strong>${planName}</strong> subscription has been cancelled as requested.</p>
                  
                  <p>We're sad to see you go. If you'd like to reactivate your subscription or try another plan, you can do so anytime.</p>
                  
                  <a href="${process.env.FRONTEND_URL}/pricing" class="button">Browse Plans</a>
                  
                  <p>If you have any feedback or questions, please let us know.</p>
                  
                  <p>Best regards,<br/>The SupportSoft Team</p>
                </div>
                
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} SupportSoft. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Cancellation email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending cancellation email:`, error.message);
      console.log(`📝 [EMAIL LOG] To: ${email} | Subject: Subscription Cancelled - ${planName}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new plan announcement to all users
   */
  async sendNewPlanAnnouncement(planName, planDescription, planPrice, features) {
    try {
      const User = (await import('../models/User.js')).default;
      const users = await User.find({ role: 'user' }).select('email name');

      if (users.length === 0) {
        console.log('📧 No users to notify about new plan');
        return { success: true, sentCount: 0 };
      }

      let successCount = 0;
      const emails = users.map(user => user.email);

      const featuresList = Array.isArray(features) ? features.join('</li><li>') : features;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: emails.join(','),
        subject: `🎉 New Plan Available: ${planName}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 5px; text-align: center; }
                .content { padding: 20px; background: #f9fafb; margin: 20px 0; border-radius: 5px; }
                .plan-details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .price { font-size: 28px; color: #667eea; font-weight: bold; margin: 10px 0; }
                .features { list-style: none; padding: 0; }
                .features li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                .features li:before { content: "✓ "; color: #10B981; font-weight: bold; margin-right: 8px; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🎉 New Plan Available!</h2>
                </div>
                
                <div class="content">
                  <p>Hi there,</p>
                  
                  <p>We're excited to announce a new subscription plan: <strong>${planName}</strong></p>
                  
                  <div class="plan-details">
                    <h3>${planName}</h3>
                    <p>${planDescription}</p>
                    <div class="price">$${planPrice}/month</div>
                    
                    <h4>Features:</h4>
                    <ul class="features">
                      <li>${featuresList}</li>
                    </ul>
                  </div>
                  
                  <p>Start your journey with this amazing new plan today!</p>
                  
                  <a href="${process.env.FRONTEND_URL}/subscriptions" class="button">View Plan</a>
                  
                  <p>If you have any questions, feel free to contact our support team.</p>
                  
                  <p>Best regards,<br/>The SupportSoft Team</p>
                </div>
                
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} SupportSoft. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      successCount = users.length;
      console.log(`📧 New plan announcement sent to ${successCount} users - Message ID: ${info.messageId}`);
      return { success: true, sentCount: successCount };
    } catch (error) {
      console.error(`❌ Error sending new plan announcement:`, error.message);
      console.log(`📝 [EMAIL LOG] New Plan Announcement: ${planName}`);
      return { success: false, error: error.message, sentCount: 0 };
    }
  }
}

export default new EmailService();