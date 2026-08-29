import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Wallet, PieChart, Target, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import useFinanceStore from '../../store/financeStore';

const Sidebar = ({ location }) => {
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
  const { theme, toggleTheme } = useFinanceStore();

  return (
    <nav className="sidebar">
      <h2 className="sidebar-logo">Balance.</h2>
      <ul className="sidebar-nav" style={{ flex: 1 }}>
        <li><Link to="/" className={isActive('/')}><LayoutDashboard size={20} /> 대시보드</Link></li>
        <li><Link to="/transactions" className={isActive('/transactions')}><ReceiptText size={20} /> 거래 내역</Link></li>
        <li><Link to="/budget" className={isActive('/budget')}><Wallet size={20} /> 예산 관리</Link></li>
        <li><Link to="/statistics" className={isActive('/statistics')}><PieChart size={20} /> 통계 분석</Link></li>
        <li><Link to="/goals" className={isActive('/goals')}><Target size={20} /> 저축 목표</Link></li>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
        <li><Link to="/settings" className={isActive('/settings')}><SettingsIcon size={20} /> 설정</Link></li>
      </ul>
      
      <button 
        onClick={toggleTheme} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '15px' }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} 
        {theme === 'light' ? '다크 모드' : '라이트 모드'}
      </button>
    </nav>
  );
};

export default function Layout({ children }) {
  const location = useLocation();
  const isActiveMobile = (path) => location.pathname === path ? 'bottom-nav-link active' : 'bottom-nav-link';
  const { theme, toggleTheme } = useFinanceStore();

  return (
    <div className="app-container">
      <header className="mobile-header">
        <h2 className="mobile-logo">Balance.</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          <Link to="/settings" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <SettingsIcon size={24} />
          </Link>
        </div>
      </header>

      <Sidebar location={location} />

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav">
        <Link to="/" className={isActiveMobile('/')}><LayoutDashboard size={20} /><span>홈</span></Link>
        <Link to="/transactions" className={isActiveMobile('/transactions')}><ReceiptText size={20} /><span>내역</span></Link>
        <Link to="/budget" className={isActiveMobile('/budget')}><Wallet size={20} /><span>예산</span></Link>
        <Link to="/statistics" className={isActiveMobile('/statistics')}><PieChart size={20} /><span>통계</span></Link>
        <Link to="/goals" className={isActiveMobile('/goals')}><Target size={20} /><span>목표</span></Link>
      </nav>
    </div>
  );
}