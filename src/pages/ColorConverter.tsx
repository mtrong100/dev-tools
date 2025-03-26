import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";

type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "cmyk";
type RecentColor = { value: string; format: ColorFormat };

export function ColorConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<Record<ColorFormat, string>>({
    hex: "",
    rgb: "",
    rgba: "",
    hsl: "",
    hsla: "",
    cmyk: "",
  });
  const [selectedFormat, setSelectedFormat] = useState<ColorFormat>("hex");
  const [error, setError] = useState("");
  const [recentColors, setRecentColors] = useState<RecentColor[]>(() => {
    const saved = localStorage.getItem("recentColors");
    return saved ? JSON.parse(saved) : [];
  });
  const [alpha, setAlpha] = useState(1);

  useEffect(() => {
    localStorage.setItem("recentColors", JSON.stringify(recentColors));
  }, [recentColors]);

  const addToRecent = (color: string, format: ColorFormat) => {
    setRecentColors((prev) => {
      const updated = [
        { value: color, format },
        ...prev.filter((c) => c.value !== color),
      ].slice(0, 10);
      return updated;
    });
  };

  const convertColor = (
    inputColor: string = input,
    inputFormat: ColorFormat = selectedFormat
  ) => {
    try {
      setError("");
      let r = 0,
        g = 0,
        b = 0,
        a = alpha;

      // Parse input color to RGBA
      if (inputFormat === "hex") {
        const hex = inputColor.replace("#", "");
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        if (hex.length === 8) {
          a = parseInt(hex.substring(6, 8), 16) / 255;
        }
      } else if (inputFormat === "rgb" || inputFormat === "rgba") {
        const match = inputColor.match(
          /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/
        );
        if (!match) throw new Error("Invalid RGB(A) format");
        [, r, g, b, a = "1"] = match.map(Number);
      } else if (inputFormat === "hsl" || inputFormat === "hsla") {
        const match = inputColor.match(
          /^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/
        );
        if (!match) throw new Error("Invalid HSL(A) format");
        const [, h, s, l, alpha = "1"] = match.map(Number);
        a = Number(alpha);

        // Convert HSL to RGB
        const hue = h / 360;
        const sat = s / 100;
        const light = l / 100;

        if (s === 0) {
          r = g = b = Math.round(light * 255);
        } else {
          const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
          const p = 2 * light - q;
          r = Math.round(hueToRgb(p, q, hue + 1 / 3) * 255);
          g = Math.round(hueToRgb(p, q, hue) * 255);
          b = Math.round(hueToRgb(p, q, hue - 1 / 3) * 255);
        }
      } else if (inputFormat === "cmyk") {
        const match = inputColor.match(
          /^cmyk\((\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)$/
        );
        if (!match) throw new Error("Invalid CMYK format");
        const [, c, m, y, k] = match.map(Number);

        // Convert CMYK to RGB
        r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
        g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
        b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
      }

      // Convert RGB(A) to all formats
      const hex = `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}${
        a < 1
          ? Math.round(a * 255)
              .toString(16)
              .padStart(2, "0")
          : ""
      }`;

      const rgb = `rgb(${r}, ${g}, ${b})`;
      const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;

      // Convert to HSL(A)
      const rr = r / 255;
      const gg = g / 255;
      const bb = b / 255;
      const max = Math.max(rr, gg, bb);
      const min = Math.min(rr, gg, bb);
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
        else if (max === gg) h = (bb - rr) / d + 2;
        else if (max === bb) h = (rr - gg) / d + 4;
        h *= 60;
      }

      const hsl = `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(
        l * 100
      )}%)`;
      const hsla = `hsla(${Math.round(h)}, ${Math.round(
        s * 100
      )}%, ${Math.round(l * 100)}%, ${a})`;

      // Convert to CMYK
      const k = 1 - Math.max(rr, gg, bb);
      const c = ((1 - rr - k) / (1 - k)) * 100;
      const m = ((1 - gg - k) / (1 - k)) * 100;
      const y = ((1 - bb - k) / (1 - k)) * 100;
      const cmyk = `cmyk(${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(
        y
      )}%, ${Math.round(k * 100)}%)`;

      setOutput({ hex, rgb, rgba, hsl, hsla, cmyk });
      addToRecent(inputColor, inputFormat);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Invalid color format");
      }
      setOutput({
        hex: "",
        rgb: "",
        rgba: "",
        hsl: "",
        hsla: "",
        cmyk: "",
      });
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value) convertColor(value, selectedFormat);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const colors = JSON.parse(e.target?.result as string);
          if (colors.color) {
            setInput(colors.color);
            convertColor(colors.color, colors.format || "hex");
          }
        } catch (err) {
          setError("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadPalette = () => {
    const data = {
      color: input,
      format: selectedFormat,
      conversions: output,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-palette.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Color Converter"
        description="Convert colors between different formats"
      >
        <div className="space-y-6">
          {/* Color Input Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as ColorFormat)
                }
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="rgba">RGBA</option>
                <option value="hsl">HSL</option>
                <option value="hsla">HSLA</option>
                <option value="cmyk">CMYK</option>
              </select>

              <input
                type="color"
                value={output.hex || "#000000"}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-12 h-10 rounded-md cursor-pointer"
              />

              {(selectedFormat === "rgba" || selectedFormat === "hsla") && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Alpha:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm">{alpha}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Enter ${selectedFormat.toUpperCase()} color value`}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          {/* Color Preview */}
          {!error && output.hex && (
            <div className="space-y-2">
              <div
                className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: output.rgba }}
              />
            </div>
          )}

          {/* Conversion Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(output).map(
              ([format, value]) =>
                value && (
                  <div
                    key={format}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium">
                      {format.toUpperCase()}:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{value}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(value)}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent Colors
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(color.value);
                      setSelectedFormat(color.format);
                      convertColor(color.value, color.format);
                    }}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color.value }}
                    title={color.value}
                  />
                ))}
              </div>
            </div>
          )}

          {/* File Actions */}
          <div className="flex gap-2">
            <Button
              onClick={downloadPalette}
              variant="outline"
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            >
              Download Palette
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
              >
                Upload Palette
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function for HSL conversion
function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
