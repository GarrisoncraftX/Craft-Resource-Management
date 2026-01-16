const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./model');
const Role = require('./models/role');
const Department = require('../lookup/model');
const Permission = require('./models/permission');
const RolePermission = require('./models/rolePermission');
const LeaveService = require('../leave/service');
const auditService = require('../audit/service');
const { pool } = require('../../config/database');

const BIOMETRIC_SERVICE_URL = process.env.PYTHON_BASE_URL || 'http://localhost:5000';

const validateRequiredFields = (userData) => {
  const requiredFields = ['employeeId', 'email', 'password', 'firstName', 'lastName', 'departmentId', 'roleId', 'dateOfBirth'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      const error = new Error(`Missing required field: ${field}`);
      error.statusCode = 400;
      throw error;
    }
  }
};

const validatePasswordLength = (password) => {
  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }
};

const mockDepartmentIdToDbIdMap = {
  'HR': 1,
  'FINANCE': 2,
  'INFORMATION_TECHNOLOGY': 3,
  'OPERATIONS': 4,
  'LEGAL': 5,
  'PROCUREMENT': 6,
  'ASSET_MANAGEMENT': 7,
  'PUBLIC_RELATIONS': 8,
  'PLANNING': 9,
  'TRANSPORTATION': 10,
  'HEALTH_SAFETY': 11,
  'REVENUE_TAX': 12,
};

const mockDepartmentIdToDbNameMap = {
  'HR': 'Human Resources',
  'FINANCE': 'Finance',
  'INFORMATION_TECHNOLOGY': 'Information Technology',
  'OPERATIONS': 'Operations',
  'LEGAL': 'Legal Affairs',
  'PROCUREMENT': 'Procurement',
  'ASSET_MANAGEMENT': 'Asset Management',
  'PUBLIC_RELATIONS': 'Public Relations',
  'PLANNING': 'Planning & Development',
  'TRANSPORTATION': 'Transportation',
  'HEALTH_SAFETY': 'Health & Safety',
  'REVENUE_TAX': 'Revenue & Tax',
};

const mockRoleIdToDbIdMap = {
  'SUPER_ADMIN': 1,
  'DEPARTMENT_HEAD': 2,
  'MANAGER': 3,
  'SENIOR_OFFICER': 4,
  'OFFICER': 5,
  'JUNIOR_OFFICER': 6,
  'INTERN': 7,
  'CONTRACTOR': 8,
  'HR_MANAGER': 9,
  'FINANCE_MANAGER': 10,
  'IT_MANAGER': 11,
  'OPERATIONS_MANAGER': 12,
  'FINANCE_OFFICER': 2,
};

const mockRoleIdToDbNameMap = {
  'SUPER_ADMIN': 'Super Admin',
  'DEPARTMENT_HEAD': 'Department Head',
  'MANAGER': 'Manager',
  'SENIOR_OFFICER': 'Senior Officer',
  'OFFICER': 'Officer',
  'JUNIOR_OFFICER': 'Junior Officer',
  'INTERN': 'Intern',
  'CONTRACTOR': 'Contractor',
  'HR_MANAGER': 'HR Manager',
  'FINANCE_MANAGER': 'Finance Manager',
  'IT_MANAGER': 'IT Manager',
  'OPERATIONS_MANAGER': 'Operations Manager',
  'FINANCE_OFFICER': 'Officer',
};

const mapAndCreateDepartment = async (departmentId) => {
  if (mockDepartmentIdToDbIdMap[departmentId]) {
    const mappedId = mockDepartmentIdToDbIdMap[departmentId];
    const mappedName = mockDepartmentIdToDbNameMap[departmentId];
    let departmentCheck = await Department.findByPk(mappedId);
    if (!departmentCheck) {
      await Department.create({ id: mappedId, name: mappedName });
    }
    return mappedId;
  }
  return departmentId;
};

const mapAndCreateRole = async (roleId) => {
  if (mockRoleIdToDbIdMap[roleId]) {
    const mappedRoleId = mockRoleIdToDbIdMap[roleId];
    const mappedRoleName = mockRoleIdToDbNameMap[roleId];
    let roleCheck = await Role.findByPk(mappedRoleId);
    if (!roleCheck) {
      await Role.create({ id: mappedRoleId, name: mappedRoleName, description: 'Auto-created role' });
    }
    return mappedRoleId;
  }
  return roleId;
};

const validateAndCreateRole = async (roleId) => {
  const role = await Role.findByPk(roleId);
  if (!role) {
    const error = new Error(`Role with ID ${roleId} not found.`);
    error.statusCode = 400;
    throw error;
  }
  return role;
};

const validateAndCreateDepartment = async (departmentId) => {
  const department = await Department.findByPk(departmentId);
  if (!department) {
    const error = new Error(`Department with ID ${departmentId} not found.`);
    error.statusCode = 400;
    throw error;
  }
  return department;
};

