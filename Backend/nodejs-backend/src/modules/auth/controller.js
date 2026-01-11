const authService = require('./service');
const communicationService = require('../communication/service');

const register = async (req, res) => {
  try {
    const { biometric_type, raw_data, biometric_type_face, raw_data_face, biometric_type_fingerprint, raw_data_fingerprint, ...userData } = req.body;
    const user = await authService.register({ ...userData, biometric_type, raw_data, biometric_type_face, raw_data_face, biometric_type_fingerprint, raw_data_fingerprint });
    // Exclude passwordHash from response
    const { passwordHash, ...responseUserData } = user.toJSON();
    res.status(201).json(responseUserData);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { employeeId, password, biometric_type, raw_data } = req.body; 
    const result = await authService.signin(employeeId, password, biometric_type, raw_data);
    res.json(result);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  // For stateless JWT, logout can be handled client-side by deleting token
  res.status(200).json({ message: 'Logout successful' });
};

const hrCreateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, departmentId, jobGradeId, roleId } = req.body;
    const hrUserId = req.user.id;

    const employeeId = await authService.hrCreateEmployee(
      firstName,
      lastName,
      email,
      departmentId,
      jobGradeId,
      roleId,
      hrUserId
    );

    const defaultPassword = 'CRMSemp123!';
    await communicationService.sendEmployeeWelcomeEmail(
      email,
      firstName,
      lastName,
      employeeId,
      defaultPassword
    );

    res.status(201).json({
      success: true,
      employeeId,
      message: 'Employee created and email sent successfully'
    });
  } catch (error) {
    console.error('HR Create Employee Error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to create employee';
    res.status(statusCode).json({ error: message });
  }
};

module.exports = {
  register,
  signin,
  logout,
  hrCreateEmployee,
};
