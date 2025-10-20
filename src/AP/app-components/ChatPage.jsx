import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faHandHoldingHeart, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";

function ChatPage({ userInfo }) {
    const username = userInfo?.id || 'visitor';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState("");
    // AI 分析視窗
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysis, setAnalysis] = useState(null); // 保留但不顯示統計
    const [selectedAnalysisImage, setSelectedAnalysisImage] = useState(null);
    // 控制讀取歷史訊息前置條件（確保先清除再讀取）
    const [readyToFetch, setReadyToFetch] = useState(false);

    // TODO: 將下列五張圖片替換為你的最終人格測驗圖片網址
    // 例如：
    // const ANALYSIS_IMAGE_URLS = [
    //   'https://your.cdn.com/p1.png',
    //   'https://your.cdn.com/p2.png',
    //   'https://your.cdn.com/p3.png',
    //   'https://your.cdn.com/p4.png',
    //   'https://your.cdn.com/p5.png'
    // ];
    const ANALYSIS_IMAGE_URLS = [
        'https://raw.githubusercontent.com/ChenXi0731/leya_user_generated/main/user_generated_images/chat_image_user3_1751014206308.webp',
        'https://raw.githubusercontent.com/ChenXi0731/leya_user_generated/main/user_generated_images/chat_image_user3_1751015075238.webp',
        'https://raw.githubusercontent.com/ChenXi0731/leya_user_generated/main/user_generated_images/chat_image_user3_1751017645702.webp',
        'https://raw.githubusercontent.com/ChenXi0731/leya_user_generated/main/user_generated_images/chat_image_admin_1751019466061.webp',
        'https://raw.githubusercontent.com/ChenXi0731/leya_user_generated/main/user_generated_images/chat_image_admin_1758517024359.webp'
    ];

    const chatHistoryRef = useRef(null);

    // 登入（或切換帳號）時的前置：展覽帳號與訪客帳號需先清除資料
    useEffect(() => {
        let isMounted = true;
        async function clearIfNeeded() {
            if (!username) {
                setReadyToFetch(false);
                return;
            }
            // 預設可讀取，除非是需要先清除的帳號
            const needClear = username === 'leyatalks' || username === 'shuics';
            if (!needClear) {
                setReadyToFetch(true);
                return;
            }
            setReadyToFetch(false);
            try {
                // 清除聊天紀錄（展覽與訪客）
                await fetch(`https://leya-backend-vercel.vercel.app/chat-history/clear-all?username=${username}`, { method: 'DELETE' });
                // 訪客模式：另外清除心情日記（請依實際 API 調整，錯誤時忽略）
                if (username === 'shuics') {
                    try {
                        await fetch(`https://leya-backend-vercel.vercel.app/mood-diary/clear-all?username=${username}`, { method: 'DELETE' });
                    } catch (_) { /* ignore */ }
                }
                if (isMounted) {
                    setMessages([]);
                }
            } catch (err) {
                console.error('清除使用者資料失敗:', err);
            } finally {
                if (isMounted) setReadyToFetch(true);
            }
        }
        clearIfNeeded();
        return () => { isMounted = false; };
    }, [username]);

    // 只從後端讀取訊息（會等 readyToFetch true）
    useEffect(() => {
        if (!username || !readyToFetch) return; // 沒有 username 或未準備好不 fetch
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
                    image_url: item.image_url
                });
            });
            setMessages(msgs);
        }
        fetchHistory();
    }, [username, readyToFetch]);

    useEffect(() => {
        console.log('fetch username:', username);
    }, [username]);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
        setInput("");
        setLoading(true);
        try {
            // 1. 先呼叫 /chat 拿到 bot 回覆
            const res = await fetch("https://leya-backend-vercel.vercel.app/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, userId: username })
            });
            const data = await res.json();
            const botMessage = {
                role: 'bot',
                text: data.reply,
                encouragement: data.encouragement,
                emotion: data.emotion
            };
            setMessages((prev) => [...prev, botMessage]);

            // 2. 呼叫 /chat-history 儲存這一組訊息
            await fetch("https://leya-backend-vercel.vercel.app/chat-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    user_message: userMessage,
                    bot_message: data.reply,
                    encourage_text: data.encouragement,
                    emotion: data.emotion
                })
            });

            // 3. 啟動輪詢，直到最新一筆 bot 訊息有 image_url
            const pollForImage = () => {
                const interval = setInterval(async () => {
                    const res = await fetch(`https://leya-backend-vercel.vercel.app/chat-history?username=${username}`);
                    const history = await res.json();
                    // 找到最後一筆有 bot_message 的訊息
                    for (let i = history.length - 1; i >= 0; i--) {
                        const item = history[i];
                        if (item.bot_message) {
                            if (item.image_url) {
                                setModalImg(item.image_url);
                                setShowModal(true);
                                clearInterval(interval);
                            }
                            break;
                        }
                    }
                }, 3000); // 每 3 秒查一次
            };
            pollForImage();
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'bot', text: '伺服器錯誤，請稍後再試。' }]);
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
            // Fallback：直接開啟原圖連結，讓使用者自行另存
            try {
                const a = document.createElement('a');
                a.href = imgUrl;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (_) {}
            alert('下載失敗，已嘗試以新分頁開啟原圖。');
        }
    };

    // IG 分享（優先：複製圖片到剪貼簿；備援：Web Share API 分享檔案；最後：開IG相機並提示）
    const handleShareIG = async (imgUrl) => {
        try {
            const resp = await fetch(imgUrl, { mode: 'cors' });
            if (!resp.ok) throw new Error('fetch failed');
            const blob = await resp.blob();
            const type = blob.type || 'image/png';
            const ext = type.split('/')[1] || 'png';

            // 1) 嘗試複製圖片到剪貼簿
            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    const item = new ClipboardItem({ [type]: blob });
                    await navigator.clipboard.write([item]);
                    // 開啟 IG 限動相機，使用者可直接貼上
                    window.location.href = 'instagram://story-camera';
                    setTimeout(() => {
                        alert('已將圖片複製到剪貼簿，開啟 IG 後直接貼上到限動即可！');
                    }, 600);
                    return;
                } catch (e) {
                    // 繼續走分享備援
                }
            }

            // 2) 備援：Web Share API 分享檔案（行動裝置分享面板可能可直接選 IG）
            const file = new File([blob], `leya-share.${ext}`, { type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: '分享至 IG', text: '分享這張圖片' });
                    return;
                } catch (e) {
                    // 使用者取消或不支援，繼續下一步
                }
            }

            // 3) 最後備援：開 IG 相機與開新分頁讓使用者手動另存
            try { window.location.href = 'instagram://story-camera'; } catch (_) {}
            const a = document.createElement('a');
            a.href = imgUrl; a.target = '_blank';
            document.body.appendChild(a); a.click(); a.remove();
            alert('已開啟 IG 相機並在新分頁開啟圖片，請儲存後再於 IG 限動選取或貼上。');
        } catch (err) {
            console.warn('IG 分享失敗，改複製網址備援:', err);
            try { await navigator.clipboard.writeText(imgUrl); } catch (_) {}
            try { window.location.href = 'instagram://story-camera'; } catch (_) {}
            alert('暫時無法直接複製圖片，已複製圖片網址到剪貼簿，請在 IG 貼上或自行選擇圖片。');
        }
    };

    // 產生 QR code 連結（無需額外套件）
    // 將 QR 指向 save-image.html，手機掃碼後可一鍵加入相簿
    const getQrUrl = (imageUrl) => {
        const page = `${window.location.origin}/save-image.html?url=${encodeURIComponent(imageUrl)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(page)}`;
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

    // AI 分析（本地端簡易統計）：僅供展覽帳號使用
    const handleOpenAnalysis = () => {
        // 簡易 AI 選圖：依據對話中 bot 的情緒占比作為人格圖建議
        const botMsgs = messages.filter(m => m.role === 'bot');
        const emotionDist = botMsgs.reduce((acc, m) => {
            const emo = (m.emotion || '').trim();
            if (!emo) return acc;
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        const ordered = Object.entries(emotionDist).sort((a, b) => b[1] - a[1]);
        const topEmotion = ordered.length ? ordered[0][0] : (botMsgs[botMsgs.length - 1]?.emotion || '');

        // 映射：依你的圖片語意自行調整
        const emotionToIndex = {
            '平靜': 0,
            '焦慮': 1,
            '開心': 2,
            '傷心': 3,
            '憤怒': 4
        };
        let idx = 0;
        if (topEmotion && emotionToIndex.hasOwnProperty(topEmotion)) {
            idx = emotionToIndex[topEmotion];
        } else if (botMsgs.length) {
            // 若沒有標準情緒，依使用者名稱或訊息數做一個穩定 fallback
            idx = Math.abs((username || '').split('').reduce((h, c) => h + c.charCodeAt(0), 0)) % ANALYSIS_IMAGE_URLS.length;
        }
        const url = ANALYSIS_IMAGE_URLS[idx] || ANALYSIS_IMAGE_URLS[0];
        setSelectedAnalysisImage(url);
        setShowAnalysis(true);
    };

    const userAvatar = "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png";
    const botAvatar = "https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png";

    return (
        <>
            <div className="content-area" id="chat-page">
                {/* 頂部操作區域：訪客(shuics) 顯示清除；展覽(leyatalks) 顯示 AI 分析 */}
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
                {username === 'leyatalks' && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        padding: '10px 20px',
                        background: '#e6f7ff',
                        borderRadius: '8px',
                        marginBottom: '10px'
                    }}>
                        <button
                            onClick={handleOpenAnalysis}
                            style={{
                                background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                boxShadow: '0 2px 8px rgba(91, 134, 229, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            🤖 AI 分析
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
                    <div className="chat-history" ref={chatHistoryRef} style={{overflowY: 'auto'}}>
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
                                            {username === 'shuics' && msg.emotion && <div style={{marginTop: '0.5rem', color: 'blue', fontSize: '0.8rem', fontWeight: '500'}}>情緒:{msg.emotion}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="chat-loading">回覆中...</div>}
                    </div>
                    <div className="chat-input-container">
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
            {/* AI 分析視窗（展覽帳號） */}
            {showAnalysis && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowAnalysis(false)}
                >
                    <div
                        style={{
                            background: '#fff', color: '#333', borderRadius: 12,
                            width: 'min(92vw, 560px)', maxHeight: '90vh', overflowY: 'auto',
                            boxShadow: '0 0 24px rgba(0,0,0,0.25)', padding: 20, position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ position: 'absolute', top: 10, right: 12, cursor: 'pointer' }} onClick={() => setShowAnalysis(false)}>✕</div>
                        <h3 style={{ marginTop: 0 }}>AI 推薦的人格圖片</h3>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 260px', minWidth: 240 }}>
                                {selectedAnalysisImage ? (
                                    <img src={selectedAnalysisImage} alt="ai-selection" style={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }} />
                                ) : (
                                    <div style={{ height: 260, border: '1px dashed #bbb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                        尚未選出圖片
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                    <button
                                        style={{ background: '#fff', borderRadius: 6, padding: '6px 12px', border: '1px solid #ddd', cursor: 'pointer' }}
                                        onClick={() => selectedAnalysisImage && handleDownload(selectedAnalysisImage)}
                                        disabled={!selectedAnalysisImage}
                                    >
                                        下載圖片（電腦）
                                    </button>
                                    <button
                                        style={{ background: '#fff', borderRadius: 6, padding: '6px 12px', border: '1px solid #ddd', cursor: 'pointer', color: '#E1306C', fontWeight: 600 }}
                                        onClick={() => selectedAnalysisImage && handleShareIG(selectedAnalysisImage)}
                                        disabled={!selectedAnalysisImage}
                                    >
                                        分享 IG 限動
                                    </button>
                                    <a
                                        href={selectedAnalysisImage || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ background: '#fff', borderRadius: 6, padding: '6px 12px', border: '1px solid #ddd', textDecoration: 'none', color: '#333' }}
                                        onClick={(e) => { if (!selectedAnalysisImage) e.preventDefault(); }}
                                    >
                                        新分頁開啟
                                    </a>
                                </div>
                            </div>
                            <div style={{ width: 240, minWidth: 200, textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, marginBottom: 6 }}>手機掃描 QRcode 儲存</div>
                                {selectedAnalysisImage ? (
                                    <img src={getQrUrl(selectedAnalysisImage)} alt="qr" style={{ width: 200, height: 200, borderRadius: 8, border: '1px solid #eee', background: '#fff' }} />
                                ) : (
                                    <div style={{ width: 200, height: 200, border: '1px dashed #bbb', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                        無網址
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>提示：手機掃碼開啟圖片後長按即可儲存至相簿</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                                    cursor: 'pointer'
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
                                    cursor: 'pointer'
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