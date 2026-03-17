# Real Estate Management - Azure Deployment Guide

## Architecture Overview

```
                         ┌──────────────────────────┐
                         │    Azure Front Door       │
                         │  (WAF + Managed SSL)      │
                         └─────────┬────────┬────────┘
                                   │        │
                    ┌──────────────┘        └──────────────┐
                    ▼                                      ▼
        ┌───────────────────────┐            ┌─────────────────────────┐
        │  Azure Static Web App │            │ Azure Container Apps    │
        │  (Angular/Ionic SPA)  │            │ (Fastify Node.js API)   │
        │                       │            │ Port 8080               │
        └───────────────────────┘            └──────────┬──────────────┘
                                                        │
                                      ┌─────────────────┼─────────────────┐
                                      ▼                 ▼                 ▼
                            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                            │ Cosmos DB    │  │ Key Vault    │  │ Storage      │
                            │ (MongoDB     │  │ (Secrets)    │  │ (Uploads)    │
                            │  vCore)      │  │              │  │              │
                            │ Private EP   │  │ RBAC Auth    │  │ Blob         │
                            └──────────────┘  └──────────────┘  └──────────────┘
```

### Component Summary

| Component | Azure Service | Purpose |
|-----------|--------------|---------|
| Frontend | Azure Static Web Apps | Hosts Angular/Ionic SPA |
| Backend API | Azure Container Apps | Runs Fastify Node.js server |
| Database | Cosmos DB for MongoDB vCore | MongoDB-compatible database |
| Secrets | Azure Key Vault | Stores DB_CONNECT, SECRET_KEY, etc. |
| Image Storage | Azure Storage (Blob) | Property image uploads |
| CDN / WAF | Azure Front Door | Global load balancing, SSL, WAF |
| Container Images | Azure Container Registry | Docker image repository |
| Monitoring | Log Analytics + App Insights | Logging and APM |
| Networking | VNet + Private Endpoints | Network isolation for Cosmos DB |

---

## Prerequisites

- **Azure subscription** with Owner or Contributor access
- **Azure CLI** v2.50+ installed (`az --version`)
- **GitHub repository** access with admin permissions (to configure secrets)
- **Node.js 20** (for local frontend builds)
- **Docker** (for local backend image testing)

---

## Initial Setup

### 1. Run the Azure Setup Script

The setup script creates resource groups, registers providers, and configures OIDC federation for GitHub Actions:

```bash
cd azure/scripts
chmod +x setup-azure.sh
./setup-azure.sh "<subscription-id>" "<github-org>" "real-estate-management"
```

The script outputs the values needed for GitHub Actions secrets.

### 2. Configure GitHub Actions Secrets

