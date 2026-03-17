@description('Name prefix for monitoring resources')
param namePrefix string

@description('Location for the resources')
param location string

@description('Log Analytics retention in days')
param retentionInDays int = 30

@description('Tags to apply to the resources')
param tags object = {}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${namePrefix}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionInDays
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${namePrefix}-appinsights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    RetentionInDays: retentionInDays
  }
}

@description('The resource ID of the Log Analytics Workspace')
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id

@description('The customer ID of the Log Analytics Workspace')
output logAnalyticsCustomerId string = logAnalyticsWorkspace.properties.customerId

@description('The shared key of the Log Analytics Workspace')
output logAnalyticsSharedKey string = logAnalyticsWorkspace.listKeys().primarySharedKey

@description('The instrumentation key of Application Insights')
output appInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey

@description('The connection string of Application Insights')
output appInsightsConnectionString string = applicationInsights.properties.ConnectionString
