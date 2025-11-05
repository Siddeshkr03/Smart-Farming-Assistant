import React, { useState, useRef, useEffect } from "react";
import "./Home.css";
import botAvatar from "../assets/bot-avatar.png";
import userAvatar from "../assets/u-avatar.png";
import DashboardCards from "../components/DashboardCards";

// 📦 Using your existing local JSON imports
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

  // 🌍 Fetch weather (OpenWeatherMap public API without .env)
  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = "54c97255a7876f103ea635bc8cd671d9"; // Direct key usage
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data = await res.json();
      setWeather({
        temperature: data.main?.temp ?? "--",
        humidity: data.main?.humidity ?? "--",
        rainfall: data.rain ? data.rain["1h"] || 0 : 0,
        city: data.name || "Unknown",
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

  // 🎤 Initialize Speech Recognition (kept same style as your original)
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
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language === "en" ? "en-IN" : "kn-IN";
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // ✍️ Bot typing animation
  const typeBotMessage = (text) => {
    let index = 0;
    let botText = "";
    setChat((prev) => [...prev, { sender: "bot", text: "" }]);

    const interval = setInterval(() => {
      botText += text[index] ?? "";
      index++;
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: botText };
        return updated;
      });
      if (index >= text.length) {
        clearInterval(interval);
        speakText(text);
      }
    }, 30);
  };

  /* ----------------------------- NEW HELPERS ----------------------------- */

  // Normalize helpers
  const normalize = (s = "") =>
    s.toString().trim().toLowerCase().replace(/\s+/g, " ");
  const includesNorm = (hay = "", needle = "") =>
    normalize(hay).includes(normalize(needle));

  // soilData can be either:
  //  A) array: [{ district, soilTypes:[{ name, kannadaName, ... }]}...]
  //  B) object: { "Mandya": { ... } }  (backward-compatible)
  const soilByDistrict = React.useMemo(() => {
    try {
      if (Array.isArray(soilData)) {
        const map = {};
        for (const entry of soilData) {
          if (entry?.district) map[normalize(entry.district)] = entry;
        }
        return map;
      }
      const map = {};
      for (const k of Object.keys(soilData || {})) {
        map[normalize(k)] = soilData[k];
      }
      return map;
    } catch {
      return {};
    }
  }, []);

  const allDistricts = React.useMemo(() => {
    try {
      return Array.isArray(soilData)
        ? soilData.map((s) => s?.district).filter(Boolean)
        : Object.keys(soilData || {});
    } catch {
      return [];
    }
  }, []);

  // cropData expected as array of crop objects with name/kannadaName
  const cropByName = React.useMemo(() => {
    const map = {};
    try {
      if (Array.isArray(cropData)) {
        for (const c of cropData) {
          const en = c?.name ? normalize(c.name) : null;
          const kn = c?.kannadaName ? normalize(c.kannadaName) : null;
          if (en) map[en] = c;
          if (kn) map[kn] = c;
        }
      }
    } catch {}
    return map;
  }, []);

  const allCropNames = React.useMemo(() => {
    try {
      if (!Array.isArray(cropData)) return [];
      const names = [];
      for (const c of cropData) {
        if (c?.name) names.push(c.name);
        else if (c?.kannadaName) names.push(c.kannadaName);
      }
      return names;
    } catch {
      return [];
    }
  }, []);

  const extractDistrict = (text) => {
    const low = normalize(text);
    // direct include against known districts
    for (const d of allDistricts) {
      if (includesNorm(low, d)) return d;
    }
    // patterns like "soil of <name>" or "<name> district"
    const m1 = low.match(/soil\s+of\s+([a-z\s]+)/i);
    const m2 = low.match(/([a-z\s]+)\s+district/i);
    const candidate = normalize(m1?.[1] || m2?.[1] || "");
    if (candidate) {
      const hit = allDistricts.find((d) => {
        const nd = normalize(d);
        return nd.includes(candidate) || candidate.includes(nd);
      });
      if (hit) return hit;
    }
    return null;
  };

  const extractCropKey = (text) => {
    const low = normalize(text);
    const keys = Object.keys(cropByName);
    for (const k of keys) {
      if (low.includes(k)) return k;
    }
    // also handle "about Banana" / "on Banana" / "for Banana"
    const m = low.match(/\b(about|on|for)\s+([a-z\u0C80-\u0CFF\s\(\)]+)/i);
    if (m?.[2]) {
      const cand = normalize(m[2]);
      const hit = keys.find((k) => k.includes(cand) || cand.includes(k));
      if (hit) return hit;
    }
    return null;
  };

  const formatSoilReply = (districtKey, lang) => {
    const entry = soilByDistrict[normalize(districtKey)];
    if (!entry) {
      const hint = allDistricts.slice(0, 8).join(", ") || "—";
      return lang === "en"
        ? `Please specify a valid district. `
        : `ದಯವಿಟ್ಟು ಮಾನ್ಯ ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ನೀಡಿ.`;
    }

    // Support both shapes: array entry or flat object with soil info
    const districtName = entry.district || districtKey;
    const s =
      Array.isArray(entry.soilTypes) && entry.soilTypes.length
        ? entry.soilTypes[0]
        : entry;

    if (lang === "en") {
      return [
        `🧱 ${districtName} — ${s.name || "Soil"}`,
        s.description ? `ℹ️ ${s.description}` : null,
        Array.isArray(s.suitableCrops)
          ? `🌾 Suitable crops: ${s.suitableCrops.join(", ")}`
          : null,
        s.waterHoldingCapacity ? `💧 Water holding: ${s.waterHoldingCapacity}` : null,
        s?.nutrients
          ? `🧪 pH: ${s?.nutrients?.pH ?? "-"}, N: ${s?.nutrients?.Nitrogen ?? "-"}, P: ${s?.nutrients?.Phosphorus ?? "-"}, K: ${s?.nutrients?.Potassium ?? "-"}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    }
    return [
      `🧱 ${districtName} — ${s.kannadaName || s.name || "ಮಣ್ಣು"}`,
      s.description ? `ℹ️ ${s.description}` : null, // use Kannada desc if you have it
      Array.isArray(s.suitableCrops)
        ? `🌾 ಬೆಳೆಗಳು: ${s.suitableCrops.join(", ")}`
        : null,
      s.waterHoldingCapacity ? `💧 ನೀರಿನ ಹಿಡಿತ: ${s.waterHoldingCapacity}` : null,
      s?.nutrients
        ? `🧪 pH: ${s?.nutrients?.pH ?? "-"}, ನೈ: ${s?.nutrients?.Nitrogen ?? "-"}, ಫೋ: ${s?.nutrients?.Phosphorus ?? "-"}, ಪೊ: ${s?.nutrients?.Potassium ?? "-"}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const formatCropReply = (crop, lang) => {
    if (!crop) {
      const examples = allCropNames.slice(0, 8).join(", ") || "—";
      return lang === "en"
        ? `Which crop? Try a name like: ${examples}.`
        : `ಯಾವ ಬೆಳೆ? ಉದಾ: ${examples}.`;
    }
    const title =
      lang === "en"
        ? `🌱 ${crop.name || crop.kannadaName}`
        : `🌱 ${crop.kannadaName || crop.name}`;

    const lines = [
      title,
      crop.scientificName ? `🔬 ${crop.scientificName}` : null,
      crop.description ? `ℹ️ ${crop.description}` : null,
      crop.soilType ? (lang === "en" ? `🧱 Soil: ${crop.soilType}` : `🧱 ಮಣ್ಣು: ${crop.soಿಲType}`) : null,
      crop.soilpH ? `🧪 pH: ${crop.soilpH}` : null,
      crop.growthConditions?.temperature ? `🌡️ Temp: ${crop.growthConditions.temperature}` : null,
      crop.growthConditions?.rainfall ? `🌧️ Rain: ${crop.growthConditions.rainfall}` : null,
      crop.growthConditions?.light ? `☀️ Light: ${crop.growthConditions.light}` : null,
      crop.growthConditions?.climate ? `🌤️ Climate: ${crop.growthConditions.climate}` : null,
      crop.fertilizer
        ? `🧯 Fertilizer N-P-K: ${crop.fertilizer.nitrogen || "-"} / ${crop.fertilizer.phosphorus || "-"} / ${crop.fertilizer.potassium || "-"}`
        : null,
      crop.irrigation?.frequency
        ? `🚰 Irrigation: ${crop.irrigation.frequency}${crop.irrigation.method ? `, ${crop.irrigation.method}` : ""}`
        : null,
      crop.plantingDetails?.season ? `🗓️ Planting: ${crop.plantingDetails.season}` : null,
      crop.plantingDetails?.spacing ? `📏 Spacing: ${crop.plantingDetails.spacing}` : null,
      crop.plantingDetails?.seedRate ? `🌾 Seed rate: ${crop.plantingDetails.seedRate}` : null,
      crop.harvesting?.duration
        ? `⏱️ Harvest: ${crop.harvesting.duration}${crop.harvesting.method ? `, ${crop.harvesting.method}` : ""}`
        : null,
      crop.yield ? `📈 Yield: ${crop.yield}` : null,
      crop.economicValue?.marketPrice ? `💰 Price: ${crop.economicValue.marketPrice}` : null,
      Array.isArray(crop.interestingFacts) && crop.interestingFacts.length
        ? `✨ Facts: ${crop.interestingFacts.join(" • ")}`
        : null,
    ].filter(Boolean);

    return lines.join("\n");
  };

  /* --------------------------- /NEW HELPERS END -------------------------- */

  // 🧠 Bot Logic (updated to use district & crop name)
  const handleBotResponse = (userText) => {
    const lower = normalize(userText);
    let botReply = "";

    // Weather Query
    if (lower.includes("weather") || lower.includes("ಹವಾಮಾನ")) {
      botReply =
        language === "en"
          ? `Weather in ${weather.city}: ${weather.temperature}°C, humidity ${weather.humidity}%, rainfall ${weather.rainfall}mm.`
          : `${weather.city} ನ ಹವಾಮಾನ: ತಾಪಮಾನ ${weather.temperature}°C, ತೇವಾಂಶ ${weather.humidity}%, ಮಳೆ ${weather.rainfall}mm.`;

      // Soil Info (by district)
    } else if (lower.includes("soil") || lower.includes("ಮಣ್ಣು")) {
      const district =
        extractDistrict(lower) ||
        allDistricts.find((d) => includesNorm(lower, d));
      if (district) {
        botReply = formatSoilReply(district, language);
      } else {
        const hint = allDistricts.slice(0, 8).join(", ") || "—";
        botReply =
          language === "en"
            ? `Please specify a district for soil info.`
            : `ಮಣ್ಣಿನ ಮಾಹಿತಿಗೆ ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ಹೇಳಿ. `;
      }

      // Crop Info (by crop name, not season)
    } else if (
      lower.includes("crop") ||
      lower.includes("crops") ||
      lower.includes("ಬೆಳೆ") ||
      extractCropKey(lower)
    ) {
      const key = extractCropKey(lower);
      if (key && cropByName[key]) {
        botReply = formatCropReply(cropByName[key], language);
      } else {
        const examples = allCropNames.slice(0, 8).join(", ") || "—";
        botReply =
          language === "en"
            ? `Which crop? Type a crop name, e.g., ${examples}.`
            : `ಯಾವ ಬೆಳೆ? ಉದಾಹರಣೆಗಳು: ${examples}.`;
      }

      // Default fallback
    } else {
      const dHint = allDistricts.slice(0, 5).join(", ");
      const cHint = allCropNames.slice(0, 5).join(", ");
      botReply =
        language === "en"
          ? `I'm your Smart Farming Assistant! Ask about weather, soil and crop. `
          : `ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ!`
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
