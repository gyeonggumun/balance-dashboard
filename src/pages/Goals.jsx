import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinanceStore();
  const [formData, setFormData] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  const [updateAmounts, setUpdateAmounts] = useState({});

  const handleAddGoal = (e) => {
    e.preventDefault();
    addGoal({ name: formData.name, targetAmount: Number(formData.targetAmount), currentAmount: Number(formData.currentAmount) || 0, targetDate: formData.targetDate });
    setFormData({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  };

  const handleUpdateAmount = (id) => {
    updateGoal(id, Number(updateAmounts[id]));
    setUpdateAmounts(prev => ({ ...prev, [id]: '' }));
  };

  const inProgressGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);

  return (
    <div>
      <h1 className="page-title">저축 목표</h1>

      <div className="card">
        <h3 className="card-title">새 목표 만들기</h3>
        <form onSubmit={handleAddGoal} className="form-group">
          <input type="text" placeholder="목표명" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="form-input" />
          <input type="number" placeholder="목표 금액" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} required className="form-input" />
          <input type="number" placeholder="현재 금액" value={formData.currentAmount} onChange={(e) => setFormData({...formData, currentAmount: e.target.value})} className="form-input" />
          <input type="date" value={formData.targetDate} onChange={(e) => setFormData({...formData, targetDate: e.target.value})} required className="form-input" />
          <button type="submit" className="btn-primary">추가</button>
        </form>
      </div>

      <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>진행 중인 목표</h3>
      <div className="grid-2">
        {inProgressGoals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);
          return (
            <div key={goal.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ margin: 0 }}>{goal.name}</h4>
                <button onClick={() => deleteGoal(goal.id)} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none' }}>삭제</button>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>목표일: {goal.targetDate}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>{progress}% 달성</span>
                <span style={{ color: 'var(--text-secondary)' }}>{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}원</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-orange)', transition: 'width 0.3s ease' }} />
              </div>

              <div className="form-group" style={{ flexWrap: 'nowrap' }}>
                <input type="number" placeholder="새 금액" value={updateAmounts[goal.id] || ''} onChange={(e) => setUpdateAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))} className="form-input" />
                <button onClick={() => handleUpdateAmount(goal.id)} className="btn-primary">수정</button>
              </div>
            </div>
          );
        })}
      </div>

      {completedGoals.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>완료된 목표 👏</h3>
          <div className="grid-2">
            {completedGoals.map(goal => (
              <div key={goal.id} className="card" style={{ opacity: 0.8, background: '#fafafa', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, textDecoration: 'line-through' }}>{goal.name}</h4>
                  <button onClick={() => deleteGoal(goal.id)} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none' }}>삭제</button>
                </div>
                <p style={{ color: 'var(--accent-orange)', fontWeight: 'bold', margin: '8px 0' }}>100% 달성 완료!</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}