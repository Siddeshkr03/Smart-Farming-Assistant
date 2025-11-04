// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-logo">🌱 Smart Farming Assistant</h2>
      <ul className="navbar-menu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            end
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/weather"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Weather
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/soil"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Soil Info
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/crophealth"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Crop Details
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/disease"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Disease and Pest
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
