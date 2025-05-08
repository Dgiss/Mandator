
import React, { useState } from 'react';
import { Image, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  id: string;
  label: string;
  description: string;
  imageUrl: string | null;
  onImageChange: (file: File | null) => void;
  aspectRatio?: 'square' | 'wide';
  maxSize?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  label,
  description,
  imageUrl,
  onImageChange,
  aspectRatio = 'wide',
  maxSize = '5MB'
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-dashed border-gray-300 rounded-md p-4">
        {imageUrl ? (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={`Aperçu de ${label.toLowerCase()}`} 
              className={`w-full ${aspectRatio === 'wide' ? 'h-48 object-cover' : 'h-24 object-contain mx-auto'} rounded-md`}
            />
            <button 
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label htmlFor={id} className={`flex flex-col items-center justify-center ${aspectRatio === 'wide' ? 'h-48' : 'h-24'} cursor-pointer`}>
            {aspectRatio === 'wide' ? (
              <Image className="h-12 w-12 text-gray-400 mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
            )}
            <span className="text-sm text-gray-500">Cliquez pour ajouter {description}</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG ou GIF, max {maxSize}</span>
            <input
              id={id}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
