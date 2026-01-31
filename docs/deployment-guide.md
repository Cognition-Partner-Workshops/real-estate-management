# Deployment Guide

This guide provides step-by-step instructions for deploying the Real Estate Management application to Google Cloud Platform using Cloud Run and Cloud Build.

## Architecture Overview

The deployment architecture consists of:

- **Backend Service**: Node.js Fastify API running on Cloud Run
- **Frontend Service**: Angular/Ionic SPA served via Nginx on Cloud Run
- **Database**: MongoDB Atlas (external, not managed by this deployment)
- **Secrets**: Google Cloud Secret Manager for sensitive configuration
- **CI/CD**: Cloud Build for automated deployments

```
┌─────────────────┐     ┌─────────────────┐
│   Cloud Build   │────▶│ Container       │
│   (CI/CD)       │     │ Registry        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Secret Manager │     │   Cloud Run     │
│  (Secrets)      │────▶│   (Services)    │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
               ┌──────────────┐  ┌──────────────┐
               │   Backend    │  │   Frontend   │
               │   Service    │  │   Service    │
               └──────┬───────┘  └──────────────┘
                      │
                      ▼
               ┌──────────────┐
               │ MongoDB Atlas│
               │  (External)  │
               └──────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **GCP Project**: A Google Cloud project with billing enabled
2. **MongoDB Database**: A MongoDB Atlas cluster or self-hosted MongoDB instance
3. **gcloud CLI**: Installed and authenticated (`gcloud auth login`)
4. **Required APIs**: Enabled (see below)
5. **IAM Permissions**: Owner or Editor role on the GCP project

### Enable Required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

## Initial Setup

### Step 1: Create Secrets in Secret Manager

Follow the [Secret Manager Setup Guide](./secret-manager-setup.md) to create the required secrets:

```bash
# MongoDB connection string
echo -n "your-mongodb-connection-string" | \
  gcloud secrets create real-estate-db-connect --data-file=-

# JWT secret key
openssl rand -base64 32 | \
  gcloud secrets create real-estate-jwt-secret --data-file=-

# Google OAuth client ID (optional, for social login)
echo -n "your-google-client-id" | \
  gcloud secrets create real-estate-google-client-id --data-file=-

# Map API key (optional, for map tiles)
echo -n "your-map-api-key" | \
  gcloud secrets create real-estate-map-api-key --data-file=-
