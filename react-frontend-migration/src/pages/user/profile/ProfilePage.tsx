import { useState, type ReactElement, type FormEvent, useRef } from 'react';
import { useAppSelector } from '@/store';
import { useUpdateUser } from '@/hooks';
import { useRestriction } from '@/hooks';
import { Button, Input, Textarea, Card } from '@/components/ui';
import ProfileVerified from './ProfileVerified';
import ActivityTimeline from './ActivityTimeline';
import UserProperties from './UserProperties';

type TabType = 'activities' | 'properties';

function ProfilePage(): ReactElement {
  const user = useAppSelector((state) => state.user.user);
  const { restricted, showAlert } = useRestriction();
  const updateUserMutation = useUpdateUser();

  const [imgUrl, setImgUrl] = useState<string>('./assets/images/avatar.png');
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    about: user?.about || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<{ fullName?: string; about?: string; address?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleUpload = (): void => {
    fileInputRef.current?.click();
  };

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = (ev): void => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          setImgUrl(result);
        }
      };
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { fullName?: string; about?: string; address?: string } = {};

    if (!formData.fullName || formData.fullName.length < 4) {
      newErrors.fullName = 'Full Name must be at least 4 characters.';
    }

    if (formData.about && formData.about.length > 1000) {
      newErrors.about = 'Maximum character limit of 1000 has been reached.';
    }

    if (formData.address && formData.address.length > 1000) {
      newErrors.address = 'Maximum character limit of 1000 has been reached.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (restricted) {
      showAlert();
      return;
    }

    updateUserMutation.mutate(formData);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">User Profile</h1>
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Card className="shadow-none h-full border border-slate-200 dark:border-slate-800">
              <Card.Header className="p-0">
                <div className="p-4" />
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                    <img
                      src={imgUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Card.Header>

              <Card.Body>
                <input
                  type="file"
                  onChange={handleSelectFile}
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                />
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleToggleUpload}
                  className="xl:h-[50px]"
                >
                  Upload Image
                </Button>

                <ProfileVerified />
              </Card.Body>
            </Card>
          </div>

          <div className="md:col-span-8">
            <Card className="shadow-none border border-slate-200 dark:border-slate-800 h-full">
              <Card.Header className="px-3 xl:px-4 py-3 xl:py-4 bg-primary flex flex-row items-center justify-between">
                <h2 className="text-base md:text-lg xl:text-xl text-white font-semibold">
                  My Information
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Card.Header>

              <Card.Body className="pt-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input
                    label="Email *"
                    type="email"
                    readOnly
                    value={user.email}
                    className="text-lg"
                  />

                  <Input
                    label="Full Name *"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={errors.fullName}
                    className="text-lg"
                  />

                  <Textarea
                    label="About Me:"
                    name="about"
                    placeholder="..."
                    value={formData.about}
                    onChange={handleInputChange}
                    error={errors.about}
                    className="text-lg"
                  />

                  <Input
                    label="Address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    className="text-lg"
                  />

                  <div className="text-right py-3">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-[200px] h-[50px]"
                      isLoading={updateUserMutation.isPending}
                    >
                      SAVE CHANGES
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="shadow-none border border-slate-200 dark:border-slate-800">
            <Card.Header>
              <div className="border-b-2 border-primary/30 flex flex-row items-center gap-x-[2px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('activities')}
                  className={`m-0 border-b-0 h-[40px] lg:h-[50px] w-[180px] lg:w-[200px] rounded-t-lg font-medium transition-colors ${
                    activeTab === 'activities'
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-primary hover:bg-primary/10'
                  }`}
                >
                  My Activities
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('properties')}
                  className={`m-0 border-b-0 h-[40px] lg:h-[50px] w-[180px] lg:w-[200px] rounded-t-lg font-medium transition-colors ${
                    activeTab === 'properties'
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-primary hover:bg-primary/10'
                  }`}
                >
                  My Properties
                </button>
              </div>
            </Card.Header>

            <Card.Body className="min-h-[400px] pt-6">
              {activeTab === 'activities' ? <ActivityTimeline /> : <UserProperties />}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
