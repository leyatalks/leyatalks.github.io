import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';

function Header({ setActivePage, userInfo, handleLogout }) {
    // 判斷是否為管理員
    const isAdmin = userInfo && userInfo.id === 'admin';
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // 點擊頭像時顯示下拉選單
    const handleUserIconClick = () => {
        setShowDropdown(!showDropdown);
    };

    // 點擊用戶頁面選項
    const goToUserPage = () => {
        if (isAdmin) {
            setActivePage('admin-page');
        } else {
            setActivePage('user-page');
        }
        setShowDropdown(false);
    };

    // 點擊登出選項
    const onLogout = () => {
        handleLogout();
        setShowDropdown(false);
    };

    // 點擊外部關閉下拉選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="ap-header">
                <div className="logo" onClick={() => setActivePage('home-page')}>
                    <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="樂壓Logo" className="logo-img" />
                </div>
                <div className='ap-header-title'>
                    樂壓Talks
                </div>
                <div className="user-menu" ref={dropdownRef}>
                    <div className="user-icon" onClick={handleUserIconClick}>
                        <FontAwesomeIcon icon={faCircleUser} />
                    </div>
                    {showDropdown && (
                        <div className="user-dropdown">
                            <div className="dropdown-item" onClick={goToUserPage}>
                                <FontAwesomeIcon icon={faCircleUser} />
                                <span>{isAdmin ? '管理頁面' : '個人頁面'}</span>
                            </div>
                            <div className="dropdown-item" onClick={onLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span>登出</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;
