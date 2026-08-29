import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Wallet, PieChart, Target, Settings as SettingsIcon } from 'lucide-react';

// 데스크톱용 사이드바 컴포넌트 내부 구현
const Sidebar = ({ location }) => {
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
  return (
    <nav className="sidebar">
      <h2 className="sidebar-logo">Balance.</h2>
      <ul className="sidebar-nav">
        <li><Link to="/" className={isActive('/')}><LayoutDashboard size={20} /> 대시보드</Link></li>
        <li><Link to="/transactions" className={isActive('/transactions')}><ReceiptText size={20} /> 거래 내역</Link></li>
        <li><Link to="/budget" className={isActive('/budget')}><Wallet size={20} /> 예산 관리</Link></li>
        <li><Link to="/statistics" className={isActive('/statistics')}><PieChart size={20} /> 통계 분석</Link></li>
        <li><Link to="/goals" className={isActive('/goals')}><Target size={20} /> 저축 목표</Link></li>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
        <li><Link to="/settings" className={isActive('/settings')}><SettingsIcon size={20} /> 설정</Link></li>
      </ul>
    </nav>
  );
};

export default function Layout({ children }) {
  const location = useLocation();
  const isActiveMobile = (path) => location.pathname === path ? 'bottom-nav-link active' : 'bottom-nav-link';

  return (
    <div className="app-container">
      {/* 1. 모바일 전용 상단 헤더 */}
      <header className="mobile-header">
        <h2 className="mobile-logo">Balance.</h2>
        <Link to="/settings" style={{ color: 'var(--text-secondary)' }}>
          <SettingsIcon size={24} />
        </Link>
      </header>

      {/* 2. 데스크톱 전용 사이드바 */}
      <Sidebar location={location} />

      {/* 3. 메인 콘텐츠 영역 */}
      <main className="main-content">
        {children}
      </main>

      {/* 4. 모바일 전용 하단 네비게이션 */}
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