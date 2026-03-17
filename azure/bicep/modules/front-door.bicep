@description('Name prefix for Front Door resources')
param namePrefix string

@description('Backend Container App FQDN')
param backendFqdn string

@description('Static Web App default hostname')
param staticWebAppHostname string

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Tags to apply to the resources')
param tags object = {}

var skuName = environment == 'prod' ? 'Premium_AzureFrontDoor' : 'Standard_AzureFrontDoor'

resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: '${namePrefix}-fd'
  location: 'global'
  tags: tags
  sku: {
    name: skuName
  }
}

resource wafPolicy 'Microsoft.Network/FrontDoorWebApplicationFirewallPolicies@2022-05-01' = {
  name: replace('${namePrefix}-waf', '-', '')
  location: 'global'
  tags: tags
  sku: {
    name: skuName
  }
  properties: {
    policySettings: {
      mode: environment == 'prod' ? 'Prevention' : 'Detection'
      requestBodyCheck: 'Enabled'
      enabledState: 'Enabled'
    }
    managedRules: {
      managedRuleSets: environment == 'prod' ? [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
        {
          ruleSetType: 'Microsoft_BotManagerRuleSet'
          ruleSetVersion: '1.0'
        }
      ] : []
    }
  }
}

resource securityPolicy 'Microsoft.Cdn/profiles/securityPolicies@2023-05-01' = {
  parent: frontDoorProfile
  name: '${namePrefix}-security-policy'
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'
      wafPolicy: {
        id: wafPolicy.id
      }
      associations: [
        {
          domains: [
            { id: backendEndpoint.id }
            { id: frontendEndpoint.id }
          ]
          patternsToMatch: ['/*']
        }
      ]
    }
  }
}

// Backend origin group and endpoint
resource backendEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: frontDoorProfile
  name: '${namePrefix}-api'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

resource backendOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  parent: frontDoorProfile
  name: 'backend-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/health'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Enabled'
  }
}

resource backendOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = {
  parent: backendOriginGroup
  name: 'backend-container-app'
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

resource backendRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: backendEndpoint
  name: 'backend-route'
  properties: {
    originGroup: {
      id: backendOriginGroup.id
    }
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
  dependsOn: [
    backendOrigin
  ]
}

// Frontend origin group and endpoint
resource frontendEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: frontDoorProfile
  name: '${namePrefix}-web'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

resource frontendOriginGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
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
  }
}

resource frontendOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = {
  parent: frontendOriginGroup
  name: 'frontend-static-web-app'
  properties: {
    hostName: staticWebAppHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: staticWebAppHostname
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

resource frontendRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: frontendEndpoint
  name: 'frontend-route'
  properties: {
    originGroup: {
      id: frontendOriginGroup.id
    }
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
  dependsOn: [
    frontendOrigin
  ]
}

@description('The Front Door API endpoint hostname')
output apiEndpointHostname string = backendEndpoint.properties.hostName

@description('The Front Door web endpoint hostname')
output webEndpointHostname string = frontendEndpoint.properties.hostName

@description('The Front Door profile ID')
output profileId string = frontDoorProfile.id
