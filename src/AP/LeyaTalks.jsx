import { useState, useEffect } from 'react'
import './ap.css'
import Header from './app-components/Header'
import Footer from './app-components/Footer'
import Post from './app-components/Post'
import CategoryPage from './app-components/Category'
import ChatPage from './app-components/ChatPage'
import UserPage from './app-components/UserPage'
import LoginPage from './app-components/Login/LoginPage'
import RegisterPage from './app-components/Login/Register'
import Sercet from './app-components/Sand'
import AdminPage from './app-components/AdminPage'
import DonateManage from './app-components/Admin-Function/DonateManage'
import MoodPage from './app-components/MoodPage'

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


function Application() {
    const [activePage, setActivePage] = useState(() => {
        try {
            const saved = localStorage.getItem('leyaActivePage')
            return saved || 'login-page'
        } catch (err) {
            return 'login-page'
        }
    })
    const [userInfo, setUserInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('leyaUserInfo')
            return saved ? JSON.parse(saved) : { nickname: '', id: '' }
        } catch (err) {
            return { nickname: '', id: '' }
        }
    })

    // 啟用下拉刷新功能
    useEffect(() => {
        // 定義刷新回調函數
        const refreshCallback = () => {
            // 這裡可以執行任何需要在刷新時進行的操作
            console.log('應用頁面已刷新');

            // 如果需要，可以強制重新渲染組件
            setActivePage(prev => prev); // 這會觸發重新渲染但不改變狀態
        };

        // 啟用下拉刷新功能，並傳入回調函數
        enablePullToRefresh(refreshCallback);
    }, []);

    // 同步 userInfo 到 localStorage（登入後能持久化，刷新仍有 username）
    useEffect(() => {
        try {
            localStorage.setItem('leyaUserInfo', JSON.stringify(userInfo))
        } catch (err) {
            // 忽略持久化錯誤
        }
    }, [userInfo])

    // 同步 activePage 到 localStorage
    useEffect(() => {
        try {
            localStorage.setItem('leyaActivePage', activePage)
        } catch (err) {
            // 忽略持久化錯誤
        }
    }, [activePage])

    const whiteList = ["login-page", "register"]

    const renderPage = () => {
        switch (activePage) {
            case 'home-page':
                return <Post />
            case 'category-page':
                return <CategoryPage  activePage={activePage} setActivePage={setActivePage} />
            case 'chat-page':
                return <ChatPage userInfo={userInfo} />
            case 'user-page':
                return <UserPage activePage={activePage} setActivePage={setActivePage} userInfo={userInfo} />
            case 'admin-page':
                return <AdminPage activePage={activePage} setActivePage={setActivePage} userInfo={userInfo} />
            case 'donate-manage':
                return <DonateManage activePage={activePage} setActivePage={setActivePage} userInfo={userInfo} />
            case 'login-page':
                return <LoginPage activePage={activePage} setActivePage={setActivePage} setUserInfo={setUserInfo} />
            case 'register':
                return <RegisterPage activePage={activePage} setActivePage={setActivePage}/>
            case 'secret':
                return <Sercet activePage={activePage} setActivePage={setActivePage}/>
            case 'mood-page':
                return <MoodPage activePage={activePage} setActivePage={setActivePage} userInfo={userInfo}/>
            default:
                return <Post />
        }
    }

    return (
            <div id='app'>
                <div className='ap-page-container'>
                    { !whiteList.includes(activePage) && <Header setActivePage={setActivePage} userInfo={userInfo} /> }
                    <div className="content-area">
                        {renderPage()}
                    </div>
                    { !whiteList.includes(activePage) && <Footer activePage={activePage} setActivePage={setActivePage} /> }
                </div>
            </div>
    )
}

export default Application