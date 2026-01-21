import { useEffect, type ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchEnquiries, selectInitialFetchDone } from '@/store/slices/enquiriesSlice';
import { EnquiriesList } from './components';

function EnquiriesPage(): ReactElement {
  const dispatch = useAppDispatch();
  const initialFetchDone = useAppSelector(selectInitialFetchDone);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !initialFetchDone) {
      dispatch(fetchEnquiries());
    }
  }, [dispatch, isAuthenticated, initialFetchDone]);

  return (
    <div className="py-4">
      <div className="px-3 md:px-5 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Enquiries</h1>
      </div>
      <EnquiriesList />
    </div>
  );
}

export default EnquiriesPage;
