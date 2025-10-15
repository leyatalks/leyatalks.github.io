import React, { useState } from 'react';
import "./login.css";

function ForgotPassword({ setActivePage }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        setSuccess(false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('https://leya-backend-vercel.vercel.app/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setMessage(data.message || '重設密碼連結已發送到您的信箱，請檢查您的郵件（包括垃圾郵件資料夾）');
                setEmail('');
            } else {
                setError(data.message || '發送失敗，請確認您的電子郵件地址是否正確');
            }
        } catch (err) {
            console.error('錯誤:', err);
            if (err.name === 'AbortError') {
                setError('請求逾時，請稍後再試');
            } else {
                setError('發生錯誤，請稍後再試');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <a href="/">
                <img 
                    src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" 
                    alt="樂壓Logo" 
                    className="login-logo" 
                />
            </a>
            <h2 className="login-title">忘記密碼</h2>
            
            {!success ? (
                <>
                    <p style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        請輸入您註冊時使用的電子郵件地址<br />
                        我們將發送重設密碼連結到您的信箱
                    </p>

                    <form onSubmit={handleSubmit} className="input-group">
                        <input
                            className="login-input"
                            type="email"
                            placeholder="請輸入您的 Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                        
                        {error && (
                            <p style={{ 
                                color: '#d32f2f', 
                                fontSize: '14px',
                                margin: '10px 0',
                                textAlign: 'center'
                            }}>
                                {error}
                            </p>
                        )}

                        <button 
                            className="login" 
                            type="submit" 
                            disabled={loading}
                            style={{ marginTop: '10px' }}
                        >
                            {loading ? '發送中...' : '發送重設連結'}
                        </button>
                    </form>
                </>
            ) : (
                <div style={{ 
                    padding: '20px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <p style={{ 
                        color: '#2e7d32', 
                        fontSize: '16px',
                        margin: '0',
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }}>
                        ✓ {message}
                    </p>
                </div>
            )}

            <div className="signup" style={{ marginTop: '20px' }}>
                想起密碼了？
                <a 
                    href="#" 
                    className="signup"
                    onClick={(e) => {
                        e.preventDefault();
                        setActivePage('login-page');
                    }}
                    style={{ marginLeft: '5px' }}
                >
                    返回登入
                </a>
            </div>

            <div className="login-donate">
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/shu.png" alt="世新大學校徽" className='shu' />
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/ics.png" alt="資傳系徽" className='ics' />
                <img src="https://shoplineimg.com/5e8da4c99e08ce00119090ae/682c4043f1e727000d963bc5/1200x.webp?source_format=png" alt="donate" className='login-donate-logo' />
                <img src="https://cdn.store-assets.com/s/1359361/f/13666576.png" alt="donate" className='login-donate-logo' />
            </div>
        </div>
    );
}

export default ForgotPassword;
