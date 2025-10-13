import { useState, useEffect } from 'react';
import { faCircleRight } from '@fortawesome/free-solid-svg-icons';
import './hp.css'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

//首頁圖片
const firstImg = "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/hp-first.webp";
const secondImg = "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/hp-second.webp";

// 下拉刷新功能 - 使用自定義事件而非頁面重載
const enablePullToRefresh = (callback) => {
    let touchStartY = 0;
    let touchEndY = 0;
    let refreshIndicator = null;

    // 創建刷新指示器
    const createRefreshIndicator = () => {
        if (!refreshIndicator) {
            refreshIndicator = document.createElement('div');
            refreshIndicator.style.position = 'fixed';
            refreshIndicator.style.top = '0';
            refreshIndicator.style.left = '0';
            refreshIndicator.style.width = '100%';
            refreshIndicator.style.height = '50px';
            refreshIndicator.style.backgroundColor = '#FAEAD3';
            refreshIndicator.style.display = 'flex';
            refreshIndicator.style.justifyContent = 'center';
            refreshIndicator.style.alignItems = 'center';
            refreshIndicator.style.transform = 'translateY(-50px)';
            refreshIndicator.style.transition = 'transform 0.3s ease';
            refreshIndicator.style.zIndex = '1000';
            refreshIndicator.textContent = '下拉刷新';
            document.body.appendChild(refreshIndicator);
        }
        return refreshIndicator;
    };

    // 觸摸開始
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        createRefreshIndicator();
    }, { passive: true });

    // 觸摸移動
    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - touchStartY;

            if (diff > 0) {
                // 防止頁面滾動
                // e.preventDefault(); // 注意：在 passive 事件中不能使用 preventDefault

                // 顯示刷新指示器
                const indicator = createRefreshIndicator();
                const pullDistance = Math.min(diff * 0.5, 50); // 限制最大下拉距離
                indicator.style.transform = `translateY(${pullDistance - 50}px)`;

                if (pullDistance > 40) {
                    indicator.textContent = '釋放刷新';
                } else {
                    indicator.textContent = '下拉刷新';
                }
            }
        }
    }, { passive: true });

    // 觸摸結束
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;

        if (window.scrollY === 0 && diff > 100) {
            // 下拉距離超過100px且在頁面頂部時觸發刷新
            const indicator = createRefreshIndicator();
            indicator.textContent = '正在刷新...';
            indicator.style.transform = 'translateY(0)';

            // 執行回調函數而不是重新加載頁面
            if (typeof callback === 'function') {
                setTimeout(() => {
                    callback();

                    // 隱藏刷新指示器
                    setTimeout(() => {
                        indicator.style.transform = 'translateY(-50px)';
                    }, 500);
                }, 1000);
            }
        } else if (refreshIndicator) {
            // 如果沒有觸發刷新，隱藏指示器
            refreshIndicator.style.transform = 'translateY(-50px)';
        }
    }, { passive: true });
};

