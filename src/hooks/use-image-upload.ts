
import { useState } from 'react';

export const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageUrl(null);
      setImageFile(null);
    }
  };

  return {
    imageUrl,
    imageFile,
    handleImageChange,
  };
};

export default useImageUpload;
