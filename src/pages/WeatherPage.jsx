import { usePageAssets } from '../utils/pageAssets';

const WEATHER_STYLES = [
  '/legacy/wether/style.css',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
];

const WEATHER_SCRIPTS = [
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
  '/legacy/wether/script.js',
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
];

export default function WeatherPage() {
  usePageAssets({ styles: WEATHER_STYLES, scripts: WEATHER_SCRIPTS, fireReadyEvents: true });

  return (
    <>
      <div id="google_translate_element" />
      <div className="header">
        <h1>Marine Weather Storm Detector</h1>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          <div className="weather-panel">
            <div className="weather-info">
              <h3>Your Current Location</h3>
              <div id="current-location-weather">
                <div className="loading">
                  <div className="spinner" />
                  <p>Getting your location...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="map-container">
            <h3>🗺️ Interactive Weather Map</h3>
            <div style={{ position: 'relative' }}>
              <div id="weather-map" />
              <div className="click-hint">Click anywhere on the map for weather data</div>
            </div>
          </div>

          <div className="weather-panel">
            <div className="weather-info">
              <h3>📊 Clicked Locations</h3>
              <div id="clicked-locations">
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '20px' }}>
                  Click on the map to add locations and see weather data here
                </p>
              </div>
            </div>
            <div id="comparison-section" />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="weather-panel">
            <div className="weather-info">
              <h3>⚡ Marine Risk Intelligence</h3>
              <div id="marine-summary">
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '20px' }}>
                  Add map locations to generate risk analytics
                </p>
              </div>
            </div>
          </div>

          <div className="weather-panel">
            <div className="weather-info">
              <h3>🚨 Storm Alert Feed</h3>
              <div id="storm-alert-feed">
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '20px' }}>
                  No active alerts yet
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="controls-panel">
          <button className="control-button" onClick={() => window.refreshAllData?.()}>
            🔄 Refresh All
          </button>
          <button className="control-button compare-button" onClick={() => window.compareLocations?.()}>
            📊 Compare Locations
          </button>
          <button id="auto-refresh-btn" className="control-button" onClick={() => window.toggleAutoRefresh?.()}>
            ⏱️ Auto Refresh: Off
          </button>
          <button className="control-button" onClick={() => window.exportWeatherReport?.()}>
            📥 Export Report
          </button>
          <button className="control-button clear-button" onClick={() => window.clearAllLocations?.()}>
            🗑️ Clear All
          </button>
        </div>

        <div className="controls-panel">
          <button className="control-button" onClick={() => window.addPresetLocation?.('Mumbai Offshore', 18.95, 72.82)}>
            📍 Mumbai Offshore
          </button>
          <button className="control-button" onClick={() => window.addPresetLocation?.('Kochi Harbor', 9.93, 76.27)}>
            📍 Kochi Harbor
          </button>
          <button className="control-button" onClick={() => window.addPresetLocation?.('Chennai Coast', 13.08, 80.27)}>
            📍 Chennai Coast
          </button>
          <button className="control-button" onClick={() => window.addPresetLocation?.('Visakhapatnam Bay', 17.69, 83.22)}>
            📍 Vizag Bay
          </button>
        </div>
      </div>

      <div id="loading-overlay" className="loading-overlay" style={{ display: 'none' }}>
        <div className="loading-content">
          <div className="spinner" />
          <p>Fetching weather data...</p>
        </div>
      </div>
    </>
  );
}