```

### Step 2: Configure IAM Permissions

Grant Cloud Build the necessary permissions:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

# Service Account User
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager Access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Set Up Cloud Build Triggers

Follow the [Cloud Build Setup Guide](./cloud-build-setup.md) to create triggers, or use the CLI:

```bash
# Backend trigger
gcloud builds triggers create github \
  --name="real-estate-backend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="Cognition-Partner-Workshops" \
  --branch-pattern="^main$" \
  --build-config="backend-fastify/cloudbuild.yaml" \
  --included-files="backend-fastify/**"

# Frontend trigger
gcloud builds triggers create github \
  --name="real-estate-frontend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="Cognition-Partner-Workshops" \
  --branch-pattern="^main$" \
  --build-config="frontend/cloudbuild.yaml" \
  --included-files="frontend/**"
```

## Deployment Process

### First-Time Deployment

For the initial deployment, deploy services in order:

#### 1. Deploy Backend First

```bash
# Trigger backend build manually
gcloud builds triggers run real-estate-backend-deploy --branch=main

# Or submit directly
gcloud builds submit --config=backend-fastify/cloudbuild.yaml .
```

Wait for the backend deployment to complete. Get the backend URL:

```bash
gcloud run services describe real-estate-backend \
  --region=us-central1 \
  --format='value(status.url)'
```

#### 2. Deploy Frontend

```bash
# Trigger frontend build (will auto-detect backend URL)
gcloud builds triggers run real-estate-frontend-deploy --branch=main

# Or submit directly
gcloud builds submit --config=frontend/cloudbuild.yaml .
```

### Automated Deployments

After initial setup, deployments are automatic:

1. Push changes to the `main` branch
2. Cloud Build detects changes in `backend-fastify/` or `frontend/`
3. The appropriate pipeline builds, tests, and deploys
4. Cloud Run performs zero-downtime deployment

## Monitoring Deployments

### View Build Status

```bash
# List recent builds
gcloud builds list --limit=10

# Watch a specific build
gcloud builds log BUILD_ID --stream
```

### View Cloud Run Services

```bash
# List services
gcloud run services list --region=us-central1

# Get service details
gcloud run services describe real-estate-backend --region=us-central1
gcloud run services describe real-estate-frontend --region=us-central1
```

### View Logs

```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=real-estate-backend" --limit=50

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=real-estate-frontend" --limit=50
```

Or use the Cloud Console: **Logging > Logs Explorer**

## Rollback Procedures

### Rollback to Previous Revision

Cloud Run maintains revision history. To rollback:

```bash
# List revisions
gcloud run revisions list --service=real-estate-backend --region=us-central1

# Route traffic to a previous revision
gcloud run services update-traffic real-estate-backend \
  --region=us-central1 \
  --to-revisions=real-estate-backend-00005-abc=100
```

### Rollback Using Container Image

```bash
# List available images
gcloud container images list-tags gcr.io/PROJECT_ID/real-estate-backend

# Deploy a specific image version
gcloud run deploy real-estate-backend \
  --image=gcr.io/PROJECT_ID/real-estate-backend:PREVIOUS_COMMIT_SHA \
  --region=us-central1
```

## Updating Configuration

### Update Environment Variables

```bash
gcloud run services update real-estate-backend \
  --region=us-central1 \
  --set-env-vars="NEW_VAR=value"
```

### Update Secrets

1. Add a new version to the secret:
   ```bash
   echo -n "new-value" | gcloud secrets versions add real-estate-db-connect --data-file=-
   ```

2. Redeploy the service to pick up the new secret:
   ```bash
   gcloud run services update real-estate-backend --region=us-central1
   ```

### Update Resource Limits

```bash
gcloud run services update real-estate-backend \
  --region=us-central1 \
  --memory=1Gi \
  --cpu=2 \
  --max-instances=20
```

## Troubleshooting

### Build Failures

**Symptom**: Cloud Build fails during Docker build

**Solutions**:
1. Check build logs: `gcloud builds log BUILD_ID`
2. Verify Dockerfile syntax
3. Ensure all required files are in the build context
4. Check that npm dependencies resolve correctly

### Deployment Failures

**Symptom**: Cloud Run deployment fails

**Solutions**:
1. Check that secrets exist and are accessible
2. Verify IAM permissions for Cloud Build service account
3. Check container health check endpoint responds
4. Review Cloud Run logs for startup errors

### Application Errors

**Symptom**: Application returns 500 errors

**Solutions**:
1. Check application logs in Cloud Logging
2. Verify MongoDB connection string is correct
3. Ensure all required environment variables are set
4. Check that the database is accessible from Cloud Run

### WebSocket Connection Issues

**Symptom**: Real-time notifications don't work

**Solutions**:
1. Verify session affinity is enabled on the backend service
2. Check that the WebSocket URL uses `wss://` protocol
3. Ensure the `/websocket` path is correct
4. Check CORS configuration allows WebSocket connections

### Frontend Can't Reach Backend

**Symptom**: API calls fail with network errors

**Solutions**:
1. Verify the backend URL is correctly injected during build
2. Check CORS configuration on the backend
3. Ensure both services allow unauthenticated access
4. Verify the backend service is running and healthy

## Cost Optimization

### Scale to Zero

Both services are configured with `min-instances=0`, meaning they scale to zero when not in use. This minimizes costs during low-traffic periods.

### Resource Limits

Default resource allocations:
- Backend: 512Mi memory, 1 CPU
- Frontend: 256Mi memory, 1 CPU

Adjust based on actual usage patterns.

### Container Registry Cleanup

Periodically clean up old container images:

```bash
# List images older than 30 days
gcloud container images list-tags gcr.io/PROJECT_ID/real-estate-backend \
  --filter="timestamp.datetime < $(date -d '-30 days' +%Y-%m-%d)" \
  --format="get(digest)"

# Delete old images (be careful!)
gcloud container images delete gcr.io/PROJECT_ID/real-estate-backend@sha256:DIGEST
```

## Security Considerations

1. **Secrets**: All sensitive data is stored in Secret Manager, never in code or environment variables
2. **Non-root containers**: Both Dockerfiles run as non-root users
3. **HTTPS**: Cloud Run provides automatic HTTPS with managed certificates
4. **IAM**: Follow principle of least privilege for service accounts
5. **Network**: Consider using VPC connectors for private database access

## Comparison with Legacy VMWare Deployment

The `vmware-legacy/` directory contains the previous VMWare-based deployment configuration. Key differences:

| Aspect | VMWare (Legacy) | Cloud Run (New) |
|--------|-----------------|-----------------|
| Scaling | Manual VM scaling | Automatic, serverless |
| Cost | Fixed VM costs | Pay-per-use |
| Deployment | Manual or scripted | Automated CI/CD |
| SSL/TLS | Manual certificate management | Automatic |
| Updates | Downtime required | Zero-downtime |
| Monitoring | Custom setup | Built-in Cloud Logging |
