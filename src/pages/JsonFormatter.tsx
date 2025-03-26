import { useState, useRef } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";

interface SearchOptions {
  query: string;
  replace: string;
  caseSensitive: boolean;
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentType, setIndentType] = useState<"spaces" | "tabs">("spaces");
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState("");
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: "",
    replace: "",
    caseSensitive: false,
  });
  const [isCollapsible, setIsCollapsible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const indent = indentType === "spaces" ? " ".repeat(indentSize) : "\t";
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (err) {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError("JSON is valid");
      setOutput(input);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Invalid JSON: ${err.message}`);
      } else {
        setError("Invalid JSON");
      }
      setOutput("");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSearch = () => {
    if (!searchOptions.query) return;

    const flags = searchOptions.caseSensitive ? "g" : "gi";
    const regex = new RegExp(searchOptions.query, flags);
    const replaced = output.replace(regex, searchOptions.replace);
    setOutput(replaced);
  };

  const renderJsonWithSyntaxHighlighting = (json: string) => {
    try {
      // Basic syntax highlighting
      return json
        .replace(
          /(".*?")/g,
          '<span class="text-green-600 dark:text-green-400">$1</span>'
        )
        .replace(
          /\b(true|false|null)\b/g,
          '<span class="text-purple-600 dark:text-purple-400">$1</span>'
        )
        .replace(
          /\b(\d+\.?\d*)\b/g,
          '<span class="text-blue-600 dark:text-blue-400">$1</span>'
        );
    } catch {
      return json;
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="JSON Formatter"
        description="Format, minify and validate JSON"
      >
        <div className="space-y-4">
          {/* File Upload */}
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
            >
              Upload JSON
            </Button>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Input JSON
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"example": "value"}'
              className="h-48 font-mono"
            />
          </div>

          {/* Controls Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Indent:
                </label>
                <select
                  value={indentType}
                  onChange={(e) =>
                    setIndentType(e.target.value as "spaces" | "tabs")
                  }
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="spaces">Spaces</option>
                  <option value="tabs">Tabs</option>
                </select>
                {indentType === "spaces" && (
                  <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  >
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="8">8 spaces</option>
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="collapsible"
                  checked={isCollapsible}
                  onChange={(e) => setIsCollapsible(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="collapsible"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Enable Collapsible Sections
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={formatJson}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Format
              </Button>
              <Button
                onClick={minifyJson}
                variant="outline"
                className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
              >
                Minify
              </Button>
              <Button
                onClick={validateJson}
                variant="outline"
                className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
              >
                Validate
              </Button>
            </div>
          </div>

          {/* Search and Replace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchOptions.query}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    query: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={searchOptions.replace}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    replace: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={searchOptions.caseSensitive}
                  onChange={(e) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      caseSensitive: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm">Case Sensitive</span>
              </label>
              <Button
                onClick={handleSearch}
                variant="outline"
                className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
              >
                Replace
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`p-4 rounded-lg ${
                error === "JSON is valid"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}
            >
              {error}
            </div>
          )}

          {/* Output Section */}
          {output && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Result
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                  >
                    Download
                  </Button>
                </div>
              </div>
              <div
                className="h-48 overflow-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 font-mono"
                dangerouslySetInnerHTML={{
                  __html: renderJsonWithSyntaxHighlighting(output),
                }}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
