import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWater, faSoap, faExplosion, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Game.css';

const games = [
    {
        id: 'water',
        title: '水波紋',
        description: '輕點水面，感受漣漪擴散的寧靜',
        icon: faWater,
        path: '/games/water.html',
        color: '#b6e2ff'
    },
    {
        id: 'bubble',
        title: '舒壓泡泡紙',
        description: '無限戳破泡泡，釋放你的壓力',
        icon: faSoap,
        path: '/games/bubble.html',
        color: '#FFE5B4'
    },
    {
        id: 'fireworks',
        title: '煙火',
        description: '點擊夜空，綻放絢麗的煙火',
        icon: faExplosion,
        path: '/games/fireworks.html',
        color: '#0b122b',
        textColor: '#fff'
    }
];

function GamePage() {
    const [activeGame, setActiveGame] = useState(null);

    const handleGameClick = (game) => {
        setActiveGame(game);
    };

    const handleBackClick = () => {
        setActiveGame(null);
    };

    if (activeGame) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <button 
                    onClick={handleBackClick}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333'
                    }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    返回
                </button>
                <iframe 
                    src={activeGame.path} 
                    style={{ width: '100%', height: '100%', border: 'none', flex: 1 }} 
                    title={activeGame.title}
                />
            </div>
        );
    }

    return (
        <div className="gp-container">
            <h1 style={{ 
                textAlign: 'center', 
                marginBottom: '2rem', 
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: 'bold'
            }}>
                紓壓小遊戲
            </h1>
            <div className="game-grid">
                {games.map((game) => (
                    <div 
                        key={game.id} 
                        onClick={() => handleGameClick(game)}
                        className='game-card'
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                        }}
                    >
                        <div className='game-content' style={{
                            backgroundColor: game.color, 
                            color: game.textColor || '#333',
                        }}>
                            <FontAwesomeIcon icon={game.icon} />
                        </div>
                        <div style={{ 
                            flex: 1, 
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#333' }}>{game.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{game.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GamePage;