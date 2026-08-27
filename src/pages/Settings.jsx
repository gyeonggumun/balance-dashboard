import { useRef } from 'react';
import useFinanceStore from '../store/financeStore';

export default function Settings() {
  const { transactions, budgets, goals, resetAll, restoreData } = useFinanceStore();
  const fileInputRef = useRef(null);

  const handleBackup = () => {
    const dataToBackup = { transactions, budgets, goals };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToBackup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `balance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData.transactions && parsedData.budgets && parsedData.goals) {
          restoreData(parsedData);
          alert('데이터가 성공적으로 복원되었습니다.');
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다. 정상적인 JSON 파일인지 확인해주세요.');
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetAll();
      alert('모든 데이터가 초기화되었습니다.');
    }
  };

  const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' };
  const buttonStyle = { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>설정</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: '#333' }}>데이터 백업</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            현재 저장된 모든 거래 내역, 예산, 목표 데이터를 JSON 파일로 다운로드합니다.
          </p>
          <button onClick={handleBackup} style={{ ...buttonStyle, background: '#333', color: '#fff' }}>
            백업 파일 다운로드
          </button>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: '#333' }}>데이터 복원</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            이전에 백업한 JSON 파일을 불러와 데이터를 복구합니다. <br />
            <span style={{ color: '#E53E3E' }}>※ 주의: 현재 데이터는 덮어씌워집니다.</span>
          </p>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleRestore} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current.click()} style={{ ...buttonStyle, background: '#FF7B28', color: '#fff' }}>
            백업 파일 불러오기
          </button>
        </div>

        <div style={{ ...cardStyle, border: '1px solid #FFEBEB', background: '#FFFAFA' }}>
          <h3 style={{ marginTop: 0, color: '#E53E3E' }}>데이터 초기화</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            앱에 저장된 모든 데이터를 삭제하고 처음 상태로 되돌립니다.
          </p>
          <button onClick={handleReset} style={{ ...buttonStyle, background: '#E53E3E', color: '#fff' }}>
            모든 데이터 삭제
          </button>
        </div>

      </div>
    </div>
  );
}