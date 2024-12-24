import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface ImageDropzoneProps {
  onImageUploaded: (url: string) => void;
}

export default function ImageDropzone({ onImageUploaded }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (data) {
        setPreview(data.publicUrl);
        onImageUploaded(data.publicUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    } else {
      toast.error('Please upload an image file');
    }
  }, [onImageUploaded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    } else {
      toast.error('Please upload an image file');
    }
  }, [onImageUploaded]);

  const clearPreview = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging ? 'border-black bg-gray-50' : 'border-gray-300'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload size={24} className="mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {uploading 
                ? 'Uploading...' 
                : 'Drag and drop an image here, or click to select'}
            </p>
          </label>
        </div>
      )}
    </div>
  );
}