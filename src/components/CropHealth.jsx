import React, { useState } from "react";
import cropData from "../data/cropData.json";
import "./CropHealth.css";

function CropHealth() {
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // 🎤 Voice Input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "kn-IN"; // Kannada language
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setSearch(voiceText);
      handleSearch(voiceText);
    };

    recognition.onerror = () => {
      setMessage("🎤 Voice recognition error. Please try again.");
    };
  };

  // 🔍 Search Crop
  const handleSearch = (customQuery) => {
    const query = (customQuery || search).trim().toLowerCase();

    if (!query) {
      setMessage("⚠️ Please enter or speak a crop name.");
      return;
    }

    setMessage("🔍 Searching crop details...");
    setCrop(null);
    setImage(null);

    // ✅ Partial match search (English + Kannada)
    const foundCrop = cropData.find(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.kannadaName?.toLowerCase().includes(query)
    );

    setTimeout(() => {
      if (foundCrop) {
        setCrop(foundCrop);
        setMessage("");
      } else {
        setMessage("❌ No data found for this crop.");
      }
    }, 700);
  };

  // 📸 Image Upload (Optional)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSearch("");
    setCrop(null);
    setMessage("🪴 Analyzing uploaded image...");

    const fileName = file.name.toLowerCase();
    const foundCrop = cropData.find((c) =>
      fileName.includes(c.name?.toLowerCase())
    );

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setTimeout(() => {
        if (foundCrop) {
          setCrop(foundCrop);
          setMessage("");
        } else {
          setMessage(
            "❌ Could not identify crop from image. Try renaming it clearly."
          );
        }
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="crop-container">
      <h2>🌾 Crop Identification & Health Analysis</h2>
      <p className="note">
        Enter a crop name (English or Kannada), upload a photo, or use 🎤 voice input.
      </p>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter crop name (e.g., Tomato / ಟೊಮ್ಯಾಟೊ)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCrop(null);
            setImage(null);
          }}
        />
        <button onClick={() => handleSearch()}>Search</button>
        <button onClick={handleVoiceInput}>🎤 Voice</button>
        <span className="or-text">OR</span>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {message && <p className="message">{message}</p>}

      {image && (
        <div className="uploaded-preview">
          <img src={image} alt="Uploaded Crop" className="uploaded-img" />
        </div>
      )}

      {crop && (
        <div className="crop-details">
          {crop.image && (
            <img src={crop.image} alt={crop.name} className="crop-img" />
          )}
          <h3>
            {crop.kannadaName} ({crop.name})
          </h3>
          <p><strong>🧬 Scientific Name:</strong> {crop.scientificName || "N/A"}</p>
          <p><strong>🌱 Soil Type:</strong> {crop.soilType || "N/A"}</p>
          <p>
            <strong>💧 Fertilizer:</strong>{" "}
            {crop.fertilizer?.perAcre || crop.fertilizer?.basal || "N/A"}
          </p>
          <p>
            <strong>🌤 Growth Conditions:</strong>{" "}
            {crop.growthConditions
              ? `${crop.growthConditions.temperature || ""}, ${
                  crop.growthConditions.climate || ""
                }`
              : "N/A"}
          </p>
          <p>
            <strong>📅 Planting Season:</strong>{" "}
            {crop.plantingDetails?.season || "N/A"}
          </p>
          <p><strong>💰 Yield:</strong> {crop.yield || "N/A"}</p>
          <p><strong>🦠 Common Diseases:</strong> {crop.commonDiseases || "N/A"}</p>
        </div>
      )}
    </div>
  );
}

export default CropHealth;
