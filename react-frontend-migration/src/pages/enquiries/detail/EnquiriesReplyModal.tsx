import { useState, type ReactElement } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { useCreateEnquiry } from '@/hooks/useEnquiries';
import { useRestriction } from '@/hooks/useRestriction';
import { useAppSelector } from '@/store';
import type { EnquiryProperty, EnquiryReplyTo, EnquiryTopic } from '@/types';

interface EnquiriesReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: EnquiryProperty;
  replyTo: EnquiryReplyTo;
  userTo: string;
}

const topicOptions = [
  { value: 'schedule', label: 'Schedule Visit' },
  { value: 'payment', label: 'Payment' },
  { value: 'sales', label: 'Sales' },
  { value: 'info', label: 'Information' },
];

function EnquiriesReplyModal({
  isOpen,
  onClose,
  property,
  replyTo,
  userTo,
}: EnquiriesReplyModalProps): ReactElement {
  const { restricted, showAlert } = useRestriction();
  const user = useAppSelector((state) => state.user.user);
  const createEnquiryMutation = useCreateEnquiry();

  const [formData, setFormData] = useState({
    title: '',
    email: user?.email || '',
    content: '',
    topic: 'info' as EnquiryTopic,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 8) {
      newErrors.title = 'Title must be at least 8 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.content || formData.content.length < 8) {
      newErrors.content = 'Message must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    if (restricted) {
      onClose();
      showAlert();
      return;
    }

    try {
      await createEnquiryMutation.mutateAsync({
        title: formData.title,
        email: formData.email,
        content: formData.content,
        topic: formData.topic,
        property,
        userTo,
        replyTo,
      });

      setFormData({
        title: '',
        email: user?.email || '',
        content: '',
        topic: 'info',
      });
      onClose();
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reply Enquiry" size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter title"
            error={errors.title}
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email"
            error={errors.email}
          />
        </div>

        <div>
          <Textarea
            label="Message"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter your message"
            rows={6}
            error={errors.content}
          />
        </div>

        <div>
          <Select
            label="Topic"
            value={formData.topic}
            onChange={(e) =>
              handleInputChange('topic', e.target.value as EnquiryTopic)
            }
            options={topicOptions}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={createEnquiryMutation.isPending}
          >
            {createEnquiryMutation.isPending ? 'Sending...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EnquiriesReplyModal;
