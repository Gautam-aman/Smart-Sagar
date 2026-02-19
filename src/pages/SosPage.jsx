import { usePageAssets } from '../utils/pageAssets';

const SOS_STYLES = [
  '/legacy/sos/sos-emergency.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap',
];

const SOS_SCRIPTS = [
  '/legacy/sos/sos-emergency.js',
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
];

export default function SosPage() {
  usePageAssets({ styles: SOS_STYLES, scripts: SOS_SCRIPTS, fireReadyEvents: true });

  return (
    <>
      <div id="google_translate_element" />

      <div className="emergency-header">
        <div className="sos-badge">
          <div className="sos-pulse" />
          <span>SOS</span>
        </div>
        <h1>Emergency Assistance</h1>
        <p>Fisherman Emergency Radio Station Locator</p>
      </div>

      <div className="emergency-actions">
        <button className="action-btn refresh-btn" onClick={() => window.refreshLocation?.()}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 4V10A6 6 0 0 0 7 16L9 14" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M17 14V8A6 6 0 0 0 11 2L9 4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          Refresh Location
        </button>

        <button className="action-btn share-btn" onClick={() => window.shareLocation?.()}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13 6L9 2L5 6" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M9 2V14" stroke="currentColor" strokeWidth="2" />
          </svg>
          Share Location
        </button>
        <button className="action-btn" onClick={() => window.exportEmergencyBrief?.()}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v8" stroke="currentColor" strokeWidth="2" />
            <path d="M6 7l3 3 3-3" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="3" y="12" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          Export Brief
        </button>
      </div>

      <div className="sos-container">
        <div className="ops-panel-card">
          <div className="list-header">
            <h3>Emergency Control Panel</h3>
            <span className="station-count" id="readinessScore">Readiness 0%</span>
          </div>
          <div className="ops-grid">
            <div className="ops-field">
              <label htmlFor="incidentType">Incident Type</label>
              <select id="incidentType" defaultValue="distress" onChange={(e) => window.setIncidentType?.(e.target.value)}>
                <option value="distress">Vessel Distress</option>
                <option value="medical">Medical Emergency</option>
                <option value="engine">Engine Failure</option>
                <option value="weather">Severe Weather</option>
                <option value="man_overboard">Man Overboard</option>
              </select>
            </div>
            <div className="ops-field">
              <label htmlFor="severityLevel">Severity</label>
              <select id="severityLevel" defaultValue="high" onChange={(e) => window.setSeverityLevel?.(e.target.value)}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
              </select>
            </div>
            <div className="ops-field">
              <label htmlFor="crewCount">Crew Count</label>
              <input id="crewCount" type="number" min="1" max="50" defaultValue="5" onChange={(e) => window.setCrewCount?.(e.target.value)} />
            </div>
            <div className="ops-field ops-check">
              <label htmlFor="medicalAidToggle">Need Immediate Medical Aid</label>
              <input id="medicalAidToggle" type="checkbox" onChange={(e) => window.setMedicalAidRequired?.(e.target.checked)} />
            </div>
          </div>
          <div className="ops-actions">
            <button className="emergency-call-btn" onClick={() => window.startDistressProtocol?.()}>Start Distress Protocol</button>
            <button className="navigate-btn" onClick={() => window.markCrewSafe?.()}>Mark Crew Safe</button>
          </div>
        </div>

        <div className="location-status-card" id="locationCard">
          <div className="status-header">
            <div className="location-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C6.13 0 3 3.13 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
                <circle cx="10" cy="7" r="3" fill="white" />
              </svg>
            </div>
            <div className="status-info">
              <span className="status-label">Current Location</span>
              <span className="status-value" id="locationStatus">Getting location...</span>
            </div>
            <div className="status-indicator" id="statusDot" />
          </div>
          <div className="coordinates-display" id="coordinatesDisplay">
            <span id="coordinates">Locating...</span>
          </div>
        </div>

        <div className="nearest-station-card" id="nearestStationCard">
          <div className="card-header">
            <h2>Nearest Coastal Radio Station</h2>
            <div className="emergency-badge">PRIORITY</div>
          </div>

          <div className="station-main-info" id="stationMainInfo">
            <div className="station-details">
              <div className="station-name" id="stationName">Finding nearest station...</div>
              <div className="station-meta">
                <span className="call-sign" id="callSign">--</span>
                <span className="frequency" id="frequency">-- kHz</span>
              </div>
              <div className="distance-info">
                <span className="distance-label">Distance:</span>
                <span className="distance-value" id="distanceValue">-- km</span>
              </div>
            </div>

            <div className="signal-strength-container">
              <div className="signal-strength" id="signalStrength">
                <div className="signal-bar" />
                <div className="signal-bar" />
                <div className="signal-bar" />
                <div className="signal-bar" />
                <div className="signal-bar" />
              </div>
              <span className="signal-label" id="signalLabel">Checking...</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="emergency-call-btn" id="emergencyCallBtn" onClick={() => window.initiateEmergencyCall?.()}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 3h3l2 7-3 2c1.667 3.333 4.667 6.333 8 8l2-3 7 2v3c-11 0-20-9-20-20z" fill="currentColor" />
              </svg>
              Emergency Contact
            </button>

            <button className="navigate-btn" id="navigateBtn" onClick={() => window.navigateToStation?.()} disabled>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 7v6l7-3 7 3V7l-7-3-7 3z" fill="currentColor" />
                <path d="M10 14v6" stroke="currentColor" strokeWidth="2" />
              </svg>
              Navigate to Station
            </button>
          </div>
        </div>

        <div className="stations-list-card">
          <div className="list-header">
            <h3>All Indian Coastal Radio Stations</h3>
            <span className="station-count" id="stationCount">Loading...</span>
          </div>
          <div className="stations-list" id="stationsList" />
        </div>

        <div className="stations-list-card">
          <div className="list-header">
            <h3>Response Tracker</h3>
            <span className="station-count" id="protocolStatus">Standby</span>
          </div>
          <div className="tracker-grid">
            <div className="tracker-item">
              <span>Elapsed Since Alert</span>
              <strong id="responseTimer">00:00</strong>
            </div>
            <div className="tracker-item">
              <span>Next Broadcast</span>
              <strong id="nextBroadcast">--:--</strong>
            </div>
            <div className="tracker-item">
              <span>Incident</span>
              <strong id="incidentSummary">Vessel Distress</strong>
            </div>
            <div className="tracker-item">
              <span>Crew</span>
              <strong id="crewSummary">5</strong>
            </div>
          </div>
          <div className="checklist">
            <label><input type="checkbox" className="checklist-item" onChange={() => window.updateReadinessChecklist?.()} /> Life jackets verified</label>
            <label><input type="checkbox" className="checklist-item" onChange={() => window.updateReadinessChecklist?.()} /> VHF channel 16 active</label>
            <label><input type="checkbox" className="checklist-item" onChange={() => window.updateReadinessChecklist?.()} /> Distress coordinates announced</label>
            <label><input type="checkbox" className="checklist-item" onChange={() => window.updateReadinessChecklist?.()} /> Crew headcount completed</label>
          </div>
        </div>

        <div className="emergency-info">
          <div className="info-item">
            <strong>Indian Coast Guard:</strong> 1554 (Toll Free)
          </div>
          <div className="info-item">
            <strong>Maritime Rescue:</strong> +91-11-23431007
          </div>
          <div className="info-item">
            <strong>Emergency Frequency:</strong> 2182 kHz / VHF Channel 16
          </div>
        </div>
      </div>
    </>
  );
}
