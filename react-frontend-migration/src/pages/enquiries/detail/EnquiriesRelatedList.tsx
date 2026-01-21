import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnquiryBadge, Card } from '@/components/ui';
import type { Enquiry } from '@/types';

interface EnquiriesRelatedListProps {
  enquiries: Enquiry[];
  currentEnquiryId?: string;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
}

function EnquiriesRelatedList({
  enquiries,
  currentEnquiryId,
}: EnquiriesRelatedListProps): ReactElement {
  const navigate = useNavigate();

  const handleView = (enquiry: Enquiry): void => {
    navigate(`/enquiries/${enquiry.enquiry_id}`, { replace: true });
  };

  if (enquiries.length === 0) {
    return (
      <div className="h-full">
        <Card className="hidden lg:block mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Related Enquiries:</span>
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
        </Card>
        <Card className="h-full flex items-center justify-center bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-gray-700">
          <h1 className="text-center text-lg font-light p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            Looks like there are no enquiries at the moment. Check back soon!
          </h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Card className="hidden lg:block mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Related Enquiries:</span>
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
      </Card>

      <div className="bg-gray-50 dark:bg-transparent flex flex-col gap-2 pt-3 px-3 border border-gray-200 dark:border-gray-700 h-full">
        {enquiries
          .filter((enq) => enq.enquiry_id !== currentEnquiryId)
          .map((enquiry) => (
            <Card
              key={enquiry.enquiry_id}
              className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
              onClick={() => handleView(enquiry)}
            >
              <div className="px-3 flex flex-row items-center justify-between py-1">
                <p className="text-sm truncate">{enquiry.title}</p>
                <EnquiryBadge topic={enquiry.topic} />
              </div>
              <div className="py-1 px-3">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-sm">
                    From:{' '}
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {enquiry.email}
                    </a>
                  </p>
                  <span className="text-sm min-w-[100px] text-right">
                    {formatDate(enquiry.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}

        <div className="text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent text-center border border-gray-200 dark:border-gray-700 p-3">
          That&apos;s all for now—no more enquiries to load.
        </div>
      </div>
    </div>
  );
}

export default EnquiriesRelatedList;
