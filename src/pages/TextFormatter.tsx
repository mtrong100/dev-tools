import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { formatText } from "../utils/textFormatter";

export function TextFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autosave
  useEffect(() => {
    const savedText = localStorage.getItem("formatterText");
    if (savedText) {
      setInput(savedText);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("formatterText", input);
  }, [input]);

  // Update stats
  useEffect(() => {
    setStats({
      words: formatText.countWords(input),
      chars: formatText.countCharacters(input),
      lines: formatText.countLines(input),
    });
  }, [input]);

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setInput(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setInput(history[historyIndex + 1]);
    }
  };

  // Handle text changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInput(newText);
    setOutput(newText);

    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), newText];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle file operations
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInput(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle find and replace
  const handleFindReplace = () => {
    if (!findText) return;

    let newText = input;
    if (useRegex) {
      try {
        const regex = new RegExp(findText, "g");
        newText = input.replace(regex, replaceText);
      } catch {
        console.error("Invalid regex pattern");
        return;
      }
    } else {
      newText = input.replace(new RegExp(findText, "g"), replaceText);
    }

    setInput(newText);
    setOutput(newText);
  };

  // Handle text formatting
  const handleFormat = (type: keyof typeof formatText) => {
    let newText = input;

    switch (type) {
      case "bold":
      case "italic":
      case "underline":
      case "strikethrough":
      case "subscript":
      case "superscript":
        newText = formatText[type](input);
        break;
      case "uppercase":
      case "lowercase":
      case "capitalize":
      case "sentence":
      case "toggle":
        newText = formatText[type](input);
        break;
      case "removeExtraSpaces":
      case "trim":
      case "tabsToSpaces":
      case "spacesToTabs":
      case "addLineBreaks":
      case "removeLineBreaks":
      case "toNumberedList":
      case "toBulletedList":
      case "removeSpecialChars":
      case "removeHtmlTags":
      case "removeDuplicateLines":
      case "removeDuplicateWords":
        newText = formatText[type](input);
        break;
      case "urlEncode":
      case "urlDecode":
      case "base64Encode":
      case "base64Decode":
      case "escapeHtml":
      case "unescapeHtml":
        newText = formatText[type](input);
        break;
      default:
        return;
    }

    setInput(newText);
    setOutput(newText);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Enhanced Text Formatter"
        description="A comprehensive text formatting tool"
      >
        <div className="space-y-4">
          {/* File Operations */}
          <div className="flex space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              Upload File
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!output}
              className="bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
            >
              Download
            </Button>
          </div>

          {/* Main Text Area */}
          <Textarea
            label="Input Text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter text to format..."
            rows={6}
            className="font-mono"
          />

          {/* Output */}
          {output && (
            <div className="mt-4">
              <Textarea
                label="Output"
                value={output}
                readOnly
                rows={6}
                className="font-mono"
              />
              <div className="mt-2 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOutput("")}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                >
                  Clear Output
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Words: {stats.words}</span>
            <span>Characters: {stats.chars}</span>
            <span>Lines: {stats.lines}</span>
          </div>

          {/* Formatting Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Basic Formatting */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Basic Formatting
              </h3>
              <div className="space-y-3">
                <Button onClick={() => handleFormat("bold")} className="w-full">
                  Bold
                </Button>
                <Button
                  onClick={() => handleFormat("italic")}
                  className="w-full"
                >
                  Italic
                </Button>
                <Button
                  onClick={() => handleFormat("underline")}
                  className="w-full"
                >
                  Underline
                </Button>
                <Button
                  onClick={() => handleFormat("strikethrough")}
                  className="w-full"
                >
                  Strikethrough
                </Button>
              </div>
            </div>

            {/* Case Conversion */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Case Conversion
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleFormat("uppercase")}
                  className="w-full"
                >
                  UPPERCASE
                </Button>
                <Button
                  onClick={() => handleFormat("lowercase")}
                  className="w-full"
                >
                  lowercase
                </Button>
                <Button
                  onClick={() => handleFormat("capitalize")}
                  className="w-full"
                >
                  Capitalize
                </Button>
                <Button
                  onClick={() => handleFormat("sentence")}
                  className="w-full"
                >
                  Sentence Case
                </Button>
                <Button
                  onClick={() => handleFormat("toggle")}
                  className="w-full"
                >
                  Toggle Case
                </Button>
              </div>
            </div>

            {/* Whitespace Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Whitespace
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleFormat("removeExtraSpaces")}
                  className="w-full"
                >
                  Remove Extra Spaces
                </Button>
                <Button onClick={() => handleFormat("trim")} className="w-full">
                  Trim Spaces
                </Button>
                <Button
                  onClick={() => handleFormat("tabsToSpaces")}
                  className="w-full"
                >
                  Tabs to Spaces
                </Button>
                <Button
                  onClick={() => handleFormat("spacesToTabs")}
                  className="w-full"
                >
                  Spaces to Tabs
                </Button>
              </div>
            </div>

            {/* Line Tools */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Line Tools
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleFormat("addLineBreaks")}
                  className="w-full"
                >
                  Add Line Breaks
                </Button>
                <Button
                  onClick={() => handleFormat("removeLineBreaks")}
                  className="w-full"
                >
                  Remove Line Breaks
                </Button>
                <Button
                  onClick={() => handleFormat("toNumberedList")}
                  className="w-full"
                >
                  Numbered List
                </Button>
                <Button
                  onClick={() => handleFormat("toBulletedList")}
                  className="w-full"
                >
                  Bulleted List
                </Button>
              </div>
            </div>

            {/* Text Cleaning */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Text Cleaning
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleFormat("removeSpecialChars")}
                  className="w-full"
                >
                  Remove Special Chars
                </Button>
                <Button
                  onClick={() => handleFormat("removeHtmlTags")}
                  className="w-full"
                >
                  Remove HTML Tags
                </Button>
                <Button
                  onClick={() => handleFormat("removeDuplicateLines")}
                  className="w-full"
                >
                  Remove Duplicate Lines
                </Button>
                <Button
                  onClick={() => handleFormat("removeDuplicateWords")}
                  className="w-full"
                >
                  Remove Duplicate Words
                </Button>
              </div>
            </div>

            {/* Encoding/Decoding */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Encoding/Decoding
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleFormat("urlEncode")}
                  className="w-full"
                >
                  URL Encode
                </Button>
                <Button
                  onClick={() => handleFormat("urlDecode")}
                  className="w-full"
                >
                  URL Decode
                </Button>
                <Button
                  onClick={() => handleFormat("base64Encode")}
                  className="w-full"
                >
                  Base64 Encode
                </Button>
                <Button
                  onClick={() => handleFormat("base64Decode")}
                  className="w-full"
                >
                  Base64 Decode
                </Button>
              </div>
            </div>
          </div>

          {/* Find and Replace */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Find and Replace
            </h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text..."
                className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={useRegex}
                  onChange={(e) => setUseRegex(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span>Regex</span>
              </label>
              <Button
                onClick={handleFindReplace}
                className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
              >
                Replace
              </Button>
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
            >
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
            >
              Redo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
