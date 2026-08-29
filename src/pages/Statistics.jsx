import { useState, useMemo } from 'react';
import useFinanceStore from '../store/financeStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Statistics() {
  const { transactions } = useFinanceStore();
  const [period, setPeriod] = useState('thisMonth');

  const { thisMonth, lastMonth, last3Months, thisYear } = useMemo(() => {
    const today = new Date();
    const currentY = today.getFullYear();
    const currentM = today.getMonth();
    const formatYM = (y, m) => {
      const d = new Date(y, m, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };
    return {
      thisMonth: formatYM(currentY, currentM), lastMonth: formatYM(currentY, currentM - 1),
      last3Months: [formatYM(currentY, currentM), formatYM(currentY, currentM - 1), formatYM(currentY, currentM - 2)],
      thisYear: String(currentY)
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (period === 'thisMonth') return tx.date.startsWith(thisMonth);
      if (period === 'lastMonth') return tx.date.startsWith(lastMonth);
      if (period === 'last3Months') return last3Months.some(m => tx.date.startsWith(m));
      if (period === 'thisYear') return tx.date.startsWith(thisYear);
      return true;
    });
  }, [transactions, period, thisMonth, lastMonth, last3Months, thisYear]);

  const { totalIncome, totalExpense, categoryData, monthlyTrend } = useMemo(() => {
    let income = 0; let expense = 0; const catMap = {}; const trendMap = {};
    filteredTransactions.forEach(tx => {
      const monthStr = tx.date.substring(0, 7);
      if (!trendMap[monthStr]) trendMap[monthStr] = { name: monthStr, income: 0, expense: 0 };
      if (tx.type === 'income') {
        income += tx.amount; trendMap[monthStr].income += tx.amount;
      } else {
        expense += tx.amount; trendMap[monthStr].expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });
    const categoryArr = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const trendArr = Object.values(trendMap).sort((a, b) => a.name.localeCompare(b.name));
    return { totalIncome: income, totalExpense: expense, categoryData: categoryArr, monthlyTrend: trendArr };
  }, [filteredTransactions]);

  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const PIE_COLORS = ['#333333', '#666666', '#FF7B28', '#999999', '#CCCCCC', '#E0E0E0'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>통계 분석</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="form-input" style={{ flex: 'none' }}>
          <option value="thisMonth">이번 달</option>
          <option value="lastMonth">지난 달</option>
          <option value="last3Months">최근 3개월</option>
          <option value="thisYear">올해</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>데이터가 없습니다.</div>
      ) : (
        <>
          <div className="grid-3">
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 className="card-title" style={{ color: 'var(--text-secondary)' }}>저축률</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{savingsRate}%</p>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 className="card-title" style={{ color: 'var(--text-secondary)' }}>총 지출</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{totalExpense.toLocaleString()}원</p>
            </div>
          </div>

          <div className="grid-2">
            <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="card-title">수입 vs 지출 추이</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `${(val / 10000).toLocaleString()}만`} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="수입" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="지출" fill="var(--text-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="card-title">카테고리 비율</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}