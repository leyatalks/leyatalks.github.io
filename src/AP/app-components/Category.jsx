import React from 'react';
import { faBrain, faCloudMoon, faClipboardCheck, faClock, faEarthAmericas, faHeart, faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function CategoryPage({ activePage, setActivePage, handleNavigation }) {
    return (
        <>
            <div id="category-page">
                <div className="category-list">
                    <div className="category-row">
                        <div className="category-item">
                            <div className="category-icon"
                                onClick={() => setActivePage('mood-page')}
                                style={{ cursor: "pointer" }}>
                                <FontAwesomeIcon icon={faBook} />
                            </div>
                            <div className="category-name">心情日記</div>
                        </div>
                        <div className="category-item"
                            onClick={() => setActivePage('stress-mind-map')}
                            style={{ cursor: "pointer" }}>
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faHeart} />
                            </div>
                            <div className="category-name">壓力心智圖</div>
                        </div>
                        <div className="category-item"
                            onClick={() => setActivePage('meditation-page')}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faBrain} />
                            </div>
                            <div className="category-name">冥想</div>
                        </div>
                    </div>

                    <div className="category-row">
                        <div className="category-item coming-soon">
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faClipboardCheck} />
                            </div>
                            <div className="category-name">心理測驗</div>
                        </div>
                        <div className="category-item coming-soon">
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className="category-name">即將新增</div>
                        </div>
                        <div className="category-item coming-soon">
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className="category-name">即將新增</div>
                        </div>
                    </div>

                    <div className="category-row">
                        <div className="category-item coming-soon">
                            <div className="category-icon">
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className="category-name">即將新增</div>
                        </div>
                        <div className="category-item coming-soon">
                            <div className="category-icon"
                                onClick={() => setActivePage('secret')}
                                >
                                <FontAwesomeIcon icon={faEarthAmericas} />
                            </div>
                            <div className="category-name">即將新增</div>
                        </div>
                        <div className="category-item">
                                <div className="category-icon" 
                                onClick={() => handleNavigation('home')}
                                style={{ cursor: "pointer" }}
                                >
                                    <FontAwesomeIcon icon={faEarthAmericas} />
                                </div>
                            <div className="category-name">樂壓Talks<br />介紹頁面</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryPage;
