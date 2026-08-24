import useFinanceStore from '../store/financeStore';

export default function Dashboard() {
  const { transactions } = useFinanceStore();

  // 자산 계산 로직 (파생 데이터)
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const currentAsset = totalIncome - totalExpense;

  // 카드 스타일을 객체로 분리하여 코드 가독성 향상
  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };

  return (
    <div>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>대시보드</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
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

      {/* 여기에 추후 Recharts를 이용한 차트 컴포넌트가 들어갑니다 */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', border: '1px dashed #ddd' }}>
        차트 영역 (다음 단계)
      </div>
    </div>
  );
}