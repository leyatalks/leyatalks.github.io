import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './ap.css'
import Header from './app-components/Header'
import Footer from './app-components/Footer'
import MainPage from './app-components/MainPage'
import CategoryPage from './app-components/Category'
import ChatPage from './app-components/ChatPage'
import UserPage from './app-components/UserPage'
import LoginPage from './app-components/Login/LoginPage'
import RegisterPage from './app-components/Login/Register'
import Sercet from './app-components/Sand'
import AdminPage from './app-components/AdminPage'
import DonateManage from './app-components/Admin-Function/DonateManage'
import MoodPage from './app-components/MoodPage'
import StressMindMap from './app-components/StressMindMap'
import MeditationPage from './app-components/MeditationPage'
import AsideNav from './app-components/AsideNav'


const DefaultRoute = () => {
    try {
        const saved = localStorage.getItem('leyaUserInfo');
        const info = saved ? JSON.parse(saved) : null;
        const isLoggedIn = info && (info.nickname || info.id);
        return <Navigate to={isLoggedIn ? 'home' : 'login'} replace />;
    } catch (e) {
        return <Navigate to="login" replace />;
    }
};

// 下拉刷新功能 - 使用自定義事件而非頁面重載
const enablePullToRefresh = (callback) => {
    let touchStartY = 0;
    let touchEndY = 0;
    let refreshIndicator = null;

    const createRefreshIndicator = () => {
        if (!refreshIndicator) {
            refreshIndicator = document.createElement('div');
            refreshIndicator.style.position = 'fixed';
            refreshIndicator.style.top = '0';
            refreshIndicator.style.left = '0';
            refreshIndicator.style.width = '100%';
            refreshIndicator.style.height = '50px';
            refreshIndicator.style.backgroundColor = '#FFF4EB';
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

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        createRefreshIndicator();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - touchStartY;

            if (diff > 0) {
                const indicator = createRefreshIndicator();
                const pullDistance = Math.min(diff * 0.5, 50);
                indicator.style.transform = `translateY(${pullDistance - 50}px)`;

                indicator.textContent = pullDistance > 40 ? '釋放刷新' : '下拉刷新';
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;

        if (window.scrollY === 0 && diff > 100) {
            const indicator = createRefreshIndicator();
            indicator.textContent = '正在刷新...';
            indicator.style.transform = 'translateY(0)';

            if (typeof callback === 'function') {
                setTimeout(() => {
                    callback();
                    setTimeout(() => {
                        indicator.style.transform = 'translateY(-50px)';
                    }, 500);
                }, 1000);
            }
        } else if (refreshIndicator) {
            refreshIndicator.style.transform = 'translateY(-50px)';
        }
    }, { passive: true });
};

function Application() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userInfo, setUserInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('leyaUserInfo')
            return saved ? JSON.parse(saved) : { nickname: '', id: '' }
        } catch (err) {
            return { nickname: '', id: '' }
        }
    })

    const [asideCollapsed, setAsideCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const refreshCallback = () => {
        };
        enablePullToRefresh(refreshCallback);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('leyaUserInfo', JSON.stringify(userInfo))
        } catch (err) { }
    }, [userInfo])

    const routeMap = {
        'home-page': '/leya/home',
        'category-page': '/leya/category',
        'chat-page': '/leya/chat',
        'user-page': '/leya/user',
        'admin-page': '/leya/admin',
        'donate-manage': '/leya/donate-manage',
        'login-page': '/leya/login',
        'register': '/leya/register',
        'secret': '/leya/secret',
        'mood-page': '/leya/mood',
        'stress-mind-map': '/leya/stress-mind-map',
        'meditation-page': '/leya/meditation',
    };
    const reverseMap = Object.fromEntries(Object.entries(routeMap).map(([k, v]) => [v, k]));
    const legacySetActivePage = (pageKey) => {
        const to = routeMap[pageKey] || '/leya/home';
        navigate(to);
    };
    const activePage = reverseMap[location.pathname] || 'home-page';

    // login / register 隱藏 Header / Footer / Aside
    const hideLayout = ['/leya/login', '/leya/register'].includes(location.pathname);

    return (
        <div id='app' className='ap-app'>
            <div className='ap-page-container'>
                {!hideLayout && isDesktop && (
                    <AsideNav
                        setActivePage={legacySetActivePage}
                        activePage={activePage}
                        collapsed={asideCollapsed}
                        onToggle={() => setAsideCollapsed(!asideCollapsed)}
                    />
                )}
                <div className={`ap-main ${asideCollapsed ? 'aside-collapsed' : ''}`}>
                    {!hideLayout&& !isDesktop && (<Header setActivePage={legacySetActivePage} userInfo={userInfo} />)}
                    <div className="content-area">
                        <Routes>
                            <Route index element={<DefaultRoute />} />
                            <Route path="login" element={<LoginPage activePage={activePage} setActivePage={legacySetActivePage} setUserInfo={setUserInfo} />} />
                            <Route path="register" element={<RegisterPage activePage={activePage} setActivePage={legacySetActivePage} />} />
                            <Route path="home" element={<MainPage activePage={activePage} setActivePage={legacySetActivePage} />} />
                            <Route path="category" element={<CategoryPage activePage={activePage} setActivePage={legacySetActivePage} />} />
                            <Route path="chat" element={<ChatPage userInfo={userInfo} />} />
                            <Route path="user" element={<UserPage activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="admin" element={<AdminPage activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="donate-manage" element={<DonateManage activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="secret" element={<Sercet activePage={activePage} setActivePage={legacySetActivePage} />} />
                            <Route path="mood" element={<MoodPage activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="stress-mind-map" element={<StressMindMap activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="meditation" element={<MeditationPage activePage={activePage} setActivePage={legacySetActivePage} userInfo={userInfo} />} />
                            <Route path="*" element={<Navigate to="login" replace />} />
                        </Routes>
                    </div>
                    {!hideLayout && !isDesktop && (
                        <Footer activePage={activePage} setActivePage={legacySetActivePage} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Application