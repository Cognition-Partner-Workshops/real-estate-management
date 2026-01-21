import { useState, useEffect, type ReactElement } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// @ts-expect-error - Swiper CSS modules don't have type declarations
import 'swiper/css';
// @ts-expect-error - Swiper CSS modules don't have type declarations
import 'swiper/css/pagination';

import { Card, Button } from '@/components/ui';

interface PropertyGalleryProps {
  images: string[];
  showEdit?: boolean;
  onEdit?: () => void;
}

const NO_IMAGE_PLACEHOLDER = '/assets/images/no-image.jpeg';

function PropertyGallery({
  images,
  showEdit = false,
  onEdit,
}: PropertyGalleryProps): ReactElement {
  const [selectedImage, setSelectedImage] = useState<string>(NO_IMAGE_PLACEHOLDER);

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    } else {
      setSelectedImage(NO_IMAGE_PLACEHOLDER);
    }
  }, [images]);

  const handleImageSelect = (image: string): void => {
    setSelectedImage(image || NO_IMAGE_PLACEHOLDER);
  };

  const hasMultipleImages = images && images.length > 1;

  return (
    <Card className="p-0 m-0 border border-slate-200 dark:border-slate-800 dark:bg-gray-800">
      {showEdit && (
        <div className="text-right p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-600"
          >
            <span>Edit</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </Button>
        </div>
      )}

      <div className="p-0 lg:p-3">
        <div className="relative flex justify-center h-[350px] sm:h-[550px] mb-3">
          <div
            className="absolute inset-0 z-0 bg-center bg-cover blur-sm scale-100 opacity-70"
            style={{
              backgroundImage: `url(${selectedImage || 'https://placehold.co/1200x300'})`,
            }}
          />
          <img
            src={selectedImage}
            alt="Property"
            className="w-auto h-full object-cover z-10"
          />
        </div>

        {hasMultipleImages && (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView="auto"
            className="property-gallery-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={`${image}-${index}`}
                className="!w-[120px] lg:!w-[150px]"
              >
                <div
                  className="relative cursor-pointer h-[80px] lg:h-[100px]"
                  onClick={() => handleImageSelect(image || NO_IMAGE_PLACEHOLDER)}
                >
                  <div
                    style={{ backgroundImage: `url(${image})` }}
                    className="rounded-lg w-full h-full bg-cover bg-center"
                  />
                  <div
                    className={`absolute inset-0 rounded-lg transition-all ${
                      selectedImage === image
                        ? 'border-2 border-blue-500 bg-blue-500/20'
                        : 'hover:bg-black/10'
                    }`}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </Card>
  );
}

export default PropertyGallery;
