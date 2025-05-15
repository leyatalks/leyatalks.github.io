import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker, setupPWAInstallPrompt } from './registerSW'

// 注册Service Worker
registerServiceWorker();

// 设置PWA安装提示
setupPWAInstallPrompt();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
