import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faLeaf, faDiagramProject, faCommentDots, faCircleUser } from '@fortawesome/free-solid-svg-icons';

function AsideNav({ setActivePage, activePage, collapsed = false, onToggle }) {
  return (
    <aside className={`ap-aside ${collapsed ? 'collapsed' : ''}`}>
      <div className="ap-aside-inner">
        <div className="ap-aside-logo" style={{ cursor: 'pointer' }} onClick={onToggle}>
          <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="樂壓Logo" />
          <span className="ap-aside-title" onClick={(e) => { e.stopPropagation(); setActivePage('home-page'); }}>樂壓Talks</span>
        </div>
        <nav className="ap-aside-nav">
          <button className={`ap-aside-item ${activePage === 'home-page' ? 'active' : ''}`} onClick={() => setActivePage('mood-page')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faBook} /></span>
            <span className="ap-aside-text">心情日記</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'meditation-page' ? 'active' : ''}`} onClick={() => setActivePage('meditation-page')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faLeaf} /></span>
            <span className="ap-aside-text">正念冥想</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'stress-mind-map' ? 'active' : ''}`} onClick={() => setActivePage('stress-mind-map')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faDiagramProject} /></span>
            <span className="ap-aside-text">壓力來源圖</span>
          </button>
          <button className={`ap-aside-item ${activePage === 'chat-page' ? 'active' : ''}`} onClick={() => setActivePage('chat-page')}>
            <span className="ap-aside-icon"><FontAwesomeIcon icon={faCommentDots} /></span>
            <span className="ap-aside-text">吐司聊天室</span>
          </button>
        </nav>
        <div className="ap-aside-footer">
          <button className='logout-btn' onClick={() => setActivePage('login-page')} style={{width: '100%'}}>
            登出
          </button>
          {/* <div className="user-icon" onClick={() => setActivePage('user-page')} style={{flex: 1}}>
            <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: '40px'}}/>
          </div> */}
        </div>
      </div>
    </aside>
  );
}

export default AsideNav;