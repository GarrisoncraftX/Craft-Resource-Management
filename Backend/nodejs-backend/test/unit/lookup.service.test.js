const LookupService = require('../../src/modules/lookup/service');
const Department = require('../../src/modules/lookup/model');
const Role = require('../../src/modules/auth/models/role');
const Permission = require('../../src/modules/auth/models/permission');

jest.mock('../../src/modules/lookup/model');
jest.mock('../../src/modules/auth/models/role');
jest.mock('../../src/modules/auth/models/permission');

describe('Lookup Service - Unit Tests', () => {
  let lookupService;

  beforeEach(() => {
    lookupService = new LookupService();
    jest.clearAllMocks();
  });

  describe('Department Operations', () => {
    it('should create department', async () => {
      const mockDept = { id: 1, name: 'IT', code: 'IT001' };
      Department.create.mockResolvedValue(mockDept);

      const result = await lookupService.createDepartment({ name: 'IT', code: 'IT001' });

      expect(result).toEqual(mockDept);
      expect(Department.create).toHaveBeenCalled();
    });

    it('should get all departments', async () => {
      const mockDepts = [{ id: 1, name: 'IT' }, { id: 2, name: 'HR' }];
      Department.findAll.mockResolvedValue(mockDepts);

      const result = await lookupService.getDepartments();

      expect(result).toEqual(mockDepts);
    });

    it('should update department', async () => {
      const mockDept = { id: 1, name: 'IT', update: jest.fn().mockResolvedValue({ id: 1, name: 'IT Updated' }) };
      Department.findByPk.mockResolvedValue(mockDept);

      await lookupService.updateDepartment(1, { name: 'IT Updated' });

      expect(mockDept.update).toHaveBeenCalledWith({ name: 'IT Updated' });
    });

    it('should throw error when updating non-existent department', async () => {
      Department.findByPk.mockResolvedValue(null);

      await expect(lookupService.updateDepartment(999, { name: 'Test' }))
        .rejects.toThrow('Department not found');
    });

    it('should delete department', async () => {
      const mockDept = { id: 1, destroy: jest.fn() };
      Department.findByPk.mockResolvedValue(mockDept);

      await lookupService.deleteDepartment(1);

      expect(mockDept.destroy).toHaveBeenCalled();
    });

    it('should activate department', async () => {
      const mockDept = { id: 1, update: jest.fn() };
      Department.findByPk.mockResolvedValue(mockDept);

      await lookupService.activateDepartment(1);

      expect(mockDept.update).toHaveBeenCalledWith({ isActive: true });
    });

    it('should search departments', async () => {
      const mockDepts = [{ id: 1, name: 'IT Department' }];
      Department.findAll.mockResolvedValue(mockDepts);

      const result = await lookupService.searchDepartments('IT');

      expect(result).toEqual(mockDepts);
      expect(Department.findAll).toHaveBeenCalled();
    });
  });

  describe('Role Operations', () => {
    it('should create role', async () => {
      const mockRole = { id: 1, name: 'Admin', code: 'ADMIN' };
      Role.create.mockResolvedValue(mockRole);

      const result = await lookupService.createRole({ name: 'Admin', code: 'ADMIN' });

      expect(result).toEqual(mockRole);
    });

    it('should get all roles', async () => {
      const mockRoles = [{ id: 1, name: 'Admin' }];
      Role.findAll.mockResolvedValue(mockRoles);

      const result = await lookupService.getRoles();

      expect(result).toEqual(mockRoles);
    });

    it('should get role by id with permissions', async () => {
      const mockRole = { id: 1, name: 'Admin', permissions: [] };
      Role.findByPk.mockResolvedValue(mockRole);

      const result = await lookupService.getRoleById(1);

      expect(result).toEqual(mockRole);
    });

    it('should assign permissions to role', async () => {
      const mockRole = { id: 1, setPermissions: jest.fn() };
      Role.findByPk.mockResolvedValue(mockRole);

      await lookupService.assignPermissionsToRole(1, [1, 2, 3]);

      expect(mockRole.setPermissions).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should remove permissions from role', async () => {
      const mockRole = { id: 1, setPermissions: jest.fn() };
      Role.findByPk.mockResolvedValue(mockRole);

      await lookupService.removePermissionsFromRole(1);

      expect(mockRole.setPermissions).toHaveBeenCalledWith([]);
    });
  });

  describe('Permission Operations', () => {
    it('should create permission', async () => {
      const mockPerm = { id: 1, name: 'CREATE_USER', code: 'CREATE_USER' };
      Permission.create.mockResolvedValue(mockPerm);

      const result = await lookupService.createPermission({ name: 'CREATE_USER', code: 'CREATE_USER' });

      expect(result).toEqual(mockPerm);
    });

    it('should get all permissions', async () => {
      const mockPerms = [{ id: 1, name: 'CREATE_USER' }];
      Permission.findAll.mockResolvedValue(mockPerms);

      const result = await lookupService.getPermissions();

      expect(result).toEqual(mockPerms);
    });

    it('should get permissions by module', async () => {
      const mockPerms = [{ id: 1, name: 'CREATE_USER', module: 'HR' }];
      Permission.findAll.mockResolvedValue(mockPerms);

      const result = await lookupService.getPermissionsByModule('HR');

      expect(result).toEqual(mockPerms);
    });

    it('should activate permission', async () => {
      const mockPerm = { id: 1, update: jest.fn() };
      Permission.findByPk.mockResolvedValue(mockPerm);

      await lookupService.activatePermission(1);

      expect(mockPerm.update).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('Bulk Operations', () => {
    it('should get all lookup data', async () => {
      const mockDepts = [{ id: 1, name: 'IT' }];
      const mockRoles = [{ id: 1, name: 'Admin' }];
      const mockPerms = [{ id: 1, name: 'CREATE_USER' }];

      Department.findAll.mockResolvedValue(mockDepts);
      Role.findAll.mockResolvedValue(mockRoles);
      Permission.findAll.mockResolvedValue(mockPerms);

      const result = await lookupService.getAllLookupData();

      expect(result).toEqual({
        departments: mockDepts,
        roles: mockRoles,
        permissions: mockPerms
      });
    });

    it('should bulk create departments', async () => {
      const mockDepts = [{ name: 'IT' }, { name: 'HR' }];
      Department.bulkCreate.mockResolvedValue(mockDepts);

      const result = await lookupService.bulkCreateDepartments(mockDepts);

      expect(Department.bulkCreate).toHaveBeenCalledWith(mockDepts);
    });
  });
});
