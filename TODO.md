# TODO: Add Supporting Documents Upload with Cloudinary for Leave Requests

## Backend Setup
- [x] Install Cloudinary SDK in Node.js backend (package.json)
- [x] Create Cloudinary service (Backend/nodejs-backend/src/utils/cloudinary.js)
- [x] Update LeaveRequest model to include supportingDocuments field (Backend/nodejs-backend/src/modules/leave/model.js)
- [x] Modify LeaveService.createLeaveRequest to handle file uploads and store URLs (Backend/nodejs-backend/src/modules/leave/service.js)
- [x] Update LeaveController.createLeaveRequest to use multer for multipart handling (Backend/nodejs-backend/src/modules/leave/controller.js)
- [x] Update routes.js to add multer middleware for file uploads (Backend/nodejs-backend/src/modules/leave/routes.js)

## Frontend Updates
- [x] Update LeaveRequestForm interface to include supportingDocuments (File[]) (Frontend/src/types/leave.ts)
- [] Modify LeaveRequestForm.tsx to add file input with multiple file selection (Frontend/src/components/modules/hr/LeaveRequestForm.tsx)
- [] Update leaveApi.ts createLeaveRequest to send FormData with files (Frontend/src/services/leaveApi.ts)
- [] Update LeaveRequest interface to include supportingDocuments (Frontend/src/types/leave.ts)

## Testing
- [ ] Test file upload to Cloudinary
- [ ] Test leave request creation with documents
- [ ] Verify stored URLs in database

## Followup
- [x] Install dependencies
- [ ] Update database schema (migration if needed)
- [ ] Verify end-to-end functionality
