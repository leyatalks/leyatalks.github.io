import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './CharacterPage.module.css';

// DailyTasks 子組件
function DailyTasks({ tasks, onTaskClick }) {
  return (
    <div className={`${styles.card} ${styles.tasksCard}`}>
      <h2 className={styles.sectionTitle}>每日任務</h2>
      <ul className={styles.taskList}>
        {tasks.map(t => (
          <li key={t.id} className={`${styles.taskItem} ${t.completed ? styles.completed : ''}`}> 
            <label>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => onTaskClick(t.id)}
                disabled={t.completed}
              />
              <span>{t.text}</span>
              {t.completed && <span className={styles.expTag}>+{t.exp} EXP</span>}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

// CharacterPanel 子組件
function CharacterPanel({ player, cooldowns, onInteraction, config }) {
  const interactions = [
    { type: 'encourage', label: config.encourage.label, exp: config.encourage.exp },
    { type: 'chat', label: config.chat.label, exp: config.chat.exp },
    { type: 'meditate', label: config.meditate.label, exp: config.meditate.exp },
  ];

  const progress = Math.min(100, (player.currentExp / player.maxExp) * 100);
  const base = import.meta.env.BASE_URL || '/';

  return (
    <div className={`${styles.card} ${styles.characterCard}`}>
      <h2 className={styles.sectionTitle}>CEO</h2>
      <div className={styles.characterContainer}> 
        {/* 外環圖片 */}
        <img
          src={`${base}character/wreath.svg`}
          alt="wreath"
          className={styles.wreathImage}
          onError={(e) => { e.currentTarget.style.opacity = 0.15; }}
        />
        {/* 角色圖片：絕對定位置中 */}
        <img
          src={`${base}character/penguin.png`}
          alt="character"
          className={styles.characterImage}
          onError={(e) => { e.currentTarget.style.opacity = 0.8; }}
        />
      </div>
      <div className={styles.levelRow}>
        <span className={styles.level}>LV. {player.level}</span>
        <span className={styles.nextLevel}>Next Level: {player.currentExp}/{player.maxExp} EXP</span>
      </div>
      <div className={styles.expBarWrapper}>
        <div className={styles.expBarTrack}>
          <div className={styles.expBarFill} style={{ width: progress + '%' }} />
        </div>
      </div>
      <div className={styles.interactionButtons}>
        {interactions.map(btn => {
          const cd = cooldowns[btn.type];
          return (
            <button
              key={btn.type}
              className={styles.interactionBtn}
              onClick={() => onInteraction(btn.type)}
              disabled={cd > 0}
            >
              <span>{btn.label}</span>
              <small className={styles.btnSub}>{cd > 0 ? cd + 's' : '+' + btn.exp + ' EXP'}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Achievements 子組件
function Achievements({ achievements }) {
  return (
    <div className={`${styles.card} ${styles.achievementsCard}`}>
      <h2 className={styles.sectionTitle}>成就列表</h2>
      <div className={styles.achievementsGrid}>
        {achievements.map(ach => (
          <div
            key={ach.id}
            className={`${styles.achievementCell} ${ach.unlocked ? styles.unlocked : styles.locked}`}
          >
            <div className={styles.achievementIcon}>{ach.icon}</div>
            <div className={styles.achievementName}>{ach.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 主組件 CharacterPage
function CharacterPage() {
  // 統一互動設定，避免顯示與實際加成不一致
  const INTERACTION_CONFIG = {
    encourage: { label: '鼓勵', exp: 3, cd: 2 },
    chat: { label: '聊天', exp: 10, cd: 20 },
    meditate: { label: '冥想', exp: 25, cd: 40 },
  };
  // Player 狀態
  const [player, setPlayer] = useState({ level: 0, currentExp: 30, maxExp: 100 });
  // 任務狀態 (示意/可再擴充)
  const [tasks, setTasks] = useState([
    { id: 'task1', text: '紀錄今天的心情', completed: false, exp: 10 },
    { id: 'task2', text: '回想今天最值得紀念的事情', completed: false, exp: 10 },
    { id: 'task3', text: '冥想5分鐘', completed: true, exp: 10 },
  ]);
  // 成就狀態 (示意多格填充 UI)
  const [achievements] = useState([
    { id: 'ach1', name: '初出茅廬', unlocked: true, icon: '🏆' },
    { id: 'ach2', name: '尚未解鎖', unlocked: false, icon: '❓' },
    { id: 'ach3', name: '尚未解鎖', unlocked: false, icon: '❓' },
    { id: 'ach4', name: '尚未解鎖', unlocked: false, icon: '❓' },
    { id: 'ach5', name: '尚未解鎖', unlocked: false, icon: '❓' },
    { id: 'ach6', name: '尚未解鎖', unlocked: false, icon: '❓' },
  ]);
  // 互動冷卻 (秒)
  const [cooldowns, setCooldowns] = useState({ encourage: 0, chat: 0, meditate: 0 });
  // 以 ref 同步保存冷卻，避免同個事件循環內的連點造成誤觸發
  const cooldownsRef = useRef(cooldowns);
  useEffect(() => { cooldownsRef.current = cooldowns; }, [cooldowns]);

  // 增加經驗值並處理升級
  const addExp = useCallback((amount) => {
    // 轉整數，避免浮點數造成視覺上的「多加/少加」錯覺
    const inc = Math.round(amount);
    setPlayer(prev => {
      let { level, currentExp, maxExp } = prev;
      currentExp = currentExp + inc;
      // 升級邏輯：可能出現一次加很多 EXP 的情況，使用 while
      while (currentExp >= maxExp) {
        currentExp -= maxExp; // 剩餘經驗值溢出保留
        level += 1;
        maxExp = Math.round(maxExp * 1.1); // 假設升級後需求 +10%
      }
      return { ...prev, level, currentExp, maxExp };
    });
  }, []);

  // 點擊任務
  const handleTaskClick = useCallback((taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && !t.completed) {
        addExp(t.exp);
        return { ...t, completed: true };
      }
      return t;
    }));
  }, [addExp]);

  // 互動處理 + 冷卻設定
  const handleInteraction = useCallback((type) => {
    // 先用 ref 立即判斷，避免同一個事件循環內因 state 尚未更新而觸發兩次
    if (cooldownsRef.current[type] > 0) return;
    const cfg = INTERACTION_CONFIG[type];
    if (!cfg) return;
    addExp(cfg.exp);
    setCooldowns(prev => ({ ...prev, [type]: cfg.cd }));
  }, [addExp]);

  // 冷卻倒數 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) { updated[key] -= 1; changed = true; }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.pageContainer}>
      <DailyTasks tasks={tasks} onTaskClick={handleTaskClick} />
      <CharacterPanel player={player} cooldowns={cooldowns} onInteraction={handleInteraction} config={INTERACTION_CONFIG} />
      <Achievements achievements={achievements} />
    </main>
  );
}

export default CharacterPage;
