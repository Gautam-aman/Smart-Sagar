import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/dashoardfinal/index.html', label: 'Research' },
  { to: '/fish-population/fishing-zone-map.html', label: 'Fishing Zones' },
  { to: '/wether/index.html', label: 'Marine Weather' },
  { to: '/sos/sos-emergency.html', label: 'SOS' },
  { to: '/fish_detect/index.html', label: 'Fish Detect' },
];

export default function GlobalNavbar() {
  return (
    <nav className="global-nav" aria-label="Primary">
      <div className="global-nav-inner">
        <NavLink to="/" className="global-brand">
          Sagar Saathi
        </NavLink>
        <div className="global-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `global-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
