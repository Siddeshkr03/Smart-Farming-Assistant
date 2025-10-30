// src/pages/Home.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import botAvatar from "../assets/bot-avatar.png";
import userAvatar from "../assets/u-avatar.png";
import DashboardCards from "../components/DashboardCards";

const Home = () => {
  const [listening, setListening] = useState(false);
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState("en"); // 🔄 Toggle English/Kannada
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom when chat updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // Initialize Speech Recognition
  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "en" ? "en-IN" : "kn-IN";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (!transcript) return;

      setChat((prev) => [...prev, { sender: "user", text: transcript }]);
      handleBotResponse(transcript);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }

  // 🔄 Toggle Language Handler
  const toggleLanguage = () => {
    const newLang = language === "en" ? "kn" : "en";
    setLanguage(newLang);

    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang === "en" ? "en-IN" : "kn-IN";
    }

    const msg = newLang === "en" ? "Language changed to English" : "ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ";
    typeBotMessage(msg);
  };

  // 🎤 Start/Stop Voice Recognition
  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      return alert("Browser does not support Speech Recognition");
    }

    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // 🔊 Text-to-Speech
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-IN" : "kn-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  // ⌨️ Typing animation for bot
  const typeBotMessage = (text) => {
    let index = 0;
    let botText = "";

    setChat((prev) => [...prev, { sender: "bot", text: "" }]);

    const interval = setInterval(() => {
      botText += text[index];
      index++;

      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: botText };
        return updated;
      });

      if (index === text.length) {
        clearInterval(interval);
        speakText(text);
      }
    }, 30);
  };

  // 🤖 Bot Logic
  const handleBotResponse = async (userInput) => {
    const lower = userInput.toLowerCase();
    let botReply = "";

    // 🔹 Simple keyword-based logic
    if (lower.includes("weather")) {
      botReply =
        language === "en"
          ? "The weather today is sunny with a temperature of 28°C."
          : "ಇಂದು ಹವಾಮಾನ ಸೂರ್ಯಪ್ರಕಾಶದಿಂದ ಕೂಡಿದೆ, ತಾಪಮಾನ 28°C.";
      return typeBotMessage(botReply);
    } else if (lower.includes("soil")) {
      botReply =
        language === "en"
          ? "The soil moisture is 45% with a pH of 6.5 — great for wheat!"
          : "ಮಣ್ಣಿನ ತೇವಾಂಶ 45% ಮತ್ತು pH 6.5 — ಗೋಧಿಗೆ ಉತ್ತಮ.";
      return typeBotMessage(botReply);
    } else if (lower.includes("crop")) {
      botReply =
        language === "en"
          ? "This season, wheat, rice, and maize are good options."
          : "ಈ ಕಾಲದಲ್ಲಿ ಗೋಧಿ, ಅಕ್ಕಿ ಮತ್ತು ಮೆಕ್ಕೆಜೋಳ ಉತ್ತಮ ಆಯ್ಕೆಗಳು.";
      return typeBotMessage(botReply);
    } else if (lower.includes("pest")) {
      botReply =
        language === "en"
          ? "There’s a locust warning and possible aphid infestation."
          : "ಕಿಡುಗುಂಡು ಮತ್ತು ಆಫಿಡ್ ಕೀಟ ಹಾನಿಯ ಸಾಧ್ಯತೆ ಇದೆ.";
      return typeBotMessage(botReply);
    }

    // 🔹 Fallback to OpenAI API (optional)
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                language === "en"
                  ? "You are a helpful smart farming assistant giving answers in English."
                  : "ನೀವು ಕನ್ನಡದಲ್ಲಿ ಸಹಾಯ ಮಾಡುವ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ.",
            },
            { role: "user", content: userInput },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
        }
      );

      botReply = response.data.choices[0].message.content.trim();
      typeBotMessage(botReply);
    } catch (error) {
      console.error(error);
      botReply =
        language === "en"
          ? "Sorry, I couldn't connect to the AI service right now."
          : "ಕ್ಷಮಿಸಿ, ಈಗ AI ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.";
      typeBotMessage(botReply);
    }
  };

  return (
    <div className="home-container">
      {/* Left Column: Chat */}
      <div className="chat-column">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-title">
            <img src={botAvatar} alt="Bot" className="chat-avatar" />
            <h2>Smart Farming Assistant</h2>
          </div>

          {/* 🌐 Language Toggle Button */}
          <button onClick={toggleLanguage} className="lang-toggle">
            {language === "en" ? "ಕನ್ನಡ" : "EN"}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="chat-container">
          {chat.length === 0 && (
            <p className="chat-placeholder">
              {language === "en"
                ? "Your conversation will appear here..."
                : "ನಿಮ್ಮ ಸಂಭಾಷಣೆ ಇಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ..."}
            </p>
          )}
          {chat.map((msg, index) => (
            <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
              <img
                src={msg.sender === "user" ? userAvatar : botAvatar}
                alt={msg.sender}
                className="chat-avatar-small"
              />
              <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 🎤 Floating Mic Button */}
        <button
          onClick={handleVoiceClick}
          className={`voice-btn ${listening ? "listening" : ""}`}
        >
          {listening ? "Listening..." : "🎤"}
        </button>
      </div>

      {/* Right Column: Dashboard */}
      <div className="dashboard-column">
        <DashboardCards
          weather={{ temperature: 28, rainfall: 5, humidity: 70 }}
          soil={{ moisture: 45, ph: 6.5 }}
          crops={["Wheat", "Rice", "Maize"]}
          pestAlerts={["Locust warning", "Aphid infestation"]}
        />
      </div>
    </div>
  );
};

export default Home;
