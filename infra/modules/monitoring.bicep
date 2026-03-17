// ============================================================================
// Module: monitoring.bicep
// Description: Log Analytics Workspace and Application Insights for
//              observability across the Container Apps environment.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Log Analytics workspace SKU.')
@allowed([
  'Free'
  'PerGB2018'
  'Standalone'
])
param logAnalyticsSku string = 'PerGB2018'

@description('Log Analytics data retention in days.')
@minValue(30)
@maxValue(730)
param retentionInDays int = 30

// ============================================================================
// Log Analytics Workspace
// ============================================================================

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${namePrefix}-law'
  location: location
  tags: tags
  properties: {
    sku: {
      name: logAnalyticsSku
    }
    retentionInDays: retentionInDays
  }
}

// ============================================================================
// Application Insights
// ============================================================================

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${namePrefix}-ai'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Log Analytics workspace.')
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id

@description('Name of the Log Analytics workspace.')
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name

@description('Customer ID of the Log Analytics workspace (used by ACA environment).')
output logAnalyticsCustomerId string = logAnalyticsWorkspace.properties.customerId

@description('Primary shared key for Log Analytics workspace.')
#disable-next-line outputs-should-not-contain-secrets
output logAnalyticsSharedKey string = logAnalyticsWorkspace.listKeys().primarySharedKey

@description('Resource ID of Application Insights.')
output appInsightsId string = appInsights.id

@description('Name of Application Insights.')
output appInsightsName string = appInsights.name

@description('Application Insights instrumentation key.')
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey

@description('Application Insights connection string.')
output appInsightsConnectionString string = appInsights.properties.ConnectionString
