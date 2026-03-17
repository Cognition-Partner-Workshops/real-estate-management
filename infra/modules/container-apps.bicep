// ============================================================================
// Module: container-apps.bicep
// Description: Azure Container Apps Environment with backend and frontend
//              Container Apps. Backend runs the Fastify API with WebSocket
//              support; frontend serves the Ionic/Angular SPA.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

// -- Infrastructure dependencies --

@description('Resource ID of the ACA subnet.')
param acaSubnetId string

@description('Customer ID of the Log Analytics workspace.')
param logAnalyticsCustomerId string

@description('Shared key for the Log Analytics workspace.')
@secure()
param logAnalyticsSharedKey string

@description('Login server URL of the container registry.')
param acrLoginServer string

@description('Resource ID of the container registry (for AcrPull role).')
param acrId string

// -- Managed identity (created externally to avoid circular dependency with Key Vault) --

@description('Resource ID of the user-assigned managed identity for the backend.')
param backendIdentityId string

@description('Principal ID of the user-assigned managed identity.')
param backendIdentityPrincipalId string

// -- Key Vault secret URIs --

@description('Key Vault URI for DB_CONNECT secret.')
param secretUriDbConnect string

@description('Key Vault URI for SECRET_KEY secret.')
param secretUriJwtSecret string

@description('Key Vault URI for GOOGLE_AUTH_CLIENT_ID secret.')
param secretUriGoogleClientId string

@description('Key Vault URI for AZURE_STORAGE_CONNECTION_STRING secret.')
param secretUriStorageConnectionString string

@description('Comma-separated CORS origins for the backend.')
param corsOrigins string = ''

// -- Scaling parameters --

@description('Minimum number of backend replicas (WebSocket needs always-on).')
@minValue(1)
param backendMinReplicas int = 1

@description('Maximum number of backend replicas.')
param backendMaxReplicas int = 10

@description('Minimum number of frontend replicas.')
@minValue(0)
param frontendMinReplicas int = 0

@description('Maximum number of frontend replicas.')
param frontendMaxReplicas int = 5

// -- Container image configuration --

@description('Backend container image (full path including tag).')
param backendImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Frontend container image (full path including tag).')
param frontendImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

// -- Resource limits --

@description('Backend container CPU cores.')
param backendCpu string = '0.5'

@description('Backend container memory.')
param backendMemory string = '1Gi'

@description('Frontend container CPU cores.')
param frontendCpu string = '0.25'

@description('Frontend container memory.')
param frontendMemory string = '0.5Gi'

// ============================================================================
// ACR Pull Role Assignment for Backend Identity
// Built-in AcrPull role: 7f951dda-4ed3-4680-a7ca-43fe172d538d
// ============================================================================

var acrPullRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '7f951dda-4ed3-4680-a7ca-43fe172d538d'
)

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' existing = {
  name: last(split(acrId, '/'))
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrId, backendIdentityId, acrPullRoleId)
  scope: containerRegistry
  properties: {
    roleDefinitionId: acrPullRoleId
    principalId: backendIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================================================
// Container Apps Environment
// ============================================================================

resource acaEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${namePrefix}-aca-env'
  location: location
  tags: tags
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: acaSubnetId
    }
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsSharedKey
      }
    }
    zoneRedundant: false
  }
}

// ============================================================================
// Backend Container App
// ============================================================================

resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${namePrefix}-backend'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${backendIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: acaEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
        stickySessions: {
          affinity: 'sticky'
        }
      }
      registries: [
        {
          server: acrLoginServer
          identity: backendIdentityId
        }
      ]
      secrets: [
        {
          name: 'db-connect'
          keyVaultUrl: secretUriDbConnect
          identity: backendIdentityId
        }
        {
          name: 'secret-key'
          keyVaultUrl: secretUriJwtSecret
          identity: backendIdentityId
        }
        {
          name: 'google-auth-client-id'
          keyVaultUrl: secretUriGoogleClientId
          identity: backendIdentityId
        }
        {
          name: 'storage-connection-string'
          keyVaultUrl: secretUriStorageConnectionString
          identity: backendIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: backendImage
          resources: {
            cpu: json(backendCpu)
            memory: backendMemory
          }
          env: [
            { name: 'PORT', value: '8080' }
            { name: 'NODE_ENV', value: 'production' }
            { name: 'LOGGER', value: 'true' }
            { name: 'SALT', value: '12' }
            { name: 'CORS_ORIGINS', value: corsOrigins }
            { name: 'DB_CONNECT', secretRef: 'db-connect' }
            { name: 'SECRET_KEY', secretRef: 'secret-key' }
            { name: 'GOOGLE_AUTH_CLIENT_ID', secretRef: 'google-auth-client-id' }
            { name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'storage-connection-string' }
          ]
        }
      ]
      scale: {
        minReplicas: backendMinReplicas
        maxReplicas: backendMaxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

// ============================================================================
// Frontend Container App
// ============================================================================

resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${namePrefix}-frontend'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: acaEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrLoginServer
          identity: backendIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: frontendImage
          resources: {
            cpu: json(frontendCpu)
            memory: frontendMemory
          }
          env: [
            { name: 'PORT', value: '8080' }
            { name: 'NODE_ENV', value: 'production' }
          ]
        }
      ]
      scale: {
        minReplicas: frontendMinReplicas
        maxReplicas: frontendMaxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Name of the Container Apps environment.')
output acaEnvironmentName string = acaEnvironment.name

@description('FQDN of the backend container app.')
output backendFqdn string = backendApp.properties.configuration.ingress.fqdn

@description('FQDN of the frontend container app.')
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn

@description('Resource ID of the backend container app.')
output backendAppId string = backendApp.id

@description('Resource ID of the frontend container app.')
output frontendAppId string = frontendApp.id
