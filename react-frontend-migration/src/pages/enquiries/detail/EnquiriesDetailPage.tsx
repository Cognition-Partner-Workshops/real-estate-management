import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  useEnquiry,
  useEnquiries,
  useDeleteEnquiry,
  useMarkEnquiryAsRead,
  useRelatedEnquiries,
} from '@/hooks/useEnquiries';
import { useRestriction } from '@/hooks/useRestriction';
import { useAppSelector } from '@/store';
import { EnquiryBadge, Button, Card, Skeleton } from '@/components/ui';
import { NotificationBell } from '@/components/ui';
import EnquiriesRelatedList from './EnquiriesRelatedList';
import EnquiriesReplyModal from './EnquiriesReplyModal';

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
}

function EnquiriesDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restricted, showAlert } = useRestriction();
  const user = useAppSelector((state) => state.user.user);

  const { data: enquiry, isLoading, error } = useEnquiry(id);
  const { data: allEnquiries } = useEnquiries();
  const deleteEnquiryMutation = useDeleteEnquiry();
  const markAsReadMutation = useMarkEnquiryAsRead();

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const sentByMe = useMemo(() => {
    if (user && enquiry) {
      return user.user_id === enquiry.users.from.user_id;
    }
    return false;
  }, [user, enquiry]);

  const relatedEnquiries = useRelatedEnquiries(
    enquiry?.property?.property_id,
    enquiry?.enquiry_id,
    allEnquiries
  );

  useEffect(() => {
    if (enquiry && !enquiry.read && enquiry.users?.to.user_id === user?.user_id) {
      markAsReadMutation.mutate(enquiry.enquiry_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiry?.enquiry_id, enquiry?.read, user?.user_id]);

  const handleGoToProperty = (propertyId: string): void => {
    navigate(`/properties/${propertyId}`);
  };

  const handleGoToEnquiry = (enquiryId: string): void => {
    navigate(`/enquiries/${enquiryId}`);
  };

  const handleDelete = async (): Promise<void> => {
    if (restricted) {
      showAlert();
      return;
    }

    if (!enquiry) return;

    try {
      await deleteEnquiryMutation.mutateAsync(enquiry.enquiry_id);
      navigate('/enquiries');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  const handleReport = (): void => {
    setShowReportConfirm(false);
    window.alert('Enquiry will be placed for investigation.');
  };

  const handleBack = (): void => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="py-8 text-center border-2">
            <h1 className="text-4xl mb-4">Error 404</h1>
            <h5 className="text-2xl">
              <strong>Enquiry</strong> not found. It may not exist or has been
              deleted.
            </h5>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
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
            </button>
            <h1 className="text-xl font-semibold">Enquiry Detail</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            <div className="xl:col-span-7 flex flex-col gap-4">
              <h1 className="px-3 text-lg xl:text-xl mb-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                {sentByMe ? (
                  'Enquiry Sent By You'
                ) : (
                  <>
                    Enquiry Message From{' '}
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {enquiry.email}
                    </a>
                  </>
                )}
              </h1>

              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="px-3 lg:px-5 py-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {enquiry.property?.name}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleGoToProperty(enquiry.property.property_id)
                      }
                    >
                      View Property
                    </Button>
                  </div>
                  <div className="flex gap-3 items-center mt-3">
                    <EnquiryBadge topic={enquiry.topic} />
                  </div>
                </div>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-3 lg:px-5 py-4">
                  {enquiry.replyTo && (
                    <div className="mb-2">
                      <button
                        className="p-0 text-base bg-transparent flex items-center gap-2"
                        onClick={() =>
                          handleGoToEnquiry(enquiry.replyTo!.enquiry_id)
                        }
                      >
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <span className="text-blue-600 hover:underline">
                          [Response to] - {enquiry.replyTo.title}
                        </span>
                      </button>
                    </div>
                  )}

                  <h2 className="text-xl font-semibold mt-2">{enquiry.title}</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDate(enquiry.createdAt)}
                  </p>
                </div>

                <div className="p-4">
                  <div className="px-4 pb-2 pt-8 min-h-fit rounded-2xl text-gray-800 dark:text-gray-200">
                    <ReactMarkdown>{enquiry.content}</ReactMarkdown>
                  </div>

                  <p className="px-4 mt-4">
                    -{' '}
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {enquiry.email}
                    </a>
                    {sentByMe && <span> (You)</span>}
                  </p>
                </div>
              </Card>

              <div className="flex pl-2 items-center mt-3 gap-3">
                {!sentByMe && (
                  <Button
                    variant="primary"
                    onClick={() => setIsReplyModalOpen(true)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Reply
                  </Button>
                )}

                {!sentByMe && (
                  <Button
                    variant="secondary"
                    className="ml-auto"
                    onClick={() => setShowReportConfirm(true)}
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    <span className="text-red-500">Report</span>
                  </Button>
                )}

                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className={sentByMe ? '' : ''}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>

            <div className="xl:col-span-5 h-full">
              <section className="h-full flex flex-col pt-8 mt-8 border-t xl:border-t-0 border-gray-300 dark:border-gray-700 xl:pt-0 xl:mt-0">
                <div className="grow pb-24 xl:px-5">
                  <EnquiriesRelatedList
                    enquiries={relatedEnquiries}
                    currentEnquiryId={enquiry.enquiry_id}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {isReplyModalOpen && enquiry && (
        <EnquiriesReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          property={enquiry.property}
          replyTo={{
            enquiry_id: enquiry.enquiry_id,
            title: enquiry.title,
            topic: enquiry.topic,
          }}
          userTo={enquiry.users.from.user_id}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Enquiry</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this Enquiry?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                DELETE
              </Button>
            </div>
          </div>
        </div>
      )}

      {showReportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowReportConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">Report Message</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to Report this Message?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowReportConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReport}>
                REPORT
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EnquiriesDetailPage;
