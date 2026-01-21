export const EnquiryTopic = {
  Info: 'info',
  Sales: 'sales',
  Schedule: 'schedule',
  Payment: 'payment',
} as const;

export type EnquiryTopic = (typeof EnquiryTopic)[keyof typeof EnquiryTopic];

export interface EnquiryUser {
  user_id: string;
  name?: string;
  email?: string;
  keep: boolean;
}

export interface EnquiryProperty {
  property_id: string;
  name: string;
}

export interface EnquiryReplyTo {
  enquiry_id: string;
  title: string;
  topic: string;
}

export interface Enquiry {
  enquiry_id: string;
  title: string;
  content: string;
  email: string;
  topic: EnquiryTopic;
  property: EnquiryProperty;
  users: {
    from: EnquiryUser;
    to: EnquiryUser;
  };
  read: boolean;
  replyTo?: EnquiryReplyTo;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnquiryPayload {
  title: string;
  content: string;
  email: string;
  topic: EnquiryTopic;
  property: EnquiryProperty;
  userTo: string;
  replyTo?: EnquiryReplyTo;
}
