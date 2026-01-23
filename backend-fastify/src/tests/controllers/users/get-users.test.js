import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser
} from '../../setup.js';
import { User } from '../../../models/user.js';

describe('Users Controller - Get Users', () => {
  let fastify;

  beforeAll(async () => {
    await setupTestDB();
    fastify = await createTestFastify();
  });

  afterAll(async () => {
    await fastify.close();
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('getUsers', () => {
    it('should return empty array when no users exist', async () => {
      const { getUsers } = await import('../../../controllers/users/get-users.js');
      
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ data: [] });
    });

    it('should return all users when users exist', async () => {
      const { getUsers } = await import('../../../controllers/users/get-users.js');
      
      await createTestUser({ email: 'user1@example.com', fullName: 'User One' });
      await createTestUser({ email: 'user2@example.com', fullName: 'User Two' });
      await createTestUser({ email: 'user3@example.com', fullName: 'User Three' });
      
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
      
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data');
      expect(sentData.data).toHaveLength(3);
    });

    it('should return users with correct properties', async () => {
      const { getUsers } = await import('../../../controllers/users/get-users.js');
      
      await createTestUser({ 
        email: 'test@example.com', 
        fullName: 'Test User',
        user_id: 'test-user-id',
        about: 'About me',
        address: '123 Test St'
      });
      
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUsers(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      const user = sentData.data[0];
      
      expect(user).toHaveProperty('email', 'test@example.com');
      expect(user).toHaveProperty('fullName', 'Test User');
      expect(user).toHaveProperty('user_id', 'test-user-id');
    });

    it('should return single user when only one exists', async () => {
      const { getUsers } = await import('../../../controllers/users/get-users.js');
      
      await createTestUser({ email: 'single@example.com' });
      
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUsers(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveLength(1);
    });
  });
});
