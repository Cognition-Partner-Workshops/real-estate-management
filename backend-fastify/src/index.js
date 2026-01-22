import dotenv from "dotenv";
import Fastify from "fastify";
import FastifyBcrypt from "fastify-bcrypt";
import FastifyJwt from "@fastify/jwt";
import FastifyMultipart from "@fastify/multipart";
import mongoose from "mongoose";
import FastifyWebsocket from "@fastify/websocket";

// Local Files
import { setFastifySwagger } from "./swagger.js";
import { setFastifyCors } from "./cors.js";
import { setFastifyRoutes } from "./routes/index.js";
import { setFastifyStatic } from "./static.js";
import { setFastifyWebsocket } from "./websocket/index.js";
import { getSecrets } from "./config/secrets.js";

dotenv.config();

async function startServer() {
  const secrets = await getSecrets();

  const jwtSecret = secrets.SECRET_KEY;
  if (!jwtSecret) {
    console.error("FATAL: JWT secret not configured. Exiting.");
    process.exit(1);
  }

  const dbConnect = secrets.DB_CONNECT;
  if (!dbConnect) {
    console.error("FATAL: Database connection string not configured. Exiting.");
    process.exit(1);
  }

  /**
   * The Fastify instance.
   * @type {import('fastify').FastifyInstance}
   */
  const fastify = await Fastify({ logger: process.env.LOGGER || true });

  // We allow Multi Part Form
  fastify.register(FastifyMultipart);
  // We add Secret Key from AWS Secrets Manager
  fastify.register(FastifyJwt, { secret: jwtSecret });
  // We add Salt
  fastify.register(FastifyBcrypt, {
    saltWorkFactor: Number(process.env.SALT) || 12,
  });
  // We register Websocket
  fastify.register(FastifyWebsocket, {
    options: {
      clientTracking: true,
    },
  });

  // We register authenticate
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const user = await request.jwtVerify();
      request.user = user;
    } catch (err) {
      reply.send(err);
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
    .connect(dbConnect, {
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
      process.exit(1);
    });

  return fastify;
}

export const fastify = await startServer();
