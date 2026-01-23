export interface User {
  user_id: string;
  email: string;
  fullName: string;
  about?: string;
  address?: string;
  verified?: boolean;
}

export interface UserSignedIn extends User {
  accessToken: string;
}

export interface UserDetails extends User {
  createdAt?: string;
  updatedAt?: string;
  properties?: string[];
  activities?: Activity[];
  notifications?: UserNotification[];
}

export interface Activity {
  activity_id: string;
  description: string;
  type: string;
  createdAt: string;
}

export interface UserNotification {
  notification_id: string;
  message: string;
  type: UserNotificationType;
  read: boolean;
  expiresAt?: string;
  createdAt: string;
}

export enum UserNotificationType {
  Account = 'ACCOUNT',
  Enquiry = 'ENQUIRY',
  Property = 'PROPERTY',
  System = 'SYSTEM',
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  fullName: string;
}
