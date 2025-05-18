import React from 'react';
import DonateManage from './Admin-Function/DonateManage';


function AdminPage({ activePage, setActivePage, userInfo }) {
    if (!userInfo) return <div>尚未登入</div>;
    console.log('User Info:', userInfo); // 檢查 userInfo 的內容

    function handleLogout() {
        setActivePage('login-page')
    }

    return (
        <>
            <div className="user-page">
                <div className="user-header">
                    <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="" className='user-avatar' />
                    <div className="user-info">
                        <h2 className="user-name">{userInfo.nickname}</h2>
                        <p className="user-id" style={{ color: "red" }}>@{userInfo.id}</p>
                    </div>
                    <div
                        className={`nav-item ${activePage === 'login-page' ? 'active' : ''}`}
                        onClick={handleLogout}
                    >
                        <button className='logout-btn'>
                            登出
                        </button>
                    </div>
                </div>
                <div>
                    <h3 style={{fontSize: "2rem", fontWeight:"700"}}>
                        管理員功能列
                        </h3>
                    <div
                        className={`nav-item ${activePage === 'donate-manage' ? 'active' : ''}`}
                        onClick={() => setActivePage('donate-manage')}
                        style={{width:"100%", backgroundColor:"#D7BFB0", color:"#fff", borderRadius:"12px"}}
                    >贊助貼文管理</div>
                </div>
            </div>
        </>
    );
}

export default AdminPage;
