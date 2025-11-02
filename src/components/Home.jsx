import React, { useState, useRef, useEffect } from "react";
import "./Home.css";
import botAvatar from "../assets/bot-avatar.png";
import userAvatar from "../assets/u-avatar.png";
import DashboardCards from "../components/DashboardCards";

// 📦 Import your local JSON data (you can replace these files later)
import soilData from "../data/soilData.json";
import cropData from "../data/cropData.json";

const Home = () => {
  const [listening, setListening] = useState(false);
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState("en");
  const [userInput, setUserInput] = useState("");

  // 🌦 Weather state
  const [weather, setWeather] = useState({
    temperature: "--",
    humidity: "--",
    rainfall: "--",
    city: "Loading...",
  });

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 🌍 Fetch weather (using OpenWeatherMap public API without .env)
  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = "54c97255a7876f103ea635bc8cd671d9"; // Direct key usage
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data = await res.json();
      setWeather({
        temperature: data.main.temp,
        humidity: data.main.humidity,
        rainfall: data.rain ? data.rain["1h"] || 0 : 0,
        city: data.name,
      });
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setWeather({ temperature: "--", humidity: "--", rainfall: "--", city: "Unavailable" });
    }
  };

  // 📍 Get user location once on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(12.9716, 77.5946) // Default Bengaluru
      );
    } else {
      fetchWeather(12.9716, 77.5946);
    }
  }, []);

  // Auto-scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 🎤 Initialize Speech Recognition
  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "en" ? "en-IN" : "kn-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChat((prev) => [...prev, { sender: "user", text: transcript }]);
      handleBotResponse(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }

  // 🌐 Language Toggle
  const toggleLanguage = () => {
    const newLang = language === "en" ? "kn" : "en";
    setLanguage(newLang);
    if (recognitionRef.current)
      recognitionRef.current.lang = newLang === "en" ? "en-IN" : "kn-IN";

    const msg =
      newLang === "en"
        ? "Language changed to English."
        : "ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.";
    typeBotMessage(msg);
  };

  // 🎤 Voice Button
  const handleVoiceClick = () => {
    if (!recognitionRef.current)
      return alert("Speech Recognition not supported in this browser.");

    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // 🔊 Bot speech output
  const speakText = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === "en" ? "en-IN" : "kn-IN";
    window.speechSynthesis.speak(utter);
  };

  // ✍️ Bot typing animation
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

  // 🧠 Bot Logic
  const handleBotResponse = (userText) => {
    const lower = userText.toLowerCase();
    let botReply = "";

    // Weather Query
    if (lower.includes("weather") || lower.includes("ಹವಾಮಾನ")) {
      botReply =
        language === "en"
          ? `Weather in ${weather.city}: ${weather.temperature}°C, humidity ${weather.humidity}%, rainfall ${weather.rainfall}mm.`
          : `${weather.city} ನ ಹವಾಮಾನ: ತಾಪಮಾನ ${weather.temperature}°C, ತೇವಾಂಶ ${weather.humidity}%, ಮಳೆ ${weather.rainfall}mm.`;

      // Soil Info
    } else if (lower.includes("soil") || lower.includes("ಮಣ್ಣು")) {
      const district = Object.keys(soilData).find((d) =>
        lower.includes(d.toLowerCase())
      );
      if (district) {
        const soil = soilData[district];
        botReply =
          language === "en"
            ? `🧱 ${district} soil: ${soil.description}\n🌾 Crops: ${soil.crops}\n💧 Water holding: ${soil.waterHolding}`
            : `${district} ಮಣ್ಣು: ${soil.description_kn}\nಬೆಳೆಗಳು: ${soil.crops_kn}\nನೀರಿನ ಹಿಡಿತ: ${soil.waterHolding}`;
      } else {
        botReply =
          language === "en"
            ? "Please specify a district to get soil information."
            : "ಮಣ್ಣಿನ ಮಾಹಿತಿಗಾಗಿ ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.";
      }

      // Crop Info
    } else if (lower.includes("crop") || lower.includes("ಬೆಳೆ")) {
      const season = Object.keys(cropData).find((s) =>
        lower.includes(s.toLowerCase())
      );
      if (season) {
        const crops = cropData[season];
        botReply =
          language === "en"
            ? `🌾 Recommended crops for ${season}: ${crops.join(", ")}.`
            : `${season} ಕಾಲಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು: ${crops.join(", ")}.`;
      } else {
        botReply =
          language === "en"
            ? "Please mention a season (Kharif, Rabi, or Summer)."
            : "ದಯವಿಟ್ಟು ಋತುವನ್ನು ಹೇಳಿ (ಖರೀಫ್, ರಬಿ ಅಥವಾ ಬೇಸಿಗೆ).";
      }

      // Default fallback
    } else {
      botReply =
        language === "en"
          ? "I'm your Smart Farming Assistant! Ask about soil, crops, or weather."
          : "ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ! ಮಣ್ಣು, ಬೆಳೆ ಅಥವಾ ಹವಾಮಾನ ಕುರಿತು ಕೇಳಿ.";
    }

    typeBotMessage(botReply);
  };

  // 💬 Send manual text
  const handleSend = () => {
    if (!userInput.trim()) return;
    setChat((prev) => [...prev, { sender: "user", text: userInput }]);
    handleBotResponse(userInput);
    setUserInput("");
  };

  return (
    <div className="home-container">
      {/* Chat Section */}
      <div className="chat-column">
        <div className="chat-header">
          <div className="chat-title">
            <img src={botAvatar} alt="Bot" className="chat-avatar" />
            <h2>Smart Farming Assistant</h2>
          </div>
          <button onClick={toggleLanguage} className="lang-toggle">
            {language === "en" ? "ಕನ್ನಡ" : "EN"}
          </button>
        </div>

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

        {/* Input Section */}
        <div className="input-section">
          <input
            type="text"
            placeholder={
              language === "en"
                ? "Type your question..."
                : "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ..."
            }
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>

        {/* Voice Button */}
        <button
          onClick={handleVoiceClick}
          className={`voice-btn ${listening ? "listening" : ""}`}
        >
          {listening ? "Listening..." : "🎤"}
        </button>
      </div>

      {/* Dashboard Section */}
      <div className="dashboard-column">
        <DashboardCards
          weather={{
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
          }}
          soil={{ moisture: 45, ph: 6.5 }}
          crops={["Rice", "Maize", "Pulses"]}
          pestAlerts={["Aphid", "Leafhopper"]}
        />
      </div>
    </div>
  );
};

export default Home;
