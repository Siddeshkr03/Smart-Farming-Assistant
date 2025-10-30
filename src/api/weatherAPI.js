const API_KEY = "54c97255a7876f103ea635bc8cd671d9";

export const getWeather = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (data.cod !== 200) throw new Error(data.message);

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      wind: data.wind.speed,
      location: data.name,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};
