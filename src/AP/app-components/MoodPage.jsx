import { useState, useEffect } from 'react'

function MoodPage(props) {
	const imagesBase = '/mood/images'
	const storeKey = 'moodJournal'
	console.log('用戶資訊 props.userInfo', props?.userInfo);

	const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
	const [selectedDate, setSelectedDate] = useState('')
	const [modalMoodPath, setModalMoodPath] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [noteText, setNoteText] = useState('')
	// data 結構：{ [dateStr]: { text?: string, mood?: string, id?: number } }
	// 僅保留已同步到資料庫的紀錄（有 id 才顯示）
	const [data, setData] = useState(() => {
		try {
			const saved = localStorage.getItem(storeKey)
			const parsed = saved ? JSON.parse(saved) : {}
			const filtered = {}
			for (const k of Object.keys(parsed || {})) {
				if (parsed[k] && parsed[k].id) filtered[k] = parsed[k]
			}
			return filtered
		} catch (e) {
			return {}
		}
	})

	const MOODS = [
		{ key: '開心', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E9%96%8B%E5%BF%83.PNG" },
		{ key: '平靜', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E5%B9%B3%E9%9D%9C.PNG" },
		{ key: '傷心', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E5%82%B7%E5%BF%83.PNG" },
		{ key: '憤怒', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E6%86%A4%E6%80%92.PNG" },
		{ key: '焦慮', src: "https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/moodPNG/%E7%84%A6%E6%85%AE.PNG" },
	]

	function moodKeyToSrc(key) {
		if (!key) return ''
		const found = MOODS.find(m => m.key === key)
		return found ? found.src : ''
	}

	function dateStrFromCreatedAt(createdAt) {
		if (!createdAt || typeof createdAt !== 'string') return ''
		const m = createdAt.match(/^(\d{4}-\d{2}-\d{2})/)
		return m ? m[1] : ''
	}

	function moodKeyToSrc(key) {
		if (!key) return ''
		const found = MOODS.find(m => m.key === key)
		return found ? found.src : ''
	}

	function dateStrFromCreatedAt(createdAt) {
		if (!createdAt || typeof createdAt !== 'string') return ''
		// 避免時區影響，直接取 YYYY-MM-DD
		const m = createdAt.match(/^(\d{4}-\d{2}-\d{2})/)
		return m ? m[1] : ''
	}

	// 取得 username：優先用 props.userInfo.id；否則讀取 localStorage('userInfo') 的 JSON；最後回退 'demo-visitor'
	const username = (() => {
		if (props?.userInfo?.id) return String(props.userInfo.id)
		try {
			const raw = localStorage.getItem('userInfo')
			if (raw) {
				const parsed = JSON.parse(raw)
				if (parsed?.id) return String(parsed.id)
			}
		} catch {}
		return 'demo-visitor'
	})();

	function todayStr() {
		const d = new Date()
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	}

	function isFuture(dateStr) {
		return new Date(dateStr) > new Date(todayStr())
	}

	function changeMonth(delta) {
		let m = currentMonth + delta
		let y = currentYear
		if (m < 0) {
			m = 11
			y -= 1
		} else if (m > 11) {
			m = 0
			y += 1
		}
		setCurrentMonth(m)
		setCurrentYear(y)
	}

	function openModal(dateStr) {
		if (isFuture(dateStr)) return
		setSelectedDate(dateStr)
		const entry = data[dateStr] || {}
		setModalMoodPath(entry.mood || '')
		setNoteText(entry.text || '')
		setIsModalOpen(true)
	}

	function closeModal() {
		setIsModalOpen(false)
	}

	function quickPick(path) {
		const t = todayStr()
		openModal(t)
		setModalMoodPath(path)
	}

	function handleDateChange(e) {
		const newDate = e.target.value
		if (isFuture(newDate)) {
			alert('未來日期不能寫日記喔！')
			return
		}
		setSelectedDate(newDate)
		const entry = data[newDate] || {}
		setModalMoodPath(entry.mood || '')
		setNoteText(entry.text || '')
	}

	// 從後端載入該使用者已存的心情日記，只用後端資料覆蓋本地，避免顯示暫存
	useEffect(() => {
		let cancelled = false
		async function loadFromServer() {
			if (!username) return
			try {
				const resp = await fetch(`https://leya-backend-vercel.vercel.app/mood-journal?username=${encodeURIComponent(username)}`)
				const json = await resp.json()
				if (cancelled) return
				if (json?.success && Array.isArray(json.items)) {
					const rebuilt = {}
					for (const it of json.items) {
						const dateStr = dateStrFromCreatedAt(it.created_at)
						if (!dateStr) continue
						const moodSrc = moodKeyToSrc(it.mood)
						rebuilt[dateStr] = { id: it.id, text: typeof it.content === 'string' ? it.content : '', mood: moodSrc || '' }
					}
					setData(rebuilt)
					try { localStorage.setItem(storeKey, JSON.stringify(rebuilt)) } catch {}
				}
			} catch (e) {
				console.warn('載入雲端心情日記失敗', e)
			}
		}
		loadFromServer()
		return () => { cancelled = true }
	}, [username])

	// 從後端載入該使用者已存的心情日記，合併到本地資料
	useEffect(() => {
		let cancelled = false
		async function loadFromServer() {
			if (!username) return
			try {
				const resp = await fetch(`https://leya-backend-vercel.vercel.app/mood-journal?username=${encodeURIComponent(username)}`)
				const json = await resp.json()
				if (cancelled) return
				if (json?.success && Array.isArray(json.items)) {
					setData(prev => {
						const next = { ...prev }
						for (const it of json.items) {
							const dateStr = dateStrFromCreatedAt(it.created_at)
							if (!dateStr) continue
							const moodSrc = moodKeyToSrc(it.mood)
							next[dateStr] = {
								...(next[dateStr] || {}),
								id: it.id,
								text: typeof it.content === 'string' ? it.content : (next[dateStr]?.text || ''),
								mood: moodSrc || next[dateStr]?.mood || ''
							}
						}
						try { localStorage.setItem(storeKey, JSON.stringify(next)) } catch {}
						return next
					})
				}
			} catch (e) {
				// 保持靜默失敗：離線或網路錯誤時仍可用本地資料
				console.warn('載入雲端心情日記失敗', e)
			}
		}
		loadFromServer()
		return () => { cancelled = true }
	}, [username])

	async function saveEntry() {
		if (!selectedDate) return
		const text = (noteText || '').trim()

		// 後端同步：若已有 id -> 更新，否則建立（成功後才更新本地 / 顯示）
		const moodKey = MOODS.find(m => m.src === modalMoodPath)?.key || ''
		const payload = {
			username,
			content: text,
			mood: moodKey,
			created_at: `${selectedDate}T00:00:00.000Z`
		}
		try {
			if (data[selectedDate]?.id) {
				const resp = await fetch(`https://leya-backend-vercel.vercel.app/mood-journal/${data[selectedDate].id}`, {
					method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
				})
				const json = await resp.json()
				if (json?.success && json.item?.id) {
					const updated = { ...data, [selectedDate]: { id: json.item.id, text, mood: modalMoodPath || '' } }
					setData(updated)
					try { localStorage.setItem(storeKey, JSON.stringify(updated)) } catch {}
				}
			} else {
				const resp = await fetch('https://leya-backend-vercel.vercel.app/mood-journal', {
					method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
				})
				const json = await resp.json()
				if (json?.success && json.item?.id) {
					const created = { ...data, [selectedDate]: { id: json.item.id, text, mood: modalMoodPath || '' } }
					setData(created)
					try { localStorage.setItem(storeKey, JSON.stringify(created)) } catch {}
				}
			}
		} catch (err) {
			console.warn('同步心情日記至後端失敗', err)
		}
		closeModal()
	}

	async function deleteEntry() {
		if (!selectedDate) return
		if (!data[selectedDate]) return closeModal()
		const id = data[selectedDate]?.id
		// 僅刪除已存在於資料庫的紀錄
		if (id) {
			try {
				const resp = await fetch(`https://leya-backend-vercel.vercel.app/mood-journal/${id}`, { method: 'DELETE' })
				const json = await resp.json()
				if (json?.success) {
					const next = { ...data }
					delete next[selectedDate]
					setData(next)
					try { localStorage.setItem(storeKey, JSON.stringify(next)) } catch (e) {}
				}
			} catch (e) { console.warn('刪除雲端日記失敗', e) }
		}
		closeModal()
	}

	const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
	const first = new Date(currentYear, currentMonth, 1)
	const last = new Date(currentYear, currentMonth + 1, 0)
	const days = last.getDate()
	const offset = first.getDay()

	return (
		<div className="container">
			<style>{`
				:root{--bg:#fffaf5;--tile:#ffe4c4;--tile-hover:#ffd2a6;--weekday:#ffcf99;--accent:#ff8a65;--accent-hover:#ff7043;--text:#333;--muted:#777;--shadow:0 8px 20px rgba(0,0,0,.08);--radius:14px}
				body{margin:0;font-family:"Noto Sans TC",system-ui,-apple-system,"Segoe UI",Arial,"Helvetica Neue",Helvetica,"PingFang TC","Microsoft JhengHei",sans-serif;background:var(--bg);color:var(--text)}
				.container{max-width:880px;margin:22px auto 40px;padding:0 16px}
				.title-bar{display:flex;align-items:center;justify-content:space-between;gap:10px}
				.title{font-size:24px;font-weight:800;letter-spacing:.5px;display:flex;align-items:center;gap:8px}
				.nav-btn{background:var(--accent);color:#fff;border:none;border-radius:12px;padding:8px 10px;width:80px;font-size:12px;cursor:pointer;box-shadow:var(--shadow)}
				.nav-btn:hover{background:var(--accent-hover)}
				.quick-moods{margin:14px 0 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center}
				.mood-btn{background:transparent;border:none;padding:4px;cursor:pointer;transition:transform .12s ease}
				.mood-btn img{width:70px;height:70px;object-fit:contain;display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.06))}
				.mood-btn:hover{transform:translateY(-2px)}
				.month-label{font-weight:700;font-size:18px;text-align:center;margin-top:8px}
				.weekday-row{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:16px}
				.weekday-cell{background:var(--weekday);border-radius:10px;padding:10px 0;text-align:center;font-weight:700;color:#5b3d22}
				.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:10px}
				.day-cell{background:var(--tile);border-radius:var(--radius);min-height:82px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;cursor:pointer;transition:background .15s ease,transform .06s ease}
				.day-cell:hover{background:var(--tile-hover)}
				.day-num{font-weight:700;opacity:.9}
				.emoji{margin-top:6px;display:flex;align-items:center;justify-content:center;min-height:28px;width:100%}
				.emoji img{width:100%;object-fit:contain;display:block;margin:auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.08))}
				.disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.15)}
				.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:${isModalOpen ? 'block' : 'none'}; z-index: 21;}
				.modal{position:fixed;inset:0;display:${isModalOpen ? 'grid' : 'none'};place-items:center;z-index:22}
				.card{width:min(92vw,520px);background:#fff;border-radius:18px;box-shadow:var(--shadow);padding:22px 20px}
				.card h3{margin:0 0 10px;font-size:20px;font-weight:800;letter-spacing:.3px;display:flex;align-items:center;gap:8px}
				.meta-row{color:var(--muted);font-size:14px;margin:8px 0 12px}
				.date-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 10px}
				.date-row input[type="date"]{appearance:auto;padding:8px 10px;border:none;border-radius:12px;background:#f7f7f7;box-shadow:inset 0 1px 0 rgba(0,0,0,.04);font-size:14px;color:#333}
				.picker-label{font-weight:700;margin-right:4px}
				.modal-moods{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0 8px}
				.modal-moods button{border:none;background:transparent;padding:4px;cursor:pointer}
				.modal-moods img{width:46px;height:46px;object-fit:contain;display:block;transition:transform .12s ease;filter:drop-shadow(0 2px 3px rgba(0,0,0,.06))}
				.modal-moods img:hover{transform:translateY(-2px)}
				.chosen{outline:3px solid var(--accent);border-radius:12px}
				textarea{width:100%;min-height:120px;resize:vertical;border:none;border-radius:14px;padding:12px 14px;background:#fff3e6;font-size:15px;color:#333}
				textarea::placeholder{color:#b57d5b}
				.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
				.btn{border:none;border-radius:999px;padding:10px 16px;cursor:pointer;font-weight:700}
				.btn-primary{background:var(--accent);color:#fff}
				.btn-primary:hover{background:var(--accent-hover)}
				.btn-ghost{background:#ececec;color:#444}
				.btn-ghost:hover{background:#ddd}
				@media (max-width:480px){.day-cell{min-height:74px}.emoji img{width:26px;height:26px}}
			`}</style>

			<div className="title-bar">
				<button className="nav-btn" onClick={() => changeMonth(-1)}><span>←<br/>上一個月</span></button>
				<div className="title">📔 今天你的心情如何？</div>
				<button className="nav-btn" onClick={() => changeMonth(1)}><span>→<br/>下一個月</span></button>
			</div>

			<div className="quick-moods" aria-label="快速選擇心情">
				{MOODS.map(m => (
					<button key={m.key} className="mood-btn" onClick={() => quickPick(m.src)} title={m.key}>
						<img src={m.src} alt={m.key} />
					</button>
				))}
			</div>

			<div className="month-label">{currentYear} 年 {monthNames[currentMonth]}</div>

			<div className="weekday-row" id="weekdayRow">
				{['日','一','二','三','四','五','六'].map(w => (
					<div key={w} className="weekday-cell">{w}</div>
				))}
			</div>

			<div className="calendar" id="calendar">
				{Array.from({ length: offset }).map((_, i) => (
					<div key={`empty-${i}`} />
				))}
				{Array.from({ length: days }).map((_, idx) => {
					const d = idx + 1
					const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
					const disabled = isFuture(dateStr)
					const entry = data[dateStr]
					const moodPath = entry && entry.id ? (entry.mood || '') : ''
					return (
						<div key={dateStr} className={`day-cell${disabled ? ' disabled' : ''}`} onClick={() => !disabled && openModal(dateStr)}>
							<div className="day-num">{d}</div>
							<div className="emoji">{moodPath ? <img src={moodPath} alt="心情" /> : null}</div>
						</div>
					)
				})}
			</div>

			<div className="overlay" onClick={closeModal} />
			<div className="modal">
				<div className="card" role="dialog" aria-modal="true">
					<h3>📅 <span>{selectedDate}</span></h3>
					<div className="meta-row">寫下你的專屬日記吧!</div>
					<div className="date-row">
						<span className="picker-label">選擇日期：</span>
						<input type="date" value={selectedDate} max={todayStr()} onChange={handleDateChange} />
					</div>
					<div className="modal-moods" aria-label="選擇心情圖片">
						{MOODS.map(m => (
							<button key={`modal-${m.key}`} onClick={() => setModalMoodPath(m.src)} title={m.key}>
								<img src={m.src} alt={m.key} className={modalMoodPath === m.src ? 'chosen' : ''} />
							</button>
						))}
					</div>
					<textarea id="noteInput" placeholder="今天心情如何？發生了什麼事？寫下今天的日記..." value={noteText} onChange={e => setNoteText(e.target.value)}></textarea>
					<div className="actions">
						<button className="btn btn-ghost" onClick={deleteEntry}>刪除日記</button>
						<button className="btn btn-primary" onClick={saveEntry}>儲存日記</button>
						<button className="btn btn-ghost" onClick={closeModal}>關閉</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MoodPage