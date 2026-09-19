import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ListFilter, Plus, Search, Trash2 } from 'lucide-react';
import useFinanceStore from '../store/financeStore';

const today = new Date().toISOString().split('T')[0];

const formatWon = (value) => `${Number(value).toLocaleString('ko-KR')}원`;

function EmptyTransactions({ filtered }) {
  return (
    <div className="empty-state">
      <div>
        <strong>{filtered ? '조건에 맞는 거래가 없어요' : '아직 기록된 거래가 없어요'}</strong>
        <span>{filtered ? '검색어나 필터를 바꿔보세요.' : '첫 거래를 추가하면 자산 흐름이 시작됩니다.'}</span>
      </div>
    </div>
  );
}

export default function Transactions() {
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: categories.expense[0] || '',
    date: today,
    memo: '',
  });

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const searchable = `${transaction.category} ${transaction.memo || ''}`.toLowerCase();
    return matchesType && searchable.includes(query.trim().toLowerCase());
  }), [transactions, typeFilter, query]);

  const summary = useMemo(() => filteredTransactions.reduce((result, transaction) => {
    const amount = Number(transaction.amount) || 0;
    result[transaction.type] += amount;
    return result;
  }, { income: 0, expense: 0 }), [filteredTransactions]);

  const handleTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      type,
      category: categories[type][0] || '',
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (Number(formData.amount) <= 0) return alert('금액은 0보다 커야 합니다.');
    addTransaction({ ...formData, amount: Number(formData.amount) });
    setFormData((previous) => ({ ...previous, amount: '', memo: '' }));
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker"><ListFilter size={13} /> Transaction ledger</p>
          <h1 className="page-title">거래 내역</h1>
          <p className="page-subtitle">수입과 지출을 기록하고 나만의 소비 패턴을 찾아보세요.</p>
        </div>
        <div className="header-date"><CalendarDays size={14} /> {transactions.length}건 기록됨</div>
      </header>

      <section className="card form-card">
        <div className="form-card-header">
          <div>
            <h2>새 거래 기록</h2>
            <p>금액과 카테고리만 입력해도 흐름이 바로 반영됩니다.</p>
          </div>
          <span className="card-badge"><Plus size={12} /> QUICK ADD</span>
        </div>
        <form onSubmit={handleSubmit} className="form-group">
          <label className="form-label">유형
            <select className="form-input" value={formData.type} onChange={(event) => handleTypeChange(event.target.value)}>
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
          </label>
          <label className="form-label">금액
            <input className="form-input" type="number" min="1" placeholder="예: 35000" value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} required />
          </label>
          <label className="form-label">카테고리
            <select className="form-input" value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} required>
              {categories[formData.type].map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="form-label">날짜
            <input className="form-input" type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} required />
          </label>
          <label className="form-label">메모
            <input className="form-input" type="text" placeholder="선택 입력" value={formData.memo} onChange={(event) => setFormData({ ...formData, memo: event.target.value })} />
          </label>
          <button type="submit" className="btn-primary"><Plus size={16} /> 추가하기</button>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-heading">전체 거래</h2>
            <p className="card-caption">검색과 필터로 원하는 기록을 빠르게 찾아보세요.</p>
          </div>
        </div>
        <div className="transaction-summary">
          <span className="summary-pill"><ArrowUpRight size={14} color="var(--accent-green)" /> 수입 <strong>{formatWon(summary.income)}</strong></span>
          <span className="summary-pill"><ArrowDownRight size={14} color="var(--accent-orange)" /> 지출 <strong>{formatWon(summary.expense)}</strong></span>
          <span className="summary-pill">표시 중 <strong>{filteredTransactions.length}건</strong></span>
        </div>
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={16} />
            <input className="form-input" type="search" placeholder="카테고리 또는 메모 검색" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="거래 검색" />
          </label>
          <select className="form-input filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="거래 유형 필터">
            <option value="all">전체 유형</option>
            <option value="income">수입만</option>
            <option value="expense">지출만</option>
          </select>
        </div>

        {filteredTransactions.length === 0 ? <EmptyTransactions filtered={transactions.length > 0} /> : (
          <>
            <table className="tx-table">
              <thead>
                <tr><th>날짜</th><th>유형</th><th>카테고리</th><th>메모</th><th style={{ textAlign: 'right' }}>금액</th><th aria-label="관리" /></tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  return (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td><span className={`tx-type ${isIncome ? 'income' : 'expense'}`}>{isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{isIncome ? '수입' : '지출'}</span></td>
                      <td><span className="tx-category">{transaction.category}</span></td>
                      <td>{transaction.memo || <span className="text-muted">메모 없음</span>}</td>
                      <td style={{ textAlign: 'right', color: isIncome ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: 800 }}>{isIncome ? '+' : '-'}{formatWon(transaction.amount)}</td>
                      <td style={{ textAlign: 'right' }}><button type="button" className="tx-delete" onClick={() => deleteTransaction(transaction.id)} aria-label={`${transaction.category} 거래 삭제`}><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tx-mobile-list">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                return (
                  <div key={transaction.id} className="tx-mobile-card">
                    <div className="tx-mobile-header"><span className="text-muted">{transaction.date}</span><button type="button" className="tx-delete" onClick={() => deleteTransaction(transaction.id)} aria-label={`${transaction.category} 거래 삭제`}><Trash2 size={14} /></button></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div><span className={`tx-type ${isIncome ? 'income' : 'expense'}`}>{isIncome ? '수입' : '지출'}</span><span className="tx-category" style={{ marginLeft: 8 }}>{transaction.category}</span></div>
                      <strong style={{ color: isIncome ? 'var(--accent-green)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{isIncome ? '+' : '-'}{formatWon(transaction.amount)}</strong>
                    </div>
                    {transaction.memo && <div className="text-muted" style={{ marginTop: 10, fontSize: 12 }}>{transaction.memo}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
