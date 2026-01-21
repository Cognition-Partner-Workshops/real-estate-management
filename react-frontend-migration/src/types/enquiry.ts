export const EnquiryTopic = {
  Info: 'info',
  Sales: 'sales',
  Schedule: 'schedule',
  Payment: 'payment',
} as const;

export type EnquiryTopic = (typeof EnquiryTopic)[keyof typeof EnquiryTopic];

export interface EnquiryUser {
  user_id: string;
  name: string;
  email: string;
  keep: boolean;
}

export interface Enquiry {
  enquiry_id: string;
  subject: string;
  message: string;
  topic: EnquiryTopic;
  property_id?: string;
  users: {
    from: EnquiryUser;
    to: EnquiryUser;
  };
  read: boolean;
  replyTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnquiryPayload {
  subject: string;
  message: string;
  topic: EnquiryTopic;
  property_id?: string;
  to_user_id: string;
  replyTo?: string;
}
