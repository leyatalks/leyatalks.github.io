import '../ap.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart, faComments, faPenToSquare, faBrain, faSpa, faMapLocationDot, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function SupportArea({ isLoggedIn, id }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleRestrictedClick = (e, path) => {
        e.preventDefault();
        if (isLoggedIn) {
            navigate(path);
        } else {
            setShowModal(true);
        }
    };

    return (
        <div className='support-area' id={id}>
            <p className="title">1219事件陪伴專區</p>
            <div className="container">
                <div className="card left">
                    <div className="feature-list">
                        <h3>我們陪你度過這一切</h3>
                        <div className="features">
                            <Link to="/leya/meditation" className="feature-item">
                                <span className="icon-wrapper no-login"><FontAwesomeIcon icon={faBrain} /></span>
                                <span className="feature-name">冥想專區</span>
                                <span className="feature-desc">將注意力回到呼吸</span>
                            </Link>
                            <Link to="/leya/mindfulness" className="feature-item">
                                <span className="icon-wrapper no-login"><FontAwesomeIcon icon={faSpa} /></span>
                                <span className="feature-name">正念專區</span>
                                <span className="feature-desc">練習放鬆與專注</span>
                            </Link>
                            <Link to="/leya/clinic-map" className="feature-item">
                                <span className="icon-wrapper no-login"><FontAwesomeIcon icon={faMapLocationDot} /></span>
                                <span className="feature-name">心理資源地圖</span>
                                <span className="feature-desc">尋找專業心理資源</span>
                            </Link>
                            <Link to="/leya/game" className="feature-item">
                                <span className="icon-wrapper no-login"><FontAwesomeIcon icon={faGamepad} /></span>
                                <span className="feature-name">紓壓小遊戲</span>
                                <span className="feature-desc">輕鬆點擊，放下煩惱</span>
                            </Link>
                            <a href="#" className="feature-item" onClick={(e) => handleRestrictedClick(e, '/leya/mood')}>
                                <span className="icon-wrapper login"><FontAwesomeIcon icon={faPenToSquare} /></span>
                                <span className="feature-name">心情日記</span>
                                <span className="feature-desc">將心情記錄下來</span>
                            </a>
                            <a href="#" className="feature-item" onClick={(e) => handleRestrictedClick(e, '/leya/chat')}>
                                <span className="icon-wrapper login"><FontAwesomeIcon icon={faComments} /></span>
                                <span className="feature-name">吐司聊天室</span>
                                <span className="feature-desc">隨時傾聽你的心事</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="card center">
                    <img src="/mourn.png" alt="" />
                </div>
                <div className="card right">
                    <div className="text-content">
                        <h3>那天之後，你/妳還好嗎？</h3>
                        <div className="text-body">
                            <p>北市隨機襲擊事件發生後</p>
                            <p>如果你曾感到焦慮、擔憂、害怕</p>
                            <p>久久無法安心的心情，又甚至不一定說的出口❤️‍🩹</p>
                            <p>請記得，這些反應都很正常，你並不孤單</p>
                            <p>為了陪伴大家慢慢找回安全感</p>
                            <p>衛福部擴大「#心理健康支持方案」</p>
                            <p>邀請你一起為自己的心「安心」🕊️</p>
                            <a href="https://sps.mohw.gov.tw/mhs" target="_blank" rel="noopener noreferrer" className="support-btn">
                                <FontAwesomeIcon icon={faHandHoldingHeart} /> 申請/查詢心理健康支持方案
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Hint Modal */}
            <div className="login-hint-modal" style={{ display: showModal ? 'flex' : 'none', position: 'fixed', zIndex: 1000 }}>
                <p className='login-hint'>請先登入以使用此功能</p>
                <div className="login-hint-button" onClick={() => setShowModal(false)}>確認</div>
            </div>
        </div>
    )
}

export default SupportArea;