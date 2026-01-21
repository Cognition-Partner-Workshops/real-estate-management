import { useState, useCallback, type ReactElement, type FormEvent } from 'react';

import { Button, Input, Select, Textarea, Modal } from '@/components/ui';
import { useUpdateProperty, useRestriction } from '@/hooks';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { PropertyType, TransactionType, PaymentFrequency } from '@/types';
import type { Coord, Property } from '@/types';

import PropertyCoordinatesModal from './PropertyCoordinatesModal';

interface PropertyEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
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

const getInitialFormData = (property: Property | null): FormData => {
  if (!property) {
    return {
      name: '',
      address: '',
      description: '',
      type: PropertyType.Residential,
      transactionType: TransactionType.ForSale,
      price: '',
      paymentFrequency: PaymentFrequency.Monthly,
      currency: '',
      features: '',
      lat: '0',
      lng: '0',
    };
  }

  return {
    name: property.name || '',
    address: property.address || '',
    description: property.description || '',
    type: property.type || PropertyType.Residential,
    transactionType: property.transactionType || TransactionType.ForSale,
    price: property.price?.toString() || '',
    paymentFrequency: property.paymentFrequency || PaymentFrequency.Monthly,
    currency: property.currency || '',
    features: property.features?.join(', ') || '',
    lat: property.position?.lat?.toString() || '0',
    lng: property.position?.lng?.toString() || '0',
  };
};

function PropertyEditForm({
  isOpen,
  onClose,
  property,
  onSuccess,
}: PropertyEditFormProps): ReactElement {
  const formKey = isOpen && property ? property.property_id : 'closed';
  
  return (
    <PropertyEditFormInner
      key={formKey}
      isOpen={isOpen}
      onClose={onClose}
      property={property}
      onSuccess={onSuccess}
    />
  );
}

function PropertyEditFormInner({
  isOpen,
  onClose,
  property,
  onSuccess,
}: PropertyEditFormProps): ReactElement {
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(property));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isMapOpen, setIsMapOpen] = useState(false);

  const dispatch = useAppDispatch();
  const updatePropertyMutation = useUpdateProperty();
  const { restricted, showAlert } = useRestriction();

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
      dispatch(addNotification({ message, type }));
    },
    [dispatch]
  );


  const validateForm = useCallback((): boolean => {
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
    if (formData.currency && formData.currency.length > 3) {
      newErrors.currency = 'Currency must be 3 characters or less';
    }
    if (!formData.lat || formData.lat === '0') {
      newErrors.lat = 'Please set property coordinates';
    }
    if (!formData.lng || formData.lng === '0') {
      newErrors.lng = 'Please set property coordinates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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

    if (!property) {
      return;
    }

    if (!validateForm()) {
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

    const updatedPropertyData: Partial<Property> = {
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
      const result = await updatePropertyMutation.mutateAsync({
        id: property.property_id,
        property: updatedPropertyData,
      });
      if (result.success && result.data) {
        showNotification('Property updated successfully', 'success');
        onSuccess?.(result.data);
        onClose();
      } else {
        showNotification(result.message || 'Failed to update property', 'error');
      }
    } catch {
      showNotification('Failed to update property', 'error');
    }
  };

  const handleClose = (): void => {
    setFormData(getInitialFormData(null));
    setErrors({});
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Property Details" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={errors.address}
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              placeholder="..."
              required
            />

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
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
              <div className="flex gap-4">
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

            <div className="border-t border-gray-200 pt-4">
              {formData.transactionType === TransactionType.ForRent && (
                <Select
                  label="Payment Frequency"
                  value={formData.paymentFrequency}
                  onChange={(e) => handleInputChange('paymentFrequency', e.target.value as PaymentFrequency)}
                  options={PAYMENT_FREQUENCIES}
                />
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  error={errors.price}
                />

                <Input
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  error={errors.currency}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Textarea
                label="Features"
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                helperText="For multiple features separate with comma ( , )"
                placeholder="bedroom, kitchen, ..."
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
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

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              size="lg"
              isLoading={updatePropertyMutation.isPending}
              disabled={updatePropertyMutation.isPending}
            >
              Update
            </Button>
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

export default PropertyEditForm;
