import React, { useState } from 'react';
import "./login.css";

function LoginPage({ activePage, setActivePage, setUserInfo }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handle(page) {
        setActivePage(page);
    }

    // 訪客模式登入
    const handleGuestLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const data = { nickname: '訪客模式', id: 'shuics' };
            setUserInfo(data);
            setActivePage('home-page');
        } catch (err) {
            console.error('訪客模式登入錯誤:', err);
            setError('訪客模式登入失敗');
        } finally {
            setLoading(false);
        }
    };

    // 登入函數加上重試機制
    const handleLogin = async (e, retryCount = 0) => {
        e.preventDefault();
        setError(''); // 清空之前的錯誤訊息
        setLoading(true);

        const maxRetries = 2; // 最多重試2次
        const timeout = 15000; // 15秒超時

        try {
            // 設定超時控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch('https://leya-backend-vercel.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usernameOrEmail: username,
                    password: password
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log('登入成功:', data);
                setUserInfo({ nickname: data.nickname, id: data.id });
                setActivePage('home-page');
            } else {
                // 當登入失敗時，設置錯誤訊息
                const errorData = await response.json();
                setError(errorData.message || '帳號或密碼錯誤'); // 使用伺服器返回的錯誤訊息，若無則使用預設訊息
            }
        } catch (err) {
            console.error('錯誤:', err);

            // 如果是超時錯誤且還有重試次數
            if (err.name === 'AbortError' && retryCount < maxRetries) {
                setError(`連線超時，正在重試 (${retryCount + 1}/${maxRetries})...`);
                setLoading(false);
                // 等待1秒後重試
                setTimeout(() => {
                    handleLogin(e, retryCount + 1);
                }, 1000);
                return;
            }

            // 已達最大重試次數或其他錯誤
            if (err.name === 'AbortError') {
                setError('伺服器回應逾時，請檢查網路連線或稍後再試。您也可以使用訪客模式體驗功能。');
            } else {
                setError(err.message || '發生未知錯誤');
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <a href="/">
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="" className="login-logo" />
            </a>
            <h2 className="login-title">樂壓Talks</h2>
            <form onSubmit={handleLogin} className="input-group">
                <input
                    className="login-input"
                    type="text"
                    placeholder="Email / 帳號"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="forgot" style={{ cursor: 'pointer' }} onClick={() => handle('forgot-password')}>
                    忘記密碼？
                </div>
                <button className={`login ${activePage === 'home-page' ? 'active' : 'login-page'}`} type="submit" disabled={loading}>
                    {loading ? '登入中…' : '登入'}
                </button>
                <button
                    className="login guest-login"
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={loading}
                    style={{
                        border: '2px solid #ff8fa473',
                        color: '#ff8fa4',
                        backgroundColor: 'transparent',
                        marginTop: '10px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#ff8fa4', e.target.style.color = '#fff')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#ff8fa4')}
                >
                    訪客模式 (快速體驗)
                </button>
            </form>

            {/* <div className="divider">── 或使用社群快速登入 ──</div>
            <div className="socials">
                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" onClick={() => handle('home-page')} />
                <img src="https://img.icons8.com/fluency/48/000000/facebook-new.png" alt="Facebook" onClick={() => handle('home-page')} />
            </div> */}

            <div className="signup">
                還沒有帳號？<a href="#" className={`signup ${activePage === 'register' ? 'active' : ''}`} onClick={() => handle('register')}>註冊</a>
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

export default LoginPage;