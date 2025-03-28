import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo">Acadify</h1>
      </div>
      <nav className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
