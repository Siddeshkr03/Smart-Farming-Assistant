import React, { useState } from "react";
import soilData from "../data/soilData.json";
import "./Soil.css";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SoilHealth() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("en");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

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

  // 🔍 Search by District
  const handleSearch = (customQuery) => {
    const query = (customQuery || search).trim().toLowerCase();
    if (!query) {
      setMessage("⚠️ Please enter or speak a district name.");
      setResults([]);
      return;
    }

    // ✅ Match district name (ignore spaces)
    const matchedDistrict = soilData.find((d) =>
      d.district.toLowerCase().replace(/\s+/g, "").includes(query.replace(/\s+/g, ""))
    );

    if (matchedDistrict) {
      setResults(matchedDistrict.soilTypes);
      setMessage(`✅ Found soils for ${matchedDistrict.district}`);
    } else {
      setResults([]);
      setMessage("❌ No data found for the entered district.");
    }
  };

  return (
    <div className="soil-container">
      {/* Header */}
      <div className="header-section">
        <h2>🌾 Soil Information by District</h2>
        <button
          className="lang-toggle"
          onClick={() => setLanguage((prev) => (prev === "en" ? "kn" : "en"))}
        >
          🌐 {language === "en" ? "Switch to Kannada" : "Switch to English"}
        </button>
      </div>

      <p className="note">
        {language === "en"
          ? "Enter a district name to view soil types and nutrient composition."
          : "ಜಿಲ್ಲೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಪೋಷಕಾಂಶ ನೋಡಲು."}
      </p>

      {/* Input Section */}
      <div className="input-section">
        <input
          type="text"
          placeholder={
            language === "en"
              ? "Enter district name (e.g., Mysuru)"
              : "ಜಿಲ್ಲೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ: ಮೈಸೂರು)"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => handleSearch()}>🔍 Search</button>
        <button onClick={handleVoiceInput}>🎤 Voice</button>
      </div>

      {message && <p className="message">{message}</p>}

      {/* Display Soil Data */}
      <div className="soil-grid">
        {results.map((soil, index) => {
          const nutrientData = Object.entries(soil.nutrients || {}).map(
            ([key, value]) => ({
              subject: key,
              A: typeof value === "number" ? value : 50, // default numeric conversion
            })
          );

          return (
            <div key={index} className="soil-card">
              <img
                src={soil.image || "/images/default-soil.jpg"}
                alt={soil.name}
                className="soil-img"
              />
              <h4>
                {soil.kannadaName} ({soil.name})
              </h4>
              <p><strong>🧱 Description:</strong> {soil.description}</p>
              <p><strong>🌾 Suitable Crops:</strong> {soil.suitableCrops.join(", ")}</p>
              <p><strong>💧 Water Holding:</strong> {soil.waterHoldingCapacity}</p>
              <p><strong>🌤 Conditions:</strong> {soil.conditions}</p>
              <p><strong>📍 Region:</strong> {soil.region}</p>

              {/* Radar Chart */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={nutrientData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Nutrients"
                      dataKey="A"
                      stroke="#2e7d32"
                      fill="#66bb6a"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SoilHealth;
