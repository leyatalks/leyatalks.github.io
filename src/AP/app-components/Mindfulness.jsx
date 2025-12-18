import React, { useState, useEffect, useRef } from 'react';
import './Mindfulness.css';

/* ==========================================================================
   Data Configuration
   ========================================================================== */

const mindfulnessData = {
  nervous: {
    id: 'nervous',
    title: '企鵝CEO的定心練習',
    subtitle: '把緊張轉為穩定',
    bgImage: '/mindfulness/企鵝.PNG',
    videoSrc: '/mindfulness/企鵝.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "ack",
        dialog: [
          "「呼...心跳得好快，手心都出汗了。」",
          "「馬上就要上場了，感覺好像整座冰山都在晃動...」",
          "「沒關係，我們都知道這種感覺。先停下來，與它共處。」"
        ],
        duration: 3
      },
      {
        key: "ground",
        dialog: [
          "「來，學我一樣，把雙腳穩穩地踩在地上。」",
          "「感覺一下地板支撐你的力量，就像企鵝站在堅實的南極冰層上一樣。」",
          "「你很安全，你很穩。現在，只要專注在你的腳底板就好。」"
        ],
        duration: 3
      },
      {
        key: "cooldown",
        dialog: [
          "「現在，我們來幫過熱的腦袋降溫。」",
          "「慢慢吸氣... 想像吸進一口冰涼清爽的空氣...（停頓3秒）」",
          "「慢慢吐氣... 把所有的燥熱和緊張都吐出去，讓身體冷靜下來...（停頓5秒）」",
          "「再來一次，跟著這個涼爽的節奏。」"
        ],
        breathing: true,
        duration: 6
      },
      {
        key: "ready",
        dialog: [
          "「感覺好多了嗎？那個搖晃的感覺是不是變小了？」",
          "「緊張不是壞事，它代表你在乎。」",
          "「你已經準備好了。整理一下領帶，我們自信地上場吧！」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "你很安全，你很穩。",
      "緊張是能量，不是敵人。",
      "把注意力帶回身上。",
      "吸進冷冽，吐出燥熱。",
      "你已經準備好了。"
    ]
  },
  anxious: {
    id: 'anxious',
    title: '熊貓的安定練習',
    subtitle: '讓心慢下來',
    bgImage: '/mindfulness/竹林.JPG',
    videoSrc: '/mindfulness/熊貓.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "empathy",
        dialog: [
          "「嗨...你也覺得腦袋轉個不停，停不下來嗎？」",
          "「我懂這種感覺。螢幕上的事情好像永遠處理不完...」",
          "「嘿，既然我們都在這裡，不如一起暫停一下？就幾分鐘就好。」"
        ],
        duration: 3
      },
      {
        key: "grounding",
        dialog: [
          "「來，試著像我一樣。」",
          "「先把手邊的事情放下，讓雙手空出來。」",
          "「感覺一下你的身體坐在椅子上，或是腳踩在地板上的感覺...那是大地在穩穩地支撐著你。」",
          "「你在這裡是安全的，不需要急著去任何地方。」"
        ],
        duration: 3
      },
      {
        key: "bamboo",
        dialog: [
          "「想像我們現在坐在一片安靜的竹林裡。」",
          "「跟著我的節奏，我們來做幾次『竹林呼吸』。」",
          "「慢慢吸氣... 想像清新的風吹進身體...（持續4秒）」",
          "「輕輕吐氣... 把所有的焦慮像落葉一樣吹走...（持續6秒）」"
        ],
        breathing: true,
        duration: 6
      },
      {
        key: "visual",
        dialog: [
          "「你有發現嗎？當我們靜下來，剛剛那些讓你煩惱的事情，其實就像這塊石頭一樣，它待在那裡，但不會傷害你。」",
          "「你不需要現在就搬走它，你只需要像竹子一樣，站穩，呼吸。」",
          "「風會吹過，焦慮會經過，而你會依然在這裡，堅韌且平靜。」"
        ],
        duration: 4
      },
      {
        key: "return",
        dialog: [
          "「做得很好。感覺稍微輕盈一點了嗎？」",
          "「謝謝你陪我一起練習。」",
          "「帶著這份平靜回到生活中吧。記住，無論多忙，你隨時都可以回到這片竹林。」",
          "「下次見。」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "慢慢來，你不需要急。",
      "先把手邊的事情放下。",
      "你在這裡是安全的。",
      "像竹子一樣，站穩，呼吸。",
      "風會吹過，焦慮會經過。"
    ]
  },
  calm: {
    id: 'calm',
    title: '卯咪的靜謐頻率',
    subtitle: '回到安靜',
    bgImage: '/mindfulness/貓.JPG',
    videoSrc: '/mindfulness/貓咪.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "notice",
        dialog: [
          "「外面的世界好像有點吵，對吧？」",
          "「太多的聲音、太多的訊息，把耳朵都塞滿了。」",
          "「嘿，你需要暫時關掉這些聲音嗎？」"
        ],
        duration: 3
      },
      {
        key: "cancel",
        dialog: [
          "「來，跟我這樣做。」",
          "「想像你戴上了一副魔法耳機。」",
          "「按下開關......」",
          "「世界安靜了，只剩下我們。」"
        ],
        duration: 3
      },
      {
        key: "purr",
        dialog: [
          "「現在，專注聽你心裡的聲音。」",
          "「或者是......聽聽我的呼嚕聲？」",
          "「吸氣......」",
          "「吐氣...... 跟著這個穩定的頻率，什麼都不用想。」"
        ],
        breathing: true,
        duration: 6
      },
      {
        key: "float",
        dialog: [
          "「這就是平靜的感覺。」",
          "「沒有地方要去，沒有事情要做。」",
          "「你就待在這個舒服的頻率裡，直到你想回到世界為止。」",
          "「隨時歡迎回來聽。」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "世界很吵，但你可以很安靜。",
      "把耳機戴上，就更舒服了。",
      "聽見呼嚕，就是回家的路上了。",
      "吸氣、吐氣，慢慢就安靜了。",
      "你可以隨時回到這個頻率。"
    ]
  },
  sleepy: {
    id: 'sleepy',
    title: '倦倦的棉花糖睡眠術',
    subtitle: '準備休息',
    bgImage: '/mindfulness/兔.JPG',
    videoSrc: '/mindfulness/兔子.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "yawn",
        dialog: [
          "「哈......（超長哈欠聲）......」",
          "「終於可以停下來了。你也累壞了吧？」",
          "「眼皮好重喔，身體好像不想動了... 沒關係，我們聽它的。」"
        ],
        duration: 3
      },
      {
        key: "softness",
        dialog: [
          "「來，學我一樣，找個最舒服的姿勢躺好。」",
          "「感覺一下你抱著的枕頭，或者身下的床鋪。」",
          "「它們好軟、好暖和，穩穩地接著你。」"
        ],
        duration: 3
      },
      {
        key: "melting",
        dialog: [
          "「現在，想像你的身體是一顆巨大的棉花糖。」",
          "「從腳趾頭開始......慢慢地融化在床上。」",
          "「膝蓋鬆開了、肚子軟軟的、肩膀沉下去了......」",
          "「最後，連腦袋裡的念頭也融化了。」"
        ],
        duration: 5
      },
      {
        key: "drift",
        dialog: [
          "「什麼都不用擔心了。」",
          "「你很安全，可以放心睡覺。」",
          "「就這樣，輕輕地飄進夢裡吧......」",
          "「晚安...... Zzz......」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "分心也沒關係，你發現了就很好。",
      "腦袋亂很正常，我陪你一起。",
      "不用逼自己專注，只要呼吸就好。",
      "你正在照顧現在的自己。",
      "就算只跟著做一點點也很棒。"
    ]
  },
  sad: {
    id: 'sad',
    title: '吐司的溫柔陪伴',
    subtitle: '我陪著你',
    bgImage: '/mindfulness/吐司.JPG',
    videoSrc: '/mindfulness/吐司.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "soggy",
        dialog: [
          "「今天的空氣，好像有點重...」",
          "「心裡濕濕冷冷的，感覺自己變得軟趴趴，提不起勁。」",
          "「沒關係，就算是吐司，也有不想酥脆的時候。」"
        ],
        duration: 3
      },
      {
        key: "hug",
        dialog: [
          "「這時候，我們不需要急著變好。」",
          "「像我一樣，輕輕抱住那個難過的自己。」",
          "「告訴自己：『我不是一個人，還有人陪著你。』」",
          "「允許這份難過存在，讓它在你懷裡休息一下。」"
        ],
        duration: 3
      },
      {
        key: "bake",
        dialog: [
          "「感覺到了嗎？懷裡的愛心有一點溫度。」",
          "「慢慢吸氣... 想像溫暖的香氣充滿全身...」",
          "「慢慢吐氣... 把心裡的濕氣都排出去...」",
          "「我們正在用呼吸，把自己重新烘焙得暖烘烘的。」"
        ],
        breathing: true,
        duration: 6
      },
      {
        key: "fresh",
        dialog: [
          "「辛苦你了。」",
          "「有沒有覺得身體輕了一點？溫暖了一點？」",
          "「你擁有自我療癒的力量，就像剛出爐的麵包一樣溫暖。」",
          "「帶著這份暖意，繼續前進吧。」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "你不需要急著變好。",
      "抱住自己一下就好。",
      "慢慢吸氣，讓溫度進來。",
      "慢慢吐氣，把濕氣放掉。",
      "你正在把自己烘乾、烘暖。"
    ]
  },
  excited: {
    id: 'excited',
    title: '狐妮的陽光收藏罐',
    subtitle: '收藏快樂',
    bgImage: '/mindfulness/狐.JPG',
    videoSrc: '/mindfulness/狐.mp4',
    audioSrc: '/mindfulness/bgm.mp3',
    stages: [
      {
        key: "spark",
        dialog: [
          "「嘿！這裡這裡！你也感覺到了嗎？」",
          "「今天好像發生了什麼好事，心裡覺得暖暖的、跳跳的！」",
          "「這份開心的感覺太珍貴了，我們不要讓它溜走，好嗎？」"
        ],
        duration: 3
      },
      {
        key: "hold",
        dialog: [
          "「來，試著像我這樣。」",
          "「把這份開心的感覺，像珍貴的寶石一樣捧在手心。」",
          "「不需要急著去慶祝，我們先停下來，好好看著它。」"
        ],
        duration: 3
      },
      {
        key: "sunshine",
        dialog: [
          "「現在，我們把這份光芒吸進身體裡。」",
          "「深深吸氣……感覺金色的陽光充滿你的胸口。」",
          "「慢慢吐氣……讓嘴角保持微笑，感覺全身都暖了起來。」",
          "「這份快樂現在屬於你了，誰也拿不走。」"
        ],
        breathing: true,
        duration: 6
      },
      {
        key: "store",
        dialog: [
          "「感覺怎麼樣？是不是充滿電了？」",
          "「把這個感覺存在心裡的小撲滿吧。」",
          "「以後如果遇到陰天，記得拿出來用喔！」",
          "「你值得這麼開心，我們下次見！」"
        ],
        duration: 4
      }
    ],
    thoughtMessages: [
      "分心也沒關係，你發現了就很好。",
      "腦袋亂很正常，我陪你一起。",
      "不用逼自己專注，只要呼吸就好。",
      "你正在照顧現在的自己。",
      "就算只跟著做一點點也很棒。"
    ]
  }
};

