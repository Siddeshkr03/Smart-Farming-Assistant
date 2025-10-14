// src/components/DashboardCards.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardCards.css";

const DashboardCards = ({ weather, soil, crops, pestAlerts }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-cards">
      {/* Weather Card */}
      <div
        className="card"
        onClick={() => navigate("/weather")}
        style={{ cursor: "pointer" }}
      >
        <h3>🌤 Weather</h3>
        <p>Temperature: {weather.temperature}°C</p>
        <p>Rainfall: {weather.rainfall}mm</p>
        <p>Humidity: {weather.humidity}%</p>
      </div>

      {/* Soil Card */}
      <div
        className="card"
        onClick={() => navigate("/soil")}
        style={{ cursor: "pointer" }}
      >
        <h3>🌱 Soil</h3>
        <p>Moisture: {soil.moisture}%</p>
        <p>pH Level: {soil.ph}</p>
      </div>

      {/* Crops Card */}
      <div className="card">
        <h3>🌾 Recommended Crops</h3>
        <ul>
          {crops.map((crop, index) => (
            <li key={index}>{crop}</li>
          ))}
        </ul>
      </div>

      {/* Pest Alerts Card */}
      <div
        className="card"
        onClick={() => navigate("/disease")}
        style={{ cursor: "pointer" }}
      >
        <h3>🐛 Pest & Disease Alerts</h3>
        <ul>
          {pestAlerts.map((alert, index) => (
            <li key={index}>{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardCards;
