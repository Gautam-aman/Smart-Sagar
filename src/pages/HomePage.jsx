import { useEffect } from 'react';
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

export default function HomePage() {
  usePageAssets({ styles: HOME_STYLES, scripts: HOME_SCRIPTS, fireReadyEvents: true });

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
          <div className="welcome-content">
            <p className="welcome-text">Welcome back to,</p>
            <h1 className="user-name">Sagar Saathi</h1>
            <p className="subtitle">Glad to see you again!</p>
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
      </div>
    </div>
  );
}
