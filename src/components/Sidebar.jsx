import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">Acadify</h1>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`
            }
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
