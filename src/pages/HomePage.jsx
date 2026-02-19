import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageAssets } from '../utils/pageAssets';

const HOME_STYLES = [
  '/legacy/style.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

const HOME_SCRIPTS = [
  '/legacy/script.js',
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
];

function weatherCodeLabel(code) {
  const map = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Dense Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    80: 'Rain Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    95: 'Thunderstorm',
  };
  return map[code] || 'Weather Update';
}

export default function HomePage() {
  usePageAssets({ styles: HOME_STYLES, scripts: HOME_SCRIPTS, fireReadyEvents: true });
  const [weather, setWeather] = useState({
    loading: true,
    city: 'Locating...',
    condition: 'Fetching weather...',
    temp: '--',
    humidity: '--',
    wind: '--',
  });

  useEffect(() => {
    if (window.chatbase && window.chatbase('getState') === 'initialized') {
      return;
    }

    window.chatbase = (...args) => {
      window.chatbase.q = window.chatbase.q || [];
      window.chatbase.q.push(args);
    };

    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'pIqaWXt4T2-S-Tp2antsY';
    script.setAttribute('data-react-chatbase', 'true');
    document.body.appendChild(script);

    return () => {
      document.querySelector('[data-react-chatbase="true"]')?.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const setFallback = (condition = 'Weather unavailable') => {
      if (!active) return;
      setWeather({
        loading: false,
        city: 'Current Region',
        condition,
        temp: '--',
        humidity: '--',
        wind: '--',
      });
    };

    const fetchWeather = async (lat, lng) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        const weatherJson = await weatherRes.json();
        const current = weatherJson?.current;
        if (!current) throw new Error('No weather data');

        if (!active) return;
        setWeather({
          loading: false,
          city: `${Math.abs(lat).toFixed(2)}${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}${lng >= 0 ? 'E' : 'W'}`,
          condition: weatherCodeLabel(current.weather_code),
          temp: `${Math.round(current.temperature_2m)}°C`,
          humidity: `${Math.round(current.relative_humidity_2m)}%`,
          wind: `${Math.round(current.wind_speed_10m)} km/h`,
        });
      } catch {
        setFallback();
      }
    };

    if (!navigator.geolocation) {
      fetchWeather(19.07, 72.87);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => fetchWeather(19.07, 72.87),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }

    return () => {
      active = false;
    };
  }, []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
    []
  );

  return (
    <div className="dashboard-container">
      <div id="google_translate_element" />
      <div className="nav-buttons">
        <Link to="/sos/sos-emergency.html" className="nav-btn-sos">
          <span>SoS</span>
        </Link>
        <Link to="/dashoardfinal/index.html" className="nav-btn">
          <span>Fish Researchers Data</span>
        </Link>
        <Link to="/fish-population/fishing-zone-map.html" className="nav-btn">
          <span>Fish Population</span>
        </Link>
        <Link to="/wether/index.html" className="nav-btn">
          <span>Weather</span>
        </Link>
      </div>

      <div className="main-grid">
        <div className="welcome-card">
          <div className="welcome-bubbles">
            <span className="bubble b1" />
            <span className="bubble b2" />
            <span className="bubble b3" />
          </div>
          <div className="welcome-content">
            <p className="welcome-text">Welcome back to,</p>
            <h1 className="user-name">Sagar Saathi</h1>
            <p className="subtitle">Glad to see you again!</p>
            <div className="welcome-info-grid">
              <div className="welcome-chip">
                <span className="chip-label">Today</span>
                <span className="chip-value">{todayLabel}</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Safety Pulse</span>
                <span className="chip-value">Moderate</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Best Fishing Window</span>
                <span className="chip-value">05:30 AM - 09:30 AM</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Dock Activity</span>
                <span className="chip-value">High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="market-card">
          <h3 className="card-title">Market value</h3>
          <div className="market-grid">
            <div className="market-item">
              <span className="fish-label">Hilsa (Ilish)</span>
              <span className="fish-value">₹2,200 - ₹3,000</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Rohu</span>
              <span className="fish-value">₹350 - ₹893</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Catla</span>
              <span className="fish-value">₹240 - ₹525</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Pangas (Pangasius)</span>
              <span className="fish-value">₹280 - ₹350</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Pomfret</span>
              <span className="fish-value">₹620 - ₹1,150</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Mackerel</span>
              <span className="fish-value">₹260 - ₹540</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Yellowfin Tuna</span>
              <span className="fish-value">₹780 - ₹1,600</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Tiger Shrimp</span>
              <span className="fish-value">₹900 - ₹1,950</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Seabass</span>
              <span className="fish-value">₹480 - ₹990</span>
            </div>
            <div className="market-item">
              <span className="fish-label">Sardine</span>
              <span className="fish-value">₹180 - ₹360</span>
            </div>
          </div>
        </div>

        <div className="population-card">
          <div className="population-header">
            <h3 className="card-title">fish population in that area</h3>
            <p className="population-subtitle">fish record 2021</p>
          </div>
          <div className="chart-container">
            <canvas id="populationChart" />
          </div>
        </div>

        <div className="weather-card weather-today-card">
          <div className="weather-header-row">
            <h3 className="weather-title">Today's Weather</h3>
            <span className="weather-tag">{weather.loading ? 'Updating...' : 'Live'}</span>
          </div>
          <p className="weather-subtitle">{weather.city}</p>
          <div className="weather-hero">
            <div className="weather-main-temp">{weather.temp}</div>
            <div className="weather-main-condition">{weather.condition}</div>
          </div>
          <div className="weather-grid">
            <div className="weather-item">
              <div className="weather-icon sunny" />
              <span className="weather-desc">Humidity</span>
              <span className="weather-temp">{weather.humidity}</span>
            </div>
            <div className="weather-item">
              <div className="weather-icon cloudy" />
              <span className="weather-desc">Wind</span>
              <span className="weather-temp">{weather.wind}</span>
            </div>
            <div className="weather-item">
              <div className="weather-icon sunny" />
              <span className="weather-desc">Water Alert</span>
              <span className="weather-temp">Stable</span>
            </div>
            <div className="weather-item">
              <div className="weather-icon cloudy" />
              <span className="weather-desc">Wave Risk</span>
              <span className="weather-temp">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
