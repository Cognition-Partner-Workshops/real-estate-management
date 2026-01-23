import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser
} from '../../setup.js';
import { User } from '../../../models/user.js';

describe('Users Controller - Get Me', () => {
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

  describe('getMe', () => {
    it('should return current user when authenticated', async () => {
      const { getMe } = await import('../../../controllers/users/get-me.js');
      
      await createTestUser({ 
        user_id: 'current-user-id',
        email: 'current@example.com',
        fullName: 'Current User'
      });
      
      const mockReq = {
        user: { id: 'current-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getMe(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data');
      expect(sentData.data).toHaveProperty('user_id', 'current-user-id');
      expect(sentData.data).toHaveProperty('email', 'current@example.com');
      expect(sentData.data).toHaveProperty('fullName', 'Current User');
    });

    it('should return null data when user not found', async () => {
      const { getMe } = await import('../../../controllers/users/get-me.js');
      
      const mockReq = {
        user: { id: 'nonexistent-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getMe(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data', null);
    });

    it('should handle database errors gracefully', async () => {
      const { getMe } = await import('../../../controllers/users/get-me.js');
      
      const originalFindOne = User.findOne;
      User.findOne = vi.fn().mockRejectedValue(new Error('Database error'));
      
      const mockReq = {
        user: { id: 'any-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getMe(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toBeInstanceOf(Error);

      User.findOne = originalFindOne;
    });

    it('should return user with all profile data', async () => {
      const { getMe } = await import('../../../controllers/users/get-me.js');
      
      await createTestUser({ 
        user_id: 'profile-user-id',
        email: 'profile@example.com',
        fullName: 'Profile User',
        about: 'This is my about section',
        address: '456 Profile Ave',
        verified: true,
        properties: ['property-1', 'property-2'],
        activities: [],
        notifications: []
      });
      
      const mockReq = {
        user: { id: 'profile-user-id' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getMe(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('about', 'This is my about section');
      expect(sentData.data).toHaveProperty('address', '456 Profile Ave');
      expect(sentData.data).toHaveProperty('verified', true);
      expect(sentData.data.properties).toHaveLength(2);
    });

    it('should return correct user from multiple users', async () => {
      const { getMe } = await import('../../../controllers/users/get-me.js');
      
      await createTestUser({ user_id: 'other-user-1', email: 'other1@example.com' });
      await createTestUser({ user_id: 'target-user', email: 'target@example.com', fullName: 'Target User' });
      await createTestUser({ user_id: 'other-user-2', email: 'other2@example.com' });
      
      const mockReq = {
        user: { id: 'target-user' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await getMe(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('user_id', 'target-user');
      expect(sentData.data).toHaveProperty('fullName', 'Target User');
    });
  });
});
