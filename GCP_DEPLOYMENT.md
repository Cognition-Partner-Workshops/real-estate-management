# GCP Cloud Run Deployment Guide

This document provides comprehensive instructions for deploying the Real Estate Management application to Google Cloud Platform using Cloud Run, Cloud Build, and Secret Manager.

## Architecture Overview

The application consists of two services deployed to Cloud Run:

- **real-estate-backend**: Fastify-based Node.js API server
- **real-estate-frontend**: Angular/Ionic application served via Nginx

Both services are containerized using Docker and deployed automatically via Cloud Build triggers.

## Prerequisites

Before deploying, ensure you have:

1. A Google Cloud Platform account with billing enabled
2. The `gcloud` CLI installed and configured
3. A MongoDB database (MongoDB Atlas recommended for production)
4. (Optional) Google OAuth credentials for authentication

## Step 1: GCP Project Setup

### Enable Required APIs

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com
```

### Configure IAM Permissions

Grant the Cloud Build service account the necessary permissions:

```bash
# Get the Cloud Build service account
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
export CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

# Grant Service Account User role (required to deploy to Cloud Run)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

# Grant Secret Manager Secret Accessor role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 2: Secret Manager Setup

### Required Secrets

Create the following secrets in GCP Secret Manager:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `real-estate-db-connect` | MongoDB connection string | Yes |
| `real-estate-jwt-secret` | JWT signing key for authentication | Yes |
| `real-estate-google-client-id` | Google OAuth client ID | Optional |
| `real-estate-map-api-key` | Map tiles API key (if using paid tiles) | Optional |

### Create Secrets

```bash
# Create MongoDB connection string secret
echo -n "mongodb+srv://user:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority" | \
  gcloud secrets create real-estate-db-connect --data-file=-

# Create JWT secret key
echo -n "your-secure-jwt-secret-key-min-32-chars" | \
  gcloud secrets create real-estate-jwt-secret --data-file=-

# Create Google OAuth client ID (optional)
echo -n "your-google-oauth-client-id.apps.googleusercontent.com" | \
  gcloud secrets create real-estate-google-client-id --data-file=-

# Create Map API key (optional)
echo -n "your-map-api-key" | \
  gcloud secrets create real-estate-map-api-key --data-file=-
```

### Update Secrets

To update an existing secret:

```bash
echo -n "new-secret-value" | \
  gcloud secrets versions add real-estate-db-connect --data-file=-
```

## Step 3: Cloud Build Triggers

### Backend Trigger

Create a trigger for the backend service:

```bash
gcloud builds triggers create github \
  --name="real-estate-backend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="your-github-org" \
  --branch-pattern="^demo/cloud-infra$" \
  --build-config="backend-fastify/cloudbuild.yaml" \
  --included-files="backend-fastify/**"
```

### Frontend Trigger

Create a trigger for the frontend service:

```bash
gcloud builds triggers create github \
  --name="real-estate-frontend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="your-github-org" \
  --branch-pattern="^demo/cloud-infra$" \
  --build-config="frontend/cloudbuild.yaml" \
  --included-files="frontend/**"
```

## Step 4: Manual Deployment

If you need to deploy manually without triggers:

### Deploy Backend

```bash
cd backend-fastify

# Build and push the image
gcloud builds submit --config=cloudbuild.yaml

# Or deploy directly
gcloud run deploy real-estate-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-secrets="DB_CONNECT=real-estate-db-connect:latest,SECRET_KEY=real-estate-jwt-secret:latest,GOOGLE_AUTH_CLIENT_ID=real-estate-google-client-id:latest"
```

### Deploy Frontend

```bash
cd frontend

# Get the backend URL first
BACKEND_URL=$(gcloud run services describe real-estate-backend --region=us-central1 --format='value(status.url)')

# Build with the backend URL
gcloud builds submit --config=cloudbuild.yaml
```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Storage | Default |
|----------|-------------|---------|---------|
| `PORT` | Server port | Cloud Run config | 8080 |
| `NODE_ENV` | Environment mode | Cloud Run config | production |
| `DB_CONNECT` | MongoDB connection string | Secret Manager | Required |
| `SECRET_KEY` | JWT signing secret | Secret Manager | Required |
| `GOOGLE_AUTH_CLIENT_ID` | Google OAuth client ID | Secret Manager | Optional |
| `LOGGER` | Enable Fastify logging | Cloud Run config | true |
| `USER_ACTIVITIES_MAX` | Max activities per user | Cloud Run config | 20 |
| `USER_NOTIFICATIONS_MAX` | Max notifications per user | Cloud Run config | 20 |

