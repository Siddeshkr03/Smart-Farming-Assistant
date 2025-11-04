import React, { useState } from "react";
import cropData from "../data/pestData.json";
import "./Disease.css";

const Disease = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState("en"); // 'en' or 'kn'

  // 🔍 Search Logic
  const handleSearch = () => {
    const lower = query.toLowerCase();
    const crop = cropData.find((item) =>
      item.crop.toLowerCase().includes(lower)
    );

    if (crop) {
      setResult(crop);
    } else {
      setResult(null);
      alert(language === "en" ? "No data found for this crop." : "ಈ ಬೆಳೆಗೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.");
      setMessage("❌ No data found");
    }
  };

  // 🎙 Voice Input
  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = language === "en" ? "en-IN" : "kn-IN";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
  };

  // 🌐 Language Toggle
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "kn" : "en"));
  };

  return (
    <div className="disease-page">
      <h2 className="title">
        🌿 {language === "en" ? "Pest and Disease Information" : "ಕೀಟ ಮತ್ತು ರೋಗ ಮಾಹಿತಿ"}
      </h2>

      {/* 🔍 Search / Voice / Language Controls */}
      <div className="search-section">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            language === "en"
              ? "Enter crop name (e.g., Rice, Tomato)"
              : "ಬೆಳೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ: ಅಕ್ಕಿ, ಟೊಮ್ಯಾಟೊ)"
          }
        />
        <button onClick={handleSearch}>
          {language === "en" ? "Search" : "ಹುಡುಕಿ"}
        </button>
        <button onClick={handleVoiceInput}>🎙Voice</button>
        <button onClick={toggleLanguage}>
          {language === "en" ? "ಕನ್ನಡ" : "English"}
        </button>
      </div>

      {/* 🧾 Display Results */}
      {result && (
        <div className="result-card">
          <h3>{result.crop}</h3>

          {/* Diseases */}
          <section>
            <h4>🦠 {language === "en" ? "Diseases" : "ರೋಗಗಳು"}</h4>
            <ul>
              {result.diseases.map((d, i) => (
                <li key={i}>
                  <b>{language === "en" ? d.name_en : d.name_kn}:</b>{" "}
                  {language === "en" ? d.symptoms_en : d.symptoms_kn}
                </li>
              ))}
            </ul>
          </section>

          {/* Pests */}
          <section>
            <h4>🪲 {language === "en" ? "Pests" : "ಕೀಟಗಳು"}</h4>
            <ul>
              {result.pests.map((p, i) => (
                <li key={i}>
                  <b>{language === "en" ? p.name_en : p.name_kn}:</b>{" "}
                  {language === "en" ? p.description_en : p.description_kn}
                </li>
              ))}
            </ul>
          </section>

          {/* Preventive Measures */}
          <section>
            <h4>🌿 {language === "en" ? "Preventive Measures" : "ತಡೆ ಕ್ರಮಗಳು"}</h4>
            <ul>
              {result.preventiveMeasures.map((m, i) => (
                <li key={i}>
                  {language === "en" ? m.en : m.kn}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default Disease;
