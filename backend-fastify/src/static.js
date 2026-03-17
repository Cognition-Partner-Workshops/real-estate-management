import FastifyStatic from "@fastify/static";
import path from "path";

export const setFastifyStatic = function (fastify) {
  // When Azure Blob Storage is configured, images are served directly
  // from blob URLs — no need to serve local files through the backend.
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return;
  }

  // Local dev fallback: serve uploaded files from the filesystem
  const __dirname = path.resolve(path.dirname(""));
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, "uploads"),
    prefix: "/uploads",
  });
};
