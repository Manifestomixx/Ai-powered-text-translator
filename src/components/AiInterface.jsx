import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineTranslate } from "react-icons/md";
import { IoLogoIonitron } from "react-icons/io";
import { useLanguageDetector } from "../chrome/languageDetector";
import { useSummarizer } from "../chrome/Summarizer";
import { useTranslator } from "../chrome/TextTranslator";
import spinner from "../assets/svg-spinners--180-ring-with-bg.svg"



const AiInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessage, setLoadingMessage] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { detectLanguage, isLoading, detectedLanguage, languageNames } =
    useLanguageDetector();
  const { summary, summarizeText } = useSummarizer();
  const { translateText, translatedText, error } = useTranslator();
  const navigate = useNavigate();

  


  function handleLogo () {
    navigate("/cover");
  }

  function clearMessage(id) {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  } 

  const handleSummarize = async (index) => {
    setLoadingMessage((prev) => ({ ...prev, [index]: true }));
    try {
      const message = messages[index];
      console.log("Summarizing started...");
const summaryText = await summarizeText(message.text);
console.log("Summarizing completed:", summaryText);
      if (summaryText) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = { ...updatedMessages[index], summary: summaryText };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error summarizing text:", error);
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
    const newMessage = { id: Date.now(), text: inputText, detectedLanguage, summary: "", translation: "", selectedLanguage };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    setTimeout(() => {
      const messageIndex = messages.findIndex(msg => msg.id === newMessage.id);
      if (messageIndex !== -1) {
        handleTranslate(messageIndex);
      }
    }, 100);
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
      const message = messages[index];

      if (!message.selectedLanguage || message.detectedLanguage === message.selectedLanguage) {
        throw new Error("Source and target languages must be different.");
      }

      const translation = await translateText(message.text, message.detectedLanguage, message.selectedLanguage);
      if (translation) {
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) => (i === index ? { ...msg, translation } : msg))
        );
      }
    } catch (error) {
      console.error("Translation error:", error);
      setMessages((prevMessages) =>
      prevMessages.map((msg, i) =>
        i === index ? { ...msg, translation: "Translation not available for selected language." } : msg
      )
    );
    } finally {
      setLoadingMessage((prev) => ({ ...prev, [`translate-${index}`]: false }));
    }
  };

  useEffect(() => {
    if (summary && messages.length > 0) {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.summary === "" ? { ...msg, summary } : msg
        )
      );
    }

  }, [summary]);

  return (
    <main className="relative h-screen md:min-h-dvh overflow-hidden ">
      {/* Logo section */}
      <div className="text-start">
        <div className="flex items-center my-5 pl-4 cursor-pointer" onClick={handleLogo}>
        <IoLogoIonitron className="text-4xl md:text-7xl text-blue-400" />
          <div className="text-center">
        <h1 className="text-sm  text-gray-400"> <span className="font-semibold md:text-xl">LINGUA </span>TRANSLATOR</h1>
          </div>
        </div>
      </div>
        
        <div className="border-b-[1px] border-gray-500 w-full mt-4"></div>
      <div className="px-10">


        <div className=" flex flex-col justify-center items-center mt-10 md:mt-30 p-2">
        <p className="text-gray-500 flex items-center gap-1"><IoLogoIonitron className="text-xl md:text-3xl text-gray-400" /> <span className="text-sm md:text-xl font-semibold">Welcome to Lingua Language Translator!</span></p>
        <p className="text-[12px] md:text-sm text-gray-400 text-center">Effortlessly translate and summarize your text in seconds. Just type, and let Lingua do the magic! </p>
        </div>

        {/* section 2 */}
      <div className=" w-full  p-5 bg-white">
        {/* Chat Output */}
        <div className="flex-grow overflow-y-auto h-auto mb-4 max-h-[20rem] md:max-h-[40rem]">
          {messages.map((msg, index) => (
            <div key={msg.id} className="mb-4 p-2 border-b ">

              <div className="border-blue-400 border rounded-2xl space-y-1 p-3">
              <div className="flex justify-between w-full items-center">
                <h1 className="text-xl text-gray-500 font-semibold">Text Input</h1>
              <button onClick={() => clearMessage(msg.id)} className="text-white bg-blue-400 p-1 rounded-full cursor-pointer"><RxCross1 /></button>
              </div>
              <p className=" text-sm md:text-lg p-3">{msg.text}</p>
              </div>

              <div className="flex justify-between items-center"> 
              <small className="text-gray-500">Language: {msg.detectedLanguage}</small>
              {msg.text.length > 150 && msg.detectedLanguage === "en" && (
              <button onClick={() => handleSummarize(index)} className="mt-2 bg-blue-400 text-white p-2 rounded-lg cursor-pointer text-xs md:text-lg" disabled={loadingMessage[index]} >{loadingMessage[index] ? <img src={spinner} alt="Loading..." className="w-5 h-5 inline" /> : "Summarize"}</button>
            )}
              </div>
                
              {msg.summary && (
                <p className="p-3 rounded-2xl mt-1 bg-gray-300 text-sm md:text-lg"><span className="text-xl font-semibold text-blue-400">Summary:</span> {msg.summary}</p>
              )}

              <div className="md:mt-2 flex items-center gap-2 mt-5">
                <select
                  value={msg.selectedLanguage || "en"}
                  onChange={(e) => {
                    const newLanguage = e.target.value;
                    setMessages((prevMessages) =>
                      prevMessages.map((m) =>
                        m.id === msg.id ? { ...m, selectedLanguage: newLanguage } : m
                      )
                    );
                  }}
                  className="border border-blue-400 p-1 rounded focus:outline-none text-xs md:text-lg"
                >
                  {languageNames && Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code} >
                        {name}
                      </option>
                    ))}
                </select>
                
                <button
                  className="bg-blue-400 text-white p-1 md:p-2 rounded-lg cursor-pointer flex items-center gap-1"
                  onClick={() => {
                    handleTranslate(index);
                  }}
                  disabled={loadingMessage[`translate-${index}`]}
                  
                >
                  {loadingMessage[`translate-${index}`] ? <img src={spinner} alt="Loading..." className="w-5 h-5 inline" /> : <MdOutlineTranslate className="text-sx md:text-xl" />} Translate
                </button>
              </div>

              {msg.translation && (
                <p className="p-3 text-white rounded-2xl mt-1 bg-blue-400 text-sm md:text-lg">
                   <span className="text-xl font-semibold text-gray-500">Translation: </span> {msg.translation}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* textarea section */}
        <div className="absolute bottom-0 left-0 w-full px-3 sm:px-5 md:px-8 lg:px-10  mb-10">

        <h1 className="md:text-lg font-semibold my-1">What can I help with?</h1>
        <div className="flex items-center gap-3 ">
          <textarea
            placeholder="Type your text..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows="2"
            className="flex-grow  border border-blue-400 rounded-2xl focus:outline-none p-2 scroll-smooth resize-none max-h-40"
            disabled={loading}
          />
          <button
            className="p-3 rounded-full bg-blue-400 text-white"
            onClick={handleSend}
            disabled={loadingMessage.sending}
          >
            {loadingMessage.sending ? <img src={spinner} alt="Loading..." className="w-5 h-5 inline"/>: <IoMdSend />}
          </button>
        </div>
        </div>
      </div>
      </div>
    </main>
  );
};

export default AiInterface;
