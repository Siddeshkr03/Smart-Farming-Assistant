// src/components/CropHealth.jsx
import React, { useState } from "react";
import "./CropHealth.css";

const CropHealth = () => {
  const [plantName, setPlantName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://plant.id/api/v3/identify";
  const API_KEY = "7OICEhjghJboOUZjFjk0RzvLxNiRZm0Ns6xKKhlK03p44hJ6tR";

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!plantName && !imageFile) {
      setError("Please enter a crop name or upload a photo.");
      return;
    }

    setLoading(true);

    let payload = {};

    if (plantName && !imageFile) {
      payload = {
        api_key: API_KEY,
        plant_name: plantName,
      };
    } else if (imageFile && !plantName) {
      const base64 = await toBase64(imageFile);
      payload = {
        api_key: API_KEY,
        images: [base64],
      };
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // remove data:image/...;base64,
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="crop-health-container">
      <h2>🌿 Crop Health Analysis</h2>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter crop name"
          value={plantName}
          onChange={(e) => {
            setPlantName(e.target.value);
            setImageFile(null); // disable image if name is entered
          }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            setPlantName(""); // disable name if image is uploaded
          }}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Fetching..." : "Analyze"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-section">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CropHealth;
