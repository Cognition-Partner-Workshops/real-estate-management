import { useState, useMemo, useCallback, useRef, useEffect, type ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useProperty, useDeleteProperty } from '@/hooks';
import { useRestriction } from '@/hooks/useRestriction';
import { useAppSelector, useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import {
  Card,
  Button,
  PropertyBadge,
  ActionPopup,
  Footer,
  Modal,
} from '@/components/ui';
import MortgageCoreCalc from '@/pages/mortgage-calc/MortgageCoreCalc';
import { TransactionType } from '@/types';

import { PropertyGallery, EnquiryNewForm } from './detail';

function PropertyDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { restricted, showAlert } = useRestriction();
  const deletePropertyMutation = useDeleteProperty();

  const actionPopupRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const [showActionPopup, setShowActionPopup] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const { data: propertyResponse, isLoading, error } = useProperty(id);
  const property = propertyResponse?.data;

  const currentUser = useAppSelector((state) => state.user.user);

  const isOwner = useMemo((): boolean => {
    if (!property || !currentUser) return false;
    return property.user_id === currentUser.user_id;
  }, [property, currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        actionPopupRef.current &&
        !actionPopupRef.current.contains(event.target as Node) &&
        actionButtonRef.current &&
        !actionButtonRef.current.contains(event.target as Node)
      ) {
        setShowActionPopup(false);
      }
    }

    if (showActionPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionPopup]);

  const handleActionPopupToggle = useCallback((): void => {
    setShowActionPopup((prev) => !prev);
  }, []);

  const handleAction = useCallback(
    (action: string): void => {
      setShowActionPopup(false);

      switch (action) {
        case 'delete':
          if (restricted) {
            showAlert();
            return;
          }
          setShowDeleteConfirm(true);
          break;
        case 'edit':
          dispatch(
            addNotification({
              type: 'info',
              message: 'Edit functionality coming soon',
            })
          );
          break;
        case 'report':
          dispatch(
            addNotification({
              type: 'warning',
              message: 'Success, we will take a look at this property.',
            })
          );
          break;
        default:
          break;
      }
    },
    [restricted, showAlert, dispatch]
  );

  const handleDeleteProperty = useCallback(async (): Promise<void> => {
    if (!property) return;

    try {
      await deletePropertyMutation.mutateAsync(property.property_id);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Property deleted successfully',
        })
      );
      navigate('/properties');
    } catch {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Failed to delete property',
        })
      );
    }finally {
      setShowDeleteConfirm(false);
    }
  }, [property, deletePropertyMutation, dispatch, navigate]);

  const handleFindInMap = useCallback((): void => {
    if (!property) return;
    const { lat, lng } = property.position;
    navigate(`/map?lat=${lat}&lng=${lng}`);
  }, [property, navigate]);

  const handleGoBack = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const formatPrice = (price: number, currency?: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <p className="mt-5 text-gray-600 dark:text-gray-300">
          Fetching Property Details, this won&apos;t take long...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-4 min-h-screen">
        <Card className="border-2 shadow-none py-8 dark:bg-gray-800 dark:border-gray-700">
          <Card.Header className="px-4 py-2 border-none">
            <h1 className="text-[42px] text-center text-gray-800 dark:text-white">Error 404</h1>
          </Card.Header>
          <Card.Body>
            <h5 className="text-[24px] text-center text-gray-600 dark:text-gray-300">
              <strong>Property</strong> not found. It may not exist or has been removed.
            </h5>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pt-0">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleGoBack} className="p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Property Detail
          </h1>
        </div>
      </div>

      <div className="max-w-[1600px] min-h-screen my-0 mx-auto xl:pt-10 pb-[100px]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 px-3">
            <Card className="border border-slate-200 dark:border-slate-800 dark:bg-gray-800 mb-4">
              <Card.Body className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white">
                    {property.name}
                  </h2>
                  <div className="relative">
                    <button
                      ref={actionButtonRef}
                      onClick={handleActionPopupToggle}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {showActionPopup && (
                      <div
                        ref={actionPopupRef}
                        className="absolute right-0 top-full mt-2 z-50"
                      >
                        <ActionPopup
                          showMessage={false}
                          showEdit={isOwner}
                          showDelete={isOwner}
                          showReport={!isOwner}
                          onAction={handleAction}
                          onClose={() => setShowActionPopup(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <PropertyBadge type={property.type} />
                </div>
              </Card.Body>
            </Card>

            {property.images && property.images.length > 0 && (
              <PropertyGallery
                images={property.images}
                showEdit={isOwner}
                onEdit={() => {
                  dispatch(
                    addNotification({
                      type: 'info',
                      message: 'Image editing coming soon',
                    })
                  );
                }}
              />
            )}

            <Card className="shadow-none my-4 mx-0 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
              <Card.Header className="px-4 py-2 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Transaction Type</span>
                <span className="capitalize text-[20px] font-semibold ml-2 text-gray-800 dark:text-white">
                  For {property.transactionType}
                </span>
              </Card.Header>
            </Card>

            <Card className="shadow-none my-4 mx-0 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
              <Card.Header className="px-4 py-2 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Description</span>
              </Card.Header>
              <Card.Body className="text-[16px] lg:text-[18px] text-gray-700 dark:text-gray-300">
                {property.description || 'No description available'}
              </Card.Body>
            </Card>

            {property.features && property.features.length > 0 && (
              <Card className="shadow-none my-4 mx-0 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
                <Card.Header className="px-4 py-2 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-gray-400">Features</span>
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span
                        key={`${feature}-${index}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            <Card className="shadow-none border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
              <Card.Header className="px-4 py-2 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Address</span>
              </Card.Header>
              <Card.Body className="lg:text-[18px] text-gray-700 dark:text-gray-300">
                {property.address}
              </Card.Body>
            </Card>

            {property.price && (
              <Card className="shadow-none mt-4 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
                <Card.Header className="px-4 py-2 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-gray-400">Price</span>
                </Card.Header>
                <Card.Body>
                  <span className="text-[20px] lg:text-[24px] font-medium text-gray-800 dark:text-white">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  {property.transactionType === TransactionType.ForRent && property.paymentFrequency && (
                    <span className="capitalize text-[18px] ml-2 text-gray-600 dark:text-gray-400">
                      | {property.paymentFrequency}
                    </span>
                  )}
                </Card.Body>
              </Card>
            )}

            {!isOwner && (
              <Card className="mt-4 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
                <Card.Header className="px-4 py-2 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Enquire for more Information
                  </h3>
                </Card.Header>
                <Card.Body>
                  <EnquiryNewForm property={property} userTo={property.user_id} />
                </Card.Body>
              </Card>
            )}
          </div>

          <div className="xl:col-span-4 py-3 px-3 xl:pl-0">
            <div className="mortgage-container">
              <MortgageCoreCalc simpleMode boxShadow={false} />
            </div>

            <Card className="shadow-none mt-5 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
              <Card.Header className="bg-blue-500 px-4 py-2 md:py-3 flex flex-row justify-between items-center">
                <h3 className="text-white font-semibold">Map View</h3>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </Card.Header>
              <Card.Body className="pb-4">
                <p className="px-3 py-4 text-[16px] text-gray-600 dark:text-gray-300">
                  Maps can be a useful tool for viewing properties location &amp; filter them by
                  types. This also helps us to know distances so that we know how far away one
                  thing is from another.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleFindInMap}
                  className="capitalize"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Find in Map
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Are you sure?"
        size="md"
      >
        <div className="text-gray-600 dark:text-gray-300 mb-6">
          You are about to delete this property? This action cannot be undone.
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProperty}
            isLoading={deletePropertyMutation.isPending}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default PropertyDetailPage;
