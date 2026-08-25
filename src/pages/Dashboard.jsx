import useFinanceStore from '../store/financeStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard() {
  const { transactions } = useFinanceStore();

  // 1. 상단 요약 카드용 데이터 계산
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const currentAsset = totalIncome - totalExpense;

  // 2. 월별 수입/지출 막대 차트용 데이터 가공 (예: '2026-08' 기준으로 그룹화)
  const monthlyDataMap = transactions.reduce((acc, tx) => {
    const month = tx.date.substring(0, 7); // YYYY-MM 추출
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
    if (tx.type === 'income') acc[month].income += tx.amount;
    if (tx.type === 'expense') acc[month].expense += tx.amount;
    return acc;
  }, {});
  
  // 날짜 오름차순으로 정렬
  const barChartData = Object.values(monthlyDataMap).sort((a, b) => a.name.localeCompare(b.name));

  // 3. 카테고리별 지출 도넛 차트용 데이터 가공
  const categoryDataMap = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      if (!acc[tx.category]) acc[tx.category] = { name: tx.category, value: 0 };
      acc[tx.category].value += tx.amount;
      return acc;
    }, {});
    
  // 지출액이 큰 순서대로 정렬
  const pieChartData = Object.values(categoryDataMap).sort((a, b) => b.value - a.value);

  // 차트 테마 색상 (신뢰감을 주는 차콜과 강조용 오렌지 제한적 사용)
  const PIE_COLORS = ['#333333', '#666666', '#FF7B28', '#999999', '#CCCCCC', '#E0E0E0'];

  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
  const chartCardStyle = { ...cardStyle, height: '350px', display: 'flex', flexDirection: 'column' };

  return (
    <div>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>대시보드</h1>
      
      {/* 상단 요약 카드 영역 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h3 style={{ color: '#666', margin: '0 0 8px 0', fontSize: '14px' }}>총 자산</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
            {currentAsset.toLocaleString()}원
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: '#666', margin: '0 0 8px 0', fontSize: '14px' }}>누적 수입</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#FF7B28' }}>
            {totalIncome.toLocaleString()}원
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: '#666', margin: '0 0 8px 0', fontSize: '14px' }}>누적 지출</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {totalExpense.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 차트 영역 (Grid 레이아웃 적용) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* 1. 월별 수입/지출 막대 차트 */}
        <div style={chartCardStyle}>
          <h3 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '16px' }}>월별 수입/지출 추이</h3>
          {barChartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `${(val / 10000).toLocaleString()}만`} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} formatter={(value) => `${value.toLocaleString()}원`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="수입" fill="#FF7B28" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="지출" fill="#333333" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. 카테고리별 지출 도넛 차트 */}
        <div style={chartCardStyle}>
          <h3 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '16px' }}>카테고리별 지출 (전체)</h3>
          {pieChartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}