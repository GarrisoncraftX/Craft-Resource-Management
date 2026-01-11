const nodemailer = require('nodemailer');
const winston = require('winston');
const twilio = require('twilio');
const communicationModel = require('./model');

class CommunicationService {
    constructor() {
        // Configure winston logger
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'communication-service' },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({ filename: 'logs/communication-error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/communication.log' })
            ]
        });

        // Configure nodemailer transporter
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });

        this.smsConfig = {
            provider: process.env.SMS_PROVIDER || 'twilio',
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FROM_NUMBER
        };
    }

    async sendEmail(to, subject, message) {
        try {
            const mailOptions = {
                from: process.env.MAIL_DEFAULT_SENDER || 'noreply@gmail.com',
                to: to,
                subject: subject,
                text: message
            };

            const info = await this.transporter.sendMail(mailOptions);

            this.logger.info('Email sent successfully', {
                to: to,
                subject: subject,
                messageId: info.messageId
            });

            return {
                success: true,
                messageId: info.messageId,
                data: info
            };

        } catch (error) {
            this.logger.error('Failed to send email', {
                to: to,
                subject: subject,
                error: error.message
            });

            // For development mode, don't fail but log
            if (process.env.NODE_ENV === 'development') {
                this.logger.info('Development mode: Email would be sent', {
                    to: to,
                    subject: subject,
                    message: message
                });
                return {
                    success: true,
                    development: true,
                    message: 'Email logged in development mode'
                };
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendSMS(to, message) {
        try {
            // Check if Twilio credentials are configured
            if (!this.smsConfig.accountSid || !this.smsConfig.authToken || !this.smsConfig.fromNumber) {
                this.logger.warn('Twilio credentials not configured, SMS not sent', {
                    to: to,
                    message: message
                });

                // For development mode, log the SMS
                if (process.env.NODE_ENV === 'development') {
                    this.logger.info('Development mode: SMS would be sent', {
                        to: to,
                        message: message
                    });
                    return {
                        success: true,
                        development: true,
                        message: 'SMS logged in development mode'
                    };
                }

                return {
                    success: false,
                    error: 'Twilio credentials not configured'
                };
            }

            // Send SMS using Twilio
            const twilioClient = twilio(this.smsConfig.accountSid, this.smsConfig.authToken);

            const smsResponse = await twilioClient.messages.create({
                body: message,
                from: this.smsConfig.fromNumber,
                to: to
            });

            this.logger.info('SMS sent successfully', {
                to: to,
                messageId: smsResponse.sid,
                status: smsResponse.status
            });

            return {
                success: true,
                messageId: smsResponse.sid,
                status: smsResponse.status,
                data: smsResponse
            };

        } catch (error) {
            this.logger.error('Failed to send SMS', {
                to: to,
                message: message,
                error: error.message
            });

            // For development mode, don't fail but log
            if (process.env.NODE_ENV === 'development') {
                this.logger.info('Development mode: SMS would be sent', {
                    to: to,
                    message: message
                });
                return {
                    success: true,
                    development: true,
                    message: 'SMS logged in development mode'
                };
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendNotification(type, to, subject, message) {
        try {
            if (type === 'email') {
                return await this.sendEmail(to, subject, message);
            } else if (type === 'sms') {
                return await this.sendSMS(to, message);
            } else {
                return {
                    success: false,
                    error: `Unsupported notification type: ${type}`
                };
            }
        } catch (error) {
            this.logger.error('Failed to send notification', {
                type: type,
                to: to,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    // Template-based notification methods
    async sendVisitorCheckinHostNotification(hostEmail, visitorData) {
        try {
            const template = communicationModel.getEmailTemplate('visitor_checkin_host', visitorData);
            return await this.sendEmail(hostEmail, template.subject, template.message);
        } catch (error) {
            this.logger.error('Failed to send visitor check-in host notification', {
                hostEmail: hostEmail,
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }

    async sendVisitorCheckinConfirmation(visitorEmail, visitorData) {
        try {
            const template = communicationModel.getEmailTemplate('visitor_checkin_confirmation', visitorData);
            return await this.sendEmail(visitorEmail, template.subject, template.message);
        } catch (error) {
            this.logger.error('Failed to send visitor check-in confirmation', {
                visitorEmail: visitorEmail,
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }

    async sendEmployeeWelcomeEmail(email, firstName, lastName, employeeId, defaultPassword) {
        try {
            const subject = 'Welcome to CraftResourceManagement';
            const html = `
                <h2>Welcome ${firstName} ${lastName}!</h2>
                <p>Your account has been created by HR.</p>
                <p><strong>Employee ID:</strong> ${employeeId}</p>
                <p><strong>Default Password:</strong> ${defaultPassword}</p>
                <p>Please login at: ${process.env.FRONTEND_URL}/signin</p>
                <p><strong>Important:</strong> You must change your password and complete your profile upon first login.</p>
            `;

            const mailOptions = {
                from: process.env.MAIL_DEFAULT_SENDER || 'noreply@gmail.com',
                to: email,
                subject: subject,
                html: html
            };

            const info = await this.transporter.sendMail(mailOptions);

            this.logger.info('Employee welcome email sent', {
                to: email,
                employeeId: employeeId,
                messageId: info.messageId
            });

            return { success: true, messageId: info.messageId };
        } catch (error) {
            this.logger.error('Failed to send employee welcome email', {
                email: email,
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }
}

module.exports = new CommunicationService();