const enrollBiometrics = async (userId, biometric_type, raw_data) => {
  if (biometric_type && raw_data) {
    try {
      const response = await axios.post(`${BIOMETRIC_SERVICE_URL}/api/biometric/enroll`, {
        user_id: userId,
        biometric_type,
        raw_data,
      });
      if (response.data && response.data.success) {
        return 'ENROLLED';
      } else {
        return 'FAILED';
      }
    } catch (error) {
      console.error('Biometric enrollment error:', error.response ? error.response.data : error.message);
      return 'FAILED';
    }
  }
  return 'NONE';
};

const register = async (userData) => {
  try {
    validateRequiredFields(userData);
    validatePasswordLength(userData.password);

    let {
      employeeId,
      email,
      password,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      departmentId,
      roleId,
      phone,
      address,
      hireDate,
      salary,
      biometric_type,
      raw_data,
      biometric_type_face,
      raw_data_face,
      biometric_type_fingerprint,
      raw_data_fingerprint,
    } = userData;

    const existingUser = await User.findOne({ where: { employeeId: employeeId.toUpperCase() } });
    if (existingUser) {
      const error = new Error('Employee ID already exists');
      error.statusCode = 400;
      throw error;
    }

    const existingEmail = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      const error = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    const role = await validateAndCreateRole(roleId);
    const department = await validateAndCreateDepartment(departmentId);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      employeeId: employeeId.toUpperCase(),
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      departmentId: department.id,
      roleId: role.id,
      phone,
      address,
      hireDate: hireDate || new Date(),
      salary,
      isActive: true,
      biometricEnrollmentStatus: 'NONE',
      dateOfJoining: new Date(),
    });

    let biometricEnrollmentStatus = 'NONE';

    // Handle face biometric
    if (biometric_type_face && raw_data_face) {
      const status = await enrollBiometrics(user.id, biometric_type_face, raw_data_face);
      console.log('Face biometric enrollment status:', status);
      if (status === 'ENROLLED') {
        biometricEnrollmentStatus = 'ENROLLED';
      } else if (status === 'FAILED' && biometricEnrollmentStatus === 'NONE') {
        biometricEnrollmentStatus = 'FAILED';
      }
    }

    // Handle fingerprint biometric
    if (biometric_type_fingerprint && raw_data_fingerprint) {
      const status = await enrollBiometrics(user.id, biometric_type_fingerprint, raw_data_fingerprint);
      console.log('Fingerprint biometric enrollment status:', status);
      if (status === 'ENROLLED') {
        biometricEnrollmentStatus = 'ENROLLED';
      } else if (status === 'FAILED' && biometricEnrollmentStatus === 'NONE') {
        biometricEnrollmentStatus = 'FAILED';
      }
    }

    // Handle legacy biometric_type if provided
    if (biometric_type && raw_data && !biometric_type_face && !biometric_type_fingerprint) {
      const status = await enrollBiometrics(user.id, biometric_type, raw_data);
      console.log('Legacy biometric enrollment status:', status);
      if (status === 'ENROLLED') {
        biometricEnrollmentStatus = 'ENROLLED';
      } else if (status === 'FAILED' && biometricEnrollmentStatus === 'NONE') {
        biometricEnrollmentStatus = 'FAILED';
      }
    }

    user.biometricEnrollmentStatus = biometricEnrollmentStatus;
    try {
      await user.save();
      console.log('User saved successfully after biometric enrollment status update.');
    } catch (saveError) {
      console.error('Error saving user after biometric enrollment status update:', saveError);
      throw saveError; 
    }

    // Call leave balance initialization for new user
    try {
      const leaveService = new LeaveService();
      await leaveService.initializeLeaveBalancesForUser(user.id);
      console.log('Leave balances initialized for new user:', user.id);
    } catch (leaveError) {
      console.error('Error initializing leave balances for new user:', leaveError);
    }

    // Log audit activity for user registration
    try {
      await auditService.logAction(null, 'REGISTER', {
        userId: user.id,
        employeeId: user.employeeId,
        email: user.email,
        departmentId: user.departmentId,
        roleId: user.roleId
      });
    } catch (auditError) {
      console.error('Audit logging failed for registration:', auditError.message);
      // Don't throw here to avoid blocking registration
    }

    return user;
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    throw error;
  }
};

const getUserPermissions = async (roleId) => {
  // Assuming RolePermission and Permission models exist and are associated
  const rolePermissions = await RolePermission.findAll({ where: { roleId } });
  const permissionIds = rolePermissions.map(rp => rp.permissionId);
  const permissions = await Permission.findAll({ where: { id: permissionIds } });
  return permissions.map(p => p.name);
};

