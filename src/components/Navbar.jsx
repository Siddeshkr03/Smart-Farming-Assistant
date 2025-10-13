import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-title">🌱 Smart Farming Assistant</h2>
      <ul className="navbar-menu">
        <li>Home</li>
        <li>Weather</li>
        <li>Soil Health</li>
        <li>Disease Detection</li>
        <li>Crop Recommendation</li>
      </ul>
    </nav>
  );
}

export default Navbar;
