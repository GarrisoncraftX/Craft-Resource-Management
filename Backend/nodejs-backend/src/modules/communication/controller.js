const communicationService = require('./service');

class CommunicationController {
    async sendEmail(req, res) {
        try {
            const { to, subject, message } = req.body;

            if (!to || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: to, subject, message'
                });
            }

            const result = await communicationService.sendEmail(to, subject, message);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Email sent successfully',
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async sendSMS(req, res) {
        try {
            const { to, message } = req.body;

            if (!to || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: to, message'
                });
            }

            const result = await communicationService.sendSMS(to, message);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'SMS sent successfully',
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async sendNotification(req, res) {
        try {
            const { type, to, subject, message } = req.body;

            if (!type || !to || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: type, to, message'
                });
            }

            if (type === 'email' && !subject) {
                return res.status(400).json({
                    success: false,
                    error: 'Subject is required for email notifications'
                });
            }

            const result = await communicationService.sendNotification(type, to, subject, message);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: `${type.toUpperCase()} sent successfully`,
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new CommunicationController();
