import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";

interface PasswordOptions {
  length: number;
  minLength: number;
  maxLength: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [passwordList, setPasswordList] = useState<string[]>([]);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    minLength: 8,
    maxLength: 64,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const characters = {
    uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ", // Excluding O
    uppercaseAll: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghjkmnpqrstuvwxyz", // Excluding l, i
    lowercaseAll: "abcdefghijklmnopqrstuvwxyz",
    numbers: "23456789", // Excluding 0, 1
    numbersAll: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const calculatePasswordStrength = (
    pwd: string
  ): "weak" | "medium" | "strong" | "very-strong" => {
    let score = 0;

    // Length check
    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;

    // Character type checks
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    // Variety check
    const uniqueChars = new Set(pwd).size;
    if (uniqueChars >= pwd.length * 0.7) score += 1;

    if (score >= 6) return "very-strong";
    if (score >= 4) return "strong";
    if (score >= 2) return "medium";
    return "weak";
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "very-strong":
        return "bg-green-500";
      case "strong":
        return "bg-blue-500";
      case "medium":
        return "bg-yellow-500";
      case "weak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const generatePassword = (count: number = 1) => {
    const passwords: string[] = [];

    for (let j = 0; j < count; j++) {
      let charset = "";
      if (options.uppercase) {
        charset += options.excludeAmbiguous
          ? characters.uppercase
          : characters.uppercaseAll;
      }
      if (options.lowercase) {
        charset += options.excludeAmbiguous
          ? characters.lowercase
          : characters.lowercaseAll;
      }
      if (options.numbers) {
        charset += options.excludeAmbiguous
          ? characters.numbers
          : characters.numbersAll;
      }
      if (options.symbols) charset += characters.symbols;

      if (!charset) {
        setPassword("Please select at least one character type");
        return;
      }

      let result = "";
      const charsetArray = charset.split("");

      // Ensure at least one character from each selected type
      if (options.uppercase) {
        result += (
          options.excludeAmbiguous
            ? characters.uppercase
            : characters.uppercaseAll
        )[
          Math.floor(
            Math.random() *
              (options.excludeAmbiguous
                ? characters.uppercase
                : characters.uppercaseAll
              ).length
          )
        ];
      }
      if (options.lowercase) {
        result += (
          options.excludeAmbiguous
            ? characters.lowercase
            : characters.lowercaseAll
        )[
          Math.floor(
            Math.random() *
              (options.excludeAmbiguous
                ? characters.lowercase
                : characters.lowercaseAll
              ).length
          )
        ];
      }
      if (options.numbers) {
        result += (
          options.excludeAmbiguous ? characters.numbers : characters.numbersAll
        )[
          Math.floor(
            Math.random() *
              (options.excludeAmbiguous
                ? characters.numbers
                : characters.numbersAll
              ).length
          )
        ];
      }
      if (options.symbols) {
        result +=
          characters.symbols[
            Math.floor(Math.random() * characters.symbols.length)
          ];
      }

      // Fill the rest randomly
      for (let i = result.length; i < options.length; i++) {
        result += charsetArray[Math.floor(Math.random() * charsetArray.length)];
      }

      // Shuffle the result
      result = result
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
      passwords.push(result);
    }

    if (count === 1) {
      setPassword(passwords[0]);
    } else {
      setPasswordList(passwords);
    }
  };

  const copyToClipboard = async (text: string = password) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy password to clipboard:", err);
    }
  };

  const downloadPasswords = (fileType: "txt" | "csv") => {
    const passwords = passwordList.length > 0 ? passwordList : [password];
    const content =
      fileType === "csv"
        ? `Password,Strength,Timestamp\n${passwords
            .map(
              (pwd) =>
                `${pwd},${calculatePasswordStrength(
                  pwd
                )},${new Date().toISOString()}`
            )
            .join("\n")}`
        : passwords.join("\n");

    const blob = new Blob([content], {
      type: fileType === "csv" ? "text/csv" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passwords.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Password Generator"
        description="Generate secure random passwords"
      >
        <div className="space-y-4">
          {/* Length Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Length: {options.length}
              </label>
              <input
                type="range"
                min={options.minLength}
                max={options.maxLength}
                value={options.length}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOptions({ ...options, length: Number(e.target.value) })
                }
                className="flex-1"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min:
                </label>
                <input
                  type="number"
                  min="4"
                  max={options.maxLength}
                  value={options.minLength}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      minLength: Number(e.target.value),
                      length: Math.max(Number(e.target.value), options.length),
                    })
                  }
                  className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max:
                </label>
                <input
                  type="number"
                  min={options.minLength}
                  max="128"
                  value={options.maxLength}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      maxLength: Number(e.target.value),
                      length: Math.min(Number(e.target.value), options.length),
                    })
                  }
                  className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Character Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uppercase"
                  checked={options.uppercase}
                  onChange={(e) =>
                    setOptions({ ...options, uppercase: e.target.checked })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="uppercase"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Uppercase (A-Z)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lowercase"
                  checked={options.lowercase}
                  onChange={(e) =>
                    setOptions({ ...options, lowercase: e.target.checked })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="lowercase"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Lowercase (a-z)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="numbers"
                  checked={options.numbers}
                  onChange={(e) =>
                    setOptions({ ...options, numbers: e.target.checked })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="numbers"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Numbers (0-9)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="symbols"
                  checked={options.symbols}
                  onChange={(e) =>
                    setOptions({ ...options, symbols: e.target.checked })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="symbols"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Symbols (!@#$%^&*)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="excludeAmbiguous"
                  checked={options.excludeAmbiguous}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      excludeAmbiguous: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="excludeAmbiguous"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Exclude Ambiguous Characters (O, 0, l, I)
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generate Multiple:
                </label>
                <Button
                  onClick={() => generatePassword(5)}
                  variant="outline"
                  className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                >
                  5 Passwords
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => generatePassword()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate
            </Button>
            <Button
              onClick={() => copyToClipboard()}
              variant="outline"
              disabled={!password || password.includes("Please select")}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
            >
              Copy
            </Button>
            <Button
              onClick={() => downloadPasswords("txt")}
              variant="outline"
              disabled={!password && passwordList.length === 0}
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            >
              Download TXT
            </Button>
            <Button
              onClick={() => downloadPasswords("csv")}
              variant="outline"
              disabled={!password && passwordList.length === 0}
              className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
            >
              Download CSV
            </Button>
          </div>

          {/* Generated Password with Strength Indicator */}
          {password && !password.includes("Please select") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generated Password
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-20 rounded ${getStrengthColor(
                      calculatePasswordStrength(password)
                    )}`}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {calculatePasswordStrength(password).replace("-", " ")}
                  </span>
                </div>
              </div>
              <Textarea
                value={password}
                readOnly
                className="font-mono text-lg"
              />
            </div>
          )}

          {/* Multiple Passwords List */}
          {passwordList.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Passwords
              </label>
              <div className="space-y-2">
                {passwordList.map((pwd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                  >
                    <code className="font-mono">{pwd}</code>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-16 rounded ${getStrengthColor(
                          calculatePasswordStrength(pwd)
                        )}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(pwd)}
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
