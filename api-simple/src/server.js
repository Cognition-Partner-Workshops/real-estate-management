import dotenv from "dotenv";
import Fastify from "fastify";
import FastifyCors from "@fastify/cors";
import FastifySwagger from "@fastify/swagger";
import FastifySwaggerUI from "@fastify/swagger-ui";
import { propertyRoutes } from "./routes/properties.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const fastify = Fastify({ logger: true });

// CORS
fastify.register(FastifyCors, { origin: "*" });

// Swagger API docs
fastify.register(FastifySwagger, {
  openapi: {
    info: {
      title: "Real Estate Management API",
      description:
        "A simple REST API for managing real estate property listings. Supports CRUD operations with in-memory storage.",
      version: "1.0.0",
    },
    tags: [{ name: "Properties", description: "Property CRUD endpoints" }],
  },
});

fastify.register(FastifySwaggerUI, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
});

// Health check
fastify.get(
  "/",
  {
    schema: {
      description: "Health check endpoint",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            message: { type: "string" },
            docs: { type: "string" },
          },
        },
      },
    },
  },
  async () => {
    return {
      status: "ok",
      message: "Real Estate Management API is running",
      docs: "/docs",
    };
  }
);

// Register property routes
fastify.register(propertyRoutes, { prefix: "/properties" });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
    console.log(`API docs available at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