### Frontend Environment Variables

Frontend environment variables are injected at build time via Docker build arguments:

| Build Arg | Description | Source |
|-----------|-------------|--------|
| `BACKEND_URL` | Backend API URL | Auto-detected from Cloud Run |
| `WEBSOCKET_URL` | WebSocket URL | Derived from backend URL |
| `MAP_API_KEY` | Map tiles API key | Secret Manager |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Secret Manager |

## Updating Environment Variables

### Backend

To update backend environment variables after deployment:

```bash
gcloud run services update real-estate-backend \
  --region us-central1 \
  --set-env-vars="LOGGER=false,USER_ACTIVITIES_MAX=50"
```

### Frontend

Frontend environment variables require a rebuild since they're baked into the static files at build time. Trigger a new build by pushing to the branch or manually running Cloud Build.

## WebSocket Support

Cloud Run supports WebSocket connections with session affinity enabled. The backend cloudbuild.yaml includes `--session-affinity` to ensure WebSocket connections are routed to the same instance.

Note: Cloud Run has a maximum request timeout of 60 minutes for WebSocket connections. For long-lived connections, implement reconnection logic in the frontend.

## Monitoring and Logging

### View Logs

```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=real-estate-backend" --limit=50

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=real-estate-frontend" --limit=50
```

### View Service Status

```bash
# List all Cloud Run services
gcloud run services list --region us-central1

# Describe a specific service
gcloud run services describe real-estate-backend --region us-central1
```

## Troubleshooting

### Common Issues

**Build fails with "secret not found"**
Ensure the secrets are created in Secret Manager and the Cloud Build service account has the `secretmanager.secretAccessor` role.

**Frontend can't connect to backend**
Verify the backend service is deployed and accessible. The frontend Cloud Build automatically detects the backend URL, but if the backend isn't deployed yet, it will use a placeholder URL.

**WebSocket connections failing**
Ensure session affinity is enabled on the backend service. Check that the WebSocket URL uses `wss://` protocol for HTTPS deployments.

**MongoDB connection timeout**
Verify your MongoDB Atlas cluster allows connections from GCP IP ranges, or configure VPC peering for private connectivity.

### Useful Commands

```bash
# Check Cloud Build history
gcloud builds list --limit=10

# View build logs
gcloud builds log BUILD_ID

# Check service revisions
gcloud run revisions list --service=real-estate-backend --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic real-estate-backend \
  --region us-central1 \
  --to-revisions=REVISION_NAME=100
```

## Cost Optimization

Cloud Run charges based on CPU, memory, and request count. To optimize costs:

1. **Min instances**: Set to 0 for non-production environments to avoid idle charges
2. **Max instances**: Limit based on expected traffic to prevent runaway scaling
3. **Memory**: Start with 256Mi for frontend, 512Mi for backend, and adjust based on actual usage
4. **CPU**: Use 1 CPU for most workloads; increase only if needed

## Security Best Practices

1. **Never commit secrets**: Use Secret Manager for all sensitive values
2. **Use non-root users**: Both Dockerfiles create and use non-root users
3. **Enable HTTPS**: Cloud Run provides automatic HTTPS with managed certificates
4. **Restrict access**: Consider using Cloud IAM for internal services
5. **Regular updates**: Keep base images and dependencies updated
6. **Audit logs**: Enable Cloud Audit Logs for compliance requirements

## Service URLs

After deployment, your services will be available at:

- **Backend**: `https://real-estate-backend-HASH-uc.a.run.app`
- **Frontend**: `https://real-estate-frontend-HASH-uc.a.run.app`

You can also configure custom domains through Cloud Run's domain mapping feature.
