import React, { useState, useEffect, useMemo } from 'react';
import StressMapContent from './StressMapContent';
import { useNavigate } from 'react-router-dom';

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

// 使用限制的最少資料筆數（> 5 => 需要至少 6 筆）
const MIN_REQUIRED_COUNT = 10;

function AuthCheck({ count = 0, min = MIN_REQUIRED_COUNT }) {
  const navigate = useNavigate();
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.5rem',
      backgroundColor: '#fff3cd',
      borderRadius: '8px',
      margin: '0 auto 2rem',
      maxWidth: '90vw',
      color: '#856404',
      border: '1px solid rgba(133,100,4,0.25)'
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>資料不足，暫時無法使用壓力心智圖</div>
      <div style={{ marginBottom: 8 }}>目前資料筆數：{count} / {min}</div>
      <div>請前往「心情日記」或「吐司聊天室」新增更多互動，讓 AI 更了解你的壓力來源喔！</div>
      <div style={{ marginTop: '24px' }}>
        <button className="application-link-button"
          onClick={() => navigate('/leya/mood')}
        >
        心情日記
      </button>
      <button className="application-link-button"
        onClick={() => navigate('/leya/chat')}
      >
        吐司聊天室
      </button>
    </div>
    </div >
  );
}

function StressMindMap({ userInfo }) {
  const username = userInfo?.id || null;
  const userNickname = userInfo?.nickname || '使用者';
  const [analysisData, setAnalysisData] = useState(demoData);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [countError, setCountError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  // 日期區間/原始資料
  const [chatItems, setChatItems] = useState([]);
  const [moodItems, setMoodItems] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [tempRange, setTempRange] = useState({ start: '', end: '' });
  const [calBase, setCalBase] = useState(null);

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

  // 取得使用者資料筆數（聊天 + 心情日記）
  useEffect(() => {
    const fetchCounts = async () => {
      if (!username) return;
      setIsCountLoading(true);
      setCountError(null);
      try {
        // 優先使用後端彙總 API（較有效率）
        const resp = await fetch(`${API_BASE_URL}/user-data-count?username=${encodeURIComponent(username)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data?.success) {
            const total = Number(data?.counts?.total ?? 0);
            setTotalCount(Number.isFinite(total) ? total : 0);
            return;
          }
        }
        // 後端若尚未部署該 API，改以既有 API 加總
        const [chatRes, moodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chat-history?username=${encodeURIComponent(username)}`),
          fetch(`${API_BASE_URL}/mood-journal?username=${encodeURIComponent(username)}`)
        ]);
        let chatCount = 0;
        let moodCount = 0;
        if (chatRes.ok) {
          const chats = await chatRes.json();
          chatCount = Array.isArray(chats) ? chats.length : 0;
        }
        if (moodRes.ok) {
          const mood = await moodRes.json();
          moodCount = Array.isArray(mood?.items) ? mood.items.length : 0;
        }
        setTotalCount(chatCount + moodCount);
      } catch (err) {
        console.error('取得資料筆數失敗:', err);
        setCountError('無法取得資料筆數');
        setTotalCount(0);
      } finally {
        setIsCountLoading(false);
      }
    };
    fetchCounts();
  }, [username]);

  // 取得原始資料（用於日曆統計與區間總數）
  useEffect(() => {
    const fetchRaw = async () => {
      if (!username) return;
      try {
        const [chatRes, moodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chat-history?username=${encodeURIComponent(username)}`),
          fetch(`${API_BASE_URL}/mood-journal?username=${encodeURIComponent(username)}`)
        ]);
        const chat = chatRes.ok ? await chatRes.json() : [];
        const moodRaw = moodRes.ok ? await moodRes.json() : { items: [] };
        setChatItems(Array.isArray(chat) ? chat : []);
        setMoodItems(Array.isArray(moodRaw?.items) ? moodRaw.items : []);
      } catch (e) {
        console.error('取得原始資料失敗:', e);
        setChatItems([]);
        setMoodItems([]);
      }
    };
    fetchRaw();
  }, [username]);

  // 預設近五天區間（含今天）
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 4); // 含今共 5 天
      setDateRange({ start, end: today });
      setTempRange({ start: toInputDate(start), end: toInputDate(today) });
      setCalBase(new Date(start.getFullYear(), start.getMonth(), 1));
    }
  }, [dateRange.start, dateRange.end]);

  // 工具：日期格式
  function toYMD(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }
  function toInputDate(date) { return toYMD(date); }
  function toDisplay(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${da}`;
  }
  function toZhWeek(date) {
    const d = new Date(date);
    const ws = ['週日','週一','週二','週三','週四','週五','週六'];
    return ws[d.getDay()];
  }
  function clampToDateStr(str) { return str ? str : ''; }

  // 以日期字串（YYYY-MM-DD）比較是否在區間內（含邊界）
  function isWithinRange(ymd, startStr, endStr) {
    if (!startStr || !endStr) return true;
    return ymd >= startStr && ymd <= endStr;
  }

  // 計算目前選擇區間內的總筆數
  function getFilteredTotalCount() {
    const startStr = dateRange.start ? toYMD(dateRange.start) : null;
    const endStr = dateRange.end ? toYMD(dateRange.end) : null;
    let total = 0;
    for (const c of chatItems) {
      const ymd = toYMD(c.created_time || c.created_at || c.date || new Date());
      if (isWithinRange(ymd, startStr, endStr)) total += 1;
    }
    for (const m of moodItems) {
      const ymd = toYMD(m.created_at || m.created_time || m.date || new Date());
      if (isWithinRange(ymd, startStr, endStr)) total += 1;
    }
    return total;
  }

  // 取得目前 temp 選擇的每日筆數（僅顯示 >0）
  function getTempDailyList() {
    const startStr = clampToDateStr(tempRange.start);
    const endStr = clampToDateStr(tempRange.end);
    const map = new Map();
    const hit = (dateStr) => map.set(dateStr, (map.get(dateStr) || 0) + 1);
    chatItems.forEach(c => {
      const ymd = toYMD(c.created_time || c.created_at || c.date || new Date());
      if (isWithinRange(ymd, startStr, endStr)) hit(ymd);
    });
    moodItems.forEach(m => {
      const ymd = toYMD(m.created_at || m.created_time || m.date || new Date());
      if (isWithinRange(ymd, startStr, endStr)) hit(ymd);
    });
    // 轉陣列、排序（日期升冪）、只回傳 >0
    return Array.from(map.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  // 依據資料建立每日總筆數 Map（yyyy-mm-dd -> count）
  const countsMap = useMemo(() => {
    const map = new Map();
    const hit = (dateStr) => map.set(dateStr, (map.get(dateStr) || 0) + 1);
    chatItems.forEach(c => hit(toYMD(c.created_time || c.created_at || c.date || new Date())));
    moodItems.forEach(m => hit(toYMD(m.created_at || m.created_time || m.date || new Date())));
    return map;
  }, [chatItems, moodItems]);

  // 產生某月份的 6x7 月曆格，週日為一週的第一天
  function buildMonthGrid(firstDayOfMonth) {
    const first = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), 1);
    const startOffset = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const ymd = toYMD(d);
      cells.push({
        date: d,
        ymd,
        inMonth: d.getMonth() === first.getMonth(),
        count: countsMap.get(ymd) || 0,
      });
    }
    return cells;
  }

  function handleDayClick(ymd) {
    setTempRange(prev => {
      const { start, end } = prev;
      if (!start || (start && end)) return { start: ymd, end: '' };
      if (ymd < start) return { start: ymd, end: start };
      return { start, end: ymd };
    });
  }

  function applyTempRange() {
    if (tempRange.start && tempRange.end) {
      const s = new Date(tempRange.start);
      const e = new Date(tempRange.end);
      if (s <= e) {
        setDateRange({ start: s, end: e });
        setIsDatePickerOpen(false);
      }
    }
  }

  function shiftMonth(delta) {
    setCalBase(cur => {
      const base = cur || new Date();
      return new Date(base.getFullYear(), base.getMonth() + delta, 1);
    });
  }

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

    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{height: '100%', overflowY: 'auto'}}>
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

      {username && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          <div style={{
            padding: '6px 12px',
            background: '#f6f2ea',
            borderRadius: 8,
            border: '1px solid #f0e6d6',
            color: '#6a6258',
            fontSize: 14
          }}>
            資料筆數：{isCountLoading ? '計算中…' : `${totalCount}`}
            {countError ? `（${countError}）` : ''}
          </div>
          <div style={{
            padding: '6px 12px',
            background: '#f6f2ea',
            borderRadius: 8,
            border: '1px solid #f0e6d6',
            color: '#6a6258',
            fontSize: 14
          }}>
            使用門檻：{MIN_REQUIRED_COUNT}
          </div>
          <button
            className="diary-select-button"
            onClick={() => setIsDatePickerOpen(true)}
            disabled={!username}
          >
            <div style={{textAlign:'left'}}>
              {/* <div style={{fontSize:12, color:'#6a6258'}}>去程</div> */}
              <div style={{fontWeight:700}}>
                {dateRange.start ? `${toDisplay(dateRange.start)} ${toZhWeek(dateRange.start)}` : '--'}
              </div>
            </div>
            <div style={{opacity:0.5}}>—</div>
            <div style={{textAlign:'left'}}>
              {/* <div style={{fontSize:12, color:'#6a6258'}}>回程</div> */}
              <div style={{fontWeight:700}}>
                {dateRange.end ? `${toDisplay(dateRange.end)} ${toZhWeek(dateRange.end)}` : '--'}
              </div>
            </div>
          </button>
          
        </div>
      )}

      {username && !isCountLoading && totalCount < MIN_REQUIRED_COUNT && (
        <AuthCheck count={totalCount} min={MIN_REQUIRED_COUNT} />
      )}

      {username && totalCount >= MIN_REQUIRED_COUNT && (
        <>
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
            marginBottom: 'auto',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={handleAnalyzeStress}
              disabled={isAnalyzing || !username || totalCount < MIN_REQUIRED_COUNT}
              style={{
                padding: '12px 24px',
                backgroundColor: isAnalyzing || totalCount < MIN_REQUIRED_COUNT ? '#ccc' : '#FAEAD3',
                color: '#6a6258',
                border: 'none',
                borderRadius: '8px',
                cursor: isAnalyzing || !username || totalCount < MIN_REQUIRED_COUNT ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (!isAnalyzing && username && totalCount >= MIN_REQUIRED_COUNT) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (!isAnalyzing && username && totalCount >= MIN_REQUIRED_COUNT) {
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
      )}

      {/* 日期區間選擇彈窗 */}
      {isDatePickerOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: 'min(96vw, 560px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
              <button onClick={() => shiftMonth(-1)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>{'‹'}</button>
              <div style={{ fontWeight:700, fontSize:18 }}>
                {calBase ? `${calBase.getFullYear()}年${calBase.getMonth()+1}月` : ''}
              </div>
              <button onClick={() => shiftMonth(1)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>{'›'}</button>
            </div>

            {(() => {
              const first = calBase ? new Date(calBase.getFullYear(), calBase.getMonth(), 1) : new Date();
              const cells = buildMonthGrid(first);
              return (
                <div style={{ border:'1px solid #eee', borderRadius:8, padding:8 }}>
                  <div style={{ textAlign:'center', fontWeight:600, margin:'4px 0' }}>
                    {first.getFullYear()}年{first.getMonth()+1}月
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', textAlign:'center', fontSize:12, color:'#6a6258', marginBottom:4 }}>
                    {['週日','週一','週二','週三','週四','週五','週六'].map(w => (<div key={w}>{w}</div>))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                    {cells.map(cell => {
                      const startStr = tempRange.start;
                      const endStr = tempRange.end;
                      const isStart = !!startStr && cell.ymd === startStr;
                      const isEnd = !!endStr && cell.ymd === endStr;
                      const inSel = !!startStr && !!endStr && cell.ymd >= startStr && cell.ymd <= endStr;
                      const bg = isStart || isEnd ? '#2f57ff' : (inSel ? '#e9efff' : '#fff');
                      const color = isStart || isEnd ? '#fff' : (cell.inMonth ? '#222' : '#b8b3ad');
                      return (
                        <div
                          key={cell.ymd}
                          onClick={() => cell.inMonth && handleDayClick(cell.ymd)}
                          style={{
                            border:'1px solid #eee', borderRadius:8, padding:'6px 4px', textAlign:'center', minHeight: '60px', cursor: cell.inMonth ? 'pointer' : 'default',
                            background:bg, color,
                          }}
                        >
                          <div style={{ fontWeight:600 }}>{new Date(cell.date).getDate()}</div>
                          {cell.count > 0 && (
                            <div style={{ fontSize:10, opacity: isStart||isEnd?1:0.8 }}>{cell.count}筆</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 12 }}>
              <div style={{ fontSize:14, color:'#6a6258', whiteSpace:'nowrap' }}>
                {tempRange.start ? `${tempRange.start.replace(/-/g,'/')} ${toZhWeek(tempRange.start)}` : '未選擇'}
                {'  —  '}
                {tempRange.end ? `${tempRange.end.replace(/-/g,'/')} ${toZhWeek(tempRange.end)}` : '未選擇'}
              </div>
              <div style={{ display:'flex', gap:0 }}>
                <button onClick={() => setIsDatePickerOpen(false)}>取消</button>
                <button className="application-link-button" onClick={applyTempRange} disabled={!tempRange.start || !tempRange.end}>套用</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StressMindMap;