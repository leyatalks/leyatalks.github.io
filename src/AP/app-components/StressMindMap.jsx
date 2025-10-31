import React, { useState, useEffect } from 'react';
import StressMapContent from './StressMapContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leya-backend-vercel.vercel.app';

// 假資料
const demoData = [
  { category: '學業', source: '考試壓力', impact: '睡眠', emotion: '焦慮', note: '期末考臨近、準備不足' },
  { category: '學業', source: '報告負荷', impact: '時間管理', emotion: '壓迫', note: '同週多科報告' },
  { category: '人際', source: '與同儕衝突', impact: '情緒波動', emotion: '憤怒', note: '社團內部意見分歧' },
  { category: '家庭', source: '父母期待', impact: '自我價值', emotion: '自責', note: '對成績與升學的期待' },
  { category: '財務', source: '學費/生活費', impact: '打工時數', emotion: '焦慮', note: '兼顧課業與打工' },
  { category: '健康', source: '慢性疲勞', impact: '專注力', emotion: '倦怠', note: '長期睡眠不足' },
  { category: '人際', source: '社交焦慮', impact: '參與意願', emotion: '不安', note: '公開表達時心跳加速' },
  { category: '學業', source: '課程難度', impact: '成就感', emotion: '挫折', note: '高階課程理解困難' },
  { category: '家庭', source: '照顧責任', impact: '時間安排', emotion: '壓力', note: '需照顧家人' },
  { category: '未來', source: '職涯不確定', impact: '決策困難', emotion: '迷惘', note: '缺乏明確方向' },
];

function StressMindMap({ userInfo }) {
  const username = userInfo?.id || null;
  const userNickname = userInfo?.nickname || '使用者';
  const [analysisData, setAnalysisData] = useState(demoData);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // 載入用戶的壓力來源分析記錄
  useEffect(() => {
    if (!username) return;

    const fetchAnalysisData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/emotion-analysis?username=${encodeURIComponent(username)}`);
        const result = await response.json();
        
        if (result.success && result.records && result.records.length > 0) {
          setAnalysisData(result.records);
        } else {
          // 如果沒有記錄，使用假資料
          setAnalysisData(demoData);
        }
      } catch (err) {
        console.error('取得壓力分析記錄失敗:', err);
        setError('無法載入分析記錄');
        setAnalysisData(demoData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [username]);

  // 執行壓力來源分析
  const handleAnalyzeStress = async () => {
    if (!username) {
      alert('請先登入');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-stress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisData(result.records);
        alert(`分析完成！找到 ${result.count} 條壓力來源記錄`);
      } else {
        setError(result.message || '分析失敗');
        alert(result.message || '分析失敗');
      }
    } catch (err) {
      console.error('壓力分析錯誤:', err);
      setError('分析過程發生錯誤');
      alert('分析過程發生錯誤，請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <h1 className='stress-title'>壓力來源心智圖</h1>
      {!username && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          margin: '0 auto 2rem',
          maxWidth: '600px',
          color: '#856404'
        }}>
          請先登入以查看您的壓力來源分析
        </div>
      )}
      <StressMapContent 
        username={username}
        userNickname={userNickname}
        analysisData={analysisData}
        isLoading={isLoading}
        error={error}
      />
      {/* 分析按鈕和狀態顯示 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px', 
        marginTop: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={handleAnalyzeStress}
          disabled={isAnalyzing || !username}
          style={{
            padding: '12px 24px',
            backgroundColor: isAnalyzing ? '#ccc' : '#FAEAD3',
            color: '#6a6258',
            border: 'none',
            borderRadius: '8px',
            cursor: isAnalyzing || !username ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (!isAnalyzing && username) {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.5)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (!isAnalyzing && username) {
              e.target.style.backgroundColor = '#FAEAD3';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }
          }}
        >
          {isAnalyzing ? '🔄 分析中...' : '🔍 AI 壓力分析'}
        </button>
        
        {isLoading && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: 'rgba(33, 150, 243, 0.1)', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1976d2',
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}>
            ⏳ 載入中...
          </div>
        )}
        
        {error && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: 'rgba(244, 67, 54, 0.1)', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#d32f2f',
            maxWidth: '300px',
            border: '1px solid rgba(244, 67, 54, 0.3)'
          }}>
            ❌ {error}
          </div>
        )}
        
        {analysisData.length > 0 && !isLoading && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#faead3d7', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6a6258',
            border: '1px solid #FAEAD3'
          }}>
            📊 共 {analysisData.length} 條記錄
          </div>
        )}
      </div>

      

    </>
  );
}

export default StressMindMap;