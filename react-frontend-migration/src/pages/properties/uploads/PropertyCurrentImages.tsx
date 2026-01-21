import { useState, useCallback, type ReactElement } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, FreeMode } from 'swiper/modules';

import Button from '@/components/ui/Button';
import { useRestriction } from '@/hooks';

interface PropertyCurrentImagesProps {
  images: string[];
  isDeleting: boolean;
  onDelete: (selectedImages: string[]) => void;
}

const NO_IMAGE_PLACEHOLDER = 'assets/images/no-image.jpeg';

function PropertyCurrentImages({
  images,
  isDeleting,
  onDelete,
}: PropertyCurrentImagesProps): ReactElement {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { restricted, showAlert } = useRestriction();

  const getImageUrl = useCallback((image: string): string => {
    return image || NO_IMAGE_PLACEHOLDER;
  }, []);

  const isSelected = useCallback(
    (image: string): boolean => {
      return selectedImages.includes(image);
    },
    [selectedImages]
  );

  const toggleSelected = useCallback((image: string): void => {
    setSelectedImages((prev) => {
      if (prev.includes(image)) {
        return prev.filter((img) => img !== image);
      }
      return [...prev, image];
    });
  }, []);

  const handleDeleteSelected = useCallback((): void => {
    if (restricted) {
      showAlert();
      return;
    }
    if (selectedImages.length > 0) {
      onDelete(selectedImages);
      setSelectedImages([]);
    }
  }, [restricted, showAlert, selectedImages, onDelete]);

  if (images.length === 0) {
    return <></>;
  }

  return (
    <section className="my-4 w-full">
      <header className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Current Images:
      </header>

      <Swiper
        modules={[Pagination, FreeMode]}
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView="auto"
        freeMode={true}
        className="w-full h-[200px]"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`} className="!w-auto max-w-[200px]">
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={() => toggleSelected(image)}
              style={{
                backgroundImage: `url(${getImageUrl(image)})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt={`Property image ${index + 1}`}
                className="w-full h-full select-none"
                draggable={false}
              />

              <input
                type="checkbox"
                className={`absolute top-3 right-3 h-4 w-4 z-10 cursor-pointer ${
                  !isSelected(image) ? 'outline outline-3 outline-blue-500' : ''
                }`}
                checked={isSelected(image)}
                onChange={() => toggleSelected(image)}
                onClick={(e) => e.stopPropagation()}
              />

              <div
                className={`absolute inset-0 transition-colors ${
                  isSelected(image)
                    ? 'bg-blue-500/20 opacity-70'
                    : 'bg-gray-700/60'
                }`}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Button
        variant="danger"
        fullWidth
        className="mt-4"
        disabled={selectedImages.length === 0 || isDeleting}
        isLoading={isDeleting}
        onClick={handleDeleteSelected}
      >
        Delete Selected ({selectedImages.length})
      </Button>
    </section>
  );
}

export default PropertyCurrentImages;
