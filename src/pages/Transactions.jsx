import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ListFilter, Plus, Search, Trash2 } from 'lucide-react';
import useFinanceStore from '../store/financeStore';
import { DEFAULT_ACCOUNT_ID, getAccountBalance, getAccountId } from '../utils/accounts';

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
  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const addAccount = useFinanceStore((state) => state.addAccount);
  const updateAccount = useFinanceStore((state) => state.updateAccount);
  const deleteAccount = useFinanceStore((state) => state.deleteAccount);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [accountName, setAccountName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: categories.expense[0] || '',
    date: today,
    memo: '',
    accountId: DEFAULT_ACCOUNT_ID,
    toAccountId: '',
  });

  const accountNames = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);
  const accountBalances = accounts.map((account) => ({
    ...account,
    balance: getAccountBalance(account, transactions),
  }));
  const totalBalance = accountBalances.reduce((sum, account) => sum + account.balance, 0);

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || getAccountId(transaction) === accountFilter
      || (transaction.type === 'transfer' && transaction.toAccountId === accountFilter);
    const searchable = `${transaction.category || ''} ${transaction.memo || ''} ${accountNames.get(getAccountId(transaction)) || ''} ${accountNames.get(transaction.toAccountId) || ''}`.toLowerCase();
    return matchesType && matchesAccount && searchable.includes(query.trim().toLowerCase());
  }), [transactions, typeFilter, accountFilter, query, accountNames]);

  const summary = useMemo(() => filteredTransactions.reduce((result, transaction) => {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'income' || transaction.type === 'expense') result[transaction.type] += amount;
    return result;
  }, { income: 0, expense: 0 }), [filteredTransactions]);

  const handleTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      type,
      category: type === 'transfer' ? '' : categories[type][0] || '',
    }));
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    if (!accountName.trim()) return;
    if (editingAccountId) {
      updateAccount(editingAccountId, accountName, openingBalance);
    } else {
      addAccount(accountName, openingBalance);
    }
    setEditingAccountId(null);
    setAccountName('');
    setOpeningBalance('');
  };

  const handleAccountEdit = (account) => {
    setEditingAccountId(account.id);
    setAccountName(account.name);
    setOpeningBalance(String(account.openingBalance));
  };

  const handleAccountDelete = (id) => {
    deleteAccount(id);
    if (accountFilter === id) setAccountFilter('all');
    if (editingAccountId === id) {
      setEditingAccountId(null);
      setAccountName('');
      setOpeningBalance('');
    }
    setFormData((previous) => ({
      ...previous,
      accountId: previous.accountId === id ? DEFAULT_ACCOUNT_ID : previous.accountId,
      toAccountId: previous.toAccountId === id ? '' : previous.toAccountId,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (Number(formData.amount) <= 0) return alert('금액은 0보다 커야 합니다.');
    if (formData.type === 'transfer' && (!formData.toAccountId || formData.accountId === formData.toAccountId)) {
      return alert('서로 다른 두 계좌를 선택해 주세요.');
    }
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

      <section className="card account-card" aria-label="내 계좌">
        <div className="card-header">
          <div>
            <h2 className="card-heading">내 계좌</h2>
            <p className="card-caption">현재는 직접 기록한 거래를 기준으로 계산해요. 은행 잔액과는 다를 수 있습니다.</p>
          </div>
          <span className="account-total">전체 기록 기준 잔액 <strong>{formatWon(totalBalance)}</strong></span>
        </div>
        <div className="account-list">
          {accountBalances.map((account) => {
            const hasTransactions = transactions.some((transaction) =>
              getAccountId(transaction) === account.id || transaction.toAccountId === account.id);
            return (
              <div key={account.id} className="account-item">
                <div>
                  <strong>{account.name}</strong>
                  <span>시작 잔액 {formatWon(account.openingBalance)} · 기록 기준 잔액 {formatWon(account.balance)}</span>
                </div>
                <div className="account-actions">
                  <button type="button" onClick={() => handleAccountEdit(account)}>수정</button>
                  {account.id !== DEFAULT_ACCOUNT_ID && !hasTransactions && (
                    <button type="button" onClick={() => handleAccountDelete(account.id)} aria-label={`${account.name} 계좌 삭제`}>삭제</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleAccountSubmit} className="account-form">
          <label className="form-label">계좌 별칭
            <input className="form-input" type="text" maxLength="40" placeholder="예: 생활비 통장" value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
          </label>
          <label className="form-label">시작 잔액
            <input className="form-input" type="number" step="1" placeholder="0" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} />
          </label>
          <button type="submit" className="btn-primary">{editingAccountId ? '계좌 수정' : '계좌 추가'}</button>
          {editingAccountId && <button type="button" className="btn-ghost account-cancel" onClick={() => { setEditingAccountId(null); setAccountName(''); setOpeningBalance(''); }}>취소</button>}
        </form>
      </section>

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
              <option value="transfer" disabled={accounts.length < 2}>내 계좌 간 이체</option>
            </select>
          </label>
          <label className="form-label">{formData.type === 'transfer' ? '보내는 계좌' : '계좌'}
            <select className="form-input" value={formData.accountId} onChange={(event) => setFormData({ ...formData, accountId: event.target.value })}>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          {formData.type === 'transfer' && (
            <label className="form-label">받는 계좌
              <select className="form-input" value={formData.toAccountId} onChange={(event) => setFormData({ ...formData, toAccountId: event.target.value })} required>
                <option value="">선택해 주세요</option>
                {accounts.filter((account) => account.id !== formData.accountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </label>
          )}
          <label className="form-label">금액
            <input className="form-input" type="number" min="1" placeholder="예: 35000" value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} required />
          </label>
          {formData.type !== 'transfer' && (
            <label className="form-label">카테고리
              <select className="form-input" value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} required>
                {categories[formData.type].map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          )}
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
            <option value="transfer">계좌 이체만</option>
          </select>
          <select className="form-input filter-select" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} aria-label="계좌 필터">
            <option value="all">전체 계좌</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </div>

        {filteredTransactions.length === 0 ? <EmptyTransactions filtered={transactions.length > 0} /> : (
          <>
            <table className="tx-table">
              <thead>
                <tr><th>날짜</th><th>유형</th><th>계좌</th><th>카테고리</th><th>메모</th><th style={{ textAlign: 'right' }}>금액</th><th aria-label="관리" /></tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  const isTransfer = transaction.type === 'transfer';
                  const accountLabel = isTransfer
                    ? `${accountNames.get(getAccountId(transaction))} → ${accountNames.get(transaction.toAccountId)}`
                    : accountNames.get(getAccountId(transaction));
                  return (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td><span className={`tx-type ${isTransfer ? 'transfer' : isIncome ? 'income' : 'expense'}`}>{isTransfer ? '이체' : isIncome ? '수입' : '지출'}</span></td>
                      <td><span className="tx-account-name">{accountLabel}</span><small className="tx-source">{transaction.source === 'csv' ? 'CSV' : '직접 입력'}</small></td>
                      <td><span className="tx-category">{isTransfer ? '계좌 이체' : transaction.category}</span></td>
                      <td>{transaction.memo || <span className="text-muted">메모 없음</span>}</td>
                      <td style={{ textAlign: 'right', color: isIncome ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: 800 }}>{isTransfer ? '' : isIncome ? '+' : '-'}{formatWon(transaction.amount)}</td>
                      <td style={{ textAlign: 'right' }}><button type="button" className="tx-delete" onClick={() => deleteTransaction(transaction.id)} aria-label={`${isTransfer ? '계좌 이체' : transaction.category} 거래 삭제`}><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tx-mobile-list">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const isTransfer = transaction.type === 'transfer';
                const accountLabel = isTransfer
                  ? `${accountNames.get(getAccountId(transaction))} → ${accountNames.get(transaction.toAccountId)}`
                  : accountNames.get(getAccountId(transaction));
                return (
                  <div key={transaction.id} className="tx-mobile-card">
                    <div className="tx-mobile-header"><span className="text-muted">{transaction.date}</span><button type="button" className="tx-delete" onClick={() => deleteTransaction(transaction.id)} aria-label={`${isTransfer ? '계좌 이체' : transaction.category} 거래 삭제`}><Trash2 size={14} /></button></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div><span className={`tx-type ${isTransfer ? 'transfer' : isIncome ? 'income' : 'expense'}`}>{isTransfer ? '이체' : isIncome ? '수입' : '지출'}</span><span className="tx-category" style={{ marginLeft: 8 }}>{isTransfer ? '계좌 이체' : transaction.category}</span></div>
                      <strong style={{ color: isIncome ? 'var(--accent-green)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{isTransfer ? '' : isIncome ? '+' : '-'}{formatWon(transaction.amount)}</strong>
                    </div>
                    <div className="tx-source">{accountLabel} · {transaction.source === 'csv' ? 'CSV' : '직접 입력'}</div>
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
