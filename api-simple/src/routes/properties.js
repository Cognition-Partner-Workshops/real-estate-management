import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../store/properties.js";

const propertySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    address: { type: "string" },
    description: { type: "string" },
    type: { type: "string", enum: ["residential", "commercial", "land"] },
    transactionType: { type: "string", enum: ["sale", "rent"] },
    price: { type: "number" },
    paymentFrequency: {
      type: "string",
      enum: ["yearly", "quarterly", "monthly", "bi-weekly", "weekly", "daily"],
      nullable: true,
    },
    currency: { type: "string" },
    features: { type: "array", items: { type: "string" } },
    contactEmail: { type: "string" },
    contactNumber: { type: "string" },
    position: {
      type: "object",
      properties: { lat: { type: "number" }, lng: { type: "number" } },
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const createPropertyBody = {
  type: "object",
  required: ["name", "address", "type", "transactionType"],
  properties: {
    name: { type: "string", minLength: 4 },
    address: { type: "string" },
    description: { type: "string" },
    type: { type: "string", enum: ["residential", "commercial", "land"] },
    transactionType: { type: "string", enum: ["sale", "rent"] },
    price: { type: "number" },
    paymentFrequency: {
      type: "string",
      enum: ["yearly", "quarterly", "monthly", "bi-weekly", "weekly", "daily"],
    },
    currency: { type: "string" },
    features: { type: "array", items: { type: "string" } },
    contactEmail: { type: "string" },
    contactNumber: { type: "string" },
    position: {
      type: "object",
      properties: { lat: { type: "number" }, lng: { type: "number" } },
    },
  },
};

/**
 * Property routes plugin
 * @param {import("fastify").FastifyInstance} fastify
 * @param {object} opts
 * @param {Function} done
 */
export function propertyRoutes(fastify, opts, done) {
  // GET /properties - List all properties with optional filters
  fastify.get(
    "/",
    {
      schema: {
        description: "List all properties with optional filters",
        tags: ["Properties"],
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["residential", "commercial", "land"] },
            transactionType: { type: "string", enum: ["sale", "rent"] },
            minPrice: { type: "number" },
            maxPrice: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              count: { type: "number" },
              data: { type: "array", items: propertySchema },
            },
          },
        },
      },
    },
    async (request) => {
      const { type, transactionType, minPrice, maxPrice } = request.query;
      const data = getAllProperties({
        type,
        transactionType,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      });
      return { success: true, count: data.length, data };
    }
  );

  // GET /properties/:id - Get a single property by ID
  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get a single property by ID",
        tags: ["Properties"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: propertySchema,
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const property = getPropertyById(request.params.id);
      if (!property) {
        reply.code(404);
        return { success: false, message: "Property not found" };
      }
      return { success: true, data: property };
    }
  );

  // POST /properties - Create a new property
  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new property listing",
        tags: ["Properties"],
        body: createPropertyBody,
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: propertySchema,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const property = createProperty(request.body);
      reply.code(201);
      return { success: true, data: property };
    }
  );

  // PATCH /properties/:id - Update a property
  fastify.patch(
    "/:id",
    {
      schema: {
        description: "Update an existing property",
        tags: ["Properties"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: createPropertyBody.properties,
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: propertySchema,
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const property = updateProperty(request.params.id, request.body);
      if (!property) {
        reply.code(404);
        return { success: false, message: "Property not found" };
      }
      return { success: true, data: property };
    }
  );

  // DELETE /properties/:id - Delete a property
  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete a property listing",
        tags: ["Properties"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const deleted = deleteProperty(request.params.id);
      if (!deleted) {
        reply.code(404);
        return { success: false, message: "Property not found" };
      }
      return { success: true, message: "Property deleted successfully" };
    }
  );

  done();
}
