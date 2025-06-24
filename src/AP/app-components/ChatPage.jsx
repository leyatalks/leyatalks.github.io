import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faHandHoldingHeart, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";

function ChatPage({ userInfo }) {
    const username = userInfo?.nickname || 'visitor';
    const storageKey = `chat-messages-${username}`;

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [messages, storageKey]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { role: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("https://leya-backend-vercel.vercel.app/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text })
            });
            const data = await res.json();
            const botMessage = {
                role: 'bot',
                text: data.reply,
                encouragement: data.encouragement,
                emotion: data.emotion
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'bot', text: '伺服器錯誤，請稍後再試。' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const userAvatar = "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png";
    const botAvatar = "https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png";

    return (
        <>
            <div className="content-area" id="chat-page">
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
                    <div className="chat-history">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.role === 'user' ? 'chat-message chat-message-user' : 'chat-message chat-message-bot'}>
                                {/* 頭貼 */}
                                <div className={msg.role === 'user' ? 'chat-avatar chat-avatar-user' : 'chat-avatar chat-avatar-bot'}>
                                    <img src={msg.role === 'user' ? userAvatar : botAvatar} alt="avatar" />
                                </div>
                                {/* 聊天氣泡 */}
                                <div className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-bot'}> 
                                    <span>{msg.text}</span>
                                    {/* {msg.role === 'bot' && (
                                        <div className="chat-bot-extra">
                                            {msg.encouragement && <div>鼓勵：{msg.encouragement}</div>}
                                            {msg.emotion && <div>情緒：{msg.emotion}</div>}
                                        </div>
                                    )} */}
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
        </>
    );
}

export default ChatPage;