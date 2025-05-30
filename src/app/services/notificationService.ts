// notification service for property alerts
import { Property } from "../../components/PropertyList";

export interface AlertNotification {
  userId: string;
  alertId: string;
  alertName: string;
  properties: Property[];
  userEmail?: string;
}

export class NotificationService {
  // Request browser notification permission
  static async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  // Send browser notification
  static sendBrowserNotification(
    alertName: string,
    propertyCount: number
  ): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(`Property Alert: ${alertName}`, {
        body: `${propertyCount} new properties match your criteria`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "property-alert",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = "/properties";
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  // Send email notification (placeholder - would integrate with email service)
  static async sendEmailNotification(
    notification: AlertNotification
  ): Promise<boolean> {
    try {
      // This would integrate with an email service like SendGrid, AWS SES, or Firebase Functions
      // For now, we'll log the notification details
      console.log("Sending email notification:", {
        to: notification.userEmail,
        subject: `Property Alert: ${notification.alertName}`,
        properties: notification.properties.map((p) => ({
          title: p.title,
          price: p.price,
          location: p.location,
        })),
      });

      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
      return false;
    }
  }

  // Send push notification (would integrate with Firebase Cloud Messaging)
  static async sendPushNotification(
    notification: AlertNotification
  ): Promise<boolean> {
    try {
      // This would integrate with Firebase Cloud Messaging or similar service
      console.log("Sending push notification:", notification);

      // For now, send browser notification if permission is granted
      if (Notification.permission === "granted") {
        this.sendBrowserNotification(
          notification.alertName,
          notification.properties.length
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      return false;
    }
  }

  // Main notification sender that handles all notification types
  static async sendNotification(
    notification: AlertNotification
  ): Promise<void> {
    const promises = [];

    // Send browser notification
    if (Notification.permission === "granted") {
      this.sendBrowserNotification(
        notification.alertName,
        notification.properties.length
      );
    }

    // Send email notification if user email is available
    if (notification.userEmail) {
      promises.push(this.sendEmailNotification(notification));
    }

    // Send push notification
    promises.push(this.sendPushNotification(notification));

    await Promise.allSettled(promises);
  }

  // Generate email template for property matches
  static generateEmailTemplate(
    alertName: string,
    properties: Property[]
  ): string {
    const propertyList = properties
      .map(
        (property) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${property.title}</h3>
        <p style="margin: 0 0 8px 0; color: #6b7280;">${
          property.location || property.address
        }</p>
        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #059669;">$${property.price.toLocaleString()}</p>
        ${
          property.beds
            ? `<p style="margin: 0; color: #6b7280;">${property.beds} beds • ${property.baths} baths</p>`
            : ""
        }
        <a href="${window.location.origin}/properties/${property.id}"
           style="display: inline-block; margin-top: 12px; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          View Details
        </a>
      </div>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Property Alert: ${alertName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1f2937; margin-bottom: 8px;">New Property Matches!</h1>
          <p style="color: #6b7280; margin: 0;">Your alert "${alertName}" found ${properties.length} new properties</p>
        </div>

        <div style="margin-bottom: 32px;">
          ${propertyList}
        </div>

        <div style="text-align: center; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
          <p style="margin: 0 0 16px 0; color: #6b7280;">Want to see more properties?</p>
          <a href="${window.location.origin}/properties"
             style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Browse All Properties
          </a>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">
            You're receiving this because you have an active property alert.
            <a href="${window.location.origin}/dashboard" style="color: #3b82f6;">Manage your alerts</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

// Background service to check alerts periodically
export class AlertScheduler {
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  // Schedule periodic checks for a specific alert
  static scheduleAlert(
    alertId: string,
    frequency: "immediate" | "daily" | "weekly",
    callback: () => void
  ): void {
    // Clear existing interval if any
    this.unscheduleAlert(alertId);

    let intervalMs: number;
    switch (frequency) {
      case "immediate":
        intervalMs = 5 * 60 * 1000; // 5 minutes
        break;
      case "daily":
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case "weekly":
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      default:
        intervalMs = 24 * 60 * 60 * 1000; // default to daily
    }

    const interval = setInterval(callback, intervalMs);
    this.intervals.set(alertId, interval);
  }

  // Unschedule an alert
  static unscheduleAlert(alertId: string): void {
    const interval = this.intervals.get(alertId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(alertId);
    }
  }

  // Clear all scheduled alerts
  static clearAllAlerts(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }
}

export default NotificationService;
