// components/ImageCropper.tsx
"use client";

import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import getCroppedImg from "./cropImage"; // Ensure this path is correct
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MIN_ZOOM_ALLOWED = 0.5; // Example: Allow zooming out to 50%
const MAX_ZOOM_ALLOWED = 3; // Current max zoom

export default function ImageCropper({
  imageSrc,
  onCropDone,
  onCancel,
  aspect = 1,
}: {
  imageSrc: string;
  onCropDone: (cropped: string) => void;
  onCancel: () => void;
  aspect?: number;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // Initial zoom is still 1 (fits to bounds)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(cropped);
    } catch (e) {
      console.error("Error cropping image:", e);
      onCancel(); // Close cropper on error for now
    }
  };

  return (
    <div className="flex flex-col h-[70vh] sm:h-[75vh] md:h-[80vh] w-full bg-card text-card-foreground rounded-lg overflow-hidden">
      <div className="relative flex-1 bg-muted/40">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          minZoom={MIN_ZOOM_ALLOWED}
          maxZoom={MAX_ZOOM_ALLOWED}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape={aspect === 1 ? "round" : "rect"}
          showGrid={true}
          style={{
            containerStyle: { backgroundColor: "rgba(0,0,0,0.7)" },
          }}
        />
      </div>

      <div className="p-4 flex items-center gap-4 bg-background border-t border-border">
        <span className="text-sm text-muted-foreground">Zoom:</span>
        <Slider
          min={MIN_ZOOM_ALLOWED}
          max={MAX_ZOOM_ALLOWED}
          step={0.01}
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          className="flex-1"
        />
      </div>

      <div className="p-4 flex justify-end gap-3 bg-background border-t border-border">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button onClick={handleDone} type="button">
          Crop & Save
        </Button>
      </div>
    </div>
  );
}
