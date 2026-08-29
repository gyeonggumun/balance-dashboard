import { useState } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useFinanceStore();
  const [formData, setFormData] = useState({
    type: 'expense', amount: '', category: '식비', date: new Date().toISOString().split('T')[0], memo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) return alert('금액은 0보다 커야 합니다.');
    addTransaction({ ...formData, amount: Number(formData.amount) });
    setFormData({ ...formData, amount: '', memo: '' });
  };

  return (
    <div>
      <h1 className="page-title">거래 내역 관리</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="form-group">
          <select className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="expense">지출</option>
            <option value="income">수입</option>
          </select>
          <input className="form-input" type="number" placeholder="금액" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          <input className="form-input" type="text" placeholder="카테고리 (예: 식비)" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          <input className="form-input" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          <input className="form-input" type="text" placeholder="메모 (선택)" value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} />
          <button type="submit" className="btn-primary">추가</button>
        </form>
      </div>

      <div className="card" style={{ padding: transactions.length === 0 ? '40px 24px' : '24px' }}>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>등록된 거래 내역이 없습니다.</p>
        ) : (
          <>
            {/* 데스크톱용 테이블 뷰 */}
            <table className="tx-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>유형</th>
                  <th>카테고리</th>
                  <th>메모</th>
                  <th style={{ textAlign: 'right' }}>금액</th>
                  <th style={{ textAlign: 'right' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td style={{ color: tx.type === 'income' ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{tx.type === 'income' ? '수입' : '지출'}</td>
                    <td>{tx.category}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.memo}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{tx.amount.toLocaleString()}원</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteTransaction(tx.id)} style={{ color: '#E53E3E', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 모바일용 카드 리스트 뷰 */}
            <div className="tx-mobile-list">
              {transactions.map(tx => (
                <div key={tx.id} className="tx-mobile-card">
                  <div className="tx-mobile-header">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tx.date}</span>
                    <button onClick={() => deleteTransaction(tx.id)} style={{ color: '#E53E3E', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>삭제</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: tx.type === 'income' ? 'var(--accent-orange)' : 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px' }}>{tx.type === 'income' ? '수입' : '지출'}</span>
                      <span style={{ fontSize: '14px' }}>{tx.category}</span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>{tx.amount.toLocaleString()}원</span>
                  </div>
                  {tx.memo && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tx.memo}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}