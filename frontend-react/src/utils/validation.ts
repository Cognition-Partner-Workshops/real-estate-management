import { z } from 'zod';
import { PropertyType, TransactionType, PaymentFrequency, EnquiryTopic } from '@/types';

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = authSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  passwordCurrent: z.string().min(6, 'Current password is required'),
  passwordNew: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.passwordNew === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const coordSchema = z.object({
  lat: z.number({ invalid_type_error: 'Latitude is required' }),
  lng: z.number({ invalid_type_error: 'Longitude is required' }),
});

export const propertySchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.nativeEnum(PropertyType, { errorMap: () => ({ message: 'Property type is required' }) }),
  transactionType: z.nativeEnum(TransactionType, { errorMap: () => ({ message: 'Transaction type is required' }) }),
  price: z.number().min(1, 'Price must be greater than 0'),
  paymentFrequency: z.nativeEnum(PaymentFrequency).optional(),
  position: coordSchema,
  features: z.array(z.string()).optional(),
  currency: z.string().optional(),
  contactNumber: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.transactionType === TransactionType.ForRent) {
      return data.paymentFrequency !== undefined;
    }
    return true;
  },
  {
    message: 'Payment frequency is required for rental properties',
    path: ['paymentFrequency'],
  }
);

export const enquirySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
  email: z.string().email('Please enter a valid email address'),
  topic: z.nativeEnum(EnquiryTopic, { errorMap: () => ({ message: 'Topic is required' }) }),
});

export const mortgageSchema = z.object({
  price: z.number().min(1, 'Price must be greater than 0'),
  downPayment: z.number().min(0, 'Down payment cannot be negative'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate cannot exceed 100%'),
  term: z.number().min(1, 'Term must be at least 1 year').max(30, 'Term cannot exceed 30 years'),
  propertyTax: z.number().min(0).optional(),
  insurance: z.number().min(0).optional(),
}).refine(
  (data) => data.downPayment < data.price,
  {
    message: 'Down payment must be less than the price',
    path: ['downPayment'],
  }
);

export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  about: z.string().max(500, 'About must be less than 500 characters').optional(),
  address: z.string().optional(),
});

export type AuthFormData = z.infer<typeof authSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type EnquiryFormData = z.infer<typeof enquirySchema>;
export type MortgageFormData = z.infer<typeof mortgageSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
