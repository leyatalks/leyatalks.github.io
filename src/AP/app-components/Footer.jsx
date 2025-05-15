import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faTableCells, faCommentDots } from '@fortawesome/free-solid-svg-icons'


function Footer({ activePage, setActivePage }) {
    return (
        <>
            <footer className="footer">
                <div 
                    className={`nav-item ${activePage === 'home-page' ? 'active' : ''}`} 
                    onClick={() => setActivePage('home-page')}
                >
                    <FontAwesomeIcon icon={faHouse} />
                </div>
                <div 
                    className={`nav-item ${activePage === 'category-page' ? 'active' : ''}`} 
                    onClick={() => setActivePage('category-page')}
                >
                    <FontAwesomeIcon icon={faTableCells} />
                </div>
                <div 
                    className={`nav-item ${activePage === 'chat-page' ? 'active' : ''}`} 
                    onClick={() => setActivePage('chat-page')}
                >
                    <FontAwesomeIcon icon={faCommentDots} />
                </div>
            </footer>
        </>
    );
}

export default Footer;
