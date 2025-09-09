import { useState, useEffect, useRef } from 'react'
import './MeditationPage.css'

function MeditationPage() {
    // 狀態管理
    const [timeLeft, setTimeLeft] = useState(300) // 5分鐘預設
    const [isRunning, setIsRunning] = useState(false)
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [breathText, setBreathText] = useState('吸氣')
    const [selectedSound, setSelectedSound] = useState('water')
    const [userMinutes, setUserMinutes] = useState(5)
    
    // Refs
    const countdownRef = useRef(null)
    const waterAudioRef = useRef(null)
    const metronomeAudioRef = useRef(null)
    const fireAudioRef = useRef(null)
    const countdownSoundRef = useRef(null)
    const breathIntervalRef = useRef(null)

    // 音效初始化
    useEffect(() => {
        try {
            waterAudioRef.current = new Audio('https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg')
            metronomeAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/radiation_meter.ogg')
            fireAudioRef.current = new Audio('https://actions.google.com/sounds/v1/ambiences/fire.ogg?hl=zh-tw')
            countdownSoundRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')
            
            // 設置循環播放
            const audioElements = [waterAudioRef.current, metronomeAudioRef.current, fireAudioRef.current]
            audioElements.forEach(audio => {
                if (audio) {
                    audio.loop = true
                }
            })
        } catch (error) {
            console.warn('音效初始化失敗:', error)
        }
    }, [])

    // 呼吸文字動畫
    useEffect(() => {
        breathIntervalRef.current = setInterval(() => {
            setBreathText(prev => prev === '吸氣' ? '呼氣' : '吸氣')
        }, 4000)
        
        return () => clearInterval(breathIntervalRef.current)
    }, [])

    // 更新計時器顯示
    const updateTimerDisplay = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 播放選中的音效
    const playSelectedSound = () => {
        try {
            // 停止所有音效
            const audioElements = [waterAudioRef.current, metronomeAudioRef.current, fireAudioRef.current]
            audioElements.forEach(audio => {
                if (audio) audio.pause()
            })
            
            // 播放選中的音效
            const currentSound = getCurrentSound()
            if (currentSound) {
                currentSound.currentTime = 0
                currentSound.play().catch(error => {
                    console.warn('音效播放失敗:', error)
                })
            }
        } catch (error) {
            console.warn('音效播放錯誤:', error)
        }
    }

    // 獲取當前音效
    const getCurrentSound = () => {
        switch (selectedSound) {
            case 'water': return waterAudioRef.current
            case 'metronome': return metronomeAudioRef.current
            case 'fire': return fireAudioRef.current
            default: return waterAudioRef.current
        }
    }

    // 開始倒數計時
    const startCountdown = () => {
        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1
                
                // 倒數3秒提示音
                if (newTime <= 3 && newTime > 0) {
                    if (countdownSoundRef.current) {
                        countdownSoundRef.current.currentTime = 0
                        countdownSoundRef.current.play().catch(error => {
                            console.warn('倒數提示音播放失敗:', error)
                        })
                    }
                }
                
                // 冥想結束
                if (newTime <= 0) {
                    clearInterval(countdownRef.current)
                    const currentSound = getCurrentSound()
                    if (currentSound) currentSound.pause()
                    if (countdownSoundRef.current) countdownSoundRef.current.pause()
                    
                    alert('冥想結束，放鬆一下！')
                    setIsRunning(false)
                    return 0
                }
                
                return newTime
            })
        }, 1000)
    }

    // 開始/暫停按鈕
    const handleStartPause = () => {
        if (!isRunning) {
            // 開始或繼續
            if (timeLeft <= 0 || timeLeft === userMinutes * 60) {
                const minutes = userMinutes < 1 ? 5 : userMinutes
                setTimeLeft(minutes * 60)
            }
            startCountdown()
            playSelectedSound()
            setIsRunning(true)
        } else {
            // 暫停
            clearInterval(countdownRef.current)
            const currentSound = getCurrentSound()
            if (currentSound) currentSound.pause()
            setIsRunning(false)
        }
    }

    // 重新開始
    const handleRestart = () => {
        clearInterval(countdownRef.current)
        const minutes = userMinutes < 1 ? 5 : userMinutes
        setTimeLeft(minutes * 60)
        playSelectedSound()
        startCountdown()
        setIsRunning(true)
    }

    // 切換黑屏模式
    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode)
    }

    // 清理
    useEffect(() => {
        return () => {
            clearInterval(countdownRef.current)
            clearInterval(breathIntervalRef.current)
        }
    }, [])

    return (
        <div className={`meditation-container ${isFocusMode ? 'focus-mode' : ''}`}>
            <div className="breath-circle-container" onClick={toggleFocusMode}>
                <div className="breath-circle"></div>
                <div className="breath-text">{breathText}</div>
            </div>

            <div className="controls">
                <div className="input-group">
                    <label htmlFor="timeInput">設定冥想時間(分鐘): </label>
                    <input 
                        type="number" 
                        id="timeInput" 
                        value={userMinutes} 
                        min="1" 
                        max="120"
                        onChange={(e) => setUserMinutes(parseInt(e.target.value) || 5)}
                        style={{textAlign: 'center', fontSize: '1.2rem'}}
                    />
                </div>

                <div className="timer">{updateTimerDisplay(timeLeft)}</div>
                
                <div className="button-group">
                    <button onClick={handleStartPause}>
                        {isRunning ? '暫停' : (timeLeft <= 0 ? '開始冥想' : '開始')}
                    </button>
                    <button onClick={handleRestart}>重新開始</button>
                    <button onClick={toggleFocusMode}>黑屏模式</button>
                </div>

                <div className="input-group">
                    <label htmlFor="soundSelect">選擇引導音效: </label>
                    <select 
                        id="soundSelect" 
                        value={selectedSound}
                        onChange={(e) => setSelectedSound(e.target.value)}
                        style={{backgroundColor: '#FAEAD3'}}
                    >
                        <option value="water">水滴聲</option>
                        <option value="metronome">蟬聲</option>
                        <option value="fire">火焰</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default MeditationPage