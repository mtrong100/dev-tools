import { useState, useRef, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import imageCompression from "browser-image-compression";

type PresetSize = {
  name: string;
  width: number;
  height: number;
};

const presetSizes: PresetSize[] = [
  { name: "Thumbnail (150x150)", width: 150, height: 150 },
  { name: "Instagram Post (1080x1080)", width: 1080, height: 1080 },
  { name: "Twitter Post (1200x675)", width: 1200, height: 675 },
  { name: "Facebook Cover (851x315)", width: 851, height: 315 },
  { name: "HD (1920x1080)", width: 1920, height: 1080 },
  { name: "4K (3840x2160)", width: 3840, height: 2160 },
];

export function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [dpi, setDpi] = useState(72);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);

    // Get original dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      if (maintainAspectRatio) {
        const aspect = img.width / img.height;
        setMaxHeight(Math.round(maxWidth / aspect));
      }
    };
    img.src = objectUrl;

    await compressImage(file);
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      quality,
      fileType: outputFormat,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const compressedUrl = URL.createObjectURL(compressedFile);
      setCompressedImage(compressedUrl);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }, []);

  const applyPreset = (preset: PresetSize) => {
    setMaxWidth(preset.width);
    setMaxHeight(preset.height);
    if (image) {
      handleCompress();
    }
  };

  const handleCompress = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    await compressImage(fileInputRef.current.files[0]);
  };

  const downloadImage = (url: string) => {
    const extension = outputFormat.split("/")[1];
    const filename = `resized-image.${extension}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card title="Image Resizer" description="Resize and compress images">
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop an image here, or
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Select Image
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleImageUpload(e.target.files[0])
                }
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          </div>

          {/* Preset Sizes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preset Sizes
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {presetSizes.map((preset) => (
                <Button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Size Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8000"
                  value={maxWidth}
                  onChange={(e) => {
                    const newWidth = Number(e.target.value);
                    setMaxWidth(newWidth);
                    if (maintainAspectRatio && originalDimensions.width) {
                      const aspect =
                        originalDimensions.width / originalDimensions.height;
                      setMaxHeight(Math.round(newWidth / aspect));
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8000"
                  value={maxHeight}
                  onChange={(e) => {
                    const newHeight = Number(e.target.value);
                    setMaxHeight(newHeight);
                    if (maintainAspectRatio && originalDimensions.height) {
                      const aspect =
                        originalDimensions.width / originalDimensions.height;
                      setMaxWidth(Math.round(newHeight * aspect));
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quality
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  DPI
                </label>
                <input
                  type="number"
                  min="72"
                  max="300"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aspectRatio"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label
              htmlFor="aspectRatio"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Maintain Aspect Ratio
            </label>
          </div>

          {/* Preview and Download Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {image && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original Image ({originalDimensions.width}x
                  {originalDimensions.height})
                </h3>
                <img
                  src={image}
                  alt="Original"
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
            {compressedImage && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Resized Image ({maxWidth}x{maxHeight})
                </h3>
                <img
                  src={compressedImage}
                  alt="Resized"
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button
                  onClick={() => downloadImage(compressedImage)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Download Resized Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
