const authService = require('./service');

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
    const { employeeId, password, biometric_type, raw_data } = req.body; // Extract biometric data
    const result = await authService.signin(employeeId, password, biometric_type, raw_data); // Pass to service
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

module.exports = {
  register,
  signin,
  logout,
};