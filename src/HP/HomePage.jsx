import { useState, useEffect } from 'react';
import { faCircleRight } from '@fortawesome/free-solid-svg-icons';
import './hp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';

function HomePage({ handleNavigation }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 監聽視窗大小變化
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
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
        setMenuOpen(!isMenuOpen);
    };

    return (
        <div className='hp-global'>
            <FakeNavbar />
            <div className='hp-navbar'>
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="LeyaTalks" className='hp-navbar_logo' />
                <button className='hp-hamburger' onClick={toggleMenu} aria-label="菜單">
                    ☰
                </button>
                <div className={`hp-navbar-links ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#" onClick={handleNavClick}>主頁</a>
                    <a href="#concept" onClick={handleNavClick}>專題理念</a>
                    <a href="#planning" onClick={handleNavClick}>專題企劃</a>
                    <a onClick={() => {
                        handleNavigation("/LeyaTalks");
                        handleNavClick();
                    }} className='hp-arrow-link'>
                        <FontAwesomeIcon icon={faCircleRight} />
                    </a>
                </div>
            </div>
            <IndexContainer isMobile={isMobile} />
        </div>
    )
}

function FakeNavbar() {
    return (
        <div className='hp-fake-navbar'></div>
    )
}

// 內容容器
function IndexContainer({ isMobile }) {
    return (
        <div className='hp-container'>
            <Slogan />
            <Content id="concept" isMobile={isMobile} />
            <Content_Reverse id="planning" isMobile={isMobile} />
            <Footer />
        </div>
    )
}

function Slogan() {
    return (
        <div className='hp-slogan'>
            樂壓Talks 溫暖你的心
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
                            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/tempcontent.png" alt="專題理念圖片" />
                        </div>
                        <div className="hp-content-bottom"></div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content">
                            在快節奏的現代生活中，許多人外表看似正常，<br />
                            內心卻早已身心俱疲，這正是韓國所稱的「Toast-out」狀態。<br />
                            我們的專題網站樂壓Talk’s，便以此為靈感出發，<br />
                            致力於打造一個能隨時隨地提供心理支持的網站，<br />
                            協助使用者識別壓力來源、釋放情緒，<br />
                            讓心理健康成為日常生活的一部分。
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/tempcontent.png" alt="專題理念圖片" />
                        </div>
                    </div>
                    <div className="hp-half-container">
                        <div className="hp-content">
                            在快節奏的現代生活中<br />
                            許多人外表看似正常<br />
                            內心卻早已身心俱疲<br />
                            這正是韓國所稱的「Toast-out」狀態<br />
                            我們的專題網站樂壓Talk’s便以此為靈感出發<br />
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
                            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/tempcontent.png" alt="專題企劃圖片" />
                        </div>
                        <div className="hp-content-bottom"></div>
                    </div>
                </>
            ) : (
                <>
                    <div className="hp-half-container">
                        <div className="hp-content-top">
                            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/tempcontent.png" alt="專題企劃圖片" />
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