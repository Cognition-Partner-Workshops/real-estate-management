import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || "property-images";

let blobServiceClient;

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

/**
 * Upload a blob to Azure Blob Storage.
 * @param {string} container - The container name.
 * @param {string} blobName - The blob name (key).
 * @param {import("stream").Readable} stream - The readable stream of file data.
 * @param {number} contentLength - The content length in bytes.
 * @param {string} contentType - The MIME content type.
 * @returns {Promise<string>} The public URL of the uploaded blob.
 */
export async function uploadBlob(
  container,
  blobName,
  stream,
  contentLength,
  contentType
) {
  const containerClient = blobServiceClient.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadStream(stream, contentLength, undefined, {
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
  const containerClient = blobServiceClient.getContainerClient(container);
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
  const containerClient = blobServiceClient.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  return blockBlobClient.url;
}

export { containerName, blobServiceClient };
