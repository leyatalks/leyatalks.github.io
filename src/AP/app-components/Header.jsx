import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faCommentDots, faBrain, faEarthAmericas, faHeart, faBook } from '@fortawesome/free-solid-svg-icons';
import '../../HP/hp.css';
import { useNavigate } from 'react-router-dom';
function Header({ setActivePage, userInfo }) {
    const navigate = useNavigate();
    // 判斷是否為管理員
    const isAdmin = userInfo && userInfo.id === 'admin';
    // 判斷是否登入（需有有效 nickname 或 id）
    const isLoggedIn = Boolean(userInfo && (userInfo.nickname || userInfo.id));

    const handleUserIconClick = () => {
        if (isLoggedIn) {
            setActivePage('user-page');
        } else {
            setActivePage('login-page');
        }
    };

    const [isMenuOpen, setMenuOpen] = useState(false);
    // 按下 ESC 也可關閉選單
    useEffect(() => {
        if (!isMenuOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isMenuOpen]);

    const toggleMenu = () => {
        // 切換選單狀態
        setMenuOpen(!isMenuOpen);
        // 如果選單即將打開，確保頁面滾動到頂部，以便完整顯示選單
        if (!isMenuOpen) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <>
            <header className={`ap-header ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className="hd-user" onClick={handleUserIconClick}>
                    <FontAwesomeIcon icon={faCircleUser} />
                </div>
                <div className='ap-header-title' onClick={() => {setActivePage('home-page'); setMenuOpen(false);}}>
                    <div className="logo">
                        <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="樂壓Logo" className="logo-img" />
                    </div>
                    樂壓Talks
                </div>
                <div className="hp-menu" style={{ position: 'relative' }}>
                    <button
                        className='hp-hamburger'
                        onClick={toggleMenu}
                        aria-label="菜單"
                        aria-expanded={isMenuOpen}
                        style={{ display: 'flex' }}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                    {/* 展開的選單 */}
                    <div className={`hp-navbar-links ${isMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="category-list">
                            <div className="category-col">
                                <div className="category-item"
                                    onClick={() => { setActivePage('meditation-page'); setMenuOpen(false); }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="category-icon">
                                        <FontAwesomeIcon icon={faBrain} />
                                    </div>
                                    <div className="category-name">冥想</div>
                                </div>
                                <hr />
                                <div className="category-item"
                                    onClick={(e) => { e.stopPropagation(); if (isLoggedIn) { setActivePage('chat-page'); setMenuOpen(false); } else { const m = document.getElementById('login-hint-modal'); if (m) m.style.display = 'flex'; } }}
                                    style={{ cursor: "pointer" }}>
                                    <div className="category-icon">
                                        <FontAwesomeIcon icon={faCommentDots} />
                                    </div>
                                    <div className="category-name">吐司聊天室</div>
                                </div>
                                <div className="category-item"
                                    onClick={(e) => { e.stopPropagation(); if (isLoggedIn) { setActivePage('mood-page'); setMenuOpen(false); } else { const m = document.getElementById('login-hint-modal'); if (m) m.style.display = 'flex'; } }}
                                    style={{ cursor: "pointer" }}>
                                    <div className="category-icon">
                                        <FontAwesomeIcon icon={faBook} />
                                    </div>
                                    <div className="category-name">心情日記</div>
                                </div>
                                <div className="category-item"
                                    onClick={(e) => { e.stopPropagation(); if (isLoggedIn) { setActivePage('stress-mind-map'); setMenuOpen(false); } else { const m = document.getElementById('login-hint-modal'); if (m) m.style.display = 'flex'; } }}
                                    style={{ cursor: "pointer" }}>
                                    <div className="category-icon">
                                        <FontAwesomeIcon icon={faHeart} />
                                    </div>
                                    <div className="category-name">壓力心智圖</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 背景遮罩，點擊可關閉選單 */}
                    {isMenuOpen && (
                        <div
                            onClick={() => setMenuOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 60,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.2)',
                                zIndex: 10
                            }}
                        />
                    )}
                </div>
                {/* 登入提示彈窗（行動版使用） */}
                <div className="login-hint-modal" id='login-hint-modal'>
                    <p className='login-hint'>請先登入以使用此功能</p>
                    <div className="login-hint-button" onClick={(e)=>{e.currentTarget.parentElement.style.display = 'none'}}>確認</div>
                </div>
            </header>
        </>
    );
};

export default Header;
