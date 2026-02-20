# Smart Sagar

Live link : [Live Demo](https://aqua-tech-six.vercel.app/)

Smart Sagar is a React + Vite marine operations dashboard that combines modern React pages with legacy HTML tools for fishing intelligence, weather, safety, and biodiversity exploration.

## Highlights

- React app shell with route-based navigation (`react-router-dom`)
- Legacy page hydration layer for existing static tools (`src/LegacyPage.jsx`)
- Fishing zone map with zone overlays, status legend, and decision support
- Marine weather dashboard and fish detect workflow
- SOS emergency panel and utilities

## Tech Stack

- React 18
- React Router DOM 6
- Vite 5
- Leaflet (in legacy map pages)

## Project Structure

- `src/` React app shell and pages
- `src/LegacyPage.jsx` loader that mounts pages from `public/legacy/*`
- `public/legacy/` canonical legacy HTML/CSS/JS assets served by Vite

## Routes

Main routes configured in `src/App.jsx`:

- `/` Home
- `/sos/sos-emergency.html` SOS page
- `/wether/index.html` Marine weather page
- `/fish_detect/index.html` Fish detect page
- `/dashoardfinal/*` Biodiversity explorer (legacy)
- `/dashboard-main/*` Dashboard main (legacy)
- `/fish-zone/*` Fishing zones (legacy)
- `/fish-population/*` Fishing population/zones (legacy)

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

App runs on Vite default URL (usually `http://localhost:5173`).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How Legacy Integration Works

`src/LegacyPage.jsx` fetches legacy HTML from `/legacy/...`, injects styles/scripts, rewrites local asset paths, and dispatches ready events so old scripts continue to work inside the React router.

## Notes

- Legacy naming is preserved under `public/legacy/` (for example `wether`, `dashoardfinal`, `fish deseases`) to avoid breaking existing links.

## License

Add your preferred license in this repository (for example MIT) if you plan to publish publicly.
