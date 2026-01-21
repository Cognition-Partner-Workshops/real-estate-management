import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button, Input, Textarea, Select, AlertCard, Modal, NeedSigninContinue } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { useCreateEnquiry } from '@/hooks';
import { useRestriction } from '@/hooks/useRestriction';
import type { Property, EnquiryTopic, CreateEnquiryPayload } from '@/types';

interface EnquiryFormData {

  title: string;
  email: string;
  content: string;
  topic: EnquiryTopic;
}

interface EnquiryNewFormProps {
  property: Property;
  userTo: string;
  replyTo?: {
    enquiry_id: string;
    title: string;
    topic: string;
  };
}

const TOPIC_OPTIONS = [
  { value: 'schedule', label: 'Schedule Visit' },
  { value: 'payment', label: 'Payment' },
  { value: 'sales', label: 'Sales' },
  { value: 'info', label: 'Information' },
];

function EnquiryNewForm({ property, userTo, replyTo }: EnquiryNewFormProps): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { restricted, showAlert } = useRestriction();
  const createEnquiryMutation = useCreateEnquiry();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [showSigninModal, setShowSigninModal] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    mode: 'onSubmit',
    defaultValues: {
      title: replyTo?.title || '',
      email: '',
      content: '',
      topic: (replyTo?.topic as EnquiryTopic) || 'info',
    },
  });

  const handleFormSubmit = async (data: EnquiryFormData): Promise<void> => {
    setShowErrors(false);

    if (restricted) {
      showAlert();
      return;
    }

    if (!isAuthenticated) {
      setShowSigninModal(true);
      return;
    }

    const payload: CreateEnquiryPayload = {
      title: data.title,
      content: data.content,
      email: data.email,
      topic: data.topic,
      property: {
        property_id: property.property_id,
        name: property.name,
      },
      userTo: userTo,
      ...(replyTo
        ? {
            replyTo: {
              enquiry_id: replyTo.enquiry_id,
              title: replyTo.title,
              topic: replyTo.topic,
            },
          }
        : {}),
    };

    try {
      await createEnquiryMutation.mutateAsync(payload);
      reset();
      dispatch(
        addNotification({
          type: 'success',
          message: 'Success, message is sent.',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Error: Something went wrong, please try again later.',
        })
      );
    }
  };

  const handleFormError = (): void => {
    setShowErrors(true);
  };

  const handleSigninRedirect = (): void => {
    setShowSigninModal(false);
    navigate('/user/signin');
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
        <div className="space-y-4">
          <div>
            <Input
              label="Title:"
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 8,
                  message: 'Title must be at least 8 characters',
                },
              })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {showErrors && errors.title && (
              <div className="mt-2">
                <AlertCard variant="error">Title is too short.</AlertCard>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Email:"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {showErrors && errors.email && (
              <div className="mt-2">
                <AlertCard variant="error">Invalid email.</AlertCard>
              </div>
            )}
          </div>

          <div>
            <Textarea
              label="Message:"
              placeholder="Must be at least 8 characters long"
              {...register('content', {
                required: 'Message is required',
                minLength: {
                  value: 8,
                  message: 'Message must be at least 8 characters',
                },
              })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {showErrors && errors.content && (
              <div className="mt-2">
                <AlertCard variant="error">Message content is too short.</AlertCard>
              </div>
            )}
          </div>

          <div>
            <Select
              label="Topic:"
              options={TOPIC_OPTIONS}
              {...register('topic', { required: 'Topic is required' })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="success"
          fullWidth
          isLoading={createEnquiryMutation.isPending}
          disabled={createEnquiryMutation.isPending}
          className="mt-4"
          size="lg"
        >
          Submit
        </Button>
      </form>

      <Modal
        isOpen={showSigninModal}
        onClose={() => setShowSigninModal(false)}
        size="lg"
      >
        <NeedSigninContinue
          isModal
          onClose={handleSigninRedirect}
        />
      </Modal>
    </>
  );
}

export default EnquiryNewForm;
