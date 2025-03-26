import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "dolor",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "dolore",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

type TextLength = "short" | "medium" | "long";
type GenerationType = "paragraphs" | "sentences" | "words";

export function LoremGenerator() {
  const [output, setOutput] = useState("");
  const [generationType, setGenerationType] =
    useState<GenerationType>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [textLength, setTextLength] = useState<TextLength>("medium");

  const getWordCount = (length: TextLength) => {
    switch (length) {
      case "short":
        return Math.floor(Math.random() * 10) + 10; // 10-20 words
      case "medium":
        return Math.floor(Math.random() * 20) + 20; // 20-40 words
      case "long":
        return Math.floor(Math.random() * 30) + 40; // 40-70 words
    }
  };

  const generateSentence = () => {
    const words = [];
    const wordCount = getWordCount("short");

    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * loremWords.length);
      words.push(loremWords[randomIndex]);
    }

    return words.join(" ") + ".";
  };

  const generateParagraph = () => {
    const sentences = [];
    const sentenceCount = getWordCount(textLength) / 10; // Roughly 10 words per sentence

    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }

    return sentences.join(" ");
  };

  const generateLorem = () => {
    let text = "";

    switch (generationType) {
      case "paragraphs":
        text = Array(amount)
          .fill(null)
          .map(() => generateParagraph())
          .join("\n\n");
        break;
      case "sentences":
        text = Array(amount)
          .fill(null)
          .map(() => generateSentence())
          .join(" ");
        break;
      case "words": {
        const words = [];
        for (let i = 0; i < amount; i++) {
          const randomIndex = Math.floor(Math.random() * loremWords.length);
          words.push(loremWords[randomIndex]);
        }
        text = words.join(" ") + ".";
        break;
      }
    }

    setOutput(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setOutput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Lorem Generator"
        description="Generate Lorem Ipsum placeholder text"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generation Type
              </label>
              <select
                value={generationType}
                onChange={(e) =>
                  setGenerationType(e.target.value as GenerationType)
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                type="number"
                min="1"
                max={generationType === "words" ? 1000 : 50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Text Length
              </label>
              <select
                value={textLength}
                onChange={(e) => setTextLength(e.target.value as TextLength)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                disabled={generationType === "words"}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateLorem}
              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Generate
            </Button>
            <Button
              onClick={() => setOutput("")}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Reset
            </Button>
          </div>

          {output && (
            <div className="mt-4 space-y-2">
              <Textarea
                label="Generated Text"
                value={output}
                readOnly
                rows={8}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                >
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
                >
                  Download as TXT
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
                  >
                    Upload TXT
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
