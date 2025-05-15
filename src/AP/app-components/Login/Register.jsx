import React, { useState } from "react";
import "./login.css";

function RegisterPage({ activePage, setActivePage }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function handle(page) {
        setActivePage(page);
    }

    async function handleRegister(e) {
        e && e.preventDefault();
        if (!email || !username || !password || !nickname) {
            setErrorMsg("請填寫所有欄位");
            return;
        }

        if (!email.includes('@')) {
            setErrorMsg("請輸入有效的電子郵件");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("密碼長度至少需要6個字符");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await fetch("https://leya-backend-vercel.vercel.app/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, username, password, nickname }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("註冊成功！請登入");
                handle("login-page");
            } else {
                setErrorMsg(data.message || "註冊失敗，請稍後再試");
            }
        } catch (error) {
            console.error("註冊錯誤:", error);
            setErrorMsg("伺服器連線錯誤，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/leyalogo.png" alt="" className="login-logo" />
            <h2 className="login-title">樂壓Talks</h2>
            <form onSubmit={handleRegister} className="input-group">
                <input 
                    className="login-input" 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    className="login-input" 
                    type="text" 
                    placeholder="帳號" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input 
                    className="login-input" 
                    type="text" 
                    placeholder="暱稱" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
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
                {errorMsg && <p className="error-message" style={{ color: 'red' }}>{errorMsg}</p>}
                <button 
                    className="login" 
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "處理中..." : "註冊"}
                </button>
            </form>

            {/* <div className="divider">── 或使用社群快速註冊 ──</div>
            <div className="socials">
                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" onClick={() => handle('home-page')} />
                <img src="https://img.icons8.com/fluency/48/000000/facebook-new.png" alt="Facebook" onClick={() => handle('home-page')} />
            </div> */}

            <div className="signup">
                已經有帳號了？<a href="#" className={`signup ${activePage === 'login-page' ? 'active' : ''}`} onClick={() => handle('login-page')}>登入</a>
            </div>

            <div className="login-donate">
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/shu.png" alt="世新大學校徽" className='shu' />
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/ics.png" alt="資傳系徽" className='ics' />
                <img src="https://raw.githubusercontent.com/ChenXi0731/leya-fronted/refs/heads/main/public/donate_example_logo.png" alt="donate"  className='login-donate-logo' />
            </div>
        </div>
    );
}

export default RegisterPage;