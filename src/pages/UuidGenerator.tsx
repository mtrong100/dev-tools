import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";

type UUIDVersion = "v1" | "v4";
type UUIDFormat = "default" | "uppercase" | "nohyphens" | "uppernohyphens";

interface GeneratedUUID {
  value: string;
  timestamp: number;
  version: UUIDVersion;
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [format, setFormat] = useState<UUIDFormat>("default");
  const [history, setHistory] = useState<GeneratedUUID[]>(() => {
    const saved = localStorage.getItem("uuid_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("uuid_history", JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const generateV1UUID = () => {
    const now = new Date().getTime();
    const tmL = now & 0xffffffff;
    const tmH = ((now * 10000) & 0xffffffff) + 0x01b21dd213814000;
    const rand = Math.floor(Math.random() * 0x3fff) + 0x8000;
    const uuid = "xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c, i) => {
        let r;
        if (i < 8) r = (tmL >>> (i * 4)) & 0xf;
        else if (i < 12) r = (tmH >>> ((i - 8) * 4)) & 0xf;
        else if (i === 12) r = 1;
        else if (i === 16) r = rand & 0xf;
        else r = rand >>> ((i - 16) * 4);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  };

  const generateV4UUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const formatUUID = (uuid: string, format: UUIDFormat): string => {
    switch (format) {
      case "uppercase":
        return uuid.toUpperCase();
      case "nohyphens":
        return uuid.replace(/-/g, "");
      case "uppernohyphens":
        return uuid.replace(/-/g, "").toUpperCase();
      default:
        return uuid;
    }
  };

  const generateUuids = () => {
    const generator = version === "v1" ? generateV1UUID : generateV4UUID;
    const newUuids = Array.from({ length: count }, () => {
      const uuid = generator();
      return formatUUID(uuid, format);
    });

    setUuids(newUuids);

    // Add to history
    const historyEntry: GeneratedUUID = {
      value: newUuids[0],
      timestamp: Date.now(),
      version,
    };
    setHistory((prev) => [historyEntry, ...prev].slice(0, 10));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
    } catch (err) {
      console.error("Failed to copy UUIDs to clipboard:", err);
    }
  };

  const downloadUUIDs = (fileType: "txt" | "csv") => {
    const content =
      fileType === "csv"
        ? `UUID,Version,Timestamp\n${uuids
            .map((uuid) => `${uuid},${version},${new Date().toISOString()}`)
            .join("\n")}`
        : uuids.join("\n");

    const blob = new Blob([content], {
      type: fileType === "csv" ? "text/csv" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card
        title="UUID Generator"
        description="Generate UUIDs with various options"
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Count:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) =>
                    setCount(Math.min(100, Math.max(1, Number(e.target.value))))
                  }
                  className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Version:
                </label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value as UUIDVersion)}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="v1">Version 1 (Timestamp)</option>
                  <option value="v4">Version 4 (Random)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format:
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as UUIDFormat)}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="default">
                    Default (lowercase with hyphens)
                  </option>
                  <option value="uppercase">Uppercase with hyphens</option>
                  <option value="nohyphens">Lowercase without hyphens</option>
                  <option value="uppernohyphens">
                    Uppercase without hyphens
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateUuids}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              disabled={uuids.length === 0}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
            >
              Copy All
            </Button>
            <Button
              onClick={() => downloadUUIDs("txt")}
              variant="outline"
              disabled={uuids.length === 0}
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            >
              Download TXT
            </Button>
            <Button
              onClick={() => downloadUUIDs("csv")}
              variant="outline"
              disabled={uuids.length === 0}
              className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
            >
              Download CSV
            </Button>
          </div>

          {/* Generated UUIDs */}
          {uuids.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated UUIDs
              </label>
              <Textarea
                value={uuids.join("\n")}
                readOnly
                className="h-48 font-mono"
              />
            </div>
          )}

          {/* UUID History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent UUIDs
              </h3>
              <div className="space-y-1">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                  >
                    <code className="text-sm font-mono">{entry.value}</code>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(entry.value)
                        }
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
