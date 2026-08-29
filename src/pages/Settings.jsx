import { useRef } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Settings() {
  const { transactions, budgets, goals, resetAll, restoreData } = useFinanceStore();
  const fileInputRef = useRef(null);

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ transactions, budgets, goals }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr); dlAnchor.setAttribute("download", `balance_backup.json`);
    document.body.appendChild(dlAnchor); dlAnchor.click(); dlAnchor.remove();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.transactions && parsed.budgets && parsed.goals) restoreData(parsed);
      } catch (error) { alert('오류가 발생했습니다.'); }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 className="page-title">설정</h1>
      <div className="grid-2">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">데이터 백업</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>모든 데이터를 JSON 파일로 다운로드합니다.</p>
          <button onClick={handleBackup} className="btn-primary" style={{ width: '100%' }}>백업 파일 다운로드</button>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">데이터 복원</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>데이터를 복구합니다. 현재 데이터는 덮어씌워집니다.</p>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleRestore} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current.click()} className="btn-accent" style={{ width: '100%' }}>백업 파일 불러오기</button>
        </div>

        <div className="card" style={{ marginBottom: 0, border: '1px solid #FFEBEB', background: '#FFFAFA' }}>
          <h3 className="card-title" style={{ color: '#E53E3E' }}>데이터 초기화</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>앱에 저장된 모든 데이터를 삭제합니다.</p>
          <button onClick={() => { if(window.confirm('모든 데이터를 삭제할까요?')) resetAll(); }} className="btn-danger" style={{ width: '100%' }}>모든 데이터 삭제</button>
        </div>
      </div>
    </div>
  );
}