// Indian Coastal Radio Stations Database
const indianCoastalRadioStations = [
    // West Coast
    { name: "Mumbai Radio", callSign: "VWM", freq: "8728 kHz", lat: 19.0760, lng: 72.8777, location: "Mumbai, Maharashtra" },
    { name: "Goa Radio", callSign: "VWG", freq: "8746 kHz", lat: 15.2993, lng: 74.1240, location: "Panaji, Goa" },
    { name: "Kochi Radio", callSign: "VWX", freq: "8752 kHz", lat: 9.9312, lng: 76.2673, location: "Kochi, Kerala" },
    { name: "New Mangalore Radio", callSign: "VWN", freq: "8758 kHz", lat: 12.8697, lng: 74.8560, location: "Mangalore, Karnataka" },

    // East Coast
    { name: "Chennai Radio", callSign: "VWC", freq: "8740 kHz", lat: 13.0827, lng: 80.2707, location: "Chennai, Tamil Nadu" },
    { name: "Visakhapatnam Radio", callSign: "VWV", freq: "8764 kHz", lat: 17.6868, lng: 83.2185, location: "Visakhapatnam, Andhra Pradesh" },
    { name: "Kolkata Radio", callSign: "VWK", freq: "8734 kHz", lat: 22.5726, lng: 88.3639, location: "Kolkata, West Bengal" },
    { name: "Paradip Radio", callSign: "VWP", freq: "8770 kHz", lat: 20.3156, lng: 86.6100, location: "Paradip, Odisha" },

    // South Coast
    { name: "Tuticorin Radio", callSign: "VWT", freq: "8776 kHz", lat: 8.7642, lng: 78.1348, location: "Tuticorin, Tamil Nadu" },

    // Island Territories  
    { name: "Port Blair Radio", callSign: "VWB", freq: "8782 kHz", lat: 11.6234, lng: 92.7265, location: "Port Blair, Andaman & Nicobar" },

    // Additional Stations
    { name: "Kandla Radio", callSign: "VWJ", freq: "8788 kHz", lat: 23.0333, lng: 70.2167, location: "Kandla, Gujarat" },
    { name: "Haldia Radio", callSign: "VWH", freq: "8794 kHz", lat: 22.0580, lng: 88.0580, location: "Haldia, West Bengal" }
];

let userLocation = null;
let nearestStations = [];
let nearestStation = null;
let autoLocationRefreshTimer = null;
let responseTimer = null;
let distressStartTime = null;
let emergencyProfile = {
    incidentType: 'distress',
    severity: 'high',
    crewCount: 5,
    medicalAidRequired: false
};

const OFFLINE_CHECKLIST_KEY = 'sos_offline_checklist';

// Initialize the SOS page
document.addEventListener('DOMContentLoaded', function() {
    initializeSOS();
});

function initializeSOS() {
    updateLocationStatus("Getting your location...", "loading");
    getCurrentLocation();
    setupAutoRefresh();
    syncProfileToUI();
    updateReadinessChecklist();
    restoreOfflineChecklist();
}

function setupAutoRefresh() {
    if (autoLocationRefreshTimer) {
        window.clearInterval(autoLocationRefreshTimer);
    }
    autoLocationRefreshTimer = window.setInterval(() => {
        if (userLocation) {
            getCurrentLocation();
        }
    }, 120000);
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateLocationDisplay();
                calculateDistances();
                updateLocationStatus("Location found", "active");
            },
            function(error) {
                console.log('Geolocation error:', error.message);
                // Fallback to Mumbai coordinates for demo
                userLocation = { lat: 19.0760, lng: 72.8777 };
                updateLocationDisplay();
                calculateDistances();
                updateLocationStatus("Using approximate location", "error");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        // Fallback location (Mumbai)
        userLocation = { lat: 19.0760, lng: 72.8777 };
        updateLocationDisplay();
        calculateDistances();
        updateLocationStatus("Geolocation not supported", "error");
    }
}

