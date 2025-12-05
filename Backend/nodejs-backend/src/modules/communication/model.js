class CommunicationModel {
    constructor() {
        this.emailTemplates = {
            visitor_checkin_host: {
                subject: 'Visitor Check-in Notification',
                template: (data) => `
Dear ${data.hostName},

A visitor has checked in and is waiting for you.

Visitor Details:
- Name: ${data.visitorName}
- Contact: ${data.contact}
- Email: ${data.email}
- Purpose: ${data.purpose}
- Check-in Time: ${data.checkinTime}

Please meet your visitor at the reception area.

Best regards,
Visitor Management System
                `
            },
            visitor_checkin_confirmation: {
                subject: 'Visitor Check-in Confirmation',
                template: (data) => `
Dear ${data.visitorName},

Your check-in has been completed successfully.

Check-in Details:
- Check-in Time: ${data.checkinTime}
- Purpose: ${data.purpose}
- Contact: ${data.contact}

Your host has been notified and will meet you shortly.

Please show your entry pass QR code at security checkpoints.

Best regards,
Visitor Management System
                `
            }
        };

        this.smsTemplates = {
            visitor_checkin: {
                template: (data) => `Hi ${data.visitorName}, your check-in at Craft Resource Management is confirmed. Please show your QR code at security.`
            }
        };
    }

    getEmailTemplate(templateName, data) {
        const template = this.emailTemplates[templateName];
        if (!template) {
            throw new Error(`Email template '${templateName}' not found`);
        }
        return {
            subject: template.subject,
            message: template.template(data)
        };
    }

    getSMSTemplate(templateName, data) {
        const template = this.smsTemplates[templateName];
        if (!template) {
            throw new Error(`SMS template '${templateName}' not found`);
        }
        return template.template(data);
    }
}

module.exports = new CommunicationModel();
