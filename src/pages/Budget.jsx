import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

// 명세서 기준 지출 카테고리
const EXPENSE_CATEGORIES = ['식비', '교통', '쇼핑', '주거', '통신', '구독', '의료', '여가', '교육', '기타'];

export default function Budget() {
  const { transactions, budgets, setBudget, deleteBudget } = useFinanceStore();
  
  // 기준 월 설정 (기본값: 이번 달)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 폼 상태 (선택된 카테고리와 금액)
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [budgetAmount, setBudgetAmount] = useState('');

  // 1. 이번 달 지출 데이터 추출 및 카테고리별 합산
  const currentMonthExpenses = transactions
    .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonth))
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  // 현재 월의 예산 객체 가져오기
  const currentMonthBudgets = budgets[currentMonth] || {};

  // 예산 추가/수정 핸들러
  const handleSetBudget = (e) => {
    e.preventDefault();
    if (Number(budgetAmount) <= 0) return alert('금액은 0보다 커야 합니다.');
    setBudget(currentMonth, selectedCategory, Number(budgetAmount));
    setBudgetAmount('');
  };

  // 진행률 바 색상 계산 함수
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#E53E3E'; // 초과: 레드
    if (percentage >= 80) return '#FF7B28';  // 경고: 오렌지 포인트
    return '#333333';                        // 안전: 차콜
  };

  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>예산 관리</h1>
        <input 
          type="month" 
          value={currentMonth} 
          onChange={(e) => setCurrentMonth(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      </div>

      {/* 예산 설정 폼 */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333', fontSize: '16px' }}>새 예산 설정</h3>
        <form onSubmit={handleSetBudget} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '8px' }}>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="예산 금액 입력" 
            value={budgetAmount} 
            onChange={(e) => setBudgetAmount(e.target.value)} 
            required 
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            저장
          </button>
        </form>
      </div>

      {/* 카테고리별 예산 현황 리스트 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {EXPENSE_CATEGORIES.map(category => {
          const budget = currentMonthBudgets[category];
          const spent = currentMonthExpenses[category] || 0;
          const isBudgetSet = budget !== undefined;
          
          // 예산 미설정 카테고리 안내
          if (!isBudgetSet && spent === 0) return null; // 예산도 없고 지출도 없으면 숨김 처리 (선택사항)

          const percentage = isBudgetSet ? Math.min((spent / budget) * 100, 100) : 0;
          const displayPercentage = isBudgetSet ? ((spent / budget) * 100).toFixed(1) : 0;
          const progressColor = getProgressColor(displayPercentage);

          return (
            <div key={category} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#333' }}>{category}</h4>
                {isBudgetSet && (
                  <button onClick={() => deleteBudget(currentMonth, category)} style={{ color: '#999', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    삭제
                  </button>
                )}
              </div>

              {!isBudgetSet ? (
                <div style={{ color: '#999', fontSize: '14px', margin: '16px 0' }}>예산이 설정되지 않았습니다. (현재 지출: {spent.toLocaleString()}원)</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: progressColor, fontWeight: 'bold' }}>{displayPercentage}% 사용</span>
                    <span style={{ color: '#666' }}>{spent.toLocaleString()}원 / {budget.toLocaleString()}원</span>
                  </div>
                  
                  {/* 진행률 바 */}
                  <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: progressColor,
                        transition: 'width 0.3s ease-in-out' 
                      }} 
                    />
                  </div>
                  
                  {/* 초과/경고 메시지 */}
                  {displayPercentage >= 100 && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>예산을 초과했습니다!</p>}
                  {displayPercentage >= 80 && displayPercentage < 100 && <p style={{ color: '#FF7B28', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>예산의 80% 이상을 사용했습니다.</p>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}