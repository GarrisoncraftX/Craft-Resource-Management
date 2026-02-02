const PlanningService = require('../../src/modules/planning/service');
const { Project } = require('../../src/modules/planning/model');

jest.mock('../../src/modules/planning/model');

describe('Planning Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create project', async () => {
      const mockProject = { id: 1, name: 'New Project', status: 'active' };
      Project.create.mockResolvedValue(mockProject);

      const result = await PlanningService.createProject({ name: 'New Project' });

      expect(result.status).toBe('active');
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      const mockProject = { id: 1, name: 'Old', save: jest.fn() };
      Project.findByPk.mockResolvedValue(mockProject);

      await PlanningService.updateProject(1, { name: 'New' });

      expect(mockProject.save).toHaveBeenCalled();
    });
  });
});
