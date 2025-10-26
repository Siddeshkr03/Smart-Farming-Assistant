import React, { useState, useEffect, useRef } from "react";
import "./Soil.css";

const Soil = () => {
  const [soilData, setSoilData] = useState(null);
  const [city, setCity] = useState("Bengaluru");
  const [inputCity, setInputCity] = useState("Bengaluru");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const spokenCity = event.results[0][0].transcript;
        setInputCity(spokenCity);
        setCity(spokenCity);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  // Mock API for soil data (you can replace this with real API)
  const fetchSoilData = async (cityName) => {
    setSoilData(null); // show loading
    await new Promise((r) => setTimeout(r, 1000)); // simulate delay

    const mockData = {
      city: cityName,
      type: "Loamy",
      color: "Dark Brown",
      pH: 6.8,
      ec: 1.2,
      temperature: 26,
      moisture: 55,
      nutrients: {
        N: "Medium",
        P: "Low",
        K: "High",
        OrganicCarbon: "Moderate",
        Sulphur: "Low",
      },
      healthIndex: 82,
      suitableCrops: ["Maize 🌽", "Groundnut 🥜", "Sunflower 🌻"],
      unsuitableCrops: ["Wheat 🌾"],
      fertilizerRecommendation:
        "Apply 60kg N, 30kg P₂O₅, 40kg K₂O per acre. Use Urea, DAP, and MOP.",
    };

    setSoilData(mockData);
  };

  useEffect(() => {
    fetchSoilData(city);
  }, [city]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }
    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  if (!soilData)
    return (
      <div className="soil-container">
        <h2>🌱 Soil Dashboard</h2>
        <div className="input-wrapper">
          <input
            type="text"
            className="city-input"
            placeholder="🎤 Speak or type location..."
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputCity.trim() !== "") {
                setCity(inputCity.trim());
              }
            }}
          />
          <button
            className={`mic-btn ${listening ? "listening" : ""}`}
            onClick={handleVoiceInput}
            title="Speak location"
          >
            🎤
          </button>
        </div>
        <p className="loading">Fetching soil data for {inputCity}...</p>
      </div>
    );

  return (
    <div className="soil-container">
      <h2>🌱 Soil Dashboard</h2>

      <div className="input-wrapper">
        <input
          type="text"
          className="city-input"
          placeholder="🎤 Speak or type location..."
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputCity.trim() !== "") {
              setCity(inputCity.trim());
            }
          }}
        />
        <button
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={handleVoiceInput}
          title="Speak location"
        >
          🎤
        </button>
      </div>

      {/* Soil Overview */}
      <div className="soil-section">
        <h3>🧾 Soil Overview</h3>
        <div className="soil-grid">
          <div className="soil-card">Type: {soilData.type}</div>
          <div className="soil-card">Color: {soilData.color}</div>
          <div className="soil-card">pH: {soilData.pH}</div>
          <div className="soil-card">EC: {soilData.ec} dS/m</div>
          <div className="soil-card">Temp: {soilData.temperature}°C</div>
          <div className="soil-card">Moisture: {soilData.moisture}%</div>
        </div>
      </div>

      {/* Nutrient Composition */}
      <div className="soil-section">
        <h3>🌿 Nutrient Composition</h3>
        <div className="soil-grid">
          {Object.entries(soilData.nutrients).map(([key, value]) => (
            <div key={key} className="soil-card">
              {key}: {value}
            </div>
          ))}
        </div>
      </div>

      {/* Soil Health Index */}
      <div className="soil-section">
        <h3>❤️ Soil Health Index</h3>
        <div className="soil-card large">
          <h1>{soilData.healthIndex}%</h1>
          <p>
            {soilData.healthIndex >= 80
              ? "Healthy 🌱"
              : soilData.healthIndex >= 50
              ? "Moderate ⚠️"
              : "Poor 🚫"}
          </p>
        </div>
      </div>

      {/* Crop Suitability */}
      <div className="soil-section">
        <h3>🌾 Crop Suitability</h3>
        <div className="soil-grid">
          <div className="soil-card">
            <strong>Suitable:</strong> {soilData.suitableCrops.join(", ")}
          </div>
          <div className="soil-card">
            <strong>Not Suitable:</strong> {soilData.unsuitableCrops.join(", ")}
          </div>
        </div>
      </div>

      {/* Fertilizer Recommendation */}
      <div className="soil-section">
        <h3>🧪 Fertilizer Recommendation</h3>
        <div className="soil-card large">
          <p>{soilData.fertilizerRecommendation}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="soil-section">
        <h3>💡 Soil Conservation Tips</h3>
        <ul className="tips-list">
          <li>Use organic compost to improve soil fertility.</li>
          <li>Rotate crops to balance nutrient levels.</li>
          <li>Prevent erosion by planting cover crops.</li>
          <li>Avoid over-irrigation to reduce nutrient loss.</li>
        </ul>
      </div>
    </div>
  );
};

export default Soil;