const moodConfig = {
  nervous: { emoji: "🐧", desc: "把緊張轉為穩定。", speech: "我們慢慢來。", subtitle: "企鵝CEO的定心練習。" },
  anxious: { emoji: "🐼", desc: "讓心慢下來。", speech: "我會陪著你。", subtitle: "熊貓的安定練習。" },
  calm: { emoji: "🐱", desc: "回到安靜。", speech: "戴上耳機。", subtitle: "卯咪的靜謐頻率。" },
  sleepy: { emoji: "🐰", desc: "準備休息。", speech: "慢慢關機。", subtitle: "倦倦的棉花糖睡眠術。" },
  sad: { emoji: "🍞", desc: "我陪著你。", speech: "現在就很好。", subtitle: "吐司的溫柔陪伴。" },
  excited: { emoji: "🦊", desc: "收藏快樂。", speech: "這份感覺很開心。", subtitle: "狐妮的陽光收藏罐。" }
};

/* ==========================================================================
   Components
   ========================================================================== */

function MindfulnessMenu({ onSelectMood }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [avatarEmoji, setAvatarEmoji] = useState("");
  const [speechText, setSpeechText] = useState("嗨～選一個現在的狀態，讓我們陪你慢慢呼吸。");
  const [subtitleText, setSubtitleText] = useState("每個角色都有一段屬於它的正念故事。");
  const [moodDesc, setMoodDesc] = useState("不用想太久，第一個浮現的選項就可以。");

  const handleMoodClick = (mood) => {
    setSelectedMood(mood);
    const config = moodConfig[mood];
    setAvatarEmoji(config.emoji);
    setSpeechText(config.speech);
    setSubtitleText(config.subtitle);
    setMoodDesc(config.desc);
  };

  const handleStart = () => {
    if (selectedMood) {
      onSelectMood(selectedMood);
    }
  };

  return (
    <div className="mindfulness-menu">
      <div className="mindfulness-bg" style={{ backgroundImage: 'url("/mindfulness/樂壓.jpg")' }}></div>
      <div className="mindfulness-card">
        <div className="menu-header">
          <div className="menu-avatar" style={{ backgroundImage: 'url("/mindfulness/Logo.jpg")' }}>
            {/* Fallback if image fails or just overlay emoji if needed, but CSS uses bg image */}
            {!selectedMood && ""}
            {/* {selectedMood && moodConfig[selectedMood].emoji} */}
          </div>
          <div className="menu-speech">{speechText}</div>
        </div>

        <div className="menu-title">正念冥想</div>
        <div className="menu-subtitle">{subtitleText}</div>

        <div className="section-title">今天的你，比較接近哪一種？</div>

        <div className="mood-list">
          <button className={`mood-btn ${selectedMood === 'nervous' ? 'active' : ''}`} onClick={() => handleMoodClick('nervous')}>緊張</button>
          <button className={`mood-btn ${selectedMood === 'anxious' ? 'active' : ''}`} onClick={() => handleMoodClick('anxious')}>焦慮</button>
          <button className={`mood-btn ${selectedMood === 'calm' ? 'active' : ''}`} onClick={() => handleMoodClick('calm')}>平靜</button>
          <button className={`mood-btn ${selectedMood === 'sleepy' ? 'active' : ''}`} onClick={() => handleMoodClick('sleepy')}>疲累</button>
          <button className={`mood-btn ${selectedMood === 'sad' ? 'active' : ''}`} onClick={() => handleMoodClick('sad')}>難過</button>
          <button className={`mood-btn ${selectedMood === 'excited' ? 'active' : ''}`} onClick={() => handleMoodClick('excited')}>快樂</button>
        </div>

        <div className="mood-desc">{moodDesc}</div>

        <button className="btn-primary" disabled={!selectedMood} onClick={handleStart}>
          開始
        </button>
      </div>
    </div>
  );
}

