@description('Name prefix for Container Apps resources')
param namePrefix string

@description('Location for the resources')
param location string

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Log Analytics Workspace customer ID')
param logAnalyticsCustomerId string

@description('Log Analytics Workspace shared key')
@secure()
param logAnalyticsSharedKey string

@description('Application Insights connection string')
param appInsightsConnectionString string

@description('Container Apps subnet ID')
param subnetId string

@description('Container registry login server')
param containerRegistryLoginServer string

@description('Container image name and tag')
param containerImage string = ''

@description('Key Vault name for secret references')
param keyVaultName string

@description('Resource ID of the user-assigned managed identity')
param managedIdentityId string

@description('Tags to apply to the resources')
param tags object = {}

var minReplicas = environment == 'prod' ? 1 : 0
var maxReplicas = 10
var imageName = !empty(containerImage) ? containerImage : '${containerRegistryLoginServer}/rem-backend:latest'

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${namePrefix}-env'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsSharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: subnetId
      internal: false
    }
    daprAiConnectionString: appInsightsConnectionString
  }
}

resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${namePrefix}-backend'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Multiple'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        stickySessions: {
          affinity: 'sticky'
        }
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: false
        }
      }
      registries: [
        {
          server: containerRegistryLoginServer
          identity: managedIdentityId
        }
      ]
      secrets: [
        {
          name: 'db-connect'
          keyVaultUrl: 'https://${keyVaultName}${az.environment().suffixes.keyvaultDns}/secrets/DB-CONNECT'
          identity: managedIdentityId
        }
        {
          name: 'secret-key'
          keyVaultUrl: 'https://${keyVaultName}${az.environment().suffixes.keyvaultDns}/secrets/SECRET-KEY'
          identity: managedIdentityId
        }
        {
          name: 'google-auth-client-id'
          keyVaultUrl: 'https://${keyVaultName}${az.environment().suffixes.keyvaultDns}/secrets/GOOGLE-AUTH-CLIENT-ID'
          identity: managedIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'rem-backend'
          image: imageName
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'PORT', value: '8080' }
            { name: 'NODE_ENV', value: 'production' }
            { name: 'LOGGER', value: 'true' }
            { name: 'SALT', value: '12' }
            { name: 'DB_CONNECT', secretRef: 'db-connect' }
            { name: 'SECRET_KEY', secretRef: 'secret-key' }
            { name: 'GOOGLE_AUTH_CLIENT_ID', secretRef: 'google-auth-client-id' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 5
              failureThreshold: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
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
}

@description('The resource ID of the Container Apps Environment')
output environmentId string = containerAppsEnvironment.id

@description('The FQDN of the backend Container App')
output backendFqdn string = backendApp.properties.configuration.ingress.fqdn

@description('The backend app URL')
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'


@description('The name of the backend Container App')
output backendAppName string = backendApp.name
