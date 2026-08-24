import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useFinanceStore();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '식비',
    date: new Date().toISOString().split('T')[0],
    memo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) return alert('금액은 0보다 커야 합니다.');
    
    addTransaction({
      ...formData,
      amount: Number(formData.amount)
    });
    // 폼 초기화
    setFormData({ ...formData, amount: '', memo: '' });
  };

  return (
    <div>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>거래 내역 관리</h1>
      
      {/* 1. 입력 폼 영역 */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="expense">지출</option>
            <option value="income">수입</option>
          </select>
          <input type="number" placeholder="금액" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          <input type="text" placeholder="카테고리 (예: 식비, 급여)" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          <input type="text" placeholder="메모 (선택)" value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} />
          <button type="submit" style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            추가
          </button>
        </form>
      </div>

      {/* 2. 리스트 영역 */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        {transactions.length === 0 ? (
          <p style={{ color: '#666' }}>아직 등록된 거래 내역이 없습니다.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px 0' }}>날짜</th>
                <th>유형</th>
                <th>카테고리</th>
                <th>메모</th>
                <th style={{ textAlign: 'right' }}>금액</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '12px 0' }}>{tx.date}</td>
                  <td style={{ color: tx.type === 'income' ? '#FF7B28' : '#333' }}>
                    {tx.type === 'income' ? '수입' : '지출'}
                  </td>
                  <td>{tx.category}</td>
                  <td style={{ color: '#666' }}>{tx.memo}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {tx.amount.toLocaleString()}원
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => deleteTransaction(tx.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}