// Update location display
function updateLocationDisplay() {
    const coordsElement = document.getElementById('coordinates');
    if (userLocation) {
        const lat = Math.abs(userLocation.lat).toFixed(4);
        const lng = Math.abs(userLocation.lng).toFixed(4);
        const latDir = userLocation.lat >= 0 ? 'N' : 'S';
        const lngDir = userLocation.lng >= 0 ? 'E' : 'W';

        coordsElement.textContent = `${lat}° ${latDir}, ${lng}° ${lngDir}`;
    }
}

// Update location status
function updateLocationStatus(message, status) {
    const statusValue = document.getElementById('locationStatus');
    const statusDot = document.getElementById('statusDot');

    statusValue.textContent = message;
    statusDot.className = 'status-indicator ' + status;
}

// Calculate distances to all radio stations
function calculateDistances() {
    if (!userLocation) return;

    nearestStations = indianCoastalRadioStations.map(station => {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            station.lat, station.lng
        );
        return { ...station, distance };
    });

    // Sort by distance
    nearestStations.sort((a, b) => a.distance - b.distance);
    nearestStation = nearestStations[0];

    // Update displays
    updateNearestStationDisplay();
    updateStationsList();

    // Enable navigation button
    document.getElementById('navigateBtn').disabled = false;
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI/180);
}

// Update nearest station display
function updateNearestStationDisplay() {
    if (!nearestStation) return;

    document.getElementById('stationName').textContent = nearestStation.name;
    document.getElementById('callSign').textContent = nearestStation.callSign;
    document.getElementById('frequency').textContent = nearestStation.freq;
    document.getElementById('distanceValue').textContent = `${nearestStation.distance.toFixed(1)} km`;

    // Update signal strength based on distance
    const signalStrength = document.getElementById('signalStrength');
    const signalLabel = document.getElementById('signalLabel');

    if (nearestStation.distance < 50) {
        signalStrength.className = 'signal-strength excellent';
        signalLabel.textContent = 'Excellent';
    } else if (nearestStation.distance < 150) {
        signalStrength.className = 'signal-strength good';
        signalLabel.textContent = 'Good';
    } else if (nearestStation.distance < 300) {
        signalStrength.className = 'signal-strength fair';
        signalLabel.textContent = 'Fair';
    } else {
        signalStrength.className = 'signal-strength poor';
        signalLabel.textContent = 'Poor';
    }

    // Animate distance counter
    animateDistanceCounter();
}

// Animate distance counter
function animateDistanceCounter() {
    const distanceElement = document.getElementById('distanceValue');
    const targetDistance = nearestStation.distance;
    let currentDistance = 0;
    const increment = targetDistance / 30;

    const counter = setInterval(() => {
        currentDistance += increment;
        if (currentDistance >= targetDistance) {
            currentDistance = targetDistance;
            clearInterval(counter);
        }
        distanceElement.textContent = `${currentDistance.toFixed(1)} km`;
    }, 50);
}

// Update stations list
function updateStationsList() {
    const stationsList = document.getElementById('stationsList');
    const stationCount = document.getElementById('stationCount');

    stationsList.innerHTML = '';
    stationCount.textContent = `${nearestStations.length} stations`;

    nearestStations.forEach((station, index) => {
        const stationElement = createStationElement(station, index === 0);
        stationsList.appendChild(stationElement);
    });
}

// Create station list element
function createStationElement(station, isNearest = false) {
    const stationDiv = document.createElement('div');
    stationDiv.className = `station-item ${isNearest ? 'nearest' : ''}`;

    stationDiv.innerHTML = `
        <div class="station-item-header">
            <div class="station-item-name">${station.name}</div>
            <div class="station-item-distance">${station.distance.toFixed(1)} km</div>
        </div>
        <div class="station-item-details">
            <span class="station-item-call">${station.callSign}</span>
            <span class="station-item-freq">${station.freq}</span>
        </div>
        <div class="station-location">${station.location}</div>
    `;

    // Add click event to navigate to this station
    stationDiv.addEventListener('click', () => {
        navigateToSpecificStation(station);
    });

    return stationDiv;
}

