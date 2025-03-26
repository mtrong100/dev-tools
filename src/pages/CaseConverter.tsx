import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";

type CaseType = "proper" | "sentence" | "upper" | "lower" | "toggle";
type WhitespaceOption = "trim" | "removeExtra" | "tabsToSpaces";

export function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [whitespaceOptions, setWhitespaceOptions] = useState<
    WhitespaceOption[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWhitespace = (text: string) => {
    let processedText = text;

    if (whitespaceOptions.includes("trim")) {
      processedText = processedText.trim();
    }

    if (whitespaceOptions.includes("removeExtra")) {
      processedText = processedText.replace(/\s+/g, " ");
    }

    if (whitespaceOptions.includes("tabsToSpaces")) {
      processedText = processedText.replace(/\t/g, "    ");
    }

    return processedText;
  };

  const convertCase = (text: string, caseType: CaseType) => {
    if (!text) return "";
    text = handleWhitespace(text);

    switch (caseType) {
      case "proper":
        return text
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
      case "sentence":
        return text
          .toLowerCase()
          .replace(/(^\w|\.\s+\w)/gm, (char) => char.toUpperCase());
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "toggle":
        return text
          .split("")
          .map((char, i) =>
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join("");
      default:
        return text;
    }
  };

  const handleConvert = (caseType: CaseType) => {
    setOutput(convertCase(input, caseType));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const text = await file.text();
      setInput(text);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearText = () => {
    setInput("");
    setOutput("");
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setToastMessage("Text copied to clipboard!");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to copy text");
      setShowToast(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleWhitespaceOption = (option: WhitespaceOption) => {
    setWhitespaceOptions((prev) =>
      prev.includes(option)
        ? prev.filter((opt) => opt !== option)
        : [...prev, option]
    );
  };

  // Live preview effect
  useEffect(() => {
    if (input) {
      setOutput(convertCase(input, "sentence")); // Default to sentence case for live preview
    }
  }, [input, whitespaceOptions]);

  return (
    <div className="space-y-6">
      <Card
        title="Case Converter"
        description="Convert text between different case styles and handle whitespace"
      >
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Upload TXT File
              </Button>
              <Button
                variant="secondary"
                onClick={handleClearText}
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
              >
                Clear Text
              </Button>
            </div>
            <Textarea
              label="Input Text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert..."
              rows={8}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Whitespace Options</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  whitespaceOptions.includes("trim") ? "default" : "outline"
                }
                onClick={() => toggleWhitespaceOption("trim")}
                className={`${
                  whitespaceOptions.includes("trim")
                    ? "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }`}
              >
                Trim Spaces
              </Button>
              <Button
                variant={
                  whitespaceOptions.includes("removeExtra")
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleWhitespaceOption("removeExtra")}
                className={`${
                  whitespaceOptions.includes("removeExtra")
                    ? "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }`}
              >
                Remove Extra Spaces
              </Button>
              <Button
                variant={
                  whitespaceOptions.includes("tabsToSpaces")
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleWhitespaceOption("tabsToSpaces")}
                className={`${
                  whitespaceOptions.includes("tabsToSpaces")
                    ? "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }`}
              >
                Tabs to Spaces
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Case Conversion</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleConvert("proper")}>
                Title Case
              </Button>
              <Button onClick={() => handleConvert("sentence")}>
                Sentence Case
              </Button>
              <Button onClick={() => handleConvert("upper")}>UPPER CASE</Button>
              <Button onClick={() => handleConvert("lower")}>lower case</Button>
              <Button onClick={() => handleConvert("toggle")}>
                tOgGlE cAsE
              </Button>
            </div>
          </div>

          {output && (
            <div className="mt-4">
              <Textarea
                label="Output"
                value={output}
                readOnly
                rows={8}
                className="min-h-[200px]"
              />
              <div className="mt-2 flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  size="default"
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                  onClick={handleCopyToClipboard}
                >
                  Copy to Clipboard
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  onClick={handleDownload}
                >
                  Download TXT
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes("Failed") ? "error" : "success"}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
