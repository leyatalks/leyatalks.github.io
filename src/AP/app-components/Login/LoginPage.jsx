import React, { useState } from 'react';
import "./login.css";

function LoginPage({ activePage, setActivePage, setUserInfo }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handle(page) {
        setActivePage(page);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // 清空之前的錯誤訊息
        try {
            const response = await fetch('https://leya-backend-vercel.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usernameOrEmail: username,
                    password: password
                }),
            });

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
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="" className="login-logo" />
            <h2 className="login-title">樂壓Talks</h2>
            <form onSubmit={handleLogin} className="input-group">
                <input
                    className="login-input"
                    type="text"
                    placeholder="Email / 帳號"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="forgot">忘記密碼？</div>
                <button className={`login ${activePage === 'home-page' ? 'active' : 'login-page'}`} type="submit">登入</button>
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
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/donate_example_logo.png" alt="donate"  className='login-donate-logo' />
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/donate_example_logo.png" alt="donate"  className='login-donate-logo' />
            </div>
        </div>
    );
}

export default LoginPage;