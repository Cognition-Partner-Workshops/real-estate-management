import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectActivities, fetchActivities } from '@/store/slices/activitiesSlice';
import { useEffect } from 'react';
import type { Activity } from '@/types';

const ActivityType = {
  PropertyDelete: 'PROPERTY_DELETE',
  EnquiryDelete: 'ENQUIRY_DELETE',
} as const;

function ActivityTimeline(): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activities = useAppSelector(selectActivities);

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  const viewProperty = (activity: Activity): void => {
    if (activity.property_id) {
      navigate(`/properties/${activity.property_id}`);
    }
  };

  const viewEnquiry = (activity: Activity): void => {
    if (activity.enquiry_id) {
      navigate(`/enquiries/${activity.enquiry_id}`);
    }
  };

  if (activities.length === 0) {
    return (
      <ul>
        <li className="h-[100px] flex items-center justify-center">
          <h1 className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            EMPTY
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </h1>
        </li>
      </ul>
    );
  }

  return (
    <div className="pl-8">
      <ol className="relative border-s border-primary/30 dark:border-primary">
        {activities.map((activity, index) => (
          <li key={activity.activity_id || index} className="mb-10 ms-4">
            <div className="absolute w-3 h-3 md:w-5 md:h-5 bg-gray-200 rounded-full mt-1.5 -start-1.5 md:-start-2.5 border border-primary/30 dark:border-gray-900 dark:bg-primary" />

            <time className="text-sm font-normal leading-none text-gray-700 dark:text-gray-500 md:text-base">
              {activity.createdAt}
            </time>

            <p className="text-base md:text-lg mt-1 text-gray-700 dark:text-gray-300">
              {activity.description}
            </p>

            {activity.property_id && activity.action !== ActivityType.PropertyDelete && (
              <button
                type="button"
                onClick={() => viewProperty(activity)}
                className="h-[45px] text-base rounded-md inline-flex items-center mt-2 bg-primary text-white px-6 py-2 hover:bg-primary/90 transition-colors"
              >
                View Property
              </button>
            )}

            {activity.enquiry_id && activity.action !== ActivityType.EnquiryDelete && (
              <button
                type="button"
                onClick={() => viewEnquiry(activity)}
                className="h-[45px] text-base rounded-md inline-flex items-center mt-2 bg-primary text-white px-6 py-2 hover:bg-primary/90 transition-colors ml-2"
              >
                View Enquiry
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ActivityTimeline;
