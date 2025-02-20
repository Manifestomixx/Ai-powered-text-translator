import { useState } from "react";

export const languageNames = {
  en: "English",
  tr: "Turkish",
  pt: "Portuguese",
  es: "Spanish",
  ru: "Russian",
  fr: "French",
};

export const useLanguageDetector = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");

  const detectLanguage = async (inputText) => {
    if (typeof window === "undefined") {
      console.log("⚠️ Language detection is disabled during server-side rendering.");
      return;
    }

    if (!("ai" in window && "languageDetector" in window.ai)) {
      console.log("❌ The Language Detector API is not supported in this environment.");
      return;
    }

    setIsLoading(true);
    console.log("✅ The Language Detector API is available.");

    try {
      const capabilities = await window.ai.languageDetector.capabilities();

      if (capabilities.available === "no") {
        console.error("🚫 Language Detector is not available.");
        setIsLoading(false);
        return;
      }

      const detector = await window.ai.languageDetector.create();
      console.log("✅ Detector initialized successfully.");

      const results = await detector.detect(inputText);

      if (results.length > 0) {
        const detectedCode = results[0].detectedLanguage;
        setDetectedLanguage(detectedCode);
        console.log(`Detected Language: ${detectedCode}, Confidence: ${results[0].confidence}`);
        return detectedCode;
      } else {
        setDetectedLanguage("Unknown");
      }
    } catch (error) {
      console.error("Error detecting language:", error);
    }

    setIsLoading(false);
  };

  return { detectLanguage, isLoading, detectedLanguage, languageNames };
};
