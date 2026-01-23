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
  const { createTestFastify, getTestFastify } = await import('../../setup.js');
  if (!testFastify) {
    testFastify = await createTestFastify();
  }
  return { fastify: testFastify };
});

vi.mock('../../../services/activity.js', () => ({
  addActivity: vi.fn()
}));

vi.mock('../../../utils/activity/index.js', () => ({
  activitySigninDescription: vi.fn().mockReturnValue('User signed in.')
}));

describe('Auth Controller - SignIn', () => {
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

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      
      const hashedPassword = await fastify.bcrypt.hash('Password123!');
      await createTestUser({ 
        email: 'test@example.com', 
        password: hashedPassword,
        user_id: 'user-123'
      });
      
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
      
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('data');
      expect(sentData.data).toHaveProperty('accessToken');
      expect(sentData.data).toHaveProperty('email', 'test@example.com');
    });

    it('should convert email to lowercase when signing in', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      
      const hashedPassword = await fastify.bcrypt.hash('Password123!');
      await createTestUser({ 
        email: 'test@example.com', 
        password: hashedPassword 
      });
      
      const mockReq = {
        body: {
          email: 'TEST@EXAMPLE.COM',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when email is not found', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      
      const mockReq = {
        body: {
          email: 'nonexistent@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error: Invalid Email or Password.'
      });
    });

    it('should return 400 when password is incorrect', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      
      const hashedPassword = await fastify.bcrypt.hash('Password123!');
      await createTestUser({ 
        email: 'test@example.com', 
        password: hashedPassword 
      });
      
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'WrongPassword123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error: Invalid Email or Password.'
      });
    });

    it('should handle database errors gracefully', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      
      const originalFindOne = User.findOne;
      User.findOne = vi.fn().mockRejectedValue(new Error('Database error'));
      
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error: Something went wrong.'
      });

      User.findOne = originalFindOne;
    });

    it('should add activity on successful sign in', async () => {
      const { signIn } = await import('../../../controllers/auth/signin.js');
      const { addActivity } = await import('../../../services/activity.js');
      
      const hashedPassword = await fastify.bcrypt.hash('Password123!');
      await createTestUser({ 
        email: 'activity@example.com', 
        password: hashedPassword,
        user_id: 'activity-user-123'
      });
      
      const mockReq = {
        body: {
          email: 'activity@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await signIn(mockReq, mockRes);

      expect(addActivity).toHaveBeenCalled();
    });
  });
});