function HomePage({ handleNavigation }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 監聽視窗大小變化和啟用下拉刷新
    useEffect(() => {
        // 定義處理視窗大小變化的函數
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);

            // 如果不是移動設備，確保選單關閉
            if (!isMobile) {
                setMenuOpen(false);
            }

            // 確保漢堡選單在正確的設備上顯示
            const hamburgerBtn = document.querySelector('.hp-hamburger');
            if (hamburgerBtn) {
                hamburgerBtn.style.display = isMobile ? 'flex' : 'none';
            }
        };

        // 初始執行一次以確保正確的初始狀態
        handleResize();

        // 添加視窗大小變化監聽器
        window.addEventListener('resize', handleResize);

        // 定義刷新回調函數
        const refreshCallback = () => {
            console.log('頁面已刷新');
            // 刷新時重新檢測設備類型
            handleResize();
        };

        // 啟用下拉刷新功能，並傳入回調函數
        enablePullToRefresh(refreshCallback);

        // 清理函數
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 點擊導航鏈接後自動關閉菜單（在移動設備上）
    const handleNavClick = () => {
        if (isMobile) {
            setMenuOpen(false);
        }
    };

    const toggleMenu = () => {
        // 切換選單狀態
        setMenuOpen(!isMenuOpen);

        // 如果選單即將打開，確保頁面滾動到頂部，以便完整顯示選單
        if (!isMenuOpen) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    const navigate = useNavigate();

    return (
        <div className='hp-global'>
            <FakeNavbar />
            <div className='hp-navbar'>
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="LeyaTalks" className='hp-navbar_logo' />
                <button
                    className='hp-hamburger'
                    onClick={toggleMenu}
                    aria-label="菜單"
                    style={{ display: isMobile ? 'flex' : 'none' }} // 只在移動設備上顯示
                >
                    {isMenuOpen ? '✕' : '☰'} {/* 切換漢堡選單圖標 */}
                </button>
                {/* 桌面版導航 */}
                {!isMobile && (
                    <div className='hp-navbar-links' style={{ display: 'flex', flexDirection: 'row', position: 'static', transform: 'none', opacity: 1, background: 'transparent', boxShadow: 'none' }}>
                        {/* <a href="#" onClick={handleNavClick}>主頁</a>
                        <a href="#concept" onClick={handleNavClick}>專題理念</a>
                        <a href="#planning" onClick={handleNavClick}>專題企劃</a> */}
                        <a onClick={() => {
                            navigate('/leya')
                        }} className='hp-arrow-link'>
                            登入 / 註冊
                        </a>
                    </div>
                )}
                {/* 移動版導航 */}
                {isMobile && (
                    <div className={`hp-navbar-links ${isMenuOpen ? 'open' : ''}`}>
                        {/* <a href="#" onClick={handleNavClick}>主頁</a>
                        <a href="#concept" onClick={handleNavClick}>專題理念</a>
                        <a href="#planning" onClick={handleNavClick}>專題企劃</a> */}
                        <a onClick={() => {
                            navigate('/leya')
                        }} className='hp-arrow-link'
                            style={{ maxWidth: '80%' }}
                        >
                            登入 / 註冊
                        </a>
                    </div>
                )}
            </div>

            {/* 背景遮罩，當選單打開時顯示 */}
            {isMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998, // 低於選單但高於其他內容
                        touchAction: 'none' // 防止觸摸事件穿透
                    }}
                    onClick={toggleMenu} // 點擊遮罩關閉選單
                />
            )}

            <IndexContainer isMobile={isMobile} handleNavigation={handleNavigation} />
        </div>
    )
}

function FakeNavbar() {
    return (
        <div className='hp-fake-navbar'></div>
    )
}

// 內容容器
function IndexContainer({ isMobile, handleNavigation}) {
    return (
        <div className='hp-container'>
            <Slogan isMobile={isMobile} />
            <ScrollBar id="scroll-bar" isMobile={isMobile} handleNavigation={handleNavigation}/>
            {/* <Video id="video" isMobile={isMobile} /> */}
            <Content id="concept" isMobile={isMobile} />
            <Content_Reverse id="planning" isMobile={isMobile} />
            <Footer />
        </div>
    )
}

function Slogan({ isMobile }) {
    return (
        <div className='hp-slogan'>
            {!isMobile ? (
                <>
                    樂壓Talks 溫暖你的心
                    <p style={{ letterSpacing: '1.8rem', fontSize: '3rem', fontFamily: 'Dela Gothic One' }}>如果你需要，我隨時都在</p>
                </>
            ) : (
                <>
                    樂壓Talks
                    <br />
                    溫暖你的心
                </>
            )}
        </div>
    )
}

