import { useLocation, useNavigate } from 'react-router-dom';
import { Home, List, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home },
  { path: '/lista', icon: List },
  { path: '/estoque', icon: Package },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  return (
    <div className="dock-container">
      <nav className="dock">
        {tabs.map((tab, i) => {
          const active = current === tab.path;
          return (
            <button
              key={tab.path}
              className={`dock-item ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              style={{ order: i < 2 ? i : i + 1 }}
            >
              <tab.icon size={20} strokeWidth={active ? 2.5 : 2} />
            </button>
          );
        })}

        {/* FAB centralizado na dock */}
        <div style={{ order: 2 }}>
          <motion.button
            className="dock-fab"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/nova')}
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
