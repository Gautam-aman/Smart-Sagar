import { usePageAssets } from '../utils/pageAssets';

const FISH_DETECT_STYLES = [
  '/legacy/fish_detect/style.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

const FISH_DETECT_SCRIPTS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  '/legacy/fish_detect/script.js',
];

export default function FishDetectPage() {
  usePageAssets({ styles: FISH_DETECT_STYLES, scripts: FISH_DETECT_SCRIPTS, fireReadyEvents: true });

  return (
    <div className="container">
      <div id="google_translate_element" />
      <header>
        <h1>🐟 Fish Population & Extinction Predictor</h1>
        <p>Predict fish populations and extinction risks to promote sustainable fishing</p>
      </header>

      <main>
        <section className="input-section">
          <div className="form-group">
            <label htmlFor="fishName">Fish Species Name:</label>
            <input type="text" id="fishName" placeholder="e.g., Atlantic Cod" autoComplete="off" />
            <div id="suggestions" className="suggestions" />
          </div>

          <div className="form-group">
            <label htmlFor="years">Years to Predict:</label>
            <input type="number" id="years" min="1" max="100" placeholder="e.g., 10" />
          </div>

          <div className="form-group">
            <label htmlFor="confidenceLevel">Model Confidence Weight: <span id="confidenceValue">70%</span></label>
            <input type="range" id="confidenceLevel" min="50" max="95" step="5" defaultValue="70" />
          </div>

          <button id="predictBtn" onClick={() => window.predictFish?.()}>
            🔮 Predict Population
          </button>
          <div className="quick-tools">
            <button type="button" className="tool-btn" onClick={() => window.pickRandomFish?.()}>🎲 Random Species</button>
            <button type="button" className="tool-btn" onClick={() => window.clearPrediction?.()}>🧹 Clear</button>
            <button type="button" className="tool-btn" onClick={() => window.exportPredictionReport?.()}>📥 Export Report</button>
            <button type="button" className="tool-btn" onClick={() => window.fitMapToDetections?.()}>🗺️ Fit Markers</button>
          </div>
        </section>

        <section className="results-section">
          <div id="loading" className="loading hidden">
            <div className="spinner" />
            <p>Analyzing fish data...</p>
          </div>

          <div id="results" className="results hidden">
            <div className="species-info">
              <h3 id="speciesName" />
              <p id="scientificName" />
              <div id="conservationStatus" className="status-badge" />
            </div>

            <div className="prediction-results">
              <div className="prediction-card">
                <h4>Population Trend</h4>
                <p id="populationTrend" />
                <div id="trendChart" className="trend-indicator" />
              </div>

              <div className="prediction-card">
                <h4>Extinction Risk</h4>
                <p id="extinctionRisk" />
                <div id="riskLevel" className="risk-indicator" />
              </div>

              <div className="fishing-recommendation">
                <h4>Fishing Recommendation</h4>
                <div id="fishingAdvice" className="advice-box" />
              </div>
            </div>

            <div className="insight-grid">
              <div className="insight-card"><span>Forecast Horizon</span><strong id="insightHorizon">--</strong></div>
              <div className="insight-card"><span>Habitats Mapped</span><strong id="insightHabitats">--</strong></div>
              <div className="insight-card"><span>Model Confidence</span><strong id="insightConfidence">--</strong></div>
            </div>
          </div>
        </section>

        <section className="results-section">
          <h3>Recent Predictions</h3>
          <div id="predictionHistory" className="prediction-history">
            <p className="history-empty">No predictions yet. Start by selecting a species.</p>
          </div>
        </section>

        <section className="map-section">
          <h3>Species Habitat Locations</h3>
          <div id="map" />
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-color safe" /> Safe to Fish
            </div>
            <div className="legend-item">
              <span className="legend-color caution" /> Fish with Caution
            </div>
            <div className="legend-item">
              <span className="legend-color danger" /> Do Not Fish
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
