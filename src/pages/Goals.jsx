import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinanceStore();

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '', 
    targetDate: ''
  });

  const [updateAmounts, setUpdateAmounts] = useState({});

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (Number(formData.targetAmount) <= 0) return alert('목표 금액은 0보다 커야 합니다.');
    
    addGoal({
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount) || 0,
      targetDate: formData.targetDate
    });
    
    setFormData({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  };

  const handleUpdateAmount = (id) => {
    const newAmount = Number(updateAmounts[id]);
    if (newAmount < 0) return alert('0 이상의 금액을 입력해 주세요.');
    
    updateGoal(id, newAmount);
    setUpdateAmounts(prev => ({ ...prev, [id]: '' }));
  };

  const inProgressGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);

  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' };
  const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' };

  return (
    <div>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>저축 목표</h1>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333', fontSize: '16px' }}>새 목표 만들기</h3>
        <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="목표명 (예: 맥북 구매)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={inputStyle} />
          <input type="number" placeholder="목표 금액" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} required style={inputStyle} />
          <input type="number" placeholder="현재 모은 금액 (선택)" value={formData.currentAmount} onChange={(e) => setFormData({...formData, currentAmount: e.target.value})} style={inputStyle} />
          <input type="date" value={formData.targetDate} onChange={(e) => setFormData({...formData, targetDate: e.target.value})} required style={inputStyle} />
          <button type="submit" style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            추가
          </button>
        </form>
      </div>

      <h3 style={{ color: '#666', fontSize: '16px', marginBottom: '16px' }}>진행 중인 목표 ({inProgressGoals.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {inProgressGoals.length === 0 && <p style={{ color: '#999' }}>진행 중인 목표가 없습니다.</p>}
        
        {inProgressGoals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);
          
          return (
            <div key={goal.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#333' }}>{goal.name}</h4>
                <button onClick={() => deleteGoal(goal.id)} style={{ color: '#999', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>목표일: {goal.targetDate}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: '#FF7B28', fontWeight: 'bold' }}>{progress}% 달성</span>
                <span style={{ color: '#666' }}>{goal.currentAmount.toLocaleString()}원 / {goal.targetAmount.toLocaleString()}원</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#FF7B28', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="새 누적 금액 입력" 
                  value={updateAmounts[goal.id] || ''}
                  onChange={(e) => setUpdateAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                  style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: '12px' }}
                />
                <button onClick={() => handleUpdateAmount(goal.id)} style={{ background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                  수정
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {completedGoals.length > 0 && (
        <>
          <h3 style={{ color: '#666', fontSize: '16px', marginBottom: '16px' }}>완료된 목표 👏</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {completedGoals.map(goal => (
              <div key={goal.id} style={{ background: '#fafafa', padding: '20px', borderRadius: '12px', border: '1px dashed #ccc', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#333', textDecoration: 'line-through' }}>{goal.name}</h4>
                  <button onClick={() => deleteGoal(goal.id)} style={{ color: '#999', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                </div>
                <p style={{ color: '#FF7B28', fontWeight: 'bold', margin: '8px 0' }}>100% 달성 완료!</p>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>총 {goal.currentAmount.toLocaleString()}원 모음</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}