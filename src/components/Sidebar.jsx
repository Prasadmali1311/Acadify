import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Get user role from profile
  const userRole = currentUser?.profile?.role || 'student';

  // Define navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/assignments', label: 'Assignments', icon: '📝' },
    ];

    if (userRole === 'teacher') {
      return [
        ...commonItems,
        { path: '/reports', label: 'Reports', icon: '📈' },
        { path: '/classes', label: 'Classes', icon: '👥' },
        { path: '/students', label: 'Students', icon: '🎓' },
      ];
    }

    return [
      ...commonItems,
      { path: '/reports', label: 'Reports', icon: '📈' },
      { path: '/courses', label: 'Courses', icon: '📚' },
    ];
  };

  const navItems = getNavItems();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button className={`menu-button ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
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
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
