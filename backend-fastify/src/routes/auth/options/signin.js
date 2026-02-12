import { responseError, responseSuccess } from "../../../utils/schema/response.js";
import { authProperties } from "./schema.js";

export const signInOpts = (handler) => ({
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "1 minute",
    },
  },
  schema: {
    response: {
      200: responseSuccess({
        data: authProperties,
        message: "Success: User password changed!!!"
      }),
      400: responseError(),
      404: responseError({ status: 404 })
    },
  },
  handler: handler,
});
