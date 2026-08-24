import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText } from 'lucide-react'; // 아이콘 라이브러리

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav style={{ width: '250px', padding: '20px', backgroundColor: '#fff', borderRight: '1px solid #eee' }}>
      <h2 style={{ color: '#FF7B28', marginBottom: '30px' }}>Balance.</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <li>
          <Link to="/" style={{ color: location.pathname === '/' ? '#FF7B28' : '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={20} /> 대시보드
          </Link>
        </li>
        <li>
          <Link to="/transactions" style={{ color: location.pathname === '/transactions' ? '#FF7B28' : '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ReceiptText size={20} /> 거래 내역
          </Link>
        </li>
      </ul>
    </nav>
  );
}