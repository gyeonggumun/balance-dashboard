import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Wallet } from 'lucide-react'; // Wallet 아이콘 추가

export default function Sidebar() {
  const location = useLocation();

  // 현재 경로에 따라 활성화된 메뉴 색상을 변경하는 스타일 함수
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
        {/* 예산 관리 메뉴 추가 */}
        <li>
          <Link to="/budget" style={getLinkStyle('/budget')}>
            <Wallet size={20} /> 예산 관리
          </Link>
        </li>
      </ul>
    </nav>
  );
}