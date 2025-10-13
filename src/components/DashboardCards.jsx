// src/components/DashboardCards.jsx
import React from "react";
import "./DashboardCards.css";

const DashboardCards = ({ weather, soil, crops, pestAlerts }) => {
  return (
    <div className="dashboard-cards">
      {/* Weather Card */}
      <div className="card weather-card">
        <h3>🌤 Weather Today</h3>
        {weather ? (
          <>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Rainfall: {weather.rainfall} mm</p>
            <p>Humidity: {weather.humidity}%</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Soil Card */}
      <div className="card soil-card">
        <h3>🌱 Soil Condition</h3>
        {soil ? (
          <>
            <p>Moisture: {soil.moisture}%</p>
            <p>pH Level: {soil.ph}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Crop Recommendation Card */}
      <div className="card crop-card">
        <h3>🌾 Recommended Crops</h3>
        {crops ? (
          <ul>
            {crops.map((crop, index) => (
              <li key={index}>{crop}</li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Pest Alerts Card */}
      <div className="card pest-card">
        <h3>🐛 Pest Alerts</h3>
        {pestAlerts ? (
          <ul>
            {pestAlerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        ) : (
          <p>No alerts</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCards;