// Navigate to nearest station using Google Maps
function navigateToStation() {
    if (!nearestStation || !userLocation) {
        alert('Location or station data not available');
        return;
    }

    const button = document.getElementById('navigateBtn');
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: spin 1s linear infinite;">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50.3" stroke-dashoffset="50.3">
                <animate attributeName="stroke-dashoffset" dur="2s" values="50.3;0" repeatCount="indefinite"/>
            </circle>
        </svg>
        Opening Maps...
    `;

    const opened = openGoogleMapsNavigation(nearestStation);
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7v6l7-3 7 3V7l-7-3-7 3z" fill="currentColor"/>
            <path d="M10 14v6" stroke="currentColor" stroke-width="2"/>
        </svg>
        Navigate to Station
    `;
    if (opened === false) {
        alert('Popup blocked. Please allow popups for this site.');
    }
}

// Navigate to specific station
function navigateToSpecificStation(station) {
    if (!userLocation) {
        alert('Your location is not available');
        return;
    }

    openGoogleMapsNavigation(station);
}

// Open Google Maps with navigation
function openGoogleMapsNavigation(station) {
    const userLat = userLocation.lat;
    const userLng = userLocation.lng;
    const stationLat = station.lat;
    const stationLng = station.lng;

    // Create Google Maps URL for navigation
    const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${stationLat},${stationLng}/@${(userLat + stationLat) / 2},${(userLng + stationLng) / 2},10z/data=!3m1!4b1!4m2!4m1!3e0`;

    // Try to open in Google Maps app first, then fallback to web
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
        // Android - try Google Maps app
        const androidUrl = `google.navigation:q=${stationLat},${stationLng}`;
        window.location.href = androidUrl;
        return true;
    } else if (isIOS) {
        // iOS - try Apple Maps, then Google Maps
        const appleUrl = `maps://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${stationLat},${stationLng}&dirflg=d`;
        window.location.href = appleUrl;
        return true;
    } else {
        // Desktop or other - open Google Maps web
        const popup = window.open(mapsUrl, '_blank', 'noopener');
        if (!popup) {
            window.location.href = mapsUrl;
            return false;
        }
        return true;
    }

    // Show confirmation
    setTimeout(() => {
        alert(`Navigation opened for ${station.name}\nDistance: ${station.distance.toFixed(1)} km\nCall Sign: ${station.callSign}\nFrequency: ${station.freq}`);
    }, 500);
}

// Emergency call function
function initiateEmergencyCall() {
    const button = document.getElementById('emergencyCallBtn');
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: pulse 1s ease-in-out infinite;">
            <path d="M2 3h3l2 7-3 2c1.667 3.333 4.667 6.333 8 8l2-3 7 2v3c-11 0-20-9-20-20z" fill="currentColor"/>
        </svg>
        Connecting...
    `;

    // Show emergency options
    setTimeout(() => {
        const emergencyOptions = `
Choose Emergency Contact:

1. Indian Coast Guard: 1554 (Toll Free)
2. Maritime Rescue: +91-11-23431007
3. ${nearestStation ? nearestStation.name : 'Nearest Radio Station'}

Location to share:
${userLocation ? document.getElementById('coordinates').textContent : 'Location unavailable'}
        `;

        if (confirm(emergencyOptions + '\n\nDo you want to call Indian Coast Guard (1554)?')) {
            // Try to initiate call
            window.location.href = 'tel:1554';
        }

        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 3h3l2 7-3 2c1.667 3.333 4.667 6.333 8 8l2-3 7 2v3c-11 0-20-9-20-20z" fill="currentColor"/>
            </svg>
            Emergency Contact
        `;
    }, 2000);
}

function setIncidentType(type) {
    emergencyProfile.incidentType = type || 'distress';
    const summary = document.getElementById('incidentSummary');
    if (summary) {
        const labels = {
            distress: 'Vessel Distress',
            medical: 'Medical Emergency',
            engine: 'Engine Failure',
            weather: 'Severe Weather',
            man_overboard: 'Man Overboard'
        };
        summary.textContent = labels[emergencyProfile.incidentType] || 'Vessel Distress';
    }
}

function setSeverityLevel(level) {
    emergencyProfile.severity = level || 'high';
    const badge = document.querySelector('.emergency-badge');
    if (!badge) return;
    badge.textContent = level === 'critical' ? 'CRITICAL' : (level === 'moderate' ? 'MODERATE' : 'PRIORITY');
}

