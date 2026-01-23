export interface EnquiryProperty {
  property_id: string;
  name: string;
}

export interface EnquiryUser {
  user_id: string;
  keep: boolean;
}

export interface Enquiry {
  enquiry_id: string;
  content: string;
  email: string;
  title: string;
  topic: EnquiryTopic;
  read: boolean;
  property: EnquiryProperty;
  replyTo?: {
    enquiry_id: string;
    title: string;
    topic: string;
  };
  users: {
    from: EnquiryUser;
    to: EnquiryUser;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EnquiryCreate {
  content: string;
  email: string;
  title: string;
  topic: EnquiryTopic;
  property: EnquiryProperty;
  replyTo?: {
    id: string;
    title: string;
    topic: string;
  };
  userTo: string;
}

export enum EnquiryTopic {
  Info = 'info',
  Sales = 'sales',
  Schedule = 'schedule',
  Payment = 'payment',
}

export interface EnquiryFilters {
  topic?: EnquiryTopic;
  direction?: 'sent' | 'received';
}
