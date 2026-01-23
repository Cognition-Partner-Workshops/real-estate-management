import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser
} from '../../setup.js';
import { User } from '../../../models/user.js';

let testFastify;

vi.mock('../../../index.js', async () => {
  const { createTestFastify } = await import('../../setup.js');
  if (!testFastify) {
    testFastify = await createTestFastify();
  }
  return { fastify: testFastify };
});

vi.mock('../../../services/activity.js', () => ({
  addActivity: vi.fn()
}));

vi.mock('../../../services/notification.js', () => ({
  addNotification: vi.fn().mockReturnValue({ notification_id: 'test-notification' })
}));

vi.mock('../../../websocket/index.js', () => ({
  sendTargetedNotification: vi.fn()
}));

describe('Auth Controller - Change Password', () => {
  let fastify;

  beforeAll(async () => {
    await setupTestDB();
    fastify = await createTestFastify();
    testFastify = fastify;
  });

  afterAll(async () => {
    await fastify.close();
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    vi.clearAllMocks();
  });

  describe('changePassword', () => {
    it('should return 400 when current password is missing', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const mockReq = {
        body: {
          passwordNew: 'NewPassword123!'
        },
        user: { id: 'user-123' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: form is invalid, current password is missing' 
      });
    });

    it('should return 400 when new password is missing', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const mockReq = {
        body: {
          passwordCurrent: 'CurrentPassword123!'
        },
        user: { id: 'user-123' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: form is invalid, new password is missing' 
      });
    });

    it('should return 400 when new password is same as current password', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const mockReq = {
        body: {
          passwordCurrent: 'SamePassword123!',
          passwordNew: 'SamePassword123!'
        },
        user: { id: 'user-123' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: new password cannot be the same as your current password. Please choose a different password' 
      });
    });

    it('should return 404 when user is not found', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const mockReq = {
        body: {
          passwordCurrent: 'CurrentPassword123!',
          passwordNew: 'NewPassword123!'
        },
        user: { id: 'nonexistent-user' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        statusCode: 404,
        message: "Error: We can't find the user."
      });
    });

    it('should return 400 when current password is incorrect', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const hashedPassword = await fastify.bcrypt.hash('CorrectPassword123!');
      await createTestUser({
        user_id: 'password-user',
        email: 'password@example.com',
        password: hashedPassword
      });
      
      const mockReq = {
        body: {
          passwordCurrent: 'WrongPassword123!',
          passwordNew: 'NewPassword123!'
        },
        user: { id: 'password-user' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: Current password is not valid.' 
      });
    });

    it('should return 400 when new password does not meet requirements', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const hashedPassword = await fastify.bcrypt.hash('CurrentPassword123!');
      await createTestUser({
        user_id: 'invalid-new-pass-user',
        email: 'invalidnew@example.com',
        password: hashedPassword
      });
      
      const mockReq = {
        body: {
          passwordCurrent: 'CurrentPassword123!',
          passwordNew: 'weak'
        },
        user: { id: 'invalid-new-pass-user' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: New password is not valid.' 
      });
    });

    it('should successfully change password with valid data', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      const { addActivity } = await import('../../../services/activity.js');
      const { addNotification } = await import('../../../services/notification.js');
      const { sendTargetedNotification } = await import('../../../websocket/index.js');
      
      const hashedPassword = await fastify.bcrypt.hash('CurrentPassword123!');
      await createTestUser({
        user_id: 'success-user',
        email: 'success@example.com',
        password: hashedPassword
      });
      
      const mockReq = {
        body: {
          passwordCurrent: 'CurrentPassword123!',
          passwordNew: 'NewPassword456!'
        },
        user: { id: 'success-user' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({});
      expect(addNotification).toHaveBeenCalled();
      expect(addActivity).toHaveBeenCalled();
      expect(sendTargetedNotification).toHaveBeenCalled();

      const updatedUser = await User.findOne({ user_id: 'success-user' });
      const isNewPasswordValid = await fastify.bcrypt.compare('NewPassword456!', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const { changePassword } = await import('../../../controllers/auth/change-password.js');
      
      const hashedPassword = await fastify.bcrypt.hash('CurrentPassword123!');
      const user = await createTestUser({
        user_id: 'error-user',
        email: 'error@example.com',
        password: hashedPassword
      });

      const originalSave = user.save;
      User.findOne = vi.fn().mockResolvedValue({
        ...user.toObject(),
        password: hashedPassword,
        save: vi.fn().mockRejectedValue(new Error('Database error'))
      });
      
      const mockReq = {
        body: {
          passwordCurrent: 'CurrentPassword123!',
          passwordNew: 'NewPassword456!'
        },
        user: { id: 'error-user' }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ 
        message: 'Error: Something went wrong.' 
      });
    });

  });
});
