import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundUp } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineTranslate } from "react-icons/md";
import { IoLogoIonitron } from "react-icons/io";
import { useLanguageDetector } from "../chrome/useLanguageDetector";
import { useSummarizer } from "../chrome/Summarizer";
import { useTranslator } from "../chrome/TextTranslator";
import spinner from "../assets/svg-spinners--180-ring-with-bg.svg";
import { CiLight } from "react-icons/ci";
import { FaMoon } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const AiInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessage, setLoadingMessage] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const { detectLanguage, isLoading, detectedLanguage, languageNames } =
    useLanguageDetector();
  const [apiError, setApiError] = useState(false);
  const { summary, summarizeText } = useSummarizer();
  const { translateText, translatedText, error } = useTranslator();
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  function handleLogo() {
    navigate("/cover");
  }

  function clearMessage(id) {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  }

  // Summarize function
  const handleSummarize = async (index) => {
    setLoadingMessage((prev) => ({ ...prev, [index]: true }));
    try {
      if (apiError) {
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) =>
            i === index
              ? { ...msg, summary: "This feature is not supported on your device" }
              : msg
          )
        );
        return;
      }
      
      const message = messages[index];
      console.log("Summarizing started...");
      const summaryText = await summarizeText(message.text);
      console.log("Summarizing completed:", summaryText);
      if (summaryText) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            summary: summaryText,
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error summarizing text:", error);
      setMessages((prevMessages) =>
     prevMessages.map((msg, i) =>
       i === index
         ? { ...msg, summary: apiError ? "This feature not supported on your device" : "Summarization unavailable at this time. Try again later." }
         : msg
     )
   );
    } finally {
      setLoadingMessage((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!inputText.trim()) return;

    setLoadingMessage((prev) => ({ ...prev, sending: true }));

    try {
      const detectedLanguage = await detectLanguage(inputText);
      const newMessage = {
        id: Date.now(),
        text: inputText,
        detectedLanguage,
        summary: "",
        translation: "",
        selectedLanguage,
      };
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];
        return updatedMessages;
      });

      setInputText("");
      const chatContainer = chatContainerRef.current;
      const previousScrollHeight = chatContainer?.scrollHeight || 0;

      setTimeout(() => {
        const messageIndex = messages.findIndex(
          (msg) => msg.id === newMessage.id
        );
        if (messageIndex !== -1) {
          handleTranslate(messageIndex);
        }
        if (chatContainer) {
          chatContainer.scrollTop =
            chatContainer.scrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error("Error processing message", error);
    } finally {
      setLoadingMessage((prev) => ({ ...prev, sending: false }));
    }
  };

  // Handle translating a message
  const handleTranslate = async (index) => {
    setLoadingMessage((prev) => ({ ...prev, [`translate-${index}`]: true }));
    try {
      if (apiError) {
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) =>
            i === index
              ? { ...msg, summary: "This feature is not supported on your device" }
              : msg
          )
        );
        return;
      }

      const message = messages[index];

      if (
        !message.selectedLanguage ||
        message.detectedLanguage === message.selectedLanguage
      ) {
        throw new Error("Source and target languages must be different.");
      }

      const translation = await translateText(
        message.text,
        message.detectedLanguage,
        message.selectedLanguage
      );
      if (translation) {
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) =>
            i === index ? { ...msg, translation: translation || "Translation not available for selected language." } : msg
          )
        );
      }
    } catch (error) {
      console.error("Translation error:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg, i) =>
          i === index
            ? {
                ...msg,
                translation: apiError ? "This feature not supported on your device" : "Translation is not available at this time. Try again later."
              }
            : msg
        )
      );
    } finally {
      setLoadingMessage((prev) => ({ ...prev, [`translate-${index}`]: false }));
    }
  };
  
  function handleToggle() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  useEffect(() => {

    if (summary && messages.length > 0) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.summary === "" ? { ...msg, summary } : msg
        )
      );
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }

    document.body.className =
      theme === "light" ? "bg-white text-black" : "bg-black text-white";
  }, [summary, theme, messages]);

  useEffect(() => {
    const checkApiSupport = () => {
      if (
        !("ai" in self) ||
        !self.ai?.translator ||
        !self.ai?.summarizer ||
        !self.ai?.languageDetector
      ) {
        setApiError(true);
      } else {
        setApiError(false);
      }
    };
  
    checkApiSupport();
  
  }, []);

  return (
    <main className="relative min-h-screen md:min-h-dvh overflow-hidden ">

{apiError !== null && (
  <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${apiError ? "bg-red-600" : "bg-blue-600"} text-white`}>
    <span>{apiError ? "❌ Your device does not support the required Chrome AI APIs." : "✅ Chrome AI APIs are supported on your device."}</span>
    <button onClick={() => setApiError(null)} className="text-white cursor-pointer">
      <RxCross2 className="w-5 h-5" />
    </button>
  </div>
)}

      {/* Logo section */}
      <div className="text-start flex justify-between items-center">
        <div
          className="flex items-center my-5 pl-4 cursor-pointer"
          onClick={handleLogo}
        >
          <IoLogoIonitron className="text-4xl md:text-7xl text-blue-500 hover:text-blue-600" />
          <div className="text-center">
            <h1
              className={`text-[10px]  md:text-sm ${
                theme === "light" ? "text-gray-500" : "text-white"
              }`}
            >
              {" "}
              <span className="font-semibold text-sm md:text-xl">LINGUA </span>
              TRANSLATOR
            </h1>
          </div>
        </div>
        <div
          className="text-2xl md:text-3xl p-3 font-semibold cursor-pointer mr-5 hover:text-[25px] md:hover:text-[35px]"
          onClick={handleToggle}
        >
          {theme === "light" ? <FaMoon /> : <CiLight />}
        </div>
      </div>

      <div className="border-b-[1px] border-gray-500 w-full mt-4"></div>

      {/* Welcome section */}
      <div className="px-10">
        <div className=" flex flex-col justify-center items-center mt-10 md:mt-30 p-2">
          <p className="text-gray-500 flex items-center gap-1">
            <IoLogoIonitron className="text-xl md:text-3xl text-gray-500" />{" "}
            <span className="text-sm md:text-xl font-semibold">
              Welcome to Lingua Language Translator!
            </span>
          </p>
          <p className="text-[10px] md:text-sm text-gray-500 text-center">
            Effortlessly translate and summarize your text in seconds. Just
            type, and let Lingua do the magic!{" "}
          </p>
        </div>

        {/* section 2  "For Input and Output"*/}
        <div
          className={`w-full  p-5 ${
            theme === "light" ? "bg-white" : "bg-black"
          } fixed md:absolute bottom-0 left-0 `}
          ref={chatContainerRef}
        >
          {/* Text Output */}
          <div className="flex-grow overflow-y-auto h-auto mb-4 max-h-[22rem] md:max-h-[30rem] lg:max-h-[60rem]">
            {messages.map((msg, index) => (
              <div key={msg.id} className="mb-4 p-2 border-b ">

                {/* Message Section */}
                <div className="border-blue-500 border rounded-2xl space-y-1 p-3 ">
                  <div className="flex justify-between w-full items-center">
                    <h1 className="text-xs md:text-xl text-gray-500 font-semibold">
                      Text Input
                    </h1>
                    <button
                      onClick={() => clearMessage(msg.id)}
                      className="text-blue-500 md:text-white text-xs md:text-sm md:bg-blue-500 p-1 rounded-full cursor-pointer hover:bg-blue-600"
                    >
                      <RxCross1 />
                    </button>
                  </div>

                 {/* Message Inputted */}
                  <p className=" text-[12px] md:text-sm p-3 overflow-hidden">
                    {msg.text}
                  </p>
                </div>

                {/* Detected language & Summarize Text */}
                <div className="flex justify-between items-center">
                  <small className="text-[8px] md:text-sm text-gray-500">
                    Language: {msg.detectedLanguage}
                  </small>

                  {/* Summarize Button */}
                  {msg.text.length > 150 && (!msg.detectedLanguage || msg.detectedLanguage === "en") && (
                    <button
                      onClick={() => handleSummarize(index)}
                      className="mt-2 bg-blue-500 text-white p-2 rounded-lg cursor-pointer text-[10px] md:text-sm hover:bg-blue-600"
                      disabled={loadingMessage[index]}
                    >
                      {loadingMessage[index] ? (
                        <img
                          src={spinner}
                          alt="Loading..."
                          className="w-[10px] h-[10px] md:w-5 md:h-5 inline"
                        />
                      ) : (
                        "Summarize"
                      )}
                    </button>
                  )}
                </div>
                
                {/* Summarized Message */}
                {msg.summary && (
                  <p
                    className={`p-3 rounded-2xl mt-1 bg-gray-300 text-[12px] md:text-sm ${
                      theme === "light" ? "text-black" : "text-black"
                    }`}
                  >
                    <span className="text-sm md:text-lg font-semibold text-blue-500">
                      Summary:
                    </span>{" "}
                    {msg.summary}
                  </p>
                )}

                
                {/* Language Selection */}
                <div className="md:mt-2 flex items-center gap-2 mt-5">
                  <select
                    value={msg.selectedLanguage || "en"}
                    onChange={(e) => {
                      const newLanguage = e.target.value;
                      setMessages((prevMessages) =>
                        prevMessages.map((m) =>
                          m.id === msg.id
                            ? { ...m, selectedLanguage: newLanguage }
                            : m
                        )
                      );
                    }}
                    className={`border border-blue-500  hover:border-2 p-1 rounded focus:outline-none text-[10px] md:text-sm cursor-pointer ${
                      theme === "light" ? "bg-white" : "bg-black"
                    }`}
                  >
                    {languageNames &&
                      Object.entries(languageNames).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                  </select>


                  {/* Translate Language */}
                  <button
                    className="bg-blue-500 text-white p-2 md:p-2 rounded-lg cursor-pointer flex items-center gap-1 text-[10px] md:text-sm hover:bg-blue-600"
                    onClick={() => {
                      handleTranslate(index);
                    }}
                    disabled={loadingMessage[`translate-${index}`]}
                  >
                    {loadingMessage[`translate-${index}`] ? (
                      <img
                        src={spinner}
                        alt="Loading..."
                        className="w-[10px] h-[10px] md:w-5 md:h-5 inline"
                      />
                    ) : (
                      <MdOutlineTranslate className="text-[10px] md:text-sm" />
                    )}{" "}
                    Translate
                  </button>
                </div>
                
                {/* Translate Message */}
                {msg.translation && (
                  <p className="p-3 text-white rounded-2xl mt-1 bg-blue-500 text-[12px] md:text-sm">
                    <span className="text-sm md:text-lg font-semibold text-gray-500">
                      Translation:{" "}
                    </span>{" "}
                    {msg.translation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Text Input */}
          <div className="w-full px-3 sm:px-5 md:px-8 lg:px-10 md:mb-5">
            <h1 className="text-xs md:text-lg text-blue-500 font-semibold my-1">
              Translate and Summarize text
            </h1>
            <div className="flex items-center gap-3 ">
              <textarea
                placeholder="Type your text..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows="2"
                className="flex-grow text-xs md:text-lg  border border-blue-500 rounded-2xl focus:outline-none p-2 scroll-smooth resize-none max-h-50"
                disabled={loading}
              />
              <button
                className="p-3 rounded-full bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                onClick={handleSend}
                disabled={loadingMessage.sending}
              >
                {loadingMessage.sending ? (
                  <img
                    src={spinner}
                    alt="Loading..."
                    className="w-5 h-5 inline"
                  />
                ) : (
                  <IoMdArrowRoundUp />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AiInterface;
