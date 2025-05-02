import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useAuth();
  
  // Define navigation items based on role
  const getNavItems = () => {
    // Only show Files option for developers
    const developerItems = [
      { path: '/files', label: 'Files', icon: '📁' },
    ];

    const studentItems = [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/reports', label: 'Reports', icon: '📈' },
      { path: '/student/courses', label: 'Courses', icon: '📚' },
      { path: '/student/assignments', label: 'Assignments', icon: '📝' },
    ];

    const commonFooterItems = [
      // { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    if (userRole === 'developer') {
      return {
        mainItems: developerItems,
        footerItems: commonFooterItems
      };
    }

    if (userRole === 'teacher') {
      return {
        mainItems: [
          { path: '/', label: 'Dashboard', icon: '📊' },
          { path: '/teacher/assignments', label: 'Assignments', icon: '📝' },
          { path: '/teacher/classes', label: 'Courses', icon: '👥' },
          { path: '/teacher/students', label: 'Students', icon: '🎓' },
        ],
        footerItems: commonFooterItems
      };
    }

    return {
      mainItems: studentItems,
      footerItems: commonFooterItems
    };
  };

  const { mainItems, footerItems } = getNavItems();

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
          {mainItems.map((item) => (
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
        
        <div className="nav-footer">
          {footerItems.map((item) => (
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
        </div>
      </div>
    </>
  );
};

export default Sidebar;
