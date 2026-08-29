import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import useFinanceStore from './store/financeStore';

import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Statistics from './pages/Statistics';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

function App() {
  const theme = useFinanceStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;