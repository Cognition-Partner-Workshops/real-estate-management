import { useState, useCallback, type ReactElement, type ChangeEvent } from 'react';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useRestriction } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  uploadPropertyImagesThunk,
  deletePropertyImagesThunk,
  selectPropertiesLoading,
} from '@/store/slices/propertiesSlice';
import { addNotification } from '@/store/slices/uiSlice';
import type { Property } from '@/types';

import PropertyCurrentImages from './PropertyCurrentImages';

interface PropertyUploadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onImagesUpdated?: (images: string[]) => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

function PropertyUploadsModal({
  isOpen,
  onClose,
  property,
  onImagesUpdated,
}: PropertyUploadsModalProps): ReactElement {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPropertiesLoading);
  const { restricted, showAlert } = useRestriction();

  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPreviewImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSelectFiles = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newPreviews: FilePreview[] = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        try {
          const preview = await getPreviewImage(file);
          newPreviews.push({ file, preview });
        } catch {
          console.error('Failed to create preview for file:', file.name);
        }
      }

      setFilePreviews((prev) => [...prev, ...newPreviews]);

      setTimeout(() => {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

      event.target.value = '';
    },
    [getPreviewImage]
  );

  const handleRemovePreview = useCallback((index: number): void => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async (): Promise<void> => {
    if (restricted) {
      showAlert();
      return;
    }

    if (filePreviews.length === 0) {
      dispatch(
        addNotification({
          type: 'warning',
          message: 'Please select images to upload.',
        })
      );
      return;
    }

    setIsUploading(true);

    try {
      const files = filePreviews.map((fp) => fp.file);
      const result = await dispatch(
        uploadPropertyImagesThunk({ id: property.property_id, files })
      ).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          message: 'Images uploaded successfully!',
        })
      );

      const updatedImages = [...(property.images || []), ...result.images];
      onImagesUpdated?.(updatedImages);
      setFilePreviews([]);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      dispatch(
        addNotification({
          type: 'error',
          message: errorMessage,
        })
      );
    } finally {
      setIsUploading(false);
    }
  }, [restricted, showAlert, filePreviews, dispatch, property, onImagesUpdated, onClose]);

  const handleDeleteImages = useCallback(
    async (imagesToDelete: string[]): Promise<void> => {
      if (restricted) {
        showAlert();
        return;
      }

      setIsDeleting(true);

      try {
        const result = await dispatch(
          deletePropertyImagesThunk({ id: property.property_id, images: imagesToDelete })
        ).unwrap();

        dispatch(
          addNotification({
            type: 'success',
            message: 'Images deleted successfully!',
          })
        );

        onImagesUpdated?.(result.remainingImages);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete images';
        dispatch(
          addNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [restricted, showAlert, dispatch, property.property_id, onImagesUpdated]
  );

  const handleClose = useCallback((): void => {
    setFilePreviews([]);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Property Uploads" size="lg">
      <div className="flex flex-col h-full pb-8">
        {filePreviews.length > 0 && (
          <section className="grid grid-cols-2 gap-3 pb-6 text-center">
            {filePreviews.map((filePreview, index) => (
              <div
                key={`preview-${index}`}
                className="border-[3px] border-gray-500 border-dashed relative cursor-pointer w-full h-40 p-2"
                onClick={() => handleRemovePreview(index)}
              >
                <img
                  src={filePreview.preview}
                  className="h-full w-full object-contain"
                  alt={`Preview ${index + 1}`}
                />
                <div className="absolute inset-0 z-50 opacity-0 hover:opacity-90 transition-opacity duration-700 ease-in-out">
                  <div className="bg-gray-700 flex flex-col items-center justify-center h-full w-full">
                    <p className="text-white font-semibold">Click to remove!</p>
                    <small className="text-white">{filePreview.file.name}</small>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="flex flex-col mb-4">
          {filePreviews.length === 0 && (
            <div className="w-full h-44 my-0 mx-auto border-4 border-dashed relative mb-4">
              <input
                type="file"
                name="imageUpload"
                id="imageUpload"
                multiple
                accept="image/*"
                onChange={handleSelectFiles}
                className="absolute h-full w-full m-0 p-0 outline-none opacity-0 cursor-pointer"
              />
              <p className="text-center leading-[170px] text-gray-700 dark:text-gray-300">
                Drag your files here or click in this area.
              </p>
            </div>
          )}

          {filePreviews.length > 0 && (
            <div className="w-full mb-4">
              <label
                htmlFor="imageUploadMore"
                className="block w-full text-center py-3 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-gray-600">+ Add more images</span>
                <input
                  type="file"
                  name="imageUploadMore"
                  id="imageUploadMore"
                  multiple
                  accept="image/*"
                  onChange={handleSelectFiles}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <Button
            id="uploadBtn"
            variant="primary"
            fullWidth
            onClick={handleUpload}
            disabled={filePreviews.length === 0 || isUploading || isLoading}
            isLoading={isUploading}
          >
            Upload Images
          </Button>
        </section>

        <PropertyCurrentImages
          images={property.images || []}
          isDeleting={isDeleting}
          onDelete={handleDeleteImages}
        />
      </div>
    </Modal>
  );
}

export default PropertyUploadsModal;
