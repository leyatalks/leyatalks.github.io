import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faLeaf, faDiagramProject, faCommentDots, faUser } from '@fortawesome/free-solid-svg-icons';

function AsideNav({ setActivePage, activePage, userInfo, collapsed }) {
  const navigate = useNavigate();
  // 僅當具備有效的 nickname 或 id 時才視為已登入（避免空物件被判定為 true）
  const isLoggedIn = Boolean(userInfo && (userInfo.nickname || userInfo.id));
  return (
    <aside className={`ap-aside ${collapsed ? 'collapsed' : ''}`}>
      <div className="ap-aside-inner">
        <div className="ap-aside-logo" style={{ cursor: 'pointer' }} onClick={() => setActivePage('home')}>
          <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="樂壓Logo" />
          {/* <span className="ap-aside-title" onClick={(e) => { e.stopPropagation(); setActivePage('home-page'); }}>樂壓Talks</span> */}
        </div>
        <nav className="ap-aside-nav">
          <button className={`ap-aside-item ${activePage === 'mood-page' ? 'active' : ''}`} 
          onClick={(e) => { if (isLoggedIn) { setActivePage('mood-page') } else { e.stopPropagation(); document.getElementById('login-hint-modal').style.display = 'flex' } }}
          >
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faBook} /></span>
            <span className="ap-aside-text">心情日記</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'chat-page' ? 'active' : ''}`} 
          onClick={(e) => { if (isLoggedIn) { setActivePage('chat-page') } else { e.stopPropagation(); document.getElementById('login-hint-modal').style.display = 'flex' } }}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faCommentDots} /></span>
            <span className="ap-aside-text">吐司聊天室</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'stress-mind-map' ? 'active' : ''}`} 
          onClick={(e) => { if (isLoggedIn) { setActivePage('stress-mind-map') } else { e.stopPropagation(); document.getElementById('login-hint-modal').style.display = 'flex' } }}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faDiagramProject} /></span>
            <span className="ap-aside-text">壓力來源圖</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'meditation-page' ? 'active' : ''}`} 
          onClick={() => setActivePage('meditation-page')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faLeaf} /></span>
            <span className="ap-aside-text">冥想</span>
          </button>

        </nav>
        <div className="ap-aside-footer">
          {/* 內嵌顯示介紹頁（右側容器切到 /leya/intro）*/}
          {/* <button className='ap-aside-item' onClick={() => setActivePage('intro-page')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faEarthAmericas} /></span>
            <span className="ap-aside-text">樂壓Talk's專題介紹</span>
          </button> */}
          <button className='ap-aside-item' onClick={() => { if (isLoggedIn) { navigate('/leya/user') } else { navigate('/leya/login') } }}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faUser} /></span>
          </button>
          {/* <div className="user-icon" onClick={() => setActivePage('user-page')} style={{flex: 1}}>
            <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: '40px'}}/>
          </div> */}
        </div>
      </div>

      <div className="login-hint-modal" id='login-hint-modal'>
        <p className='login-hint'>請先登入以使用此功能</p>
        <div className="login-hint-button" onClick={(e)=>{e.currentTarget.parentElement.style.display = 'none'}}>確認</div>
      </div>
    </aside>
  );
}

export default AsideNav;