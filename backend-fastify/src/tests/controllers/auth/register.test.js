import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { 
  createTestFastify, 
  setupTestDB, 
  teardownTestDB, 
  clearTestDB,
  createTestUser,
  hashPassword
} from '../../setup.js';
import { User } from '../../../models/user.js';

vi.mock('../../../index.js', async () => {
  const { createTestFastify } = await import('../../setup.js');
  const fastify = await createTestFastify();
  return { fastify };
});

describe('Auth Controller - Register', () => {
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

  describe('register', () => {
    it('should successfully register a new user with valid data', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalled();
      
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('user_id');
      expect(sentData).toHaveProperty('email', 'john@example.com');
      expect(sentData).toHaveProperty('fullName', 'John Doe');
      expect(sentData).toHaveProperty('accessToken');

      const savedUser = await User.findOne({ email: 'john@example.com' });
      expect(savedUser).toBeTruthy();
      expect(savedUser.fullName).toBe('John Doe');
    });

    it('should convert email to lowercase when registering', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Jane Doe',
          email: 'JANE@EXAMPLE.COM',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData.email).toBe('jane@example.com');
    });

    it('should return 400 when fullName is missing', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
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

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: form is invalid' });
    });

    it('should return 400 when email is missing', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: form is invalid' });
    });

    it('should return 400 when password is missing', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: form is invalid' });
    });

    it('should return 400 when password is invalid (too short)', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Pass1!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: password is not valid' });
    });

    it('should return 400 when password has no special characters', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: password is not valid' });
    });

    it('should return 400 when password has no uppercase letters', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: password is not valid' });
    });

    it('should return 400 when password has no lowercase letters', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'PASSWORD123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: password is not valid' });
    });

    it('should return 400 when password has no digits', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: password is not valid' });
    });

    it('should handle duplicate email error', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      await createTestUser({ email: 'existing@example.com' });
      
      const mockReq = {
        body: {
          fullName: 'New User',
          email: 'existing@example.com',
          password: 'Password123!'
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = mockRes.send.mock.calls[0][0];
      expect(sentData).toHaveProperty('code', 11000);
    });

    it('should return 400 when all fields are empty', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {}
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: form is invalid' });
    });

    it('should return 400 when body is undefined', async () => {
      const { register } = await import('../../../controllers/auth/register.js');
      
      const mockReq = {
        body: {
          fullName: undefined,
          email: undefined,
          password: undefined
        }
      };
      
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Error: form is invalid' });
    });
  });
});
