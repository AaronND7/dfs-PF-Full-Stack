// backend/src/routes/weather.js - API de clima
const express = require("express");
const router = express.Router();

// Obtener clima actual de una ciudad
router.get("/current/:city", async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

  if (!apiKey) {
    return res.status(500).json({ 
      error: "API key de OpenWeatherMap no configurada" 
    });
  }

  try {
    const response = await fetch(
      `${baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "Ciudad no encontrada" });
      }
      throw new Error(`Error en API: ${response.status}`);
    }

    const data = await response.json();

    // Formatear datos para el frontend
    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      feelsLike: data.main.feels_like
    };

    res.json(weatherData);

  } catch (error) {
    console.error("Error obteniendo clima:", error);
    res.status(500).json({ 
      error: "Error al obtener datos del clima" 
    });
  }
});

module.exports = router;
