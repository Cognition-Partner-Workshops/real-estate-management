import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

let blobServiceClient;
let initialized = false;

/**
 * Lazily initialize the BlobServiceClient. Deferred so that dotenv.config()
 * in index.js has already run before env vars are read.
 * @returns {BlobServiceClient|undefined}
 */
function getBlobServiceClient() {
  if (initialized) {
    return blobServiceClient;
  }
  initialized = true;

  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
  } else if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
    const credential = new DefaultAzureCredential();
    blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential
    );
  }

  return blobServiceClient;
}

/**
 * Returns the container name from env or the default.
 * @returns {string}
 */
export function getContainerName() {
  return process.env.AZURE_STORAGE_CONTAINER_NAME || "property-images";
}

/**
 * Whether blob storage is configured and available.
 * @returns {boolean}
 */
export function isBlobStorageEnabled() {
  return !!getBlobServiceClient();
}

/**
 * Upload a blob to Azure Blob Storage.
 * @param {string} container - The container name.
 * @param {string} blobName - The blob name (key).
 * @param {import("stream").Readable} stream - The readable stream of file data.
 * @param {string} contentType - The MIME content type.
 * @returns {Promise<string>} The public URL of the uploaded blob.
 */
export async function uploadBlob(container, blobName, stream, contentType) {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadStream(stream, undefined, undefined, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

/**
 * Delete a blob from Azure Blob Storage.
 * @param {string} container - The container name.
 * @param {string} blobName - The blob name (key).
 * @returns {Promise<void>}
 */
export async function deleteBlob(container, blobName) {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists();
}

/**
 * Get the public URL of a blob.
 * @param {string} container - The container name.
 * @param {string} blobName - The blob name (key).
 * @returns {string} The public URL.
 */
export function getBlobUrl(container, blobName) {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  return blockBlobClient.url;
}
