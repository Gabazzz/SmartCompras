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
      <div
        key={location.pathname}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}
      >
        {children}
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
}
