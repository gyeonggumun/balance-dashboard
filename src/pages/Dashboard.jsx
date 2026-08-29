import useFinanceStore from '../store/financeStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { transactions } = useFinanceStore();
  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const currentAsset = totalIncome - totalExpense;

  const monthlyDataMap = transactions.reduce((acc, tx) => {
    const month = tx.date.substring(0, 7);
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
    tx.type === 'income' ? acc[month].income += tx.amount : acc[month].expense += tx.amount;
    return acc;
  }, {});
  const barChartData = Object.values(monthlyDataMap).sort((a, b) => a.name.localeCompare(b.name));

  const categoryDataMap = transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => {
    if (!acc[tx.category]) acc[tx.category] = { name: tx.category, value: 0 };
    acc[tx.category].value += tx.amount;
    return acc;
  }, {});
  const pieChartData = Object.values(categoryDataMap).sort((a, b) => b.value - a.value);
  const PIE_COLORS = ['#333333', '#666666', '#FF7B28', '#999999', '#CCCCCC', '#E0E0E0'];

  return (
    <div>
      <h1 className="page-title">대시보드</h1>
      
      <div className="grid-3">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ color: 'var(--text-secondary)' }}>총 자산</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{currentAsset.toLocaleString()}원</p>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ color: 'var(--text-secondary)' }}>누적 수입</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{totalIncome.toLocaleString()}원</p>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title" style={{ color: 'var(--text-secondary)' }}>누적 지출</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{totalExpense.toLocaleString()}원</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">월별 수입/지출 추이</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <h3 className="card-title">카테고리별 지출</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}