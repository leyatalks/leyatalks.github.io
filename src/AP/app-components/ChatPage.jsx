import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCircleRight } from "@fortawesome/free-solid-svg-icons";

function ChatPage({ userInfo }) {
    const username = userInfo?.id || 'visitor';
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [typingInterval, setTypingInterval] = useState(20); // 每個字顯示間隔（ms），預設 200ms
    const [showModal, setShowModal] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [modalImg, setModalImg] = useState("");

    const chatHistoryRef = useRef(null);
    const bottomRef = useRef(null); // 聊天底部錨點
    const prevMetadataRef = useRef({ length: 0, lastText: '' }); // 用於判斷是新增訊息還是持續打字
    const streamingRef = useRef({}); // 用來追蹤目前的打字動畫
    const sseControllerRef = useRef({ queue: [], timer: null, botIndex: null, closed: false, finalReply: null });

    // 只從後端讀取訊息
    useEffect(() => {
        if (!username) return; // 沒有 username 不 fetch
        async function fetchHistory() {
            const res = await fetch(`https://leya-backend-vercel.vercel.app/chat-history?username=${username}`);
            const history = await res.json();
            console.log('history:', history);
            // 轉換成 messages 陣列格式
            const msgs = [];
            history.forEach(item => {
                msgs.push({ role: 'user', text: item.user_message });
                msgs.push({
                    role: 'bot',
                    text: item.bot_message,
                    encouragement: item.encourage_text,
                    emotion: item.emotion,
                    image_url: item.image_url,
                    recommendation: item.recommendation
                });
            });
            setMessages(msgs);
        }
        fetchHistory();
    }, [username]);

    useEffect(() => {
        console.log('fetch username:', username);
    }, [username]);

    useEffect(() => {
        // 依據變化型態決定捲動行為：
        // - 新增/刪除訊息：平滑捲動
        // - 同筆訊息文字更新（打字機/串流）：即時捲動（auto），避免多次平滑造成卡頓
        const last = messages[messages.length - 1];
        const prev = prevMetadataRef.current;
        const isNewItem = messages.length !== prev.length;
        const isTypingUpdate = !isNewItem && (last?.text || '') !== (prev.lastText || '');

        const behavior = isNewItem ? 'smooth' : 'auto';

        // 使用底部錨點確保滾動到容器內部底部而非整頁
        if (bottomRef.current) {
            try {
                bottomRef.current.scrollIntoView({ behavior, block: 'end' });
            } catch (e) {
                // 兼容舊瀏覽器：退回到直接操作 scrollTop
                if (chatHistoryRef.current) {
                    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                }
            }
        }

        // 更新前一次的快照
        prevMetadataRef.current = {
            length: messages.length,
            lastText: last?.text || ''
        };
    }, [messages]);

    // 讀取免責聲明是否已被關閉
    // useEffect(() => {
    //     try {
    //         const hidden = localStorage.getItem('leya_hide_disclaimer') === '1';
    //         if (hidden) setShowDisclaimer(false);
    //     } catch (e) {
    //         // ignore
    //     }
    // }, []);

    const handleCloseDisclaimer = () => {
        setShowDisclaimer(false);
        try {
            localStorage.setItem('leya_hide_disclaimer', '1');
        } catch (e) {
            // ignore
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // 以「打字機」方式即時渲染訊息內容（前端模擬 streaming）
    const streamTextIntoMessage = (index, fullText, speed = typingInterval) => {
        return new Promise((resolve) => {
            let i = 0;
            // 若有既有的動畫在同一 index，先取消（透過旗標中斷）
            const token = Symbol('typing');
            streamingRef.current[index] = token;

            const step = () => {
                // 若被新一輪覆蓋，停止
                if (streamingRef.current[index] !== token) {
                    resolve();
                    return;
                }

                setMessages(prev => {
                    if (!prev[index]) return prev;
                    const next = [...prev];
                    next[index] = { ...next[index], text: fullText.slice(0, i) };
                    return next;
                });

                if (i >= fullText.length) {
                    resolve();
                    return;
                }
                i++;
                setTimeout(step, speed);
            };
            step();
        });
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        let botIndex = null;
        // 一次加入使用者訊息與機器人占位訊息，確保索引正確
        setMessages((prev) => {
            const next = [...prev, { role: 'user', text: userMessage }, { role: 'bot', text: '' }];
            botIndex = next.length - 1;
            return next;
        });
        setInput("");
        setLoading(true);
        try {
            // 改為一次性 API（不使用 SSE 串流）
            const useStreaming = false;
            if (useStreaming && typeof EventSource !== 'undefined') {
                const url = `https://leya-backend-vercel.vercel.app/chat/stream?userId=${encodeURIComponent(username)}&message=${encodeURIComponent(userMessage)}`;
                await new Promise((resolve, reject) => {
                    const es = new EventSource(url);
                    let finalPayload = null;

                    // 初始化打字緩衝控制器
                    sseControllerRef.current = { queue: [], timer: null, botIndex, closed: false, finalReply: null };

                    const ensureDrain = () => {
                        const ctrl = sseControllerRef.current;
                        if (ctrl.timer) return;
                        ctrl.timer = setInterval(() => {
                            const c = sseControllerRef.current;
                            // 直接嘗試從隊列取字並寫入，內層 setMessages 會自行保護索引不存在的情況
                            if (c.queue.length > 0) {
                                const ch = c.queue.shift();
                                setMessages(prev => {
                                    if (!prev[ctrl.botIndex]) return prev;
                                    const next = [...prev];
                                    next[ctrl.botIndex] = { ...next[ctrl.botIndex], text: (next[ctrl.botIndex].text || '') + ch };
                                    return next;
                                });
                                return;
                            }
                            // 若隊列空且已關閉，收尾
                            if (c.closed) {
                                if (typeof c.finalReply === 'string') {
                                    setMessages(prev => {
                                        if (!prev[ctrl.botIndex]) return prev;
                                        const next = [...prev];
                                        // 確保最終文字與伺服器 final 一致
                                        next[ctrl.botIndex] = { ...next[ctrl.botIndex], text: c.finalReply };
                                        return next;
                                    });
                                }
                                clearInterval(c.timer);
                                c.timer = null;
                                resolve();
                            }
                        }, typingInterval);
                    };

                    es.addEventListener('chunk', (e) => {
                        try {
                            const { delta } = JSON.parse(e.data || '{}');
                            if (!delta) return;
                            const ctrl = sseControllerRef.current;
                            // 將收到的片段拆成字元，放入緩衝佇列
                            for (const ch of String(delta)) ctrl.queue.push(ch);
                            ensureDrain();
                        } catch { }
                    });

                    es.addEventListener('final', async (e) => {
                        try {
                            finalPayload = JSON.parse(e.data || '{}');
                        } catch {
                            finalPayload = { reply: '', encouragement: '', emotion: '平靜' };
                        }
                        // 標記已關閉，並記錄最終 reply 以確保同步
                        const ctrl = sseControllerRef.current;
                        ctrl.closed = true;
                        ctrl.finalReply = finalPayload.reply || '';

                        // 若未收到 chunk（或前面字數不足），以 final 文本補齊待打字的佇列，並啟動打字器
                        try {
                            setMessages(prev => {
                                const curr = prev[botIndex]?.text || '';
                                const full = finalPayload.reply || '';
                                if (full.length > curr.length) {
                                    const rest = full.slice(curr.length);
                                    for (const ch of rest) sseControllerRef.current.queue.push(ch);
                                }
                                return prev;
                            });
                            // 確保定時器已啟動（即使沒有任何 chunk 也能收尾或逐字補齊）
                            ensureDrain();
                        } catch { }

                        // 填補鼓勵語與情緒
                        setMessages(prev => {
                            if (!prev[botIndex]) return prev;
                            const next = [...prev];
                            next[botIndex] = {
                                ...next[botIndex],
                                encouragement: finalPayload.encouragement,
                                emotion: finalPayload.emotion
                            };
                            return next;
                        });
                        // 儲存聊天記錄
                        try {
                            await fetch("https://leya-backend-vercel.vercel.app/chat-history", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    username: username,
                                    user_message: userMessage,
                                    bot_message: finalPayload.reply || '',
                                    encourage_text: finalPayload.encouragement || '',
                                    emotion: finalPayload.emotion || '',
                                    recommendation: finalPayload.recommendation || ''
                                })
                            });
                        } catch { }
                        // 輪詢圖片：只更新訊息的 image_url，不自動彈窗
                        const pollForImage = () => {
                            const interval = setInterval(async () => {
                                try {
                                    const res = await fetch(`https://leya-backend-vercel.vercel.app/chat-history?username=${username}`);
                                    const history = await res.json();
                                    // 從最新往回找此輪對話對應的圖片（找到就把當前 bot 訊息加上 image_url）
                                    let foundUrl = null;
                                    for (let i = history.length - 1; i >= 0; i--) {
                                        const item = history[i];
                                        if (item.bot_message && item.image_url) {
                                            foundUrl = item.image_url;
                                            break;
                                        }
                                    }
                                    if (foundUrl) {
                                        setMessages(prev => {
                                            if (!prev[botIndex]) return prev;
                                            const next = [...prev];
                                            next[botIndex] = { ...next[botIndex], image_url: foundUrl };
                                            return next;
                                        });
                                        clearInterval(interval);
                                    }
                                } catch (e) {
                                    // 忽略暫時性錯誤，等待下次輪詢
                                }
                            }, 3000);
                        };
                        pollForImage();
                        es.close();
                        // 這裡不直接 resolve，等待緩衝器收尾（ensureDrain 會 resolve）
                    });

                    es.addEventListener('error', () => {
                        const ctrl = sseControllerRef.current;
                        // 若我們已經收到 final 並進入收尾，就忽略之後的 error 事件（某些瀏覽器在正常關閉時也會觸發）
                        if (ctrl && ctrl.closed) {
                            if (ctrl.timer) {
                                clearInterval(ctrl.timer);
                                ctrl.timer = null;
                            }
                            es.close();
                            return;
                        }
                        if (ctrl && ctrl.timer) {
                            clearInterval(ctrl.timer);
                            ctrl.timer = null;
                        }
                        es.close();
                        reject(new Error('SSE error'));
                    });
                });
            } else {
                // 一次性 API + 前端打字效果
                const res = await fetch("https://leya-backend-vercel.vercel.app/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMessage, userId: username })
                });
                const data = await res.json();
                await streamTextIntoMessage(botIndex, data.reply || '', typingInterval);
                setMessages(prev => {
                    if (!prev[botIndex]) return prev;
                    const next = [...prev];
                    next[botIndex] = { 
                        ...next[botIndex], 
                        encouragement: data.encouragement, 
                        emotion: data.emotion,
                        recommendation: data.recommendation 
                    };
                    return next;
                });
                await fetch("https://leya-backend-vercel.vercel.app/chat-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username,
                        user_message: userMessage,
                        bot_message: data.reply,
                        encourage_text: data.encouragement,
                        emotion: data.emotion,
                        recommendation: data.recommendation || ''
                    })
                });
                const pollForImage = () => {
                    const interval = setInterval(async () => {
                        try {
                            const res = await fetch(`https://leya-backend-vercel.vercel.app/chat-history?username=${username}`);
                            const history = await res.json();
                            let foundUrl = null;
                            for (let i = history.length - 1; i >= 0; i--) {
                                const item = history[i];
                                if (item.bot_message && item.image_url) {
                                    foundUrl = item.image_url;
                                    break;
                                }
                            }
                            if (foundUrl) {
                                setMessages(prev => {
                                    if (!prev[botIndex]) return prev;
                                    const next = [...prev];
                                    next[botIndex] = { ...next[botIndex], image_url: foundUrl };
                                    return next;
                                });
                                clearInterval(interval);
                            }
                        } catch (e) {
                            // 忽略暫時性錯誤，等待下次輪詢
                        }
                    }, 3000);
                };
                pollForImage();
            }
        } catch (err) {
            // 若先前已經建立占位 bot 訊息，更新其內容；否則補一則錯誤訊息
            if (botIndex !== null) {
                setMessages(prev => {
                    if (!prev[botIndex]) return [...prev, { role: 'bot', text: '伺服器錯誤，請稍後再試。' }];
                    const next = [...prev];
                    next[botIndex] = { ...next[botIndex], text: '伺服器錯誤，請稍後再試。' };
                    return next;
                });
            } else {
                setMessages((prev) => [...prev, { role: 'bot', text: '伺服器錯誤，請稍後再試。' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleEncouragementClick = async (msg) => {
        if (msg.image_url) {
            setModalImg(msg.image_url);
            setShowModal(true);
        } else {
            alert("暫無圖片");
        }
    };

    // 下載圖片（不開新分頁）
    const handleDownload = async (imgUrl) => {
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'leya-encourage.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('下載失敗');
        }
    };

    // IG分享（複製網址並嘗試打開IG App的story camera）
    const handleShareIG = (imgUrl) => {
        navigator.clipboard.writeText(imgUrl);
        window.location.href = 'instagram://story-camera';
        setTimeout(() => {
            alert('圖片網址已複製，請在 IG 貼上或選擇圖片！');
        }, 1000);
    };

    // 一鍵清除聊天紀錄 (僅限 shuics)
    const handleClearAllChats = async () => {
        if (username !== 'shuics') {
            alert('此功能僅限訪客模式使用');
            return;
        }

        if (!confirm('確定要清除所有聊天紀錄嗎？此操作無法復原！')) {
            return;
        }

        try {
            const response = await fetch(`https://leya-backend-vercel.vercel.app/chat-history/clear-all?username=${username}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessages([]);
                alert('已清除所有聊天紀錄！');
            } else {
                alert('清除失敗，請稍後再試');
            }
        } catch (err) {
            console.error('清除聊天紀錄錯誤:', err);
            alert('清除失敗，請檢查網路連線');
        }
    };

    const recommendationMap = {
        '冥想': '/leya/meditation',
        '正念': '/leya/mindfulness',
        '心理資源地圖': '/leya/clinic-map',
        '紓壓小遊戲': '/leya/game',
        '心情日記': '/leya/mood',
        '壓力心智圖': '/leya/stress-mind-map'
    };

    const handleRecommendationClick = (rec) => {
        const path = recommendationMap[rec];
        if (path) {
            navigate(path);
        }
    };

    const userAvatar = "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/usericon.svg";
    const botAvatar = "https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png";

    return (
        <>

            <div id="chat-page" style={{ overflowY: 'auto', height: '100%'}}>
                {showDisclaimer && (
                    <div className="disclaimer-label">
                        <div className="disclaimer-track">
                            樂壓Talk's 提醒您：本聊天室的回覆僅供參考，並非專業心理諮詢。如有需要，請尋求合格的心理健康專業人士協助。樂壓Talk's 團隊祝您身心健康！
                        </div>
                        <button className="disclaimer-close" aria-label="關閉公告" onClick={handleCloseDisclaimer}>
                            ✕
                        </button>
                    </div>
                )}
                {/* 訪客模式清除按鈕 */}
                {username === 'shuics' && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '10px 20px',
                        background: '#fff3e6',
                        borderRadius: '8px',
                        marginBottom: '10px'
                    }}>
                        <button
                            onClick={handleClearAllChats}
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                boxShadow: '0 2px 8px rgba(238, 90, 111, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            🗑️ 一鍵清除所有紀錄
                        </button>
                    </div>
                )}
                {/* <div className="golden-sentence-container">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="golden-sentence-icon" />
                    <div className="golden-sentence">
                        <h4>今天最適合你的一句話</h4>
                        {/* 下面之後連接資料庫，替換成變數 
                        <p>明天一定會更好的！</p> 
                    </div>
                    <div className="share-icon">
                        <FontAwesomeIcon icon={faShareFromSquare}/>
                    </div>
                </div> */}
                <div className="chat-container">
                    <div className="chat-history" ref={chatHistoryRef} style={{ overflowY: 'auto' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.role === 'user' ? 'chat-message chat-message-user' : 'chat-message chat-message-bot'}>
                                {/* 頭貼 */}
                                <div className={msg.role === 'user' ? 'chat-avatar chat-avatar-user' : 'chat-avatar chat-avatar-bot'}>
                                    <img src={msg.role === 'user' ? userAvatar : botAvatar} alt="avatar" />
                                </div>
                                {/* 聊天氣泡 */}
                                <div className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-bot'}>
                                    <span>{msg.text}</span>
                                    {msg.role === 'bot' && (
                                        <div className="chat-bot-extra">
                                            {msg.encouragement && (
                                                <div
                                                    style={{ cursor: "pointer", textDecoration: "none" }}
                                                    onClick={() => handleEncouragementClick(msg)}
                                                >
                                                    {msg.encouragement}
                                                </div>
                                            )}
                                            {msg.recommendation && (
                                                <div 
                                                    style={{ marginTop: '0.5rem', cursor: 'pointer', color: '#2d7f27ff', textDecoration: 'none', fontWeight: 'bold', opacity: 0.85 }}
                                                    onClick={() => handleRecommendationClick(msg.recommendation)}
                                                >
                                                    推薦你使用{msg.recommendation}<FontAwesomeIcon icon={faCircleRight} style={{ marginLeft: '0.25rem' }} />
                                                </div>
                                            )}
                                            {username === 'shuics' && msg.emotion && <div style={{ marginTop: '0.5rem', color: 'blue', fontSize: '0.8rem', fontWeight: '500' }}>情緒:{msg.emotion}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="chat-loading">回覆中...</div>}

                    </div>
                    {/* 底部錨點：確保每次更新都能正確滾到最底 */}
                    <div ref={bottomRef} />
                    <div className="chat-input-container">
                        {/* 字速選擇器 */}
                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
                            <label htmlFor="typingSpeed" style={{ fontSize: 12, color: '#555' }}>字速</label>
                            <select
                                id="typingSpeed"
                                value={typingInterval}
                                onChange={(e) => setTypingInterval(Number(e.target.value))}
                                disabled={loading}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }}
                            >
                                <option value={120}>快</option>
                                <option value={200}>中</option>
                                <option value={320}>慢</option>
                            </select>
                        </div> */}
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="今天的心情如何呀?"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            </div>
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div style={{ position: 'relative', maxWidth: "90vw", maxHeight: "90vh" }}>
                        <img
                            src={modalImg}
                            alt="勵志語圖片"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "90vh",
                                borderRadius: 10,
                                boxShadow: "0 0 20px #000",
                                objectFit: "contain"
                            }}
                            onClick={e => e.stopPropagation()}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '16px',
                            zIndex: 10000
                        }}>
                            {/* 下載按鈕 */}
                            <button
                                style={{
                                    background: '#fff',
                                    borderRadius: '6px',
                                    padding: '6px 16px',
                                    border: 'none',
                                    color: '#333',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    maxHeight: 'fit-content'
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDownload(modalImg);
                                }}
                            >
                                下載圖片
                            </button>
                            {/* IG分享按鈕 */}
                            <button
                                style={{
                                    background: '#fff',
                                    borderRadius: '6px',
                                    padding: '6px 16px',
                                    border: 'none',
                                    color: '#E1306C',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    maxHeight: 'fit-content'
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleShareIG(modalImg);
                                }}
                            >
                                分享到IG
                            </button>
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatPage;