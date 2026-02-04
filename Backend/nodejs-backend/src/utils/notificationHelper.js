const axios = require('axios');

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:5002';

class NotificationHelper {
  async sendNotification(userId, title, message, type = 'INFO') {
    try {
      await axios.post(`${JAVA_BACKEND_URL}/system/notifications`, {
        userId,
        title,
        message,
        type
      });
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
  }

  async notifyLeaveRequestCreated(userId, leaveType, startDate, endDate) {
    await this.sendNotification(
      userId,
      'Leave Request Submitted',
      `Your ${leaveType} leave request from ${startDate} to ${endDate} has been submitted and is pending approval.`,
      'INFO'
    );
  }

  async notifyLeaveRequestApproved(userId, leaveType, startDate, endDate) {
    await this.sendNotification(
      userId,
      'Leave Request Approved',
      `Your ${leaveType} leave request from ${startDate} to ${endDate} has been approved.`,
      'SUCCESS'
    );
  }

  async notifyLeaveRequestRejected(userId, leaveType, startDate, endDate, reason) {
    await this.sendNotification(
      userId,
      'Leave Request Rejected',
      `Your ${leaveType} leave request from ${startDate} to ${endDate} has been rejected. Reason: ${reason || 'Not specified'}`,
      'WARNING'
    );
  }

  async notifyPayrollProcessed(userId, netPay, periodStart, periodEnd) {
    await this.sendNotification(
      userId,
      'Payroll Processed',
      `Your salary for ${periodStart} to ${periodEnd} has been processed. Net Pay: $${netPay.toFixed(2)}`,
      'SUCCESS'
    );
  }

  async notifyTrainingEnrollment(userId, courseName, startDate) {
    await this.sendNotification(
      userId,
      'Training Enrollment',
      `You have been enrolled in ${courseName} starting on ${startDate}.`,
      'INFO'
    );
  }

  async notifyPerformanceReview(userId, reviewDate) {
    await this.sendNotification(
      userId,
      'Performance Review Scheduled',
      `Your performance review has been scheduled for ${reviewDate}.`,
      'INFO'
    );
  }

  async notifyOnboarding(userId, firstName) {
    await this.sendNotification(
      userId,
      'Welcome to the Team!',
      `Welcome ${firstName}! Please complete your onboarding checklist and submit required documents.`,
      'INFO'
    );
  }

  async notifyOffboarding(userId, exitDate) {
    await this.sendNotification(
      userId,
      'Exit Process Initiated',
      `Your exit process has been initiated. Exit date: ${exitDate}. Please complete the clearance checklist.`,
      'WARNING'
    );
  }

  async notifyLeaveCompleted(userId, leaveType, startDate, endDate) {
    await this.sendNotification(
      userId,
      'Leave Period Completed',
      `Your ${leaveType} leave from ${startDate} to ${endDate} has ended. Welcome back!`,
      'INFO'
    );
  }
}

module.exports = new NotificationHelper();
