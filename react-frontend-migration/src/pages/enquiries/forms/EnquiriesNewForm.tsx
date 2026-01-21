import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { useCreateEnquiry } from '@/hooks/useEnquiries';
import { useRestriction } from '@/hooks/useRestriction';
import { Button, Input, Select, Textarea, Modal, NeedSigninContinue } from '@/components/ui';
import { EnquiryTopic } from '@/types';
import type { Property, CreateEnquiryPayload } from '@/types';

interface ReplyToInfo {
  enquiry_id: string;
  title: string;
  topic: string;
}

interface EnquiriesNewFormProps {
  property?: Partial<Property>;
  userTo: string;
  replyTo?: ReplyToInfo;
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

interface FormData {
  title: string;
  email: string;
  content: string;
  topic: string;
}

const TOPIC_OPTIONS = [
  { value: EnquiryTopic.Schedule, label: 'Schedule Visit' },
  { value: EnquiryTopic.Payment, label: 'Payment' },
  { value: EnquiryTopic.Sales, label: 'Sales' },
  { value: EnquiryTopic.Info, label: 'Information' },
];

function EnquiriesNewForm({
  property,
  userTo,
  replyTo,
  onSuccess,
  onClose,
  isModal = false,
}: EnquiriesNewFormProps): ReactElement {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { restricted, showAlert } = useRestriction();
  const createEnquiryMutation = useCreateEnquiry();

  const [showSigninModal, setShowSigninModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      email: '',
      content: '',
      topic: EnquiryTopic.Info,
    },
  });

  const showToast = (message: string, type: 'success' | 'error'): void => {
    dispatch(addNotification({ type, message }));
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    if (restricted) {
      if (onClose) {
        onClose();
      }
      showAlert();
      return;
    }

    if (!isAuthenticated) {
      setShowSigninModal(true);
      return;
    }

    const payload: CreateEnquiryPayload = {
      subject: data.title,
      message: data.content,
      topic: data.topic as CreateEnquiryPayload['topic'],
      to_user_id: userTo,
      ...(property?.property_id && { property_id: property.property_id }),
      ...(replyTo && { replyTo: replyTo.enquiry_id }),
    };

    try {
      await createEnquiryMutation.mutateAsync(payload);
      showToast('Success, message is sent.', 'success');
      reset();
      if (onSuccess) {
        onSuccess();
      }
      if (isModal && onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong, please try again later.';
      showToast(`Error: ${errorMessage}`, 'error');
    }
  };

  const handleCloseSigninModal = (): void => {
    setShowSigninModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          type="text"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 8,
              message: 'Title is too short (minimum 8 characters)',
            },
          })}
          error={errors.title?.message}
        />

        <Input
          label="Email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Textarea
          label="Message"
          {...register('content', {
            required: 'Message is required',
            minLength: {
              value: 8,
              message: 'Message content is too short (minimum 8 characters)',
            },
          })}
          error={errors.content?.message}
          className="min-h-[200px]"
        />

        <Select
          label="Topic"
          options={TOPIC_OPTIONS}
          {...register('topic', {
            required: 'Topic is required',
          })}
          error={errors.topic?.message}
        />

        <Button
          type="submit"
          variant="success"
          size="lg"
          fullWidth
          isLoading={isSubmitting || createEnquiryMutation.isPending}
          disabled={isSubmitting || createEnquiryMutation.isPending}
        >
          Submit
        </Button>
      </form>

      <Modal
        isOpen={showSigninModal}
        onClose={handleCloseSigninModal}
        title="Sign In Required"
        size="lg"
      >
        <NeedSigninContinue isModal onClose={handleCloseSigninModal} />
      </Modal>
    </>
  );
}

export default EnquiriesNewForm;
