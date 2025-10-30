import React, { useState, useEffect } from "react";
import cropData from "../data/cropData.json";
import "./CropHealth.css";

function CropHealth() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [searchedCrops, setSearchedCrops] = useState([]);

  // Load crops from localStorage
  useEffect(() => {
    const savedCrops = localStorage.getItem("searchedCrops");
    if (savedCrops) setSearchedCrops(JSON.parse(savedCrops));
  }, []);

  // Save crops to localStorage
  useEffect(() => {
    localStorage.setItem("searchedCrops", JSON.stringify(searchedCrops));
  }, [searchedCrops]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "kn" : "en"));
    setSearch("");
    setMessage("");
  };

  // Voice input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
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

    recognition.onerror = () => setMessage("🎤 Voice recognition error.");
  };

  // Search crops
  const handleSearch = (customQuery) => {
    const query = (customQuery || search).trim().toLowerCase();
    if (!query) {
      setMessage("⚠️ Please enter or speak a crop name.");
      return;
    }

    setMessage("🔍 Searching crop details...");

    const foundCrop = cropData.find(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.kannadaName?.toLowerCase().includes(query)
    );

    setTimeout(() => {
      if (foundCrop) {
        const exists = searchedCrops.some(
          (c) =>
            c.name.toLowerCase() === foundCrop.name.toLowerCase() ||
            c.kannadaName.toLowerCase() === foundCrop.kannadaName.toLowerCase()
        );

        if (!exists) {
          setSearchedCrops((prev) => [...prev, foundCrop]);
          setMessage("");
        } else {
          setMessage("✅ Crop already displayed.");
        }
      } else {
        setMessage("❌ No data found for this crop.");
      }
    }, 600);
  };

  // Delete one crop
  const handleDeleteCrop = (index) => {
    const updated = searchedCrops.filter((_, i) => i !== index);
    setSearchedCrops(updated);
    localStorage.setItem("searchedCrops", JSON.stringify(updated));
  };

  // Clear all crops
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all crops?")) {
      setSearchedCrops([]);
      localStorage.removeItem("searchedCrops");
    }
  };

  return (
    <div className="crop-container">
      <div className="header-section">
        <h2>🌾 Crop Identification & Health Analysis</h2>
        <button className="lang-toggle" onClick={toggleLanguage}>
          🌐 {language === "en" ? "Switch to Kannada" : "Switch to English"}
        </button>
      </div>

      <p className="note">
        {language === "en"
          ? "Enter or speak a crop name to fetch details. Previous crops stay visible."
          : "ಬೆಳೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಹೇಳಿ. ಹಿಂದಿನ ಬೆಳೆಗಳ ವಿವರಗಳು ಪುಟದಲ್ಲಿ ಉಳಿಯುತ್ತವೆ."}
      </p>

      <div className="input-section">
        <input
          type="text"
          placeholder={
            language === "en"
              ? "Enter crop name (e.g., Tomato)"
              : "ಬೆಳೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ: ಟೊಮ್ಯಾಟೊ)"
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

      <div className="crop-history">
        <h3>{language === "en" ? "🪴 Fetched Crops" : "🪴 ಪಡೆದ ಬೆಳೆಗಳು"}</h3>

        <div className="crop-grid">
          {searchedCrops.map((crop, index) => (
            <div key={index} className="crop-card">
              <button
                className="delete-btn"
                onClick={() => handleDeleteCrop(index)}
              >
                ✖
              </button>

              {crop.image && (
                <img src={crop.image} alt={crop.name} className="crop-img" />
              )}
              <h4>
                {crop.kannadaName} ({crop.name})
              </h4>
              <p>
                <strong>🧬 Scientific Name:</strong>{" "}
                {crop.scientificName || "Not Available"}
              </p>
              <p>
                <strong>🌱 Soil Type:</strong> {crop.soilType || "Not specified"}
              </p>
              <p>
                <strong>💧 Fertilizer:</strong>{" "}
                {crop.fertilizer?.perAcre ||
                  crop.fertilizer?.basal ||
                  "Use organic manure or balanced NPK fertilizers"}
              </p>
              <p>
                <strong>🌤 Growth Conditions:</strong>{" "}
                {crop.growthConditions
                  ? `${crop.growthConditions.temperature || ""}, ${
                      crop.growthConditions.climate || ""
                    }`
                  : "Requires moderate climate with proper sunlight"}
              </p>
              <p>
                <strong>📅 Planting Season:</strong>{" "}
                {crop.plantingDetails?.season || "Seasonal crop"}
              </p>
              <p>
                <strong>💰 Yield:</strong> {crop.yield || "Yield varies by soil"}
              </p>
              <p>
                <strong>🦠 Diseases:</strong>{" "}
                {crop.commonDiseases || "May suffer from common fungal infections"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CropHealth;
