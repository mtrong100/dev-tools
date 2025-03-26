import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
  mostUsedWords: Array<{ word: string; count: number }>;
  uniqueWords: number;
  averageWordLength: number;
  longestWord: string;
  shortestWord: string;
}

export function TextAnalyzer() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState<TextStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeText = () => {
    if (!text.trim()) {
      setStats(null);
      return;
    }

    // Basic calculations
    const characters = text.length;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const sentences = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((para) => para.trim().length > 0);

    // Calculate reading and speaking time
    const wordsPerMinute = 200; // Average reading speed
    const speakingWordsPerMinute = 130; // Average speaking speed
    const readingMinutes = words.length / wordsPerMinute;
    const speakingMinutes = words.length / speakingWordsPerMinute;

    // Format time
    const formatTime = (minutes: number) => {
      if (minutes < 1) {
        return `${Math.round(minutes * 60)} seconds`;
      }
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      return `${mins} min${mins !== 1 ? "s" : ""} ${secs} sec${
        secs !== 1 ? "s" : ""
      }`;
    };

    // Word analysis
    const wordFrequency = words.reduce(
      (acc: { [key: string]: number }, word) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanWord.length > 0) {
          acc[cleanWord] = (acc[cleanWord] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const mostUsedWords = Object.entries(wordFrequency)
      .filter(
        ([word]) =>
          ![
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
          ].includes(word)
      )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    const uniqueWords = Object.keys(wordFrequency).length;
    const validWords = words.filter((word) => word.match(/^[a-zA-Z]+$/));
    const averageWordLength =
      validWords.length > 0
        ? validWords.reduce((sum, word) => sum + word.length, 0) /
          validWords.length
        : 0;

    const longestWord = validWords.reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );
    const shortestWord = validWords.reduce(
      (shortest, word) =>
        !shortest || word.length < shortest.length ? word : shortest,
      ""
    );

    setStats({
      characters,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime: formatTime(readingMinutes),
      speakingTime: formatTime(speakingMinutes),
      mostUsedWords,
      uniqueWords,
      averageWordLength: Number(averageWordLength.toFixed(1)),
      longestWord,
      shortestWord,
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(analyzeText, 500);
    return () => clearTimeout(debounceTimer);
  }, [text]);

  return (
    <div className="space-y-6">
      <Card title="Text Analyzer" description="Analyze your text in detail">
        <div className="space-y-4">
          <Textarea
            label="Input Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here..."
            rows={6}
          />

          {stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Characters
                  </div>
                  <div className="text-xl font-semibold">
                    {stats.characters}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Words
                  </div>
                  <div className="text-xl font-semibold">{stats.words}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sentences
                  </div>
                  <div className="text-xl font-semibold">{stats.sentences}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Paragraphs
                  </div>
                  <div className="text-xl font-semibold">
                    {stats.paragraphs}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Reading Time
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.readingTime}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Speaking Time
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.speakingTime}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                {showDetails ? "Hide Details" : "Show More Details"}
              </Button>

              {showDetails && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      Most Used Words
                    </h3>
                    <div className="space-y-2">
                      {stats.mostUsedWords.map(({ word, count }) => (
                        <div key={word} className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {word}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Unique Words
                      </div>
                      <div className="text-lg font-semibold">
                        {stats.uniqueWords}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Avg. Word Length
                      </div>
                      <div className="text-lg font-semibold">
                        {stats.averageWordLength} chars
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Longest Word
                      </div>
                      <div
                        className="text-lg font-semibold truncate"
                        title={stats.longestWord}
                      >
                        {stats.longestWord}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Shortest Word
                      </div>
                      <div
                        className="text-lg font-semibold truncate"
                        title={stats.shortestWord}
                      >
                        {stats.shortestWord}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
