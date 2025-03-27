import { useState, useRef, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const colors = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#95a5a6",
  "#f39c12",
  "#d35400",
  "#c0392b",
  "#bdc3c7",
  "#7f8c8d",
];

const fontFamilies = [
  "Arial",
  "Helvetica",
  "Roboto",
  "Times New Roman",
  "Georgia",
];
const imageSizes = [128, 256, 512];
const shapes = ["circle", "square", "rounded"];

export function LetterProfile() {
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(colors[0]);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [size, setSize] = useState(256);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0]);
  const [fontSize] = useState(0.5); // Relative to canvas size
  const [shape, setShape] = useState<"circle" | "square" | "rounded">("circle");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateInitials = useCallback((name: string) => {
    const parts = name.trim().split(/\s+/);
    const initials = parts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setInitials(initials);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFullName(name);
    generateInitials(name);
  };

  const generateImage = () => {
    if (!initials || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create clipping path for shape
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    } else if (shape === "rounded") {
      const radius = size * 0.1;
      ctx.moveTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
    } else {
      ctx.rect(0, 0, size, size);
    }
    ctx.closePath();
    ctx.clip();

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Configure text
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${size * fontSize}px ${fontFamily}`;

    // Draw text
    ctx.fillText(initials, size / 2, size / 2);
  };

  const downloadImage = (format: "png" | "jpg" | "svg") => {
    if (!canvasRef.current) return;

    if (format === "svg") {
      // Generate SVG
      const svgData = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="shape">
              ${
                shape === "circle"
                  ? `<circle cx="${size / 2}" cy="${size / 2}" r="${
                      size / 2
                    }"/>`
                  : shape === "rounded"
                  ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${
                      size * 0.1
                    }"/>`
                  : `<rect x="0" y="0" width="${size}" height="${size}"/>`
              }
            </clipPath>
          </defs>
          <rect width="${size}" height="${size}" fill="${backgroundColor}" clip-path="url(#shape)"/>
          <text
            x="${size / 2}"
            y="${size / 2}"
            font-family="${fontFamily}"
            font-size="${size * fontSize}"
            fill="${textColor}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-weight="bold"
          >${initials}</text>
        </svg>
      `;
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      downloadURL(url, `profile-${initials.toLowerCase()}.svg`);
      return;
    }

    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const url = canvasRef.current.toDataURL(mimeType);
    downloadURL(url, `profile-${initials.toLowerCase()}.${format}`);
  };

  const downloadURL = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((blob) => resolve(blob!))
      );
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const text = e.target.result.toString();
            const names = text.split("\n")[0].trim();
            setFullName(names);
            generateInitials(names);
          }
        };
        reader.readAsText(file);
      }
    },
    [generateInitials]
  );

  return (
    <div className="space-y-6">
      <Card
        title="Letter Profile Image"
        description="Generate profile images with initials"
      >
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name:
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={handleNameChange}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Initials:
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Color:
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 ${
                        backgroundColor === c
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setBackgroundColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Color:
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size:
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {imageSizes.map((s) => (
                    <option key={s} value={s}>
                      {s}x{s}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font:
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shape:
                </label>
                <div className="flex gap-2">
                  {shapes.map((s) => (
                    <Button
                      key={s}
                      variant={shape === s ? "default" : "outline"}
                      onClick={() => setShape(s as typeof shape)}
                      className="flex-1"
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateImage}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate Image
            </Button>
            <Button
              onClick={() => downloadImage("png")}
              variant="outline"
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
            >
              PNG
            </Button>
            <Button
              onClick={() => downloadImage("jpg")}
              variant="outline"
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            >
              JPG
            </Button>
            <Button
              onClick={() => downloadImage("svg")}
              variant="outline"
              className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
            >
              SVG
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Copy
            </Button>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-lg"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
