import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./login.css";

function ResetPassword({ setActivePage }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // 驗證 token 是否有效
    useEffect(() => {
        if (!token) {
            setError('無效的重設連結');
            setValidatingToken(false);
            return;
        }

        const validateToken = async () => {
            try {
                const response = await fetch(`https://leya-backend-vercel.vercel.app/validate-reset-token?token=${encodeURIComponent(token)}`);
                const data = await response.json();

                if (response.ok && data.valid) {
                    setTokenValid(true);
                } else {
                    setError(data.message || '此重設連結已過期或無效');
                }
            } catch (err) {
                setError('驗證連結時發生錯誤');
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // 驗證密碼
        if (password.length < 6) {
            setError('密碼長度至少需要 6 個字元');
            return;
        }

        if (password !== confirmPassword) {
            setError('兩次輸入的密碼不一致');
            return;
        }

        setLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('https://leya-backend-vercel.vercel.app/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: password
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setMessage('密碼重設成功！3 秒後將跳轉到登入頁面...');
                
                // 3 秒後跳轉到登入頁面
                setTimeout(() => {
                    if (setActivePage) {
                        setActivePage('login-page');
                    } else {
                        navigate('/leya/login');
                    }
                }, 3000);
            } else {
                setError(data.message || '密碼重設失敗，請重試');
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

    if (validatingToken) {
        return (
            <div className="login-container">
                <img 
                    src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" 
                    alt="樂壓Logo" 
                    className="login-logo" 
                />
                <h2 className="login-title">重設密碼</h2>
                <p style={{ textAlign: 'center', color: '#666' }}>驗證連結中...</p>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="login-container">
                <img 
                    src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" 
                    alt="樂壓Logo" 
                    className="login-logo" 
                />
                <h2 className="login-title">重設密碼</h2>
                <div style={{ 
                    padding: '20px',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <p style={{ 
                        color: '#c62828', 
                        fontSize: '16px',
                        margin: '0',
                        textAlign: 'center'
                    }}>
                        ✕ {error || '此重設連結已過期或無效'}
                    </p>
                </div>
                <div className="signup">
                    <a 
                        href="#" 
                        className="signup"
                        onClick={(e) => {
                            e.preventDefault();
                            if (setActivePage) {
                                setActivePage('forgot-password');
                            } else {
                                navigate('/leya/forgot-password');
                            }
                        }}
                    >
                        重新發送重設連結
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <img 
                src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" 
                alt="樂壓Logo" 
                className="login-logo" 
            />
            <h2 className="login-title">重設密碼</h2>

            {!success ? (
                <>
                    <p style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        請輸入您的新密碼
                    </p>

                    <form onSubmit={handleSubmit} className="input-group">
                        <input
                            className="login-input"
                            type="password"
                            placeholder="新密碼（至少 6 個字元）"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            minLength={6}
                        />

                        <input
                            className="login-input"
                            type="password"
                            placeholder="確認新密碼"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                            minLength={6}
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
                            {loading ? '重設中...' : '重設密碼'}
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

            <div className="login-donate">
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/shu.png" alt="世新大學校徽" className='shu' />
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/ics.png" alt="資傳系徽" className='ics' />
                <img src="https://shoplineimg.com/5e8da4c99e08ce00119090ae/682c4043f1e727000d963bc5/1200x.webp?source_format=png" alt="donate" className='login-donate-logo' />
                <img src="https://cdn.store-assets.com/s/1359361/f/13666576.png" alt="donate" className='login-donate-logo' />
            </div>
        </div>
    );
}

export default ResetPassword;
