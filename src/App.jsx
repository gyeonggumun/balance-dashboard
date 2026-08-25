import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget'; // 1. 예산 페이지 불러오기

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} /> {/* 2. 예산 페이지 라우팅 추가 */}
          {/* 차후 Statistics, Goals, Settings 라우팅을 여기에 추가합니다 */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;