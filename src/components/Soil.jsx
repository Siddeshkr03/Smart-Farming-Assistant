import React, { useState, useEffect } from "react";
import soilData from "../data/soilData.json"; // ✅ Soil data in /data folder
import "./Soil.css";

function SoilHealth() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [searchedSoils, setSearchedSoils] = useState([]);

  // 🧠 Load saved soils from localStorage
  useEffect(() => {
    const savedSoils = localStorage.getItem("searchedSoils");
    if (savedSoils) {
      setSearchedSoils(JSON.parse(savedSoils));
    }
  }, []);

  // 💾 Save soils whenever they change
  useEffect(() => {
    localStorage.setItem("searchedSoils", JSON.stringify(searchedSoils));
  }, [searchedSoils]);

  // 🌐 Language Toggle
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "kn" : "en"));
    setMessage("");
    setSearch("");
  };

  // 🎤 Voice Input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("🎙️ Voice input not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "kn" ? "kn-IN" : "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setSearch(voiceText);
      handleSearch(voiceText);
    };
  };

  // 🔍 Search Soil Type
  const handleSearch = (customQuery) => {
    const query = (customQuery || search).trim().toLowerCase();
    if (!query) {
      setMessage("⚠️ Please enter or speak a soil type.");
      return;
    }

    setMessage("🔍 Searching soil details...");

    const foundSoil = soilData.find(
      (s) =>
        s.name?.toLowerCase().includes(query) ||
        s.kannadaName?.toLowerCase().includes(query)
    );

    setTimeout(() => {
      if (foundSoil) {
        const exists = searchedSoils.some(
          (s) =>
            s.name.toLowerCase() === foundSoil.name.toLowerCase() ||
            s.kannadaName.toLowerCase() === foundSoil.kannadaName.toLowerCase()
        );

        if (!exists) {
          setSearchedSoils((prev) => [...prev, foundSoil]);
          setMessage("");
        } else {
          setMessage("✅ Soil already displayed.");
        }
      } else {
        setMessage("❌ No data found for this soil type.");
      }
    }, 600);
  };

  // 🗑️ Remove single soil card
  const handleRemove = (index) => {
    const updated = searchedSoils.filter((_, i) => i !== index);
    setSearchedSoils(updated);
    localStorage.setItem("searchedSoils", JSON.stringify(updated));
  };

  // 🗑️ Clear all
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all soils?")) {
      setSearchedSoils([]);
      localStorage.removeItem("searchedSoils");
    }
  };

  return (
    <div className="soil-container">
      <div className="header-section">
        <h2>🌍 Soil Information & Analysis</h2>
        <button className="lang-toggle" onClick={toggleLanguage}>
          🌐 {language === "en" ? "Switch to Kannada" : "Switch to English"}
        </button>
      </div>

      <p className="note">
        {language === "en"
          ? "Enter or speak a soil type to view its characteristics and crop suitability."
          : "ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಹೇಳಿ ಅದರ ವೈಶಿಷ್ಟ್ಯಗಳು ಮತ್ತು ಬೆಳೆಗೆ ಅನುಕೂಲತೆಗಳನ್ನು ನೋಡಲು."}
      </p>

      <div className="input-section">
        <input
          type="text"
          placeholder={
            language === "en"
              ? "Enter soil type (e.g., Red soil)"
              : "ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ನಮೂದಿಸಿ (ಉದಾ: ಕೆಂಪು ಮಣ್ಣು)"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => handleSearch()}>🔍 Search</button>
        <button onClick={handleVoiceInput}>🎤 Voice</button>
        <button onClick={handleClearAll} className="clear-btn">
          🗑️ Clear All
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="soil-history">
        <h3>{language === "en" ? "🪴 Fetched Soils" : "🪴 ಪಡೆದ ಮಣ್ಣುಗಳು"}</h3>
        <div className="soil-grid">
          {searchedSoils.map((soil, index) => (
            <div key={index} className="soil-card">
              <button
                className="delete-btn"
                onClick={() => handleRemove(index)}
                title="Remove soil"
              >
                🗑️
              </button>

              <img
                src={soil.image || "/images/default-soil.jpg"}
                alt={soil.name}
                className="soil-img"
              />

              <h4>
                {soil.kannadaName} ({soil.name})
              </h4>
              <p>
                <strong>🌱 Description:</strong> {soil.description || "N/A"}
              </p>
              <p>
                <strong>🌾 Suitable Crops:</strong>{" "}
                {soil.suitableCrops?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>💧 Water Holding Capacity:</strong>{" "}
                {soil.waterHoldingCapacity || "N/A"}
              </p>
              <p>
                <strong>🌤 Ideal Conditions:</strong>{" "}
                {soil.conditions || "N/A"}
              </p>
              <p>
                <strong>📍 Region Found:</strong> {soil.region || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SoilHealth;
