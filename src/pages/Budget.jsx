import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

const EXPENSE_CATEGORIES = ['식비', '교통', '쇼핑', '주거', '통신', '구독', '의료', '여가', '교육', '기타'];

export default function Budget() {
  const { transactions, budgets, setBudget, deleteBudget } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [budgetAmount, setBudgetAmount] = useState('');

  const currentMonthExpenses = transactions
    .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonth))
    .reduce((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {});

  const currentMonthBudgets = budgets[currentMonth] || {};

  const handleSetBudget = (e) => {
    e.preventDefault();
    if (Number(budgetAmount) <= 0) return alert('금액은 0보다 커야 합니다.');
    setBudget(currentMonth, selectedCategory, Number(budgetAmount));
    setBudgetAmount('');
  };

  const getProgressColor = (percentage) => percentage >= 100 ? '#E53E3E' : percentage >= 80 ? 'var(--accent-orange)' : 'var(--text-primary)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>예산 관리</h1>
        <input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="form-input" style={{ flex: 'none' }} />
      </div>

      <div className="card">
        <h3 className="card-title">새 예산 설정</h3>
        <form onSubmit={handleSetBudget} className="form-group">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="form-input">
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="number" placeholder="예산 금액 입력" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} required className="form-input" />
          <button type="submit" className="btn-primary">저장</button>
        </form>
      </div>

      <div className="grid-2">
        {EXPENSE_CATEGORIES.map(category => {
          const budget = currentMonthBudgets[category];
          const spent = currentMonthExpenses[category] || 0;
          const isBudgetSet = budget !== undefined;
          
          if (!isBudgetSet && spent === 0) return null;

          const percentage = isBudgetSet ? Math.min((spent / budget) * 100, 100) : 0;
          const displayPercentage = isBudgetSet ? ((spent / budget) * 100).toFixed(1) : 0;
          const progressColor = getProgressColor(displayPercentage);

          return (
            <div key={category} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>{category}</h4>
                {isBudgetSet && <button onClick={() => deleteBudget(currentMonth, category)} style={{ color: 'var(--text-secondary)', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>}
              </div>

              {!isBudgetSet ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '16px 0' }}>예산 미설정 (현재 지출: {spent.toLocaleString()}원)</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: progressColor, fontWeight: 'bold' }}>{displayPercentage}% 사용</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{spent.toLocaleString()} / {budget.toLocaleString()}원</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: progressColor, transition: 'width 0.3s' }} />
                  </div>
                  {displayPercentage >= 100 && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>예산을 초과했습니다!</p>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}