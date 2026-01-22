import { getPublicConfig } from "../../config/secrets.js";

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export const configRoutes = async function (fastify) {
  fastify.get(
    "/",
    {
      schema: {
        description: "Get public configuration values for the frontend",
        tags: ["Config"],
        response: {
          200: {
            type: "object",
            properties: {
              googleAuthClientId: { type: "string" },
              mapKey: { type: "string" },
              webSocketUrl: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const config = await getPublicConfig();
      return reply.send(config);
    }
  );
};
