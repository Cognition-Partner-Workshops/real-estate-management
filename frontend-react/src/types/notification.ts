import type { Activity, UserNotification } from './user';
import type { Enquiry } from './enquiry';
import type { Property } from './property';

export enum SocketNotificationType {
  Activity = 'ACTIVITY',
  Enquiry = 'ENQUIRY',
  Logout = 'USER_LOGOUT',
  User = 'USER',
}

export interface WebSocketNotification {
  type: SocketNotificationType;
  payload: Enquiry | Property | Activity | UserNotification;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
