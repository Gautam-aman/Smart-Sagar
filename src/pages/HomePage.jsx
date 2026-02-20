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
  const [assistantNote, setAssistantNote] = useState('Ready to assist your next trip.');
  const [copilotQuestion, setCopilotQuestion] = useState('Tap a quick action to start.');
  const [copilotReply, setCopilotReply] = useState('I can help with routes, catch strategy, and emergency preparedness.');
  const [copilotBusy, setCopilotBusy] = useState(false);

  useEffect(() => {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };

      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === 'q') {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        },
      });
    }

    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'pIqaWXt4T2-S-Tp2antsY';
    script.setAttribute('data-chatbase-id', 'pIqaWXt4T2-S-Tp2antsY');
    script.setAttribute('data-chatbase-domain', 'www.chatbase.co');
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

  const generateCopilotReply = (prompt) => {
    const temp = weather.temp === '--' ? 'around normal range' : weather.temp;
    const wind = weather.wind === '--' ? 'moderate' : weather.wind;
    const humidity = weather.humidity === '--' ? 'stable' : weather.humidity;

    if (prompt.toLowerCase().includes('safest fishing route')) {
      return `Recommended route: start near near-shore Zone B, avoid high-current patches, and keep return corridor open by 11:30 AM. Current wind is ${wind} with humidity ${humidity}, so medium-risk offshore edges should be avoided.`;
    }

    if (prompt.toLowerCase().includes('best fish species')) {
      return `Based on current dashboard signals, prioritize Mackerel, Pomfret, and Seabass today. Temperature is ${temp} and winds are ${wind}, which generally supports short-haul targeted runs rather than deep offshore travel.`;
    }

    if (prompt.toLowerCase().includes('emergency readiness checklist')) {
      return 'Checklist: verify VHF + backup battery, confirm distress contacts, share float plan, test GPS waypoints, check fuel reserve (30%+), and brief crew roles for MOB and storm-return protocol.';
    }

    return 'I analyzed your request and prepared a safe, efficiency-focused plan. You can refine by adding target zone, crew size, and trip duration.';
  };

  const handleAssistantPrompt = async (prompt) => {
    const askChatWithoutOpening = async () => {
      try {
        if (typeof window.chatbase === 'function') {
          // Best-effort call for embeds that support direct message APIs.
          window.chatbase('sendMessage', prompt);
        }
      } catch {
        // Keep local copilot reply as fallback behavior.
      }
    };

    setCopilotBusy(true);
    setCopilotQuestion(prompt);
    setAssistantNote('Analyzing marine conditions and preparing response...');
    await askChatWithoutOpening();

    setTimeout(() => {
      setCopilotReply(generateCopilotReply(prompt));
      setAssistantNote('Response generated. You can ask another quick action.');
      setCopilotBusy(false);
    }, 700);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <div className="brand-area">
          <div className="brand-mark">SS</div>
          <div className="brand-meta">
            <h2>Smart Sagar Control Deck</h2>
            <p>Smart marine operations, safety and catch intelligence</p>
          </div>
        </div>
        <div className="nav-utility">
          <div className="utility-chip">
            <span className="dot green" />
            <span>Coast Network: Online</span>
          </div>
          <div className="utility-chip">
            <span className="dot blue" />
            <span>Last Sync: 2 min ago</span>
          </div>
          <div id="google_translate_element" />
        </div>
      </div>

      <div className="nav-buttons nav-prof">
        <Link to="/sos/sos-emergency.html" className="nav-btn-sos">
          <span>Emergency SoS</span>
        </Link>
        <Link to="/dashoardfinal/index.html" className="nav-btn">
          <span>Research Intelligence</span>
        </Link>
        <Link to="/fish-population/fishing-zone-map.html" className="nav-btn">
          <span>Population Heatmap</span>
        </Link>
        <Link to="/wether/index.html" className="nav-btn">
          <span>Marine Weather Ops</span>
        </Link>
      </div>

      <div className="main-grid">
        <div className="dashboard-col">
          <div className="welcome-card">
            <div className="welcome-bubbles">
              <span className="bubble b1" />
              <span className="bubble b2" />
              <span className="bubble b3" />
            </div>
            <div className="welcome-content">
              <p className="welcome-text">Welcome back to,</p>
              <h1 className="user-name">Smart Sagar</h1>
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

          <div className="weather-card insight-card">
            <div className="weather-header-row">
              <h3 className="weather-title">Ocean Intelligence Snapshot</h3>
              <span className="weather-tag">Insight</span>
            </div>
            <div className="welcome-info-grid">
              <div className="welcome-chip">
                <span className="chip-label">High-Value Catch Index</span>
                <span className="chip-value">76 / 100</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Fuel Risk Score</span>
                <span className="chip-value">Low</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Recommended Departure</span>
                <span className="chip-value">05:10 AM</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Operational Confidence</span>
                <span className="chip-value">High</span>
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

          <div className="weather-card ops-card trip-card">
            <div className="weather-header-row">
              <h3 className="weather-title">Trip Operations</h3>
              <span className="weather-tag">Planner</span>
            </div>
            <div className="welcome-info-grid">
              <div className="welcome-chip">
                <span className="chip-label">Tide Window</span>
                <span className="chip-value">06:05 AM - 10:15 AM</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Port Congestion</span>
                <span className="chip-value">Moderate</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Fuel Efficiency</span>
                <span className="chip-value">+8% vs Last Week</span>
              </div>
              <div className="welcome-chip">
                <span className="chip-label">Crew Readiness</span>
                <span className="chip-value">4/5 Members Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-col">
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

          <div className="weather-card ops-card compliance-card">
            <div className="weather-header-row">
              <h3 className="weather-title">Compliance & Alerts</h3>
              <span className="weather-tag">Priority</span>
            </div>
            <div className="alert-list">
              <div className="alert-item">
                <span className="alert-badge warn">Doc</span>
                <span>Vessel permit renewal due in 5 days.</span>
              </div>
              <div className="alert-item">
                <span className="alert-badge info">Zone</span>
                <span>Zone C has temporary net-size restriction advisory.</span>
              </div>
              <div className="alert-item">
                <span className="alert-badge ok">Safe</span>
                <span>No major hazard broadcast in the last 2 hours.</span>
              </div>
            </div>
          </div>

        </div>

        <div className="weather-card ai-assistant-card full-width-card">
          <div className="weather-header-row">
            <h3 className="weather-title">AI Marine Copilot</h3>
            <span className="weather-tag">Assistant</span>
          </div>
          <p className="weather-subtitle">{assistantNote}</p>
          <div className="copilot-thread">
            <div className="copilot-line">
              <span className="chip-label">Question</span>
              <p>{copilotQuestion}</p>
            </div>
            <div className="copilot-line">
              <span className="chip-label">Copilot Reply</span>
              <p>{copilotBusy ? 'Analyzing...' : copilotReply}</p>
            </div>
          </div>
          <div className="assistant-actions">
            <button type="button" className="nav-btn" onClick={() => handleAssistantPrompt('Give me the safest fishing route for today based on weather and wave risk.')}>
              Safe Route Brief
            </button>
            <button type="button" className="nav-btn" onClick={() => handleAssistantPrompt('Summarize best fish species to target today using market value and weather.')}>
              Catch Strategy
            </button>
            <button type="button" className="nav-btn" onClick={() => handleAssistantPrompt('Create an emergency readiness checklist for my crew before departure.')}>
              Emergency Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
