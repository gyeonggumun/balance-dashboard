import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  PieChart,
  Target,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import useFinanceStore from '../../store/financeStore';

const navItems = [
  { path: '/', label: '대시보드', mobileLabel: '홈', icon: LayoutDashboard },
  { path: '/transactions', label: '거래 내역', mobileLabel: '내역', icon: ReceiptText },
  { path: '/budget', label: '예산 관리', mobileLabel: '예산', icon: Wallet },
  { path: '/statistics', label: '통계 분석', mobileLabel: '통계', icon: PieChart },
  { path: '/goals', label: '저축 목표', mobileLabel: '목표', icon: Target },
];

function ThemeToggle({ compact = false }) {
  const theme = useFinanceStore((state) => state.theme);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={compact ? 'icon-button theme-toggle' : 'theme-toggle'}
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact && <span>{isDark ? '라이트 모드' : '다크 모드'}</span>}
    </button>
  );
}

function Navigation({ mobile = false }) {
  return (
    <ul className={mobile ? 'mobile-nav-list' : 'sidebar-nav'}>
      {navItems.map(({ path, label, mobileLabel, icon: Icon }) => (
        <li key={path}>
          <NavLink
            to={path}
            end={path === '/'}
            className={({ isActive }) => mobile
              ? `bottom-nav-link${isActive ? ' active' : ''}`
              : `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={mobile ? 19 : 18} strokeWidth={1.8} />
            <span>{mobile ? mobileLabel : label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <Link to="/" className="brand-block">
          <span className="brand-mark"><Sparkles size={17} /></span>
          <span>
            <strong className="sidebar-logo">Balance.</strong>
            <small>PERSONAL FINANCE</small>
          </span>
        </Link>
        <p className="sidebar-intro">내 돈의 흐름을 한눈에 보고, 더 나은 다음을 설계하세요.</p>

        <div className="sidebar-section-label">WORKSPACE</div>
        <Navigation />

        <div className="sidebar-section-label sidebar-section-label-secondary">MANAGE</div>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <SettingsIcon size={18} strokeWidth={1.8} />
          <span>설정</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="profile-avatar">GG</div>
          <div>
            <strong>나의 지갑</strong>
            <span>LOCAL-FIRST MODE</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function MobileHeader() {
  return (
    <header className="mobile-header">
      <Link to="/" className="mobile-brand">
        <span className="brand-mark"><Sparkles size={15} /></span>
        <strong>Balance.</strong>
      </Link>
      <div className="mobile-header-actions">
        <ThemeToggle compact />
        <Link to="/settings" className="icon-button" aria-label="설정">
          <SettingsIcon size={19} />
        </Link>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-container">
      <MobileHeader />
      <Sidebar />
      <main className="main-content" key={location.pathname}>
        {children}
      </main>
      <nav className="bottom-nav" aria-label="모바일 내비게이션">
        <Navigation mobile />
      </nav>
    </div>
  );
}
