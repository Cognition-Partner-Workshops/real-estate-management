import { authProperties } from "./schema.js";

export const registerOpts = (handler) => ({
  config: {
    rateLimit: {
      max: 5,
      timeWindow: "1 minute",
    },
  },
  schema: {
    response: {
      201: authProperties,
    },
  },
  handler: handler,
});