function setCrewCount(count) {
    emergencyProfile.crewCount = Math.max(1, Number(count || 1));
    const crewSummary = document.getElementById('crewSummary');
    if (crewSummary) crewSummary.textContent = String(emergencyProfile.crewCount);
}

function setMedicalAidRequired(enabled) {
    emergencyProfile.medicalAidRequired = !!enabled;
}

function syncProfileToUI() {
    setIncidentType(emergencyProfile.incidentType);
    setSeverityLevel(emergencyProfile.severity);
    setCrewCount(emergencyProfile.crewCount);
    const med = document.getElementById('medicalAidToggle');
    if (med) med.checked = emergencyProfile.medicalAidRequired;
}

function formatElapsed(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const min = String(Math.floor(total / 60)).padStart(2, '0');
    const sec = String(total % 60).padStart(2, '0');
    return `${min}:${sec}`;
}

function startDistressProtocol() {
    distressStartTime = Date.now();
    const protocolStatus = document.getElementById('protocolStatus');
    if (protocolStatus) protocolStatus.textContent = 'Active';
    updateReadinessChecklist();

    if (responseTimer) {
        window.clearInterval(responseTimer);
    }
    responseTimer = window.setInterval(() => {
        const timerEl = document.getElementById('responseTimer');
        const nextEl = document.getElementById('nextBroadcast');
        if (timerEl) timerEl.textContent = formatElapsed(Date.now() - distressStartTime);
        if (nextEl) {
            const nextMs = 5 * 60 * 1000 - ((Date.now() - distressStartTime) % (5 * 60 * 1000));
            nextEl.textContent = formatElapsed(nextMs);
        }
    }, 1000);

    const callBtn = document.getElementById('emergencyCallBtn');
    if (callBtn) {
        callBtn.classList.add('active-alert');
    }
}

function markCrewSafe() {
    if (responseTimer) {
        window.clearInterval(responseTimer);
        responseTimer = null;
    }
    distressStartTime = null;
    const protocolStatus = document.getElementById('protocolStatus');
    const timerEl = document.getElementById('responseTimer');
    const nextEl = document.getElementById('nextBroadcast');
    if (protocolStatus) protocolStatus.textContent = 'Resolved';
    if (timerEl) timerEl.textContent = '00:00';
    if (nextEl) nextEl.textContent = '--:--';
    const callBtn = document.getElementById('emergencyCallBtn');
    if (callBtn) {
        callBtn.classList.remove('active-alert');
    }
}

