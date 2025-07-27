//src/components/shared/ImageComponent.tsx

"use client";

import React, { useState, DragEvent, useRef } from "react";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { Loader2, AlertTriangle, Upload, ImageIcon } from "lucide-react"; // --- FIX: Import correct icons from lucide-react ---
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Dynamically import ImageCropper to avoid SSR issues
const ImageCropper = dynamic(() => import("./ImageCropper"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-white">
      <Loader2 className="animate-spin text-2xl mr-2" /> Loading Cropper...
    </div>
  ),
});

interface ImageComponentProps {
  onFileSelect: (file: string | null) => void;
}

const FALLBACK_IMAGE_PREVIEW_PATH = "/fallback-image-placeholder.png";

const ImageComponent: React.FC<ImageComponentProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageHasError, setImageHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Create a ref to access the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Centralized function to handle a file object from any source
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type. Please upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCroppingImage(reader.result as string);
      setPreview(null);
      setIsImageLoading(false);
      setImageHasError(false);
    };
    reader.onerror = () => {
      console.error("There was an issue reading the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // --- Button Click Handler ---
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // --- Cropper Handlers ---
  const handleCropDone = (cropped: string) => {
    setPreview(cropped);
    onFileSelect(cropped);
    setCroppingImage(null);
    setIsImageLoading(true);
    setImageHasError(false);
  };

  const handleCropCancel = () => {
    setCroppingImage(null);
    if (!preview) {
      setIsImageLoading(false);
      setImageHasError(false);
    }
  };

  // --- Next/Image Handlers ---
  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageHasError(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageHasError(true);
    setPreview(FALLBACK_IMAGE_PREVIEW_PATH);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* --- Preview Display or Uploader UI --- */}
      {preview ? (
        <div
          className="w-full max-w-xs rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden relative bg-zinc-100 dark:bg-zinc-800"
          style={{ aspectRatio: "16/9" }}
        >
          {isImageLoading && !imageHasError && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 z-10">
              {/* --- FIX: Use Loader2 icon --- */}
              <Loader2 className="animate-spin text-3xl" />
            </div>
          )}
          {imageHasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-2 text-center z-10">
              {/* --- FIX: Use AlertTriangle icon --- */}
              <AlertTriangle className="text-3xl mb-1" />
              <span className="text-xs">Preview Error</span>
            </div>
          )}
          <NextImage
            key={preview}
            src={preview}
            alt="Preview"
            fill
            objectFit="contain"
            className={cn(
              "transition-opacity duration-300",
              isImageLoading || imageHasError ? "opacity-50" : "opacity-100"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 320px) 100vw, 320px"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full max-w-xs rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-6 transition-colors duration-300",
              isDragging
                ? "border-primary bg-primary/10 text-primary"
                : "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500"
            )}
            style={{ aspectRatio: "16/9", minHeight: "120px" }}
          >
            {/* --- FIX: Use Upload icon --- */}
            <Upload className="text-3xl mb-2 opacity-70" />
            <p className="text-sm font-semibold">Drag & drop an image</p>
          </div>

          <div className="text-xs text-zinc-500">OR</div>

          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="w-full max-w-xs"
          >
            Select File
          </Button>
        </div>
      )}

      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
          aspect={16 / 9}
        />
      )}
    </div>
  );
};

export default ImageComponent;
