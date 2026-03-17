// ============================================================================
// Module: front-door.bicep
// Description: Azure Front Door (Standard tier) with routing rules for
//              frontend, backend API, WebSocket, and blob storage origins.
// ============================================================================

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('FQDN of the backend container app.')
param backendFqdn string

@description('FQDN of the frontend container app.')
param frontendFqdn string

@description('Primary blob endpoint hostname (e.g., storageaccount.blob.core.windows.net).')
param blobEndpointHostname string

@description('Custom domain name for Front Door (e.g., app.example.com). Leave empty to skip custom domain.')
param customDomainName string = ''

@description('Front Door SKU.')
@allowed([
  'Standard_AzureFrontDoor'
  'Premium_AzureFrontDoor'
])
param skuName string = 'Standard_AzureFrontDoor'

// ============================================================================
// Front Door Profile
// ============================================================================

resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-07-01-preview' = {
  name: '${namePrefix}-afd'
  location: 'global'
  tags: tags
  sku: {
    name: skuName
  }
}

// ============================================================================
// Front Door Endpoint
// ============================================================================

resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-07-01-preview' = {
  parent: frontDoorProfile
  name: '${namePrefix}-endpoint'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

// ============================================================================
// Origin Groups
// ============================================================================

resource frontendOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-07-01-preview' = {
  parent: frontDoorProfile
  name: 'frontend-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 60
    }
    sessionAffinityState: 'Disabled'
  }
}

resource backendOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-07-01-preview' = {
  parent: frontDoorProfile
  name: 'backend-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Enabled'
  }
}

resource storageOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-07-01-preview' = {
  parent: frontDoorProfile
  name: 'storage-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/property-images'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 120
    }
    sessionAffinityState: 'Disabled'
  }
}

// ============================================================================
// Origins
// ============================================================================

resource frontendOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-07-01-preview' = {
  parent: frontendOriginGroup
  name: 'frontend-aca'
  properties: {
    hostName: frontendFqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: frontendFqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

resource backendOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-07-01-preview' = {
  parent: backendOriginGroup
  name: 'backend-aca'
  properties: {
    hostName: backendFqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: backendFqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

resource storageOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-07-01-preview' = {
  parent: storageOriginGroup
  name: 'blob-storage'
  properties: {
    hostName: blobEndpointHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: blobEndpointHostname
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

// ============================================================================
// Rule Sets
// ============================================================================

resource webSocketRuleSet 'Microsoft.Cdn/profiles/ruleSets@2023-07-01-preview' = {
  parent: frontDoorProfile
  name: 'WebSocketRules'
}

resource webSocketUpgradeRule 'Microsoft.Cdn/profiles/ruleSets/rules@2023-07-01-preview' = {
  parent: webSocketRuleSet
  name: 'EnableWebSocketUpgrade'
  properties: {
    order: 1
    conditions: [
      {
        name: 'RequestHeader'
        parameters: {
          typeName: 'DeliveryRuleRequestHeaderConditionParameters'
          selector: 'Upgrade'
          operator: 'Equal'
          matchValues: ['websocket']
          transforms: ['Lowercase']
          negateCondition: false
        }
      }
    ]
    actions: [
      {
        name: 'RouteConfigurationOverride'
        parameters: {
          typeName: 'DeliveryRuleRouteConfigurationOverrideActionParameters'
          originGroupOverride: {
            originGroup: {
              id: backendOriginGroup.id
            }
            forwardingProtocol: 'HttpsOnly'
          }
        }
      }
    ]
    matchProcessingBehavior: 'Continue'
  }
}

// ============================================================================
// Routes
// ============================================================================

resource defaultRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-07-01-preview' = {
  parent: frontDoorEndpoint
  name: 'default-route'
  properties: {
    originGroup: {
      id: frontendOriginGroup.id
    }
    originPath: '/'
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
  }
  dependsOn: [
    frontendOrigin
  ]
}

resource apiRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-07-01-preview' = {
  parent: frontDoorEndpoint
  name: 'api-route'
  properties: {
    originGroup: {
      id: backendOriginGroup.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/api/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
  }
  dependsOn: [
    backendOrigin
  ]
}

resource websocketRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-07-01-preview' = {
  parent: frontDoorEndpoint
  name: 'websocket-route'
  properties: {
    originGroup: {
      id: backendOriginGroup.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/websocket'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
    ruleSets: [
      {
        id: webSocketRuleSet.id
      }
    ]
  }
  dependsOn: [
    backendOrigin
    webSocketUpgradeRule
  ]
}

resource uploadsRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-07-01-preview' = {
  parent: frontDoorEndpoint
  name: 'uploads-route'
  properties: {
    originGroup: {
      id: storageOriginGroup.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/uploads/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
  }
  dependsOn: [
    storageOrigin
  ]
}

// ============================================================================
// Custom Domain (conditional)
// ============================================================================

resource customDomain 'Microsoft.Cdn/profiles/customDomains@2023-07-01-preview' = if (!empty(customDomainName)) {
  parent: frontDoorProfile
  name: !empty(customDomainName) ? replace(customDomainName, '.', '-') : 'placeholder'
  properties: {
    hostName: customDomainName
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Front Door profile name.')
output frontDoorName string = frontDoorProfile.name

@description('Front Door endpoint hostname.')
output frontDoorEndpointHostname string = frontDoorEndpoint.properties.hostName

@description('Front Door profile ID.')
output frontDoorProfileId string = frontDoorProfile.id

@description('Front Door endpoint ID.')
output frontDoorEndpointId string = frontDoorEndpoint.id
