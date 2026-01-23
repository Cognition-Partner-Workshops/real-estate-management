import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser
} from '../../setup.js';
import { User } from '../../../models/user.js';

describe('Users Controller - Update Me', () => {
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

  describe('updateMe', () => {
    it('should successfully update fullName', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'update-user-id',
        email: 'update@example.com',
        fullName: 'Original Name'
      });
      
      const mockReq = {
        user: { id: 'update-user-id' },
        body: { fullName: 'Updated Name' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
      
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('message', 'Success: update user information.');
      expect(sentData.data).toHaveProperty('fullName', 'Updated Name');

      const updatedUser = await User.findOne({ user_id: 'update-user-id' });
      expect(updatedUser.fullName).toBe('Updated Name');
    });

    it('should successfully update about', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'about-user-id',
        email: 'about@example.com',
        fullName: 'About User',
        about: 'Original about'
      });
      
      const mockReq = {
        user: { id: 'about-user-id' },
        body: { about: 'Updated about section' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('about', 'Updated about section');
    });

    it('should successfully update address', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'address-user-id',
        email: 'address@example.com',
        fullName: 'Address User',
        address: 'Original Address'
      });
      
      const mockReq = {
        user: { id: 'address-user-id' },
        body: { address: '123 New Street' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('address', '123 New Street');
    });

    it('should successfully update multiple fields at once', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'multi-user-id',
        email: 'multi@example.com',
        fullName: 'Original Name',
        about: 'Original about',
        address: 'Original address'
      });
      
      const mockReq = {
        user: { id: 'multi-user-id' },
        body: { 
          fullName: 'New Name',
          about: 'New about',
          address: 'New address'
        }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.data).toHaveProperty('fullName', 'New Name');
      expect(sentData.data).toHaveProperty('about', 'New about');
      expect(sentData.data).toHaveProperty('address', 'New address');
    });

    it('should return 404 when user is not found', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      const mockReq = {
        user: { id: 'nonexistent-user-id' },
        body: { fullName: 'New Name' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: User not found.' 
      });
    });

    it('should handle empty body gracefully', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'empty-body-user',
        email: 'empty@example.com',
        fullName: 'Empty Body User'
      });
      
      const mockReq = {
        user: { id: 'empty-body-user' },
        body: {}
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle database errors gracefully', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      const originalFindOneAndUpdate = User.findOneAndUpdate;
      User.findOneAndUpdate = vi.fn().mockRejectedValue(new Error('Database error'));
      
      const mockReq = {
        user: { id: 'error-user-id' },
        body: { fullName: 'New Name' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: An internal error occurred, please try again later.' 
      });

      User.findOneAndUpdate = originalFindOneAndUpdate;
    });

    it('should not update fields that are not provided', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'partial-user-id',
        email: 'partial@example.com',
        fullName: 'Original Name',
        about: 'Original about',
        address: 'Original address'
      });
      
      const mockReq = {
        user: { id: 'partial-user-id' },
        body: { fullName: 'Updated Name Only' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      const updatedUser = await User.findOne({ user_id: 'partial-user-id' });
      expect(updatedUser.fullName).toBe('Updated Name Only');
      expect(updatedUser.about).toBe('Original about');
      expect(updatedUser.address).toBe('Original address');
    });

    it('should allow setting fields to empty string', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'clear-user-id',
        email: 'clear@example.com',
        fullName: 'Clear User',
        about: 'Some about text',
        address: 'Some address'
      });
      
      const mockReq = {
        user: { id: 'clear-user-id' },
        body: { about: '', address: '' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const updatedUser = await User.findOne({ user_id: 'clear-user-id' });
      expect(updatedUser.about).toBe('');
      expect(updatedUser.address).toBe('');
    });

    it('should ignore undefined fields in body', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'undefined-user-id',
        email: 'undefined@example.com',
        fullName: 'Undefined User',
        about: 'Keep this about'
      });
      
      const mockReq = {
        user: { id: 'undefined-user-id' },
        body: { 
          fullName: 'New Name',
          about: undefined,
          address: undefined
        }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const updatedUser = await User.findOne({ user_id: 'undefined-user-id' });
      expect(updatedUser.fullName).toBe('New Name');
      expect(updatedUser.about).toBe('Keep this about');
    });

    it('should return updated user data in response', async () => {
      const { updateMe } = await import('../../../controllers/users/update-me.js');
      
      await createTestUser({ 
        user_id: 'response-user-id',
        email: 'response@example.com',
        fullName: 'Response User'
      });
      
      const mockReq = {
        user: { id: 'response-user-id' },
        body: { fullName: 'Updated Response User' }
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await updateMe(mockReq, mockRes);

      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data');
      expect(sentData.data).toHaveProperty('user_id', 'response-user-id');
      expect(sentData.data).toHaveProperty('email', 'response@example.com');
      expect(sentData.data).toHaveProperty('fullName', 'Updated Response User');
    });
  });
});
