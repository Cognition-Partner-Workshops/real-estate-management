import { useState, useCallback, type ReactElement, type FormEvent } from 'react';

import { Button, Input, Select, Textarea, Modal } from '@/components/ui';
import { useCreateProperty, useRestriction } from '@/hooks';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { PropertyType, TransactionType, PaymentFrequency } from '@/types';
import type { Coord, Property } from '@/types';

import PropertyCoordinatesModal from './PropertyCoordinatesModal';

interface PropertyNewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (property: Property) => void;
}

interface FormData {
  name: string;
  address: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: string;
  paymentFrequency: PaymentFrequency;
  currency: string;
  features: string;
  lat: string;
  lng: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  description?: string;
  price?: string;
  currency?: string;
  lat?: string;
  lng?: string;
}

const PROPERTY_TYPES = [
  { label: 'Residential', value: PropertyType.Residential },
  { label: 'Commercial', value: PropertyType.Commercial },
  { label: 'Industrial', value: PropertyType.Industrial },
  { label: 'Land', value: PropertyType.Land },
];

const TRANSACTION_TYPES = [
  { label: 'For Sale', value: TransactionType.ForSale },
  { label: 'For Rent', value: TransactionType.ForRent },
];

const PAYMENT_FREQUENCIES = [
  { label: 'Yearly', value: PaymentFrequency.Yearly },
  { label: 'Quarterly', value: PaymentFrequency.Quarterly },
  { label: 'Monthly', value: PaymentFrequency.Monthly },
  { label: 'Bi-Weekly', value: PaymentFrequency.BiWeekly },
  { label: 'Weekly', value: PaymentFrequency.Weekly },
  { label: 'Daily', value: PaymentFrequency.Daily },
];

const initialFormData: FormData = {
  name: '',
  address: '',
  description: '',
  type: PropertyType.Residential,
  transactionType: TransactionType.ForSale,
  price: '',
  paymentFrequency: PaymentFrequency.Monthly,
  currency: 'PHP',
  features: '',
  lat: '0',
  lng: '0',
};

function PropertyNewForm({
  isOpen,
  onClose,
  onSuccess,
}: PropertyNewFormProps): ReactElement {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isMapOpen, setIsMapOpen] = useState(false);

  const dispatch = useAppDispatch();
  const createPropertyMutation = useCreateProperty();
  const { restricted, showAlert } = useRestriction();

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
      dispatch(addNotification({ message, type }));
    },
    [dispatch]
  );

  const validateStepOne = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 4) {
      newErrors.name = 'Name must be at least 4 characters';
    }
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.address, formData.description]);

  const validateStepTwo = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (formData.currency && formData.currency.length > 3) {
      newErrors.currency = 'Currency must be 3 characters or less';
    }
    if (formData.currency && !/^[a-zA-Z]*$/.test(formData.currency)) {
      newErrors.currency = 'Currency must contain only letters';
    }
    if (!formData.lat || formData.lat === '0') {
      newErrors.lat = 'Please set property coordinates';
    }
    if (!formData.lng || formData.lng === '0') {
      newErrors.lng = 'Please set property coordinates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.currency, formData.lat, formData.lng]);

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCoordinatesConfirm = (coord: Coord): void => {
    setFormData((prev) => ({
      ...prev,
      lat: coord.lat.toString(),
      lng: coord.lng.toString(),
    }));
    setIsMapOpen(false);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (step === 1) {
      if (validateStepOne()) {
        setStep(2);
      }
      return;
    }

    if (!validateStepTwo()) {
      showNotification('Error: Invalid, please fill the form properly', 'error');
      return;
    }

    if (restricted) {
      onClose();
      showAlert();
      return;
    }

    const features = formData.features
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f !== '');

    const propertyData = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      type: formData.type,
      transactionType: formData.transactionType,
      price: parseFloat(formData.price) || 0,
      paymentFrequency: formData.paymentFrequency,
      currency: formData.currency,
      features,
      position: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
    };

    try {
      const result = await createPropertyMutation.mutateAsync(propertyData);
      if (result.success && result.data) {
        showNotification('Property created successfully', 'success');
        onSuccess?.(result.data);
        handleClose();
      } else {
        showNotification(result.message || 'Failed to create property', 'error');
      }
    } catch {
      showNotification('Failed to create property', 'error');
    }
  };

  const handleClose = (): void => {
    setStep(1);
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const handleBack = (): void => {
    setStep(1);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Add New Property" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-sm text-gray-500">
            Step {step} / 2
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                helperText="Enter property name"
                required
              />

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
                helperText="Enter property physical address"
                required
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={errors.description}
                helperText="Enter property description"
                placeholder="..."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="space-y-2">
                  {PROPERTY_TYPES.map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => handleInputChange('type', e.target.value as PropertyType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700 capitalize">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="space-y-2">
                  {TRANSACTION_TYPES.map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transactionType"
                        value={type.value}
                        checked={formData.transactionType === type.value}
                        onChange={(e) => handleInputChange('transactionType', e.target.value as TransactionType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {formData.transactionType === TransactionType.ForRent && (
                <Select
                  label="Payment Frequency"
                  value={formData.paymentFrequency}
                  onChange={(e) => handleInputChange('paymentFrequency', e.target.value as PaymentFrequency)}
                  options={PAYMENT_FREQUENCIES}
                />
              )}

              <Input
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                helperText="Enter property price"
              />

              <Input
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                error={errors.currency}
                helperText="Enter property currency (e.g., USD, PHP, SGD)"
                placeholder="USD, PHP, SGD"
              />

              <Textarea
                label="Features"
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                helperText="For multiple features separate with comma ( , )"
                placeholder="bedroom, kitchen, ..."
              />

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Set Marker Position:
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsMapOpen(true)}
                  >
                    Open Map
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Latitude"
                    value={formData.lat}
                    onChange={(e) => handleInputChange('lat', e.target.value)}
                    error={errors.lat}
                    placeholder="Latitude"
                  />
                  <Input
                    label="Longitude"
                    value={formData.lng}
                    onChange={(e) => handleInputChange('lng', e.target.value)}
                    error={errors.lng}
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step === 2 && (
              <Button type="button" variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
            <div className={step === 1 ? 'ml-auto' : ''}>
              <Button
                type="submit"
                variant="success"
                size="lg"
                fullWidth={step === 1}
                isLoading={createPropertyMutation.isPending}
                disabled={createPropertyMutation.isPending}
              >
                {step === 2 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <PropertyCoordinatesModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleCoordinatesConfirm}
        initialCoord={
          formData.lat !== '0' && formData.lng !== '0'
            ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
            : undefined
        }
      />
    </>
  );
}

export default PropertyNewForm;
