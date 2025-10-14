import React, { useEffect, useState, useRef } from "react";
import "./Weather.css";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Bengaluru"); // city for fetching
  const [inputCity, setInputCity] = useState("Bengaluru"); // user input
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const API_KEY = "54c97255a7876f103ea635bc8cd671d9";

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        const spokenCity = event.results[0][0].transcript;
        setInputCity(spokenCity);
        setCity(spokenCity);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // Fetch weather by city
  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) return;
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
      } else {
        setError("City not found. Please try again.");
      }
    } catch {
      setError("Failed to fetch weather. Try again.");
    }
  };

  // Fetch weather when city changes
  useEffect(() => {
    fetchWeatherByCity(city);
  }, [city]);

  // Voice input
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported.");
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

  // Current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    setInputCity("Fetching current location...");
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
          );
          const geoData = await geoRes.json();
          const cityName = geoData[0]?.name || "Unknown Location";

          setInputCity(cityName);
          setCity(cityName);
        } catch {
          setError("Failed to fetch location weather.");
          setInputCity("");
        }
      },
      (err) => {
        setError("Could not get your location.");
        setInputCity("");
      },
      { enableHighAccuracy: true }
    );
  };

  // Extract weather info safely
  const temp = weather?.main?.temp;
  const tempMax = weather?.main?.temp_max;
  const tempMin = weather?.main?.temp_min;
  const feelsLike = weather?.main?.feels_like;
  const humidity = weather?.main?.humidity;
  const windSpeed = weather?.wind?.speed;
  const windDir = weather?.wind?.deg;
  const condition = weather?.weather?.[0]?.description;
  const icon = weather?.weather?.[0]?.icon;
  const sunrise = weather?.sys ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString() : "";
  const sunset = weather?.sys ? new Date(weather.sys.sunset * 1000).toLocaleTimeString() : "";
  const dewPoint = temp && humidity ? (temp - (100 - humidity) / 5).toFixed(1) : "";
  const evapotranspiration = tempMax && tempMin ? ((0.0023 * (temp + 17.8) * Math.sqrt(tempMax - tempMin)) / 10).toFixed(2) : "";
  const soilMoisture = humidity > 70 ? "High" : humidity > 40 ? "Moderate" : "Low";

  return (
    <div className="weather-container">
      <h2>🌤️ Weather Dashboard</h2>

      <div className="input-wrapper">
        <input
          type="text"
          className="city-input"
          placeholder="🎤 Speak or type city name..."
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputCity.trim() !== "") setCity(inputCity.trim());
          }}
        />
        <button className={`mic-btn ${listening ? "listening" : ""}`} onClick={handleVoiceInput}>
          🎤
        </button>
        <button className="location-btn" onClick={handleCurrentLocation}>
          📍Current Location
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-grid">
          <div className="weather-card main">
            <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="weather icon" />
            <h3>{condition?.toUpperCase()}</h3>
            <p>{temp}°C</p>
            <small>Feels like {feelsLike}°C</small>
          </div>

          <div className="weather-card">
            <h4>🌡️ Temperature</h4>
            <p>Max: {tempMax}°C</p>
            <p>Min: {tempMin}°C</p>
          </div>

          <div className="weather-card">
            <h4>💧 Humidity</h4>
            <p>{humidity}%</p>
          </div>

          <div className="weather-card">
            <h4>🌬️ Wind</h4>
            <p>{windSpeed} m/s at {windDir}°</p>
          </div>

          <div className="weather-card">
            <h4>🌧️ Rainfall</h4>
            <p>{weather.rain ? weather.rain["1h"] + " mm" : "0 mm"}</p>
          </div>

          <div className="weather-card">
            <h4>🌾 Evapotranspiration</h4>
            <p>{evapotranspiration} mm/day</p>
          </div>

          <div className="weather-card">
            <h4>🪴 Soil Moisture</h4>
            <p>{soilMoisture}</p>
          </div>

          <div className="weather-card">
            <h4>🌫️ Dew Point</h4>
            <p>{dewPoint}°C</p>
          </div>

          <div className="weather-card">
            <h4>🌅 Sunrise</h4>
            <p>{sunrise}</p>
          </div>

          <div className="weather-card">
            <h4>🌇 Sunset</h4>
            <p>{sunset}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
