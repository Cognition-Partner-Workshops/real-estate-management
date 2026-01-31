# Secret Manager Setup Guide

This guide explains how to create and manage secrets in Google Cloud Secret Manager for the Real Estate Management application.

## Required Secrets

The application requires the following secrets to be configured:

| Secret Name | Description | Used By |
|-------------|-------------|---------|
| `real-estate-db-connect` | MongoDB connection string | Backend |
| `real-estate-jwt-secret` | JWT signing key for authentication | Backend |
| `real-estate-google-client-id` | Google OAuth client ID | Backend, Frontend |
| `real-estate-map-api-key` | Map tiles API key (Stadia Maps or similar) | Frontend |

## Creating Secrets

### Prerequisites

Ensure you have the Secret Manager API enabled:

```bash
gcloud services enable secretmanager.googleapis.com
```

### Creating Each Secret

#### 1. MongoDB Connection String

```bash
echo -n "mongodb+srv://username:password@cluster.mongodb.net/rem-db?retryWrites=true&w=majority" | \
  gcloud secrets create real-estate-db-connect --data-file=-
```

Replace the connection string with your actual MongoDB Atlas or self-hosted MongoDB connection string.

#### 2. JWT Secret Key

Generate a secure random key and create the secret:

```bash
openssl rand -base64 32 | \
  gcloud secrets create real-estate-jwt-secret --data-file=-
```

Or use a specific value:

```bash
echo -n "your-secure-jwt-secret-key-here" | \
  gcloud secrets create real-estate-jwt-secret --data-file=-
```

#### 3. Google OAuth Client ID

```bash
echo -n "your-google-client-id.apps.googleusercontent.com" | \
  gcloud secrets create real-estate-google-client-id --data-file=-
```

To obtain a Google OAuth Client ID:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Configure the authorized JavaScript origins and redirect URIs for your Cloud Run URLs

#### 4. Map API Key

```bash
echo -n "your-map-api-key" | \
  gcloud secrets create real-estate-map-api-key --data-file=-
```

For Stadia Maps, obtain an API key from [Stadia Maps](https://stadiamaps.com/).

## Granting Access to Secrets

### Cloud Build Service Account

Cloud Build needs access to secrets during the build process (for frontend environment injection):

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant access to all secrets
for SECRET in real-estate-db-connect real-estate-jwt-secret real-estate-google-client-id real-estate-map-api-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Cloud Run Service Account

Cloud Run needs access to secrets at runtime (for backend environment variables):

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to backend secrets
for SECRET in real-estate-db-connect real-estate-jwt-secret real-estate-google-client-id; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${CLOUD_RUN_SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Updating Secret Values

To update an existing secret with a new value:

```bash
# Add a new version to an existing secret
echo -n "new-secret-value" | \
  gcloud secrets versions add real-estate-db-connect --data-file=-
```

The Cloud Run services will automatically use the latest version of secrets on the next deployment.

## Viewing Secrets

### List All Secrets

```bash
gcloud secrets list
```

### View Secret Metadata

```bash
gcloud secrets describe real-estate-db-connect
```

### View Secret Versions

```bash
gcloud secrets versions list real-estate-db-connect
```

### Access Secret Value (for verification)

```bash
gcloud secrets versions access latest --secret=real-estate-db-connect
```

**Note:** Be careful when accessing secret values in shared environments or logs.

## Deleting Secrets

To delete a secret (use with caution):

```bash
gcloud secrets delete real-estate-db-connect
```

To disable a specific version without deleting:

```bash
gcloud secrets versions disable VERSION_ID --secret=real-estate-db-connect
```

## Secret Rotation

For production environments, implement secret rotation:

1. Add a new version of the secret
2. Deploy the application to pick up the new version
3. Verify the application works with the new secret
4. Disable or destroy the old version

```bash
# Add new version
echo -n "new-jwt-secret" | gcloud secrets versions add real-estate-jwt-secret --data-file=-

# After verification, disable old version
gcloud secrets versions disable 1 --secret=real-estate-jwt-secret
```

## Troubleshooting

### "Permission denied" when accessing secrets

Ensure the service account has the `secretmanager.secretAccessor` role:

```bash
gcloud secrets get-iam-policy SECRET_NAME
```

### Secret not found during deployment

Verify the secret exists and the name matches exactly:

```bash
gcloud secrets list --filter="name:real-estate"
```

### Cloud Build cannot access secrets

Check that the Cloud Build service account has access:

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
gcloud secrets get-iam-policy real-estate-map-api-key \
  --filter="bindings.members:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
```
