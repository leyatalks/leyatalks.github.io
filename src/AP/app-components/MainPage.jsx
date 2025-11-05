import React from 'react';
import './MainPageComponents/mainPage.css'
import Role from './MainPageComponents/Role';
import InfoCard from './MainPageComponents/InfoCard';

function MainPage({ setActivePage, activatePage, activePage, userInfo, handleLogout }) {
    function handleLogout() {
        setActivePage('login-page')
    }

    // 允許同時支援 activePage 或 activatePage（避免命名不一致造成的錯誤）
    const currentActivePage = activePage ?? activatePage;
    // 避免 userInfo 未定義造成渲染錯誤
    const nickname = userInfo?.nickname ?? '訪客';
    const userId = userInfo?.id ?? 'guest';
    // 登出函式可選（未傳入則為 no-op）
    const onLogout = handleLogout ?? (() => { });
    return (
        <div className='mp-container'>
            {/* <ADs /> */}
            <div className="user-header">
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="" className='user-avatar' />
                <div className="user-info">
                    <h2 className="user-name">{nickname}</h2>
                    <p className="user-id">@{userId}</p>
                </div>
                <div
                    className={`nav-item ${currentActivePage === 'login-page' ? 'active' : ''}`}
                    onClick={onLogout}
                >
                    <button className='logout-btn'>
                        登出
                    </button>
                </div>
            </div>
            <div className="mainpage-container">
                <Role />
                <InfoCard setActivatePage={setActivePage} />
            </div>

        </div>
    );


}

export default MainPage;