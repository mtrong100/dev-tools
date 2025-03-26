export type TextFormatType = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
  alignment: "left" | "center" | "right" | "justify";
  indentation: number;
};

export type CaseType =
  | "uppercase"
  | "lowercase"
  | "capitalize"
  | "sentence"
  | "toggle";

export const formatText = {
  // Basic formatting
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  underline: (text: string) => `__${text}__`,
  strikethrough: (text: string) => `~~${text}~~`,
  subscript: (text: string) => `<sub>${text}</sub>`,
  superscript: (text: string) => `<sup>${text}</sup>`,

  // Case conversion
  uppercase: (text: string) => text.toUpperCase(),
  lowercase: (text: string) => text.toLowerCase(),
  capitalize: (text: string) =>
    text
      .toLowerCase()
      .replace(/(?:^|[-_\s]+)(.)/g, (_, chr) => chr.toUpperCase()),
  sentence: (text: string) =>
    text
      .toLowerCase()
      .replace(/(^\w|\.\s+\w)/gm, (letter) => letter.toUpperCase()),
  toggle: (text: string) =>
    text
      .split("")
      .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
      .join(""),

  // Whitespace management
  removeExtraSpaces: (text: string) => text.replace(/\s+/g, " "),
  trim: (text: string) => text.trim(),
  tabsToSpaces: (text: string, spacesPerTab: number = 4) =>
    text.replace(/\t/g, " ".repeat(spacesPerTab)),
  spacesToTabs: (text: string, spacesPerTab: number = 4) =>
    text.replace(new RegExp(" ".repeat(spacesPerTab), "g"), "\t"),

  // Line and paragraph tools
  addLineBreaks: (text: string) => text.replace(/\n/g, "\n\n"),
  removeLineBreaks: (text: string) => text.replace(/\n+/g, " "),
  toNumberedList: (text: string) =>
    text
      .split("\n")
      .map((line, i) => `${i + 1}. ${line}`)
      .join("\n"),
  toBulletedList: (text: string) =>
    text
      .split("\n")
      .map((line) => `• ${line}`)
      .join("\n"),

  // Text cleaning
  removeSpecialChars: (text: string) => text.replace(/[^\w\s]/g, ""),
  removeHtmlTags: (text: string) => text.replace(/<[^>]*>/g, ""),
  removeDuplicateLines: (text: string) =>
    [...new Set(text.split("\n"))].join("\n"),
  removeDuplicateWords: (text: string) =>
    [...new Set(text.split(/\s+/))].join(" "),

  // Encoding/Decoding
  urlEncode: (text: string) => encodeURIComponent(text),
  urlDecode: (text: string) => decodeURIComponent(text),
  base64Encode: (text: string) => btoa(text),
  base64Decode: (text: string) => atob(text),
  escapeHtml: (text: string) =>
    text.replace(
      /[&<>"']/g,
      (char) =>
        ((
          {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          } as { [key: string]: string }
        )[char])
    ),
  unescapeHtml: (text: string) =>
    text.replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;/g,
      (char) =>
        ((
          {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#39;": "'",
          } as { [key: string]: string }
        )[char])
    ),

  // Text generation
  generateLoremIpsum: (paragraphs: number = 1) => {
    const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
    return Array(paragraphs).fill(lorem).join("\n\n");
  },

  // Text counting
  countWords: (text: string) => text.trim().split(/\s+/).length,
  countCharacters: (text: string) => text.length,
  countLines: (text: string) => text.split("\n").length,
};
