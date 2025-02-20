import { useState } from "react";
import { languageNames } from "./langCode";

export const useTranslator = () => {
  async function translateText(text, sourceLang, targetLang) {
    // if (!("ai" in self) || !("translator" in self.ai)) {
    //   console.error("Translator API not supported.");
    //   return;
    // }

    console.log("Validating translation:", { text, sourceLang, targetLang });

    if (!self?.ai?.translator) {
      console.error("Translator API not supported.");
      return null;
    }

    if (!sourceLang || !targetLang) {
      console.error("Invalid language codes:", sourceLang, targetLang);
      return null;
    }


    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      console.log("Attempting to translate:", text, "From:", sourceLang, "To:", targetLang);

      const translation = await translator.translate(text);
      console.log("Translation result:", translation);

      return translation;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  }
  
  return { translateText };
};
