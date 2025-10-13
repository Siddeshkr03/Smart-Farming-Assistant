// src/pages/Home.jsx
import React, { useState, useRef, useEffect } from "react";
import "./Home.css";
import botAvatar from "../assets/bot-avatar.png";
import userAvatar from "../assets/u-avatar.png";
import DashboardCards from "../components/DashboardCards";

const Home = () => {
  const [listening, setListening] = useState(false);
  const [chat, setChat] = useState([]);
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
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      // Only use final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (!transcript) return;

      // Add user message
      setChat((prev) => [...prev, { sender: "user", text: transcript }]);

      // Bot response with typing animation
      const botReply = "This is a bot response to: " + transcript;
      typeBotMessage(botReply);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }

  // Start/Stop voice recognition
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

  // Text-to-Speech
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Typing animation for bot
  const typeBotMessage = (text) => {
    let index = 0;
    let botText = "";

    // Add placeholder bot message
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
    }, 30); // typing speed
  };

  return (
    <div className="home-container">
      {/* Left Column: Chat */}
      <div className="chat-column">
        {/* Chat Header */}
        <div className="chat-header">
          <img src={botAvatar} alt="Bot" className="chat-avatar" />
          <h2>Smart Farming Assistant</h2>
        </div>

        {/* Chat Messages */}
        <div className="chat-container">
          {chat.length === 0 && (
            <p className="chat-placeholder">Your conversation will appear here...</p>
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

        {/* Floating Mic Button */}
        <button
          onClick={handleVoiceClick}
          className={`voice-btn ${listening ? "listening" : ""}`}
        >
          {listening ? "Listening..." : "🎤"}
        </button>
      </div>

      {/* Right Column: Dashboard Cards */}
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