const signin = async (employeeId, password, biometric_type, raw_data) => {
  let user = null;

  if (biometric_type && raw_data) {
    try {
      let biometricVerificationResult;
      if (biometric_type === 'face') {
        biometricVerificationResult = await axios.post(`${BIOMETRIC_SERVICE_URL}/api/biometric/identify`, {
          biometric_type,
          raw_data,
        });
      } else if (biometric_type === 'fingerprint') {
        biometricVerificationResult = await axios.post(`${BIOMETRIC_SERVICE_URL}/api/biometric/identify`, {
          biometric_type,
          raw_data,
        });
      }

      if (biometricVerificationResult.data && biometricVerificationResult.data.success) {
        const identifiedUserId = biometricVerificationResult.data.data.user_id;
        user = await User.findByPk(identifiedUserId, {
          include: [
            { model: Department, attributes: ['id', 'name'] },
            { model: Role, attributes: ['id', 'name'] },
          ],
        });
        if (!user) {
          throw new Error('User not found after biometric identification');
        }
      } else {
        throw new Error(biometricVerificationResult.data.message || 'Biometric identification failed');
      }
    } catch (error) {
      console.error('Biometric identification error:', error.response ? error.response.data : error.message);
      throw new Error('Biometric authentication failed');
    }
  } else if (employeeId && password) {
    user = await User.findOne({
      where: { employeeId: employeeId.toUpperCase() },
      include: [
        { model: Department, attributes: ['id', 'name'] },
        { model: Role, attributes: ['id', 'name'] },
      ],
    });

    if (!user) {
      throw new Error('Invalid employee ID or password');
    }

    if (!user.isActive) {
      throw new Error('Account is not active');
    }

    // Check if account is locked
    const now = new Date();
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > now) {
      throw new Error(`Account is locked until ${new Date(user.accountLockedUntil).toISOString()}`);
    }

    let passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      const sha256Hash = crypto.createHash('sha256').update(user.employeeId + password).digest('hex');
      passwordMatch = sha256Hash === user.passwordHash;
    }
    
    if (!passwordMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account logic
      if (user.failedLoginAttempts >= 5) {
        let lockDurationMinutes = 1;
        if (user.accountLockedUntil && new Date(user.accountLockedUntil) > now) {
          const previousLockDuration = (new Date(user.accountLockedUntil) - now) / 60000; 
          if (previousLockDuration <= 1) {
            lockDurationMinutes = 3;
          } else if (previousLockDuration <= 3) {
            lockDurationMinutes = 5;
          } else {
            lockDurationMinutes = 5; 
          }
        }
        user.accountLockedUntil = new Date(now.getTime() + lockDurationMinutes * 60000);
        user.failedLoginAttempts = 0; 
      }

      await user.save();
      throw new Error('Invalid employee ID or password');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;

  } else {
    throw new Error('Missing employeeId/password or biometric data');
  }

  user.lastLogin = new Date();
  await user.save();

  // Log audit activity for signin
  try {
    await auditService.logAction(user.id, 'SIGNIN', {
      employeeId: user.employeeId,
      method: biometric_type ? 'biometric' : 'password'
    });
  } catch (auditError) {
    console.error('Audit logging failed for signin:', auditError.message);
    // Don't throw here to avoid blocking signin
  }

  const permissions = await getUserPermissions(user.roleId);

    // Map departmentId and roleId to codes for frontend routing
    const departmentIdToCodeMap = {
      1: 'HR',
      2: 'FINANCE',
      3: 'INFORMATION_TECHNOLOGY',
      4: 'OPERATIONS',
      5: 'LEGAL',
      6: 'PROCUREMENT',
      7: 'ASSETS',
      8: 'PUBLIC_RELATIONS',
      9: 'PLANNING',
      10: 'TRANSPORTATION',
      11: 'HEALTH_SAFETY',
      12: 'REVENUE_TAX',
    };

    const roleIdToCodeMap = {
      1: 'SUPER_ADMIN',
      2: 'DEPARTMENT_HEAD',
      3: 'MANAGER',
      4: 'SENIOR_OFFICER',
      5: 'OFFICER',
      6: 'JUNIOR_OFFICER',
      7: 'INTERN',
      8: 'CONTRACTOR',
      9: 'HR_MANAGER',
      10: 'FINANCE_MANAGER',
      11: 'IT_MANAGER',
      12: 'OPERATIONS_MANAGER',
      13: 'FINANCE_OFFICER',
    };

    const departmentCode = departmentIdToCodeMap[user.departmentId] || '';
    const roleCode = roleIdToCodeMap[user.roleId] || '';

    const token = jwt.sign(
      {
        userId: user.id,
        employeeId: user.employeeId,
        departmentId: user.departmentId,
        roleId: user.roleId,
        permissions,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        userId: user.id,
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        phone: user.phone,
        address: user.address,
        departmentId: user.departmentId,
        department: user.Department ? user.Department.name : '',
        departmentCode,
        roleId: user.roleId,
        role: user.Role ? user.Role.name : '',
        roleCode,
        permissions,
        defaultPasswordChanged: user.defaultPasswordChanged,
        profileCompleted: user.profileCompleted,
        hiredDate: user.hireDate ? (user.hireDate instanceof Date ? user.hireDate.toISOString().split('T')[0] : user.hireDate) : null,
      },
    };
};

