import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';

function Header({ setActivePage }) {
    return (
        <>
            <header className="ap-header">
                <div className="logo" onClick={() => setActivePage('home-page')}>
                    <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="樂壓Logo" className="logo-img" />
                </div>
                <div className='ap-header-title'>
                    樂壓Talks
                </div>
                <div className="user-icon" onClick={() => setActivePage('user-page')}>
                    <FontAwesomeIcon icon={faCircleUser} />
                </div>
            </header>
        </>
    );
};

export default Header;
