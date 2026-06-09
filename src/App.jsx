import { useEffect, useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GeoLocation Unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => setError(err.message)
    );
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      loadWeather();
      cityName();
    }
  }, [location]);

  const cityName = async () => {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`;
    const response = await fetch(url);
    const data = await response.json();
    setCity(data.city);
  };

  const search = async () => {
    if (!searchCity.trim()) return;
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${import.meta.env.VITE_APP_ID}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === 200) {
        setCurrentWeather(data);
        setCity(data.name);
      }

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${import.meta.env.VITE_APP_ID}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      if (forecastData.cod === "200") {
        setForecast(forecastData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadWeather = async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${import.meta.env.VITE_APP_ID}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === 200) {
        setCurrentWeather(data);
      }

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${import.meta.env.VITE_APP_ID}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      if (forecastData.cod === "200") {
        setForecast(forecastData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    const seen = new Set();
    return forecast.list.filter((entry) => {
      const date = entry.dt_txt.split(" ")[0];
      if (seen.has(date)) return false;
      seen.add(date);
      return true;
    }).slice(1, 6); 
  };

  return (
    <div id="page">
      <div id="box">
        <div id="searchBar">
          <input
            id="searchBox"
            type="text"
            placeholder="Enter City"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button id="searchButton" onClick={search}>🔍</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div id="weatherBox">
          {currentWeather ? (
            <>
              <h2>{city}</h2>
              <img
                src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                alt={currentWeather.weather[0].description}
              />
              <p className="temp">{Math.round(currentWeather.main.temp)}°C</p>
              <p className="description">{currentWeather.weather[0].description}</p>
              <div className="details">
                <span>💧 {currentWeather.main.humidity}%</span>
                <span>💨 {currentWeather.wind.speed} m/s</span>
              </div>
            </>
          ) : (
            !error && <p>Fetching weather...</p>
          )}

          {getDailyForecast().length > 0 && (
            <div id="forecast">
              {getDailyForecast().map((entry) => (
                <div className="forecast-item" key={entry.dt}>
                  <p>{new Date(entry.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`}
                    alt={entry.weather[0].description}
                  />
                  <p>{Math.round(entry.main.temp)}°C</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;