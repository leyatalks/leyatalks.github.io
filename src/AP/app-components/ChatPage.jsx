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

    const chatHistoryRef = useRef(null);

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
                    image_url: item.image_url
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

    const userAvatar = "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png";
    const botAvatar = "https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png";

    return (
        <>
            <div className="content-area" id="chat-page">
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