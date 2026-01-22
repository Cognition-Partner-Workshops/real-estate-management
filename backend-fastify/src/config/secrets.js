import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedSecrets = null;
let cacheTimestamp = null;

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

async function fetchSecretsFromAWS() {
  const secretName = process.env.AWS_SECRET_NAME;

  if (!secretName) {
    console.warn(
      "AWS_SECRET_NAME not configured. Falling back to environment variables."
    );
    return null;
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });

    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }

    console.error("Secret value is not a string");
    return null;
  } catch (error) {
    console.error("Failed to fetch secrets from AWS Secrets Manager:", error.message);
    return null;
  }
}

export async function getSecrets() {
  const now = Date.now();

  if (cachedSecrets && cacheTimestamp && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSecrets;
  }

  const awsSecrets = await fetchSecretsFromAWS();

  if (awsSecrets) {
    cachedSecrets = {
      SECRET_KEY: awsSecrets.SECRET_KEY || process.env.SECRET_KEY,
      DB_CONNECT: awsSecrets.DB_CONNECT || process.env.DB_CONNECT,
      GOOGLE_AUTH_CLIENT_ID:
        awsSecrets.GOOGLE_AUTH_CLIENT_ID || process.env.GOOGLE_AUTH_CLIENT_ID,
      MAP_KEY: awsSecrets.MAP_KEY || process.env.MAP_KEY,
      WEBSOCKET_URL: awsSecrets.WEBSOCKET_URL || process.env.WEBSOCKET_URL,
    };
    cacheTimestamp = now;
    console.log("Secrets loaded from AWS Secrets Manager");
    return cachedSecrets;
  }

  cachedSecrets = {
    SECRET_KEY: process.env.SECRET_KEY,
    DB_CONNECT: process.env.DB_CONNECT,
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    MAP_KEY: process.env.MAP_KEY,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
  };
  cacheTimestamp = now;
  console.log("Secrets loaded from environment variables (AWS fallback)");
  return cachedSecrets;
}

export async function getSecret(key) {
  const secrets = await getSecrets();
  return secrets[key];
}

export function clearSecretsCache() {
  cachedSecrets = null;
  cacheTimestamp = null;
}

export async function getPublicConfig() {
  const secrets = await getSecrets();
  return {
    googleAuthClientId: secrets.GOOGLE_AUTH_CLIENT_ID || "",
    mapKey: secrets.MAP_KEY || "",
    webSocketUrl: secrets.WEBSOCKET_URL || "",
  };
}
