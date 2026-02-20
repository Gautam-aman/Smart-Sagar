import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/fish-population/fishing-zone-map.html', label: 'Fishing Zones' },
  { to: '/wether/index.html', label: 'Marine Weather' },
  { to: '/fish_detect/index.html', label: 'Fish Detect' },
  { to: '/dashoardfinal/index.html', label: 'Research' },
  { to: '/sos/sos-emergency.html', label: 'SOS' },
];

export default function GlobalNavbar() {
  return (
    <nav className="global-nav" aria-label="Primary">
      <div className="global-nav-inner">
        <NavLink to="/" className="global-brand">
          Smart Sagar
        </NavLink>
        <div className="global-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `global-nav-link${item.label === 'SOS' ? ' sos-link' : ''}${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
