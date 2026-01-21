import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Card, Input, Textarea, AlertCard } from '@/components/ui';

interface ContactFormData {
  email: string;
  name: string;
  message: string;
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
  className?: string;
}

function ContactForm({ onSubmit, className = '' }: ContactFormProps): ReactElement {
  const [sent, setSent] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      name: '',
      message: '',
    },
  });

  const handleFormSubmit = (data: ContactFormData): void => {
    console.log(data);
    setShowErrors(false);
    setSent(true);
    reset();

    if (onSubmit) {
      onSubmit(data);
    }
  };

  const handleFormError = (): void => {
    setShowErrors(true);
  };

  return (
    <Card className={className}>
      <Card.Header>
        <h2 className="capitalize text-[20px] lg:text-[24px] px-3 lg:px-6 pt-4 font-semibold">
          Contact Form
        </h2>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
          <div className="space-y-4">
            <div>
              <Input
                label="Email:"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email is invalid',
                  },
                })}
              />
              {showErrors && errors.email && (
                <div className="mt-2">
                  <AlertCard variant="error">Email is invalid.</AlertCard>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Name:"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {showErrors && errors.name && (
                <div className="mt-2">
                  <AlertCard variant="error">Name must be filled correctly.</AlertCard>
                </div>
              )}
            </div>

            <div>
              <Textarea
                label="Message:"
                placeholder="Must be at least 10 characters long"
                {...register('message', {
                  required: 'Message is required',
                  minLength: {
                    value: 10,
                    message: 'Message must be at least 10 characters long',
                  },
                })}
              />
              {showErrors && errors.message && (
                <div className="mt-2">
                  <AlertCard variant="error">
                    Make sure the message is filled correctly.
                  </AlertCard>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={sent}
            className="mt-4"
          >
            {sent ? 'Message Sent' : 'Send message'}
          </Button>
        </form>
      </Card.Body>
    </Card>
  );
}

export default ContactForm;