function ScrollBar({ id }) {
    const navigate = useNavigate();
    return (
        <div className='hp-scroll-bar' id={id}>
            <a onClick={() => {
                navigate('/leya')
            }} className='hp-sc-btn1'
            >前往聊天</a>
            <a href="#concept" className='hp-sc-btn2'>了解更多</a>
        </div>
    )
}

function Video({ id, isMobile }) {
    return (
        <div className='hp-video' id={id}>
            16165416
        </div>
    )
}

function Content({ id, isMobile }) {
    return (
        <div className='hp-content-container' id={id}>
            {!isMobile ? (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src={firstImg} alt="專題理念圖片" />
                        </div>
                        <div className="hp-content-bottom"></div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content">
                            在快節奏的現代生活中<br />
                            許多人外表看似正常<br />
                            內心卻早已身心俱疲<br />
                            這正是韓國所稱的「Toast-out」狀態<br />
                            我們的專題網站樂壓Talk's，便以此為靈感出發<br />
                            致力於打造一個能隨時隨地提供心理支持的網站<br />
                            協助使用者識別壓力來源、釋放情緒<br />
                            讓心理健康成為日常生活的一部分
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src={firstImg} alt="專題理念圖片" />
                        </div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content">
                            在快節奏的現代生活中<br />
                            許多人外表看似正常<br />
                            內心卻早已身心俱疲<br />
                            這正是韓國所稱的「Toast-out」狀態<br />
                            我們的專題網站樂壓Talk's便以此為靈感出發<br />
                            致力於打造一個能隨時隨地提供心理支持的網站<br />
                            協助使用者識別壓力來源、釋放情緒<br />
                            讓心理健康成為日常生活的一部分
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function Content_Reverse({ id, isMobile }) {
    return (
        <div className='hp-content-container' id={id}>
            {!isMobile ? (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-reverse">
                            透過結合心理層面概念、數位科技與社群元素<br />
                            讓社會更加重視隱性壓力<br />
                            讓每一個人都能安心敞開心扉<br />
                            並找到能被理解與支持的出口<br />
                            進而建立一個有溫度的情緒抒發網站
                        </div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src={secondImg} alt="專題企劃圖片" />
                        </div>
                        <div className="hp-content-bottom"></div>
                    </div>
                </>
            ) : (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src={secondImg} alt="專題企劃圖片" />
                        </div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content-reverse">
                            透過結合心理層面概念、數位科技與社群元素<br />
                            讓社會更加重視隱性壓力<br />
                            讓每一個人都能安心敞開心扉<br />
                            並找到能被理解與支持的出口<br />
                            進而建立一個有溫度的情緒抒發網站
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function Footer() {
    return (
        <div className='hp-footer'>
            <div className='hp-footer-logo'>
                <div className='hp-logo-container'>
                    <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/shu.png" alt="世新大學校徽" className='shu' />
                    <span style={{ display: 'flex', flexDirection: 'column' }}><p style={{ fontSize: '1.6rem' }}>世新大學</p><p style={{ fontSize: '1rem' }}>Shih Hsin University</p></span>
                </div>
                <div className='hp-logo-container'>
                    <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/ics.png" alt="資傳系徽" className='ics' />
                    <span style={{ display: 'flex', flexDirection: 'column' }}><p style={{ fontSize: '1.6rem' }}>資訊傳播學系</p><p style={{ fontSize: '1rem' }}>Department of<br />Information and Communications</p></span>
                </div>
            </div>
            <div className='hp-copyright'>
                <p>版權所有©2025樂壓Talks</p>
                <p style={{ fontSize: '1rem' }}>Copyright©2025 Reserved by LeyaTalks</p>
            </div>
            <div className='hp-footer-contact'>
                <p>樂壓Talks聯絡資訊</p>
                <p>專案經理：張騰利</p>
                <p>聯絡信箱：<a href='mailto:leyatalks1010@gmail.com'>leyatalks1010@gmail.com</a></p>
            </div>
        </div>
    )
}

export default HomePage