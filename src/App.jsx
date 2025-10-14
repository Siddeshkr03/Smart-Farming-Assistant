// src/App.jsx
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Soil from "./components/Soil.jsx";
import Disease from "./components/Disease.jsx";
import Weather from "./components/Weather.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/soil" element={<Soil />} />
        <Route path="/disease" element={<Disease />} />
      </Routes>
    </Router>
  );
}

export default App;
