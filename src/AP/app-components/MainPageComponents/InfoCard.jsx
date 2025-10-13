import React, { Suspense, useMemo, useEffect, useState } from 'react';
import StressMapContent from '../StressMapContent';

// 卡片資料抽離成常數，避免每次 render 重新建立陣列
const cardList = [
    { id: 1, name: '壓力來源心智圖', text: '看看最近在煩惱什麼吧！', img: '' },
    { id: 2, name: 'AI聊天次數統計', text: '今天你跟 AI 聊了嗎？', img: '' },
    { id: 3, name: '心情日記', text: '記錄每天的心情，讓自己更了解自己。', img: '' },
    { id: 4, name: '放鬆小訣竅', text: '一天一小步，放鬆心情...', img: '' },
];

const MOODS = [
		{ alt: '開心', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E9%96%8B%E5%BF%83.PNG" },
		{ alt: '平靜', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E5%B9%B3%E9%9D%9C.PNG" },
		{ alt: '傷心', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E5%82%B7%E5%BF%83.PNG" },
		{ alt: '憤怒', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E6%86%A4%E6%80%92.PNG" },
		{ alt: '焦慮', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E7%84%A6%E6%85%AE.PNG" },
	]

// 單一卡片元件：接收 item 物件
function Card({ item, setActivatePage }) {
    if (!item) return null;
    const isMindMap = item.id === 1;
    const isMoodCard = item.id === 3;
    const isChatStats = item.id === 2;
    const isRelaxTips = item.id === 4;

    // 聊天次數統計狀態
    const [chatTotal, setChatTotal] = useState(null); // 總筆數
    const [hasToday, setHasToday] = useState(false);  // 今日是否有聊
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState(null);

    // 放鬆小訣竅狀態
    const [tips, setTips] = useState([]);
    const [tipsLoading, setTipsLoading] = useState(false);
    const [tipsError, setTipsError] = useState(null);

    // 壓力心智圖狀態
    const [analysisData, setAnalysisData] = useState([]);
    const [mindMapLoading, setMindMapLoading] = useState(false);
    const [mindMapError, setMindMapError] = useState(null);

    // 從 localStorage 取得使用者 id（與 ChatPage 一致，預設 visitor）
    const username = useMemo(() => {
        try {
            const saved = localStorage.getItem('leyaUserInfo');
            const info = saved ? JSON.parse(saved) : null;
            return (info && info.id) ? info.id : 'visitor';
        } catch {
            return 'visitor';
        }
    }, []);

    // 從 localStorage 取得使用者 nickname
    const userNickname = useMemo(() => {
        try {
            const saved = localStorage.getItem('leyaUserInfo');
            const info = saved ? JSON.parse(saved) : null;
            return (info && info.nickname) ? info.nickname : '使用者';
        } catch {
            return '使用者';
        }
    }, []);

    // 載入聊天紀錄以計算總數與今日是否有聊天
    useEffect(() => {
        if (!isChatStats || !username) return;
        let cancelled = false;
        (async () => {
            try {
                setChatLoading(true);
                setChatError(null);
                const res = await fetch(`https://leya-backend-vercel.vercel.app/chat-history?username=${encodeURIComponent(username)}`);
                if (!res.ok) throw new Error('network');
                const rows = await res.json();
                if (cancelled) return;
                const total = Array.isArray(rows) ? rows.length : 0;
                setChatTotal(total);

                // 判斷是否有今日紀錄
                const today = new Date();
                const ty = today.getFullYear();
                const tm = today.getMonth();
                const td = today.getDate();
                const anyToday = Array.isArray(rows) && rows.some((r) => {
                    if (!r || !r.created_time) return false;
                    const dt = new Date(r.created_time);
                    return dt.getFullYear() === ty && dt.getMonth() === tm && dt.getDate() === td;
                });
                setHasToday(Boolean(anyToday));
            } catch (e) {
                if (!cancelled) setChatError('failed');
            } finally {
                if (!cancelled) setChatLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isChatStats, username]);

    // 取得放鬆小訣竅
    const fetchRelaxTips = async () => {
        try {
            setTipsLoading(true);
            setTipsError(null);
            const res = await fetch('https://leya-backend-vercel.vercel.app/relax-tips?count=1');
            if (!res.ok) throw new Error('network');
            const data = await res.json();
            setTips(Array.isArray(data?.tips) ? data.tips : []);
        } catch (e) {
            setTipsError('failed');
            // 顯示預設備援內容（單一句），避免整塊空白
            setTips(['深呼吸放慢步調']);
        } finally {
            setTipsLoading(false);
        }
    };

    useEffect(() => {
        if (!isRelaxTips) return;
        fetchRelaxTips();
    }, [isRelaxTips]);

    // 載入壓力分析數據
    useEffect(() => {
        if (!isMindMap || !username) return;
        let cancelled = false;
        (async () => {
            try {
                setMindMapLoading(true);
                setMindMapError(null);
                const res = await fetch(`https://leya-backend-vercel.vercel.app/emotion-analysis?username=${encodeURIComponent(username)}`);
                if (!res.ok) throw new Error('network');
                const result = await res.json();
                if (cancelled) return;
                
                if (result.success && result.records && result.records.length > 0) {
                    setAnalysisData(result.records);
                } else {
                    setAnalysisData([]);
                }
            } catch (e) {
                if (!cancelled) {
                    setMindMapError('failed');
                    setAnalysisData([]);
                }
            } finally {
                if (!cancelled) setMindMapLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isMindMap, username]);

    const randomMood = useMemo(() => {
        if (!isMoodCard || !Array.isArray(MOODS) || MOODS.length === 0) return null;
        const idx = Math.floor(Math.random() * MOODS.length);
        return MOODS[idx];
    }, [isMoodCard]);
    return (
        <div className="infocard" role="group" tabIndex={0}>
            <div className="infocard-body">
                <h3 className="infocard-title">{item.name}</h3>
                {/* 將 AI 聊天提示文字移到原本的說明文字位置 */}
                {!isMindMap && !isChatStats && !isRelaxTips && (
                    <p className="infocard-text">{item.text}</p>
                )}
                {isChatStats && (
                    <p className="infocard-text">
                        {chatLoading && '載入中...'}
                        {!chatLoading && chatError && '取得失敗'}
                        {!chatLoading && !chatError && (
                            hasToday
                                ? '再來跟我說說你今天的心情如何吧'
                                : '快來跟我聊聊今天發生的事情吧'
                        )}
                    </p>
                )}
                {/* AI聊天次數統計 */}
                {isChatStats && (
                    <div className="chat-stats" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, width: '100%', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setActivatePage('chat-page')}>
                        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                            目前聊天總計<br/>
                            {chatLoading ? '...' : (chatError ? '-' : (chatTotal ?? '-'))}
                        </div>
                    </div>
                )}
                {isRelaxTips && (
                    <div className="relax-tips" style={{ marginTop: 8, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <p className="infocard-text" style={{ margin: 0, textAlign: 'center' }}>
                            {tipsLoading
                                ? '生成中...'
                                : (tips && tips.length > 0
                                    ? tips[0]
                                    : '今天的小放鬆建議暫無內容')}
                        </p>
                        <button onClick={fetchRelaxTips} disabled={tipsLoading} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: tipsLoading ? '#f5f5f5' : '#fff', cursor: tipsLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'inline-block' }}>換一組</button>
                    </div>
                )}
                {isMoodCard && randomMood && (
                    <div className="infocard-media"
                        style={{ cursor: 'pointer', marginTop: 8, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        onClick={() => setActivatePage('mood-page')}>
                        <img
                            src={randomMood.src}
                            alt={randomMood.alt}
                            loading="lazy"
                            style={{ alignSelf: 'center', width: '60%', height: 'auto', display: 'block', borderRadius: 8, objectFit: 'cover' }}
                        />
                    </div>
                )}
                {isMindMap && (
                    <div className="mindmap-wrapper" style={{ width: '100%', maxHeight: '25vh', marginTop: 8, cursor: 'pointer' }} onClick={() => setActivatePage('stress-mind-map')}>
                        <Suspense fallback={<div style={{ fontSize: 12, color: '#666' }}>載入中...</div>}>
                            <StressMapContent 
                                height={200} 
                                maxDepth={1} 
                                username={username}
                                userNickname={userNickname}
                                analysisData={analysisData}
                                isLoading={mindMapLoading}
                                error={mindMapError}
                            />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ setActivatePage }) {
    // 依序兩個為一列
    const rows = [];
    for (let i = 0; i < cardList.length; i += 2) {
        rows.push(cardList.slice(i, i + 2));
    }

    return (
        <div className="infocard-container">
            <div className="flex-col">
                {rows.map((row, rIdx) => (
                    <div className="flex-row" key={rIdx}>
                        {row.map(item => (
                            <Card key={item.id} item={item} setActivatePage={setActivatePage} />
                        ))}
                        {row.length === 1 && <div className="infocard infocard--placeholder" />} {/* 若未來是奇數張 */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InfoCard;