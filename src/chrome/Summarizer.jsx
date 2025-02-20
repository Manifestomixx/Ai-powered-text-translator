import { useState, useRef } from "react";

export const useSummarizer = () => {
  // const [isLoading, setIsLoading] = useState(false);
  async function summarizeText(text) {
    if (!self?.ai?.summarizer?.create) {
      console.error("Summarizer API not supported or unavailable.");
      return null;
    }

    try {
      // setIsLoading(true);
      const summarizer = await self.ai.summarizer.create({
        type: "key-points",
        format: "plain-text",
        length: "short",
      });
      console.log("self.ai.summarizer.create:", self?.ai?.summarizer?.create);

      if (!summarizer) {
        console.error("Failed to create summarizer session.");
        return null;
      }

      return await summarizer.summarize(text);
    } catch (error) {
      console.error("Summarization error:", error);
      return null;
    } 
  }

  return { summarizeText };
};
