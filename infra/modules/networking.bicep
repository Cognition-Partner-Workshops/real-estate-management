// ============================================================================
// Module: networking.bicep
// Description: Virtual Network with subnets for Azure Container Apps
//              environment and private endpoints.
// ============================================================================

@description('Azure region for resource deployment.')
param location string

@description('Resource name prefix for naming convention.')
param namePrefix string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Address space for the virtual network.')
param vnetAddressPrefix string = '10.0.0.0/16'

@description('Address prefix for the Container Apps Environment subnet.')
param acaSubnetAddressPrefix string = '10.0.0.0/23'

@description('Address prefix for private endpoints subnet.')
param privateEndpointsSubnetAddressPrefix string = '10.0.2.0/24'

// ============================================================================
// Virtual Network
// ============================================================================

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: '${namePrefix}-vnet'
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
    subnets: [
      {
        name: 'snet-aca'
        properties: {
          addressPrefix: acaSubnetAddressPrefix
          networkSecurityGroup: {
            id: acaNsg.id
          }
          delegations: [
            {
              name: 'Microsoft.App.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
        }
      }
      {
        name: 'snet-private-endpoints'
        properties: {
          addressPrefix: privateEndpointsSubnetAddressPrefix
          privateEndpointNetworkPolicies: 'Disabled'
          networkSecurityGroup: {
            id: privateEndpointNsg.id
          }
        }
      }
    ]
  }
}

// ============================================================================
// Network Security Groups
// ============================================================================

resource acaNsg 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: '${namePrefix}-nsg-aca'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowHTTPSInbound'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      {
        name: 'AllowHTTPInbound'
        properties: {
          priority: 110
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '80'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

resource privateEndpointNsg 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: '${namePrefix}-nsg-pe'
  location: location
  tags: tags
  properties: {
    securityRules: []
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the virtual network.')
output vnetId string = vnet.id

@description('Name of the virtual network.')
output vnetName string = vnet.name

@description('Resource ID of the ACA subnet.')
output acaSubnetId string = vnet.properties.subnets[0].id

@description('Resource ID of the private endpoints subnet.')
output privateEndpointsSubnetId string = vnet.properties.subnets[1].id
