const authService = require('./service');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    // Exclude passwordHash from response
    const { passwordHash, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const result = await authService.signin(employeeId, password);
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