const hrCreateEmployee = async (firstName, lastName, email, departmentId, jobGradeId, roleId, hrUserId) => {
  try {
    await pool.query(
      'CALL hr_create_employee(?, ?, ?, ?, ?, ?, ?, @emp_id, @success, @msg)',
      [firstName, lastName, email, departmentId, jobGradeId, roleId, hrUserId]
    );

    const [[output]] = await pool.query('SELECT @emp_id as employeeId, @success as success, @msg as message');

    if (!output.success) {
      const error = new Error(output.message);
      error.statusCode = 400;
      throw error;
    }

    return output.employeeId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Email address already exists');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Department, attributes: ['id', 'name'] },
      { model: Role, attributes: ['id', 'name'] },
    ],
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      employeeId: user.employeeId,
      departmentId: user.departmentId,
      roleId: user.roleId,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new Error('Current password is incorrect');
  }

  validatePasswordLength(newPassword);
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newPasswordHash;
  user.defaultPasswordChanged = true;
  await user.save();

  await auditService.logAction(userId, 'CHANGE_PASSWORD', { userId });
};

const createPasswordResetToken = async (email) => {
  const users = await User.findAll({ where: { email: email.toLowerCase() } });
  
  if (users.length === 0) {
    throw new Error('User with this email not found');
  }
  
  if (users.length > 1) {
    throw new Error('Multiple accounts found with this email. Please contact administrator.');
  }

  const user = users[0];
  const defaultPassword = 'CRMSemp123!';
  const newPasswordHash = await bcrypt.hash(defaultPassword, 10);
  user.passwordHash = newPasswordHash;
  user.defaultPasswordChanged = false;
  await user.save();

  await auditService.logAction(user.id, 'PASSWORD_RESET', { userId: user.id, email });
  
  return defaultPassword;
};



const createEmailVerificationToken = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = verificationTokenHash;
  await user.save();

  return verificationToken;
};

const verifyEmail = async (token) => {
  const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    where: { emailVerificationToken: verificationTokenHash },
  });

  if (!user) {
    throw new Error('Invalid verification token');
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  await auditService.logAction(user.id, 'EMAIL_VERIFIED', { userId: user.id });
};

const updateUserProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const allowedUpdates = ['firstName', 'lastName', 'middleName', 'phone', 'address', 'dateOfBirth'];
  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      user[key] = updates[key];
    }
  });

  if (updates.profileCompleted !== undefined) {
    user.profileCompleted = updates.profileCompleted;
  }

  await user.save();
  await auditService.logAction(userId, 'UPDATE_PROFILE', { userId, updates: Object.keys(updates) });

  return user;
};

const getUserSessions = async (userId) => {
  // Mock implementation - in production, store sessions in Redis or database
  return [
    {
      id: '1',
      userId,
      device: 'Chrome on Windows',
      ipAddress: '192.168.1.1',
      lastActive: new Date(),
      createdAt: new Date(),
    },
  ];
};

const revokeSession = async (userId, sessionId) => {
  // Mock implementation - in production, remove from Redis or database
  await auditService.logAction(userId, 'REVOKE_SESSION', { userId, sessionId });
};

const revokeAllSessions = async (userId) => {
  // Mock implementation - in production, remove all sessions from Redis or database
  await auditService.logAction(userId, 'REVOKE_ALL_SESSIONS', { userId });
};

const adminResetPassword = async (adminUserId, targetUserId) => {
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  const defaultPassword = 'CRMSemp123!';
  const newPasswordHash = await bcrypt.hash(defaultPassword, 10);
  targetUser.passwordHash = newPasswordHash;
  targetUser.defaultPasswordChanged = false;
  await targetUser.save();

  await auditService.logAction(adminUserId, 'ADMIN_PASSWORD_RESET', { 
    targetUserId, 
    targetEmployeeId: targetUser.employeeId 
  });
  
  return defaultPassword;
};

module.exports = {
  register,
  signin,
  hrCreateEmployee,
  getUserById,
  generateToken,
  changePassword,
  createPasswordResetToken,
  createEmailVerificationToken,
  verifyEmail,
  updateUserProfile,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  adminResetPassword,
};