Add the following **repository-level** secrets in GitHub (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | App registration client ID (from setup script) |
| `AZURE_TENANT_ID` | Azure AD tenant ID (from setup script) |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

Add the following **per-environment** secrets (create `dev`, `staging`, `prod` environments in GitHub):

| Secret | Description |
|--------|-------------|
| `RESOURCE_GROUP` | Resource group name (e.g., `rem-dev-rg`) |
| `ACR_NAME` | Container registry name (e.g., `remdevacr`) |
| `ACR_LOGIN_SERVER` | ACR login server (e.g., `remdevacr.azurecr.io`) |
| `CONTAINER_APP_NAME` | Container App name (e.g., `rem-dev-backend`) |
| `SWA_DEPLOYMENT_TOKEN` | Static Web App deployment token |
| `BACKEND_URL` | Backend URL (e.g., `https://rem-dev-backend.azurecontainerapps.io`) |
| `BACKEND_WS_URL` | WebSocket URL (e.g., `wss://rem-dev-backend.azurecontainerapps.io`) |
| `MAP_API_KEY` | Map tile API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `COSMOS_DB_ADMIN_PASSWORD` | Cosmos DB administrator login password |

### 3. Deploy Infrastructure

Push the Bicep templates to the `main` branch (or trigger manually):

```bash
# Preview changes first
az deployment group what-if \
  --resource-group rem-dev-rg \
  --template-file azure/bicep/main.bicep \
  --parameters azure/bicep/parameters/dev.bicepparam

# Deploy
az deployment group create \
  --resource-group rem-dev-rg \
  --template-file azure/bicep/main.bicep \
  --parameters azure/bicep/parameters/dev.bicepparam
```

### 4. Seed Key Vault

After infrastructure is deployed, populate the application secrets:

```bash
cd azure/scripts
chmod +x seed-keyvault.sh
./seed-keyvault.sh "rem-dev-kv"
```

You will be prompted for:
- `DB_CONNECT` - Cosmos DB connection string
- `SECRET_KEY` - JWT signing secret
- `GOOGLE_AUTH_CLIENT_ID` - Google OAuth client ID
- `MAP_API_KEY` - Map tile provider API key

---

## CI/CD Pipelines

### How It Works

All pipelines use **OIDC (OpenID Connect)** for Azure authentication — no stored service principal credentials.

| Workflow | Trigger | What It Does |
|----------|---------|-------------|
| `deploy-infrastructure.yml` | Push to `azure/bicep/**` | Deploys Bicep IaC templates |
| `deploy-backend.yml` | Push to `backend-fastify/**` | Builds Docker image, pushes to ACR, deploys to Container Apps |
| `deploy-frontend.yml` | Push to `frontend/**` | Builds Angular app, deploys to Static Web Apps |

### Manual Deployment

All workflows support `workflow_dispatch` with environment selection:

1. Go to **Actions** tab in GitHub
2. Select the workflow
3. Click **Run workflow**
4. Choose the target environment (`dev`, `staging`, `prod`)

---

## Deploying to Different Environments

Each environment has its own parameter file and GitHub environment:

| Environment | Parameter File | Resource Group | Characteristics |
|-------------|---------------|----------------|-----------------|
| `dev` | `azure/bicep/parameters/dev.bicepparam` | `rem-dev-rg` | Basic SKUs, scale-to-zero, Free SWA |
| `staging` | `azure/bicep/parameters/staging.bicepparam` | `rem-staging-rg` | Staging SKUs, moderate scaling |
| `prod` | `azure/bicep/parameters/prod.bicepparam` | `rem-prod-rg` | Standard SKUs, min 1 replica, HA Cosmos DB |

---

## Rollback Procedures

### Container Apps Revision Routing

Container Apps keeps previous revisions available for instant rollback:

```bash
# List all revisions
az containerapp revision list \
  --name rem-dev-backend \
  --resource-group rem-dev-rg \
  --output table

# Route 100% traffic to a previous revision
az containerapp ingress traffic set \
  --name rem-dev-backend \
  --resource-group rem-dev-rg \
  --revision-weight <previous-revision-name>=100

# Gradually shift traffic (canary)
az containerapp ingress traffic set \
  --name rem-dev-backend \
  --resource-group rem-dev-rg \
  --revision-weight <old-revision>=90 <new-revision>=10
```

### Frontend Rollback

Static Web Apps automatically maintains previous deployments. Redeploy from a previous commit:

```bash
git revert HEAD
git push origin main
```

### Automated Rollback

The backend deploy workflow automatically rolls back if the health check fails after deploying a new revision.

---

## Monitoring and Alerting

### Log Analytics

Query application logs via the Azure Portal or CLI:

```bash
# View recent backend logs
az monitor log-analytics query \
  --workspace rem-dev-logs \
  --analytics-query "ContainerAppConsoleLogs_CL | where ContainerAppName_s == 'rem-dev-backend' | order by TimeGenerated desc | take 50"
```

### Application Insights

- **Live Metrics**: Real-time request rates, failures, and dependencies
- **Application Map**: Visual dependency topology
- **Failures**: Aggregated exception and error analysis
- **Performance**: Response time percentiles and slow requests

### Recommended Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | Failures > 5% over 5 min | Critical |
| Slow Response | P95 latency > 2s over 5 min | Warning |
| Container Restart | Restart count > 3 in 10 min | Critical |
| High CPU | CPU > 80% for 5 min | Warning |

---

## Legacy VMware vs Azure Comparison

| Aspect | VMware (Legacy) | Azure (Current) |
|--------|----------------|-----------------|
| **Provisioning** | Manual VM creation in vSphere | Bicep IaC templates (automated) |
| **Deployment** | SSH + SCP scripts | GitHub Actions CI/CD |
| **Scaling** | Manual VM cloning | Auto-scaling (0-10 replicas) |
| **Database** | Self-managed MongoDB on VM | Cosmos DB for MongoDB vCore (managed) |
| **SSL/TLS** | Manual cert installation | Azure Front Door managed SSL |
| **WAF** | None | Azure Front Door WAF |
| **Monitoring** | journalctl + manual log review | Log Analytics + Application Insights |
| **Rollback** | Manual tar backup restore | Instant revision traffic routing |
| **Networking** | Static IPs, manual firewall | VNet + Private Endpoints + NSGs |
| **Secrets** | .env files on disk | Azure Key Vault with RBAC |
| **Time to deploy** | ~30 minutes (manual) | ~5 minutes (automated) |
| **Downtime during deploy** | Yes (service restart) | Zero-downtime (revision switching) |

---

## Cost Optimization Tips

1. **Scale to zero in dev**: The dev environment uses `minReplicas: 0` so Container Apps scale down when idle, eliminating compute costs during off-hours.

2. **Use Free tier Static Web Apps for dev**: The dev parameter file uses Free SKU for Static Web Apps; only prod uses Standard.

3. **Basic ACR for non-prod**: Dev environments use Basic SKU Container Registry (cheaper), while prod uses Premium for geo-replication and retention policies.

4. **Right-size Cosmos DB**: Dev uses M30 tier with a single node; prod uses M40 with HA. Evaluate actual usage patterns and adjust.

5. **Set up budget alerts**: Configure Azure Cost Management budget alerts to avoid surprise bills.

6. **Review Front Door usage**: If traffic is low, consider removing Front Door in dev and connecting directly to Container Apps and Static Web Apps.

7. **Log retention**: Dev environments retain logs for 30 days; prod retains for 90 days. Adjust based on compliance needs.

---

## Troubleshooting

### Backend Container Not Starting

```bash
# Check container logs
az containerapp logs show \
  --name rem-dev-backend \
  --resource-group rem-dev-rg \
  --follow

# Check revision status
az containerapp revision list \
  --name rem-dev-backend \
  --resource-group rem-dev-rg \
  --output table
```

### Cannot Connect to Cosmos DB

- Verify the private endpoint is correctly configured
- Check that the Container App's VNet has connectivity to the private endpoint subnet
- Verify the `DB-CONNECT` secret in Key Vault has the correct connection string

### Static Web App Returns 404

- Ensure `staticwebapp.config.json` is present in the deployed output
- Check that the navigation fallback is configured for SPA routing
- Verify the build output is in `frontend/www/`

### Key Vault Access Denied

- Verify the Container App's managed identity has the "Key Vault Secrets User" role
- Check that RBAC authorization is enabled on the Key Vault
- Ensure the secret names match (use hyphens, not underscores: `DB-CONNECT` not `DB_CONNECT`)
