# Cloud Build Setup Guide

This guide explains how to configure Cloud Build triggers for automated CI/CD deployments of the Real Estate Management application.

## Prerequisites

Before setting up Cloud Build triggers, ensure you have:

1. A GCP project with billing enabled
2. The following APIs enabled:
   - Cloud Build API
   - Cloud Run API
   - Container Registry API
   - Secret Manager API
3. Appropriate IAM permissions (Cloud Build Editor, Cloud Run Admin)
4. The repository connected to Cloud Build

## Enabling Required APIs

Run the following commands to enable the necessary APIs:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Connecting the Repository

1. Navigate to Cloud Build in the GCP Console
2. Go to "Triggers" and click "Connect Repository"
3. Select "GitHub" as the source
4. Authenticate with GitHub and select the `Cognition-Partner-Workshops/real-estate-management` repository
5. Accept the Cloud Build GitHub App permissions

## Backend Trigger Configuration

Create a trigger for the backend service with the following settings:

**Trigger Name:** `real-estate-backend-deploy`

**Event:** Push to a branch

**Source:**
- Repository: `Cognition-Partner-Workshops/real-estate-management`
- Branch: `^main$` (or `^demo/cloud-infra$` for testing)

**Included Files Filter:**
```
backend-fastify/**
```

**Build Configuration:**
- Type: Cloud Build configuration file
- Location: `backend-fastify/cloudbuild.yaml`

**Substitution Variables (optional):**
- `_REGION`: `us-central1` (default)
- `_SERVICE_NAME`: `real-estate-backend` (default)

### Creating the Backend Trigger via CLI

```bash
gcloud builds triggers create github \
  --name="real-estate-backend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="Cognition-Partner-Workshops" \
  --branch-pattern="^main$" \
  --build-config="backend-fastify/cloudbuild.yaml" \
  --included-files="backend-fastify/**" \
  --substitutions="_REGION=us-central1,_SERVICE_NAME=real-estate-backend"
```

## Frontend Trigger Configuration

Create a trigger for the frontend service with the following settings:

**Trigger Name:** `real-estate-frontend-deploy`

**Event:** Push to a branch

**Source:**
- Repository: `Cognition-Partner-Workshops/real-estate-management`
- Branch: `^main$` (or `^demo/cloud-infra$` for testing)

**Included Files Filter:**
```
frontend/**
```

**Build Configuration:**
- Type: Cloud Build configuration file
- Location: `frontend/cloudbuild.yaml`

**Substitution Variables (optional):**
- `_REGION`: `us-central1` (default)
- `_SERVICE_NAME`: `real-estate-frontend` (default)
- `_BACKEND_SERVICE_NAME`: `real-estate-backend` (default)

### Creating the Frontend Trigger via CLI

```bash
gcloud builds triggers create github \
  --name="real-estate-frontend-deploy" \
  --repo-name="real-estate-management" \
  --repo-owner="Cognition-Partner-Workshops" \
  --branch-pattern="^main$" \
  --build-config="frontend/cloudbuild.yaml" \
  --included-files="frontend/**" \
  --substitutions="_REGION=us-central1,_SERVICE_NAME=real-estate-frontend,_BACKEND_SERVICE_NAME=real-estate-backend"
```

## IAM Permissions for Cloud Build

Cloud Build needs specific permissions to deploy to Cloud Run and access secrets. Grant the following roles to the Cloud Build service account:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

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

## Deployment Order

When deploying for the first time, deploy the services in this order:

1. **Backend first**: The backend service must be deployed first because the frontend build needs the backend URL to configure API endpoints.

2. **Frontend second**: After the backend is deployed and has a URL, deploy the frontend. The frontend Cloud Build pipeline automatically retrieves the backend URL.

## Manual Trigger Execution

To manually trigger a build:

### Via Console
1. Go to Cloud Build > Triggers
2. Click "Run" next to the desired trigger
3. Select the branch and click "Run Trigger"

### Via CLI
```bash
# Trigger backend build
gcloud builds triggers run real-estate-backend-deploy --branch=main

# Trigger frontend build
gcloud builds triggers run real-estate-frontend-deploy --branch=main
```

## Monitoring Builds

View build logs and status:

### Via Console
1. Go to Cloud Build > History
2. Click on a build to view detailed logs

### Via CLI
```bash
# List recent builds
gcloud builds list --limit=10

# Stream logs for a specific build
gcloud builds log BUILD_ID --stream
```

## Troubleshooting

### Common Issues

**Build fails with "permission denied":**
- Ensure the Cloud Build service account has the required IAM roles
- Verify Secret Manager secrets exist and are accessible

**Frontend build fails to get backend URL:**
- Ensure the backend service is deployed first
- Check that the `_BACKEND_SERVICE_NAME` substitution matches the actual service name

**Docker build fails:**
- Check the Dockerfile syntax
- Verify all required files are present in the build context
- Review the build logs for specific error messages

**Deployment fails with "service account does not have permission":**
- Grant the `roles/iam.serviceAccountUser` role to the Cloud Build service account
- Ensure the Cloud Run service account exists

### Viewing Detailed Logs

```bash
# Get the build ID from the failed build
gcloud builds list --filter="status=FAILURE" --limit=5

# View detailed logs
gcloud builds log BUILD_ID
```
