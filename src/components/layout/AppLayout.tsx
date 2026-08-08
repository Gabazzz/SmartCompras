import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

interface Props {
  children: React.ReactNode;
  hideNav?: boolean;
}

export default function AppLayout({ children, hideNav = false }: Props) {
  const location = useLocation();

  return (
    <div className="mobile-container">
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.28 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
            style={{ height: '100%', overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
}
