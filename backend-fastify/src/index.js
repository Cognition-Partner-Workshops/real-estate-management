import dotenv from "dotenv";
import Fastify from "fastify";
import FastifyBcrypt from "fastify-bcrypt";
import FastifyJwt from "@fastify/jwt";
import FastifyMultipart from "@fastify/multipart";
import mongoose from "mongoose";
import FastifyWebsocket from "@fastify/websocket";
import FastifyRateLimit from "@fastify/rate-limit";

// Local Files
import { setFastifySwagger } from "./swagger.js";
import { setFastifyCors } from "./cors.js";
import { setFastifyRoutes } from "./routes/index.js";
import { setFastifyStatic } from "./static.js";
import { setFastifyWebsocket } from "./websocket/index.js";

dotenv.config();

/**
 * The Fastify instance.
 * @type {import('fastify').FastifyInstance}
 */
export const fastify = await Fastify({ logger: process.env.LOGGER || true });

// We allow Multi Part Form
fastify.register(FastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});
// We add Secret Key
const jwtSecret = process.env.SECRET_KEY;
if (!jwtSecret || jwtSecret === 'secret') {
  fastify.log.warn('WARNING: JWT SECRET_KEY is not set or is using the default value. Set a strong SECRET_KEY in .env');
}
fastify.register(FastifyJwt, {
  secret: jwtSecret || "secret",
  sign: { expiresIn: "24h" },
});
// We add Salt
fastify.register(FastifyBcrypt, {
  saltWorkFactor: Number(process.env.SALT) || 12,
});
// We register Websocket
fastify.register(FastifyWebsocket, {
  options: {
    clientTracking: true
  }
});
// We register rate limiting
await fastify.register(FastifyRateLimit, {
  global: false,
});

// We register authenticate
fastify.decorate("authenticate", async function (request, reply) {
  try {
    const user = await request.jwtVerify();
    request.user = user;
  } catch (err) {
    return reply.status(401).send({ message: "Error: Unauthorized. Invalid or expired token." });
  }
});
// Generate API documentation
setFastifySwagger(fastify);
// We serve static files -ex uploads/
setFastifyStatic(fastify);
// We allowed cors
setFastifyCors(fastify);
// We register routes
setFastifyRoutes(fastify);
// We set webSocket connection
setFastifyWebsocket();

mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    try {
      fastify.listen(
        {
          port: PORT,
        },
        () => {
          console.log("Listening on PORT: " + PORT);
        }
      );
    } catch (error) {
      fastify.log.error(error);
      console.log("ERROR", error);
    }
  })
  .catch((e) => {
    fastify.log.error(e);
    process.exit(1); // Exit process on connection error
  });
