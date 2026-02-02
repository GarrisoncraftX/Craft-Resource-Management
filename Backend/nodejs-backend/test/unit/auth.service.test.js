const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../../src/modules/auth/service');
const User = require('../../src/modules/auth/model');
const Role = require('../../src/modules/auth/models/role');
const Department = require('../../src/modules/lookup/model');

jest.mock('../../src/modules/auth/model');
jest.mock('../../src/modules/auth/models/role');
jest.mock('../../src/modules/lookup/model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('axios');

describe('Auth Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        employeeId: 'EMP001',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        departmentId: 1,
        roleId: 1
      };

      User.findOne.mockResolvedValue(null);
      Role.findByPk.mockResolvedValue({ id: 1, name: 'Officer' });
      Department.findByPk.mockResolvedValue({ id: 1, name: 'HR' });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ id: 1, ...userData, save: jest.fn() });

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(User.create).toHaveBeenCalled();
    });

    it('should throw error if employee ID already exists', async () => {
      const userData = {
        employeeId: 'EMP001',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        departmentId: 1,
        roleId: 1
      };

      User.findOne.mockResolvedValue({ id: 1 });

      await expect(authService.register(userData)).rejects.toThrow('Employee ID already exists');
    });

    it('should throw error if password is less than 8 characters', async () => {
      const userData = {
        employeeId: 'EMP001',
        email: 'test@example.com',
        password: 'pass',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        departmentId: 1,
        roleId: 1
      };

      await expect(authService.register(userData)).rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('signin', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        employeeId: 'EMP001',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        isActive: true,
        roleId: 1,
        departmentId: 1,
        firstName: 'John',
        lastName: 'Doe',
        lastLogin: null,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        Department: { name: 'HR' },
        Role: { name: 'Officer' },
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await authService.signin('EMP001', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.employeeId).toBe('EMP001');
    });

    it('should throw error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.signin('INVALID', 'password')).rejects.toThrow('Invalid employee ID or password');
    });

    it('should throw error for inactive account', async () => {
      const mockUser = {
        id: 1,
        employeeId: 'EMP001',
        isActive: false
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(authService.signin('EMP001', 'password123')).rejects.toThrow('Account is not active');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 1,
        passwordHash: 'oldHashedPassword',
        save: jest.fn()
      };

      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await authService.changePassword(1, 'oldPassword', 'newPassword123');

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.defaultPasswordChanged).toBe(true);
    });

    it('should throw error if current password is incorrect', async () => {
      const mockUser = {
        id: 1,
        passwordHash: 'hashedPassword'
      };

      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.changePassword(1, 'wrongPassword', 'newPassword123'))
        .rejects.toThrow('Current password is incorrect');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        save: jest.fn()
      };

      User.findByPk.mockResolvedValue(mockUser);

      const updates = { firstName: 'Jane', phone: '1234567890' };
      const result = await authService.updateUserProfile(1, updates);

      expect(result.firstName).toBe('Jane');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(authService.updateUserProfile(999, { firstName: 'Jane' }))
        .rejects.toThrow('User not found');
    });
  });
});
