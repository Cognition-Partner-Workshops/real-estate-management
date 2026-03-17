import FastifyCors from "@fastify/cors";

export const setFastifyCors = function (fastify) {
  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:9000", "http://localhost:8100", "http://localhost:4200"];

  fastify.register(FastifyCors, {
    origin: origins,
  });
};
