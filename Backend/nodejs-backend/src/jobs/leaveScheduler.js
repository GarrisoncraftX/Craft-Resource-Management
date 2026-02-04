const cron = require('node-cron');
const LeaveService = require('../modules/leave/service');

const leaveService = new LeaveService();

// Run daily at 1:00 AM to process expired leaves
const scheduleLeaveCompletion = () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('Running scheduled job: Processing expired leaves...');
    try {
      const count = await leaveService.processExpiredLeaves();
      console.log(`Processed ${count} expired leave(s)`);
    } catch (error) {
      console.error('Error processing expired leaves:', error);
    }
  });

  console.log('Leave completion scheduler initialized - runs daily at 1:00 AM');
};

module.exports = { scheduleLeaveCompletion };
