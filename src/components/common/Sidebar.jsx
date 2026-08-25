import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Wallet, PieChart, Target } from 'lucide-react'; 

export default function Sidebar() {
  const location = useLocation();

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? '#FF7B28' : '#666',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    transition: 'color 0.2s ease-in-out'
  });

  return (
    <nav style={{ width: '250px', padding: '20px', backgroundColor: '#fff', borderRight: '1px solid #eee' }}>
      <h2 style={{ color: '#FF7B28', marginBottom: '30px', paddingLeft: '8px' }}>Balance.</h2>
      
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>
          <Link to="/" style={getLinkStyle('/')}>
            <LayoutDashboard size={20} /> 대시보드
          </Link>
        </li>
        <li>
          <Link to="/transactions" style={getLinkStyle('/transactions')}>
            <ReceiptText size={20} /> 거래 내역
          </Link>
        </li>
        <li>
          <Link to="/budget" style={getLinkStyle('/budget')}>
            <Wallet size={20} /> 예산 관리
          </Link>
        </li>
        <li>
          <Link to="/statistics" style={getLinkStyle('/statistics')}>
            <PieChart size={20} /> 통계 분석
          </Link>
        </li>
        <li>
          <Link to="/goals" style={getLinkStyle('/goals')}>
            <Target size={20} /> 저축 목표
          </Link>
        </li>
      </ul>
    </nav>
  );
}