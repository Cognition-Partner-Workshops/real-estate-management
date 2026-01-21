export interface Activity {
  activity_id: string;
  action: string;
  description: string;
  property_id?: string;
  enquiry_id?: string;
  createdAt: string;
}

export interface User {
  user_id: string;
  name: string;
  fullName: string;
  email: string;
  avatar?: string;
  about?: string;
  address?: string;
  verified?: boolean;
  properties?: string[];
  activities?: Activity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSignedIn {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  about?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
