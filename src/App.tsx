import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Tool imports
import { CaseConverter } from "./pages/CaseConverter";
import { TextFormatter } from "./pages/TextFormatter";
import { LoremGenerator } from "./pages/LoremGenerator";
import { ImageResizer } from "./pages/ImageResizer";
import { LetterProfile } from "./pages/LetterProfile";
import { TextAnalyzer } from "./pages/TextAnalyzer";
import { ColorConverter } from "./pages/ColorConverter";
import { JsonFormatter } from "./pages/JsonFormatter";
import { UuidGenerator } from "./pages/UuidGenerator";
import { PasswordGenerator } from "./pages/PasswordGenerator";
import { DashboardLayout } from "./layouts/DashboardLayout";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<CaseConverter />} />
            <Route path="case-converter" element={<CaseConverter />} />
            <Route path="text-formatter" element={<TextFormatter />} />
            <Route path="text-analyzer" element={<TextAnalyzer />} />
            <Route path="lorem-generator" element={<LoremGenerator />} />
            <Route path="image-resizer" element={<ImageResizer />} />
            <Route path="letter-profile" element={<LetterProfile />} />
            <Route path="color-converter" element={<ColorConverter />} />
            <Route path="json-formatter" element={<JsonFormatter />} />
            <Route path="uuid-generator" element={<UuidGenerator />} />
            <Route path="password-generator" element={<PasswordGenerator />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
