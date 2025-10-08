# TODO: Fix Updating Employee Info Using Employee Accounts

## Completed Tasks
- [x] Analyzed the error: PropertyValueException due to null password in User entity during update.
- [x] Identified root cause: In EmployeeController.updateEmployee, setting existingUser.setPassword(null) causes issues with JPA managed entities when fetching existing password.
- [x] Created UpdateEmployeeRequest DTO in backend for proper request handling.
- [x] Updated EmployeeController to use UpdateEmployeeRequest, validate password confirmation, and merge fields without setting password to null.
- [x] Removed setPassword(null) from updateProfilePicture method.
- [x] Added UpdateEmployeeRequest interface in frontend types.
- [x] Updated frontend api.ts to use UpdateEmployeeRequest for updateEmployeeById.

## Remaining Tasks
- [ ] Test the update functionality to ensure it works without errors.
- [ ] If needed, update frontend components to use the new UpdateEmployeeRequest type for employee updates.
- [ ] Verify password update works with confirmation.
