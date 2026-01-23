import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser
} from '../../setup.js';
import { User } from '../../../models/user.js';

describe('Users Controller - Get User', () => {
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

  describe('getUser', () => {
    it('should return user when valid id is provided', async () => {
      const { getUser } = await import('../../../controllers/users/get-user.js');
      
      await createTestUser({ 
        user_id: 'specific-user-id',
        email: 'specific@example.com',
        fullName: 'Specific User'
      });
      
      const mockReq = {
        params: { id: 'specific-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUser(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data');
      expect(sentData.data).toHaveProperty('user_id', 'specific-user-id');
      expect(sentData.data).toHaveProperty('email', 'specific@example.com');
      expect(sentData.data).toHaveProperty('fullName', 'Specific User');
    });

    it('should return 404 when user is not found', async () => {
      const { getUser } = await import('../../../controllers/users/get-user.js');
      
      const mockReq = {
        params: { id: 'nonexistent-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: "Error: Can't find User." 
      });
    });

    it('should handle database errors gracefully', async () => {
      const { getUser } = await import('../../../controllers/users/get-user.js');
      
      const originalFindOne = User.findOne;
      User.findOne = vi.fn().mockRejectedValue(new Error('Database error'));
      
      const mockReq = {
        params: { id: 'any-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUser(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toBeInstanceOf(Error);

      User.findOne = originalFindOne;
    });

    it('should return user with all properties', async () => {
      const { getUser } = await import('../../../controllers/users/get-user.js');
      
      await createTestUser({ 
        user_id: 'full-user-id',
        email: 'full@example.com',
        fullName: 'Full User',
        about: 'About this user',
        address: '123 Main St',
        verified: true,
        properties: ['prop1', 'prop2'],
        activities: [],
        notifications: []
      });
      
      const mockReq = {
        params: { id: 'full-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUser(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('about', 'About this user');
      expect(sentData.data).toHaveProperty('address', '123 Main St');
      expect(sentData.data).toHaveProperty('verified', true);
    });

    it('should return correct user when multiple users exist', async () => {
      const { getUser } = await import('../../../controllers/users/get-user.js');
      
      await createTestUser({ user_id: 'user-1', email: 'user1@example.com' });
      await createTestUser({ user_id: 'user-2', email: 'user2@example.com' });
      await createTestUser({ user_id: 'user-3', email: 'user3@example.com' });
      
      const mockReq = {
        params: { id: 'user-2' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getUser(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('user_id', 'user-2');
      expect(sentData.data).toHaveProperty('email', 'user2@example.com');
    });
  });
});