function updateReadinessChecklist() {
    const checks = Array.from(document.querySelectorAll('.checklist-item'));
    const scoreEl = document.getElementById('readinessScore');
    if (!checks.length || !scoreEl) return;
    const done = checks.filter((c) => c.checked).length;
    const score = Math.round((done / checks.length) * 100);
    scoreEl.textContent = `Readiness ${score}%`;

    const state = checks.map((c) => c.checked);
    try {
        localStorage.setItem(OFFLINE_CHECKLIST_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage failures.
    }
}

function restoreOfflineChecklist() {
    try {
        const raw = localStorage.getItem(OFFLINE_CHECKLIST_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        const checks = Array.from(document.querySelectorAll('.checklist-item'));
        checks.forEach((c, idx) => {
            if (typeof state[idx] === 'boolean') {
                c.checked = state[idx];
            }
        });
        updateReadinessChecklist();
    } catch {
        // Ignore storage failures.
    }
}

function buildEmergencyBrief() {
    const coords = document.getElementById('coordinates')?.textContent || 'Unknown';
    const station = nearestStation ? `${nearestStation.name} (${nearestStation.callSign}, ${nearestStation.freq})` : 'Unknown';
    const distance = nearestStation ? `${nearestStation.distance.toFixed(1)} km` : 'Unknown';
    const incidentLabel = document.getElementById('incidentSummary')?.textContent || 'Vessel Distress';
    const elapsed = document.getElementById('responseTimer')?.textContent || '00:00';
    return `SOS EMERGENCY BRIEF
Time: ${new Date().toLocaleString()}
Incident: ${incidentLabel}
Severity: ${emergencyProfile.severity.toUpperCase()}
Crew Count: ${emergencyProfile.crewCount}
Medical Aid Required: ${emergencyProfile.medicalAidRequired ? 'YES' : 'NO'}
Coordinates: ${coords}
Nearest Radio Station: ${station}
Distance to Station: ${distance}
Alert Elapsed: ${elapsed}
Google Maps: https://maps.google.com/?q=${userLocation ? `${userLocation.lat},${userLocation.lng}` : ''}`;
}

function exportEmergencyBrief() {
    const text = buildEmergencyBrief();
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sos_brief_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

// Refresh location
function refreshLocation() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('loading');

    updateLocationStatus("Refreshing location...", "loading");

    setTimeout(() => {
        getCurrentLocation();
        refreshBtn.classList.remove('loading');
    }, 2000);
}

// Share location
function shareLocation() {
    if (!userLocation) {
        alert('Location not available');
        return;
    }

    const locationText = `EMERGENCY LOCATION SHARE
Coordinates: ${document.getElementById('coordinates').textContent}
Nearest Radio Station: ${nearestStation ? nearestStation.name : 'Unknown'}
Distance: ${nearestStation ? nearestStation.distance.toFixed(1) + ' km' : 'Unknown'}
Timestamp: ${new Date().toLocaleString()}

Google Maps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;

    if (navigator.share) {
        navigator.share({
            title: 'Emergency Location',
            text: locationText
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(locationText).then(() => {
            alert('Location copied to clipboard!');
        });
    } else {
        // Fallback - show text for manual copy
        prompt('Copy this emergency location info:', locationText);
    }
}

function shareEmergencyDetails() {
    const coordsText = userLocation
        ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
        : 'Location unavailable';
    const station = nearestStation
        ? `${nearestStation.name} (${nearestStation.callSign}, ${nearestStation.freq})`
        : 'Nearest station unavailable';
    const distance = nearestStation
        ? `${nearestStation.distance.toFixed(1)} km`
        : 'Unknown';
    const profile = emergencyProfile || {};

    const brief = [
        'Emergency Brief (Smart Sagar)',
        `Incident: ${profile.incidentType || 'unknown'}`,
        `Severity: ${profile.severity || 'unknown'}`,
        `Crew Count: ${profile.crewCount || 'unknown'}`,
        `Medical Aid Required: ${profile.medicalAidRequired ? 'Yes' : 'No'}`,
        `Coordinates: ${coordsText}`,
        `Nearest Station: ${station}`,
        `Distance: ${distance}`,
        `Timestamp: ${new Date().toLocaleString()}`
    ].join('\\n');

    if (navigator.share) {
        navigator.share({
            title: 'Emergency Brief',
            text: brief
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(brief).then(() => {
            alert('Emergency brief copied to clipboard!');
        });
    } else {
        prompt('Copy this emergency brief:', brief);
    }
}

// Add emergency keyboard shortcuts once
if (!window.__sosKeybindsAttached) {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F1' || (e.ctrlKey && e.key === 'e')) {
            e.preventDefault();
            initiateEmergencyCall();
        }

        if (e.key === 'F2' || (e.ctrlKey && e.key === 'n')) {
            e.preventDefault();
            navigateToStation();
        }

        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            refreshLocation();
        }
    });
    window.__sosKeybindsAttached = true;
}

window.setIncidentType = setIncidentType;
window.setSeverityLevel = setSeverityLevel;
window.setCrewCount = setCrewCount;
window.setMedicalAidRequired = setMedicalAidRequired;
window.startDistressProtocol = startDistressProtocol;
window.markCrewSafe = markCrewSafe;
window.updateReadinessChecklist = updateReadinessChecklist;
window.exportEmergencyBrief = exportEmergencyBrief;
window.navigateToStation = navigateToStation;
window.refreshLocation = refreshLocation;
window.shareLocation = shareLocation;
window.shareEmergencyDetails = shareEmergencyDetails;

function googleTranslateElementInit() {
            new google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'hi,ta,te,gu,bn,mr,ml,kn,or,pa', // Indian languages
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 
                'google_translate_element'
            );
        }
