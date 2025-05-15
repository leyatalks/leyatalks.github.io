import { useState } from 'react'
import './ap.css'
import Header from './app-components/Header'
import Footer from './app-components/Footer'
import Post from './app-components/Post'
import CategoryPage from './app-components/Category'
import ChatPage from './app-components/ChatPage'
import UserPage from './app-components/UserPage'
import LoginPage from './app-components/Login/LoginPage'
import RegisterPage from './app-components/Login/Register'
import Sercet from './app-components/Sand'


function Application() {
    const [activePage, setActivePage] = useState('login-page')
    const [userInfo, setUserInfo] = useState({ nickname: '', id: '' })

    const whiteList = ["login-page", "register"]

    const renderPage = () => {
        switch (activePage) {
            case 'home-page':
                return <Post />
            case 'category-page':
                return <CategoryPage  activePage={activePage} setActivePage={setActivePage} />
            case 'chat-page':
                return <ChatPage />
            case 'user-page':
                return <UserPage activePage={activePage} setActivePage={setActivePage} userInfo={userInfo} />
            case 'login-page':
                return <LoginPage activePage={activePage} setActivePage={setActivePage} setUserInfo={setUserInfo} />
            case 'register':
                return <RegisterPage activePage={activePage} setActivePage={setActivePage}/>
            case 'secret':
                return <Sercet activePage={activePage} setActivePage={setActivePage}/>
            default:
                return <Post />
        }
    }

    return (
            <div id='app'>
                <div className='ap-page-container'>
                    { !whiteList.includes(activePage) && <Header setActivePage={setActivePage} /> }
                    <div className="content-area">
                        {renderPage()}
                    </div>
                    { !whiteList.includes(activePage) && <Footer activePage={activePage} setActivePage={setActivePage} /> }
                </div>
            </div>
    )
}

export default Application