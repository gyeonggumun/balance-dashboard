import { useState, useMemo } from 'react';
import useFinanceStore from '../store/financeStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

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
      thisMonth: formatYM(currentY, currentM),
      lastMonth: formatYM(currentY, currentM - 1),
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
    let income = 0;
    let expense = 0;
    const catMap = {};
    const trendMap = {};

    filteredTransactions.forEach(tx => {
      const monthStr = tx.date.substring(0, 7);
      
      if (!trendMap[monthStr]) trendMap[monthStr] = { name: monthStr, income: 0, expense: 0 };

      if (tx.type === 'income') {
        income += tx.amount;
        trendMap[monthStr].income += tx.amount;
      } else {
        expense += tx.amount;
        trendMap[monthStr].expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });

    const categoryArr = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const trendArr = Object.values(trendMap).sort((a, b) => a.name.localeCompare(b.name));

    return { totalIncome: income, totalExpense: expense, categoryData: categoryArr, monthlyTrend: trendArr };
  }, [filteredTransactions]);

  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const topCategory = categoryData.length > 0 ? categoryData[0].name : '-';
  const averageExpense = monthlyTrend.length > 0 ? Math.round(totalExpense / monthlyTrend.length) : 0;

  const PIE_COLORS = ['#333333', '#666666', '#FF7B28', '#999999', '#CCCCCC', '#E0E0E0'];
  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>통계 및 분석</h1>
        
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="thisMonth">이번 달</option>
          <option value="lastMonth">지난 달</option>
          <option value="last3Months">최근 3개월</option>
          <option value="thisYear">올해</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p>선택한 기간에 해당하는 데이터가 충분하지 않습니다.</p>
          <p style={{ fontSize: '14px', color: '#999' }}>거래 내역을 먼저 추가해 주세요.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={cardStyle}>
              <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>저축률</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF7B28', margin: 0 }}>{savingsRate}%</p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>가장 큰 지출</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{topCategory}</p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>월 평균 지출</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{averageExpense.toLocaleString()}원</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            <div style={{ ...cardStyle, height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#333', fontSize: '16px', margin: '0 0 20px 0' }}>수입 vs 지출 추이</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `${(val / 10000).toLocaleString()}만`} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="수입" fill="#FF7B28" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="지출" fill="#333333" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ ...cardStyle, height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#333', fontSize: '16px', margin: '0 0 20px 0' }}>카테고리별 지출 비율</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      )}
    </div>
  );
}