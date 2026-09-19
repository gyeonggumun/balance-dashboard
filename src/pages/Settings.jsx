import { useState, useRef } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Settings() {
  const { 
    transactions, budgets, goals, categories, 
    resetAll, restoreData, addCategory, deleteCategory, importTransactions 
  } = useFinanceStore();
  
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // --- 카테고리 폼 상태 ---
  const [newExpCat, setNewExpCat] = useState('');
  const [newIncCat, setNewIncCat] = useState('');

  const handleAddCategory = (type, value, setValue) => {
    if (!value.trim()) return;
    addCategory(type, value.trim());
    setValue('');
  };

  // --- CSV 내보내기 ---
  const handleExportCSV = () => {
    if (transactions.length === 0) return alert('내보낼 거래 내역이 없습니다.');

    const headers = ['id', 'type', 'category', 'amount', 'date', 'memo', 'createdAt'];
    
    const csvRows = transactions.map(tx => {
      return headers.map(header => {
        const value = tx[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `balance_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // --- CSV 가져오기 ---
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        
        if (rows.length < 2) return alert('가져올 데이터가 없습니다.');

        const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
        const importedData = [];

        for (let i = 1; i < rows.length; i++) {
          const rowValues = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          
          const tx = {};
          headers.forEach((header, index) => {
            let val = rowValues[index] ? rowValues[index].replace(/^"|"$/g, '').trim() : '';
            tx[header] = header === 'amount' ? Number(val) : val;
          });

          if (tx.type && tx.amount && tx.date) {
            importedData.push({
              ...tx,
              id: `txn_csv_${Date.now()}_${i}`,
              createdAt: new Date().toISOString()
            });
          }
        }

        if (importedData.length > 0) {
          importTransactions(importedData);
          alert(`${importedData.length}건의 거래 내역을 성공적으로 불러왔습니다.`);
        } else {
          alert('유효한 거래 내역 데이터가 없습니다.');
        }
      } catch {
        alert('CSV 파일을 파싱하는 중 오류가 발생했습니다.');
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  // --- JSON 백업 및 복원 ---
  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ transactions, budgets, goals, categories }, null, 2));
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
        if (parsed.transactions) restoreData(parsed);
      } catch { alert('오류가 발생했습니다.'); }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const chipStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', margin: '0 8px 8px 0' };

  return (
    <div>
      <h1 className="page-title">설정</h1>
      
      {/* 1. 카테고리 관리 영역 */}
      <h3 style={{ fontSize: '18px', margin: '32px 0 16px 0' }}>카테고리 관리</h3>
      <div className="grid-2">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">지출 카테고리</h3>
          <div style={{ marginBottom: '16px' }}>
            {categories.expense.map(cat => (
              <div key={cat} style={chipStyle}>
                {cat} 
                <button onClick={() => deleteCategory('expense', cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <div className="form-group" style={{ flexWrap: 'nowrap' }}>
            <input type="text" placeholder="새 지출 카테고리" value={newExpCat} onChange={(e) => setNewExpCat(e.target.value)} className="form-input" />
            <button onClick={() => handleAddCategory('expense', newExpCat, setNewExpCat)} className="btn-primary">추가</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">수입 카테고리</h3>
          <div style={{ marginBottom: '16px' }}>
            {categories.income.map(cat => (
              <div key={cat} style={chipStyle}>
                {cat} 
                <button onClick={() => deleteCategory('income', cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <div className="form-group" style={{ flexWrap: 'nowrap' }}>
            <input type="text" placeholder="새 수입 카테고리" value={newIncCat} onChange={(e) => setNewIncCat(e.target.value)} className="form-input" />
            <button onClick={() => handleAddCategory('income', newIncCat, setNewIncCat)} className="btn-accent">추가</button>
          </div>
        </div>
      </div>

      {/* 2. CSV 영역 */}
      <h3 style={{ fontSize: '18px', margin: '32px 0 16px 0' }}>거래 내역 내보내기/가져오기 (CSV)</h3>
      <div className="grid-2">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">CSV로 내보내기</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>거래 내역을 엑셀에서 열 수 있는 CSV 파일로 저장합니다.</p>
          <button onClick={handleExportCSV} className="btn-primary" style={{ width: '100%', background: '#217346', color: '#fff' }}>CSV 내보내기</button>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">CSV 파일 불러오기</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>외부의 거래 내역을 대량으로 추가합니다.</p>
          <input type="file" accept=".csv" ref={csvInputRef} onChange={handleImportCSV} style={{ display: 'none' }} />
          <button onClick={() => csvInputRef.current.click()} className="btn-accent" style={{ width: '100%', background: '#217346', color: '#fff' }}>CSV 가져오기</button>
        </div>
      </div>

      {/* 3. JSON 데이터 관리 영역 */}
      <h3 style={{ fontSize: '18px', margin: '32px 0 16px 0' }}>전체 데이터 백업 및 복원 (JSON)</h3>
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
