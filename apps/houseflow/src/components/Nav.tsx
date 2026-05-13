import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/income', label: 'Income', icon: '💰' },
  { to: '/expenses', label: 'Expenses', icon: '🧾' },
  { to: '/split', label: 'Split', icon: '⚖️' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Nav(): JSX.Element {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto flex">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-500' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
