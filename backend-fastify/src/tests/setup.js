import Fastify from 'fastify';
import FastifyBcrypt from 'fastify-bcrypt';
import FastifyJwt from '@fastify/jwt';
import FastifyMultipart from '@fastify/multipart';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/user.js';

let mongoServer;
let testFastify;

export const createTestFastify = async () => {
  testFastify = Fastify({ logger: false });

  await testFastify.register(FastifyMultipart);
  await testFastify.register(FastifyJwt, { secret: 'test-secret-key' });
  await testFastify.register(FastifyBcrypt, { saltWorkFactor: 10 });

  testFastify.decorate('authenticate', async function (request, reply) {
    try {
      const user = await request.jwtVerify();
      request.user = user;
    } catch (err) {
      reply.send(err);
    }
  });

  return testFastify;
};

export const getTestFastify = () => testFastify;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    user_id: 'test-user-id-' + Date.now(),
    fullName: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed password
    properties: [],
    activities: [],
    notifications: [],
    about: 'Test about',
    address: 'Test address',
    verified: true,
  };

  const userData = { ...defaultUser, ...overrides };
  const user = new User(userData);
  await user.save();
  return user;
};

export const generateTestToken = (userId) => {
  return testFastify.jwt.sign({ id: userId });
};

export const hashPassword = async (password) => {
  return testFastify.bcrypt.hash(password);
};