function MindfulnessExercise({ config, onBack }) {
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showBreatheCircle, setShowBreatheCircle] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [thoughtBubbles, setThoughtBubbles] = useState([]);

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const timersRef = useRef([]);
  const stateRef = useRef({ stageIndex: 0, lineIndex: 0 });
  const isRunningRef = useRef(isRunning);

  // Thought bubbles logic
  useEffect(() => {
    const spawnThought = () => {
      const id = Date.now();
      const msg = config.thoughtMessages[Math.floor(Math.random() * config.thoughtMessages.length)];
      const left = 20 + Math.random() * 60;
      const duration = 8000 + Math.random() * 6000;
      const scale = 0.9 + Math.random() * 0.4;

      setThoughtBubbles(prev => [...prev, { id, msg, left, duration, scale }]);

      // Remove bubble after animation
      setTimeout(() => {
        setThoughtBubbles(prev => prev.filter(b => b.id !== id));
      }, duration);
    };

    const interval = setInterval(spawnThought, 5000);
    return () => clearInterval(interval);
  }, [config.thoughtMessages]);

  // Audio control
  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && bgmEnabled) {
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isRunning, bgmEnabled]);

  // Sync isRunning ref
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Sequence logic
  useEffect(() => {
    if (!isRunning) {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        return;
    }

    const playNext = () => {
        if (!isRunningRef.current) return;

        const { stageIndex, lineIndex } = stateRef.current;
        const stages = config.stages;

        if (stageIndex >= stages.length) {
            setFinished(true);
            setIsRunning(false);
            setShowBreatheCircle(false);
            return;
        }

        const stage = stages[stageIndex];
        setShowBreatheCircle(!!stage.breathing);

        if (lineIndex >= stage.dialog.length) {
            // Stage complete
            const timer = setTimeout(() => {
                stateRef.current.stageIndex++;
                stateRef.current.lineIndex = 0;
                setShowSubtitle(false);
                setSubtitle("");
                playNext();
            }, stage.duration * 1000);
            timersRef.current.push(timer);
            return;
        }

        // Show line
        const line = stage.dialog[lineIndex];
        setShowSubtitle(false);
        
        setTimeout(() => {
             setSubtitle(line);
             setShowSubtitle(true);
        }, 50);

        stateRef.current.lineIndex++;
        const timer = setTimeout(playNext, 3200);
        timersRef.current.push(timer);
    };

    playNext();

    return () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };
  }, [isRunning, config]);

  const handleStart = () => {
    if (finished) {
        stateRef.current = { stageIndex: 0, lineIndex: 0 };
        setFinished(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setFinished(false);
    stateRef.current = { stageIndex: 0, lineIndex: 0 };
    setSubtitle("");
    setShowSubtitle(false);
    setShowBreatheCircle(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleBack = () => {
    handleStop();
    onBack();
  };

  // Auto start on mount
  useEffect(() => {
      handleStart();
      return () => handleStop();
  }, []);

  return (
    <div className="mindfulness-wrapper">
      <div className="exercise-overlay">
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${config.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}></div>
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.7))', zIndex: 1 }}></div>

        <div className="thought-layer">
          {thoughtBubbles.map(b => (
            <div key={b.id} className="thought-bubble" style={{ left: `${b.left}%`, animationDuration: `${b.duration}ms`, transform: `scale(${b.scale})` }}>
              {b.msg}
            </div>
          ))}
        </div>

        <div className="back-home" onClick={handleBack}>← 返回入口</div>

        <div className="exercise-controls">
          <button className="icon-btn" onClick={handleStart} disabled={isRunning || finished} title="開始"><span>▶</span></button>
          <button className="icon-btn" onClick={handlePause} disabled={!isRunning} title="暫停"><span>⏸</span></button>
          <button className="icon-btn" onClick={handleStop} disabled={!isRunning && !finished} title="停止"><span>⏹</span></button>
          <button className="icon-btn" onClick={() => setBgmEnabled(!bgmEnabled)} title="背景音樂開關">
            <span>{bgmEnabled ? "🔊" : "🔇"}</span>
          </button>
        </div>

        <header className="exercise-header">
          <div className="header-title">{config.title}</div>
          <div className="header-subtitle">{config.subtitle}</div>
        </header>

        <div className="character-box">
          <div className="character-inner">
            <div className="character-video">
              <video ref={videoRef} src={config.videoSrc} autoPlay muted loop playsInline />
            </div>
            <div className={`breathe-circle ${showBreatheCircle ? 'show' : ''}`}>
              {config.id === 'calm' ? '吸氣 · 吐氣 · 跟著呼嚕' : 
               config.id === 'nervous' ? '吸氣 · 吐氣 · 降溫' :
               config.id === 'anxious' ? '吸氣 · 吐氣 · 吹走焦慮' :
               config.id === 'excited' ? '深深吸氣 · 慢慢吐氣' :
               config.id === 'sad' ? '慢慢吸氣 · 慢慢吐氣' : '吸氣 · 吐氣'}
            </div>
          </div>
        </div>

        <div className="subtitle-box">
          <div className={`subtitle-text ${showSubtitle ? 'show' : ''}`}>{subtitle}</div>
        </div>

        <audio ref={audioRef} src={config.audioSrc} loop />
      </div>
    </div>
  );
}

function Mindfulness() {
  const [currentView, setCurrentView] = useState('menu'); // 'menu' or mood key

  const handleSelectMood = (mood) => {
    setCurrentView(mood);
  };

  const handleBack = () => {
    setCurrentView('menu');
  };

  return (
    <div className="mindfulness-app">
      {currentView === 'menu' ? (
        <MindfulnessMenu onSelectMood={handleSelectMood} />
      ) : (
        <MindfulnessExercise config={mindfulnessData[currentView]} onBack={handleBack} />
      )}
    </div>
  );
}

export default Mindfulness;