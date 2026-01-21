export const SocketNotificationType = {
  Activity: 'ACTIVITY',
  Enquiry: 'ENQUIRY',
  Logout: 'USER_LOGOUT',
  User: 'USER',
} as const;

export type SocketNotificationType = (typeof SocketNotificationType)[keyof typeof SocketNotificationType];

export const UserNotificationType = {
  Account: 'ACCOUNT',
  Enquiry: 'ENQUIRY',
  Property: 'PROPERTY',
  System: 'SYSTEM',
} as const;

export type UserNotificationType = (typeof UserNotificationType)[keyof typeof UserNotificationType];
