import React, { useRef, useCallback, useState, useEffect } from 'react';

function AdCard({ src, alt, title, onClick }) {
  const fallback = '/hp-second.webp';
  const isSrcMissing = !(src && typeof src === 'string' && src.trim().length > 0);
  const [isFallback, setIsFallback] = useState(isSrcMissing);
  const actualSrc = isFallback ? fallback : src;
  const handleError = (e) => {
    setIsFallback(true);
    e.currentTarget.src = fallback; // 本地 fallback 圖片
  };
  return (
    <div
      className='main-ad'
      role='listitem'
      aria-haspopup='dialog'
      aria-label={alt ? `打開廣告：${alt}` : '打開廣告'}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
      }}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <img
        src={actualSrc}
        alt={alt || ''}
        loading='lazy'
        onError={handleError}
        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
      />
      {isFallback && (
        <div
          aria-hidden='true'
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 12, textAlign: 'center', fontWeight: 700
          }}
        >
          {title || alt || '無標題'}
        </div>
      )}
    </div>
  );
}

// 彈跳視窗內容：使用者提供的設計，映射 JSON 欄位
function ADcontent({ ad }) {
  const fallback = '/hp-second.webp';
  const imgSrc = ad?.img && typeof ad.img === 'string' && ad.img.trim().length > 0 ? ad.img : fallback;
  const contentText = (ad?.content || '').replace(/<br\s*\/?>(\r?\n)?/gi, '\n');
  return (
    <div
      style={{
        display: 'flex', position: 'relative', minWidth: '80vw', minHeight: '80vh',
        justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary-color)',
        borderRadius: 12, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.35)'
      }}
      role='document'
    >
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '80vw', maxHeight: '80vh', color: 'var(--text-color)', textAlign: 'center' }}>
        <p id='ad-title' style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          {ad?.title || ''}
        </p>
        <p id='ad-content' style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line' }}>
          {contentText}
        </p>
        <img
          id='ad-image'
          src={imgSrc}
          alt={ad?.title || ''}
          onError={(e) => { e.currentTarget.src = fallback; }}
          style={{ display: 'block', alignSelf: 'center', maxWidth: '70%', maxHeight: '50vh', objectFit: 'contain', borderRadius: 8, marginBottom: 16 }}
        />
        <div>
          <button
            id='ad-url'
            onClick={() => { if (ad?.url) { window.open(ad.url, '_blank', 'noopener,noreferrer'); } }}
            disabled={!ad?.url}
            style={{
              minWidth: 'fit-content', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: ad?.url ? 'pointer' : 'not-allowed',
              background: ad?.url ? 'var(--secondary-color)' : 'rgba(255,255,255,0.4)', color: ad?.url ? 'var(--primary-color)' : '#f2f2f2',
              fontWeight: 600
            }}
          >
            {ad?.url ? '前往連結' : '沒有連結'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdModal({ ad, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='ad-title'
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button
          aria-label='關閉'
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: 20, width: 32, height: 32, cursor: 'pointer' }}
        >
          ×
        </button>
        <ADcontent ad={ad} />
      </div>
    </div>
  );
}

function Ads() {
  const ref = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);

  // 垂直滾輪 -> 水平捲動
  const onWheel = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, []);

  // 從 public/AD_data.json 載入資料，全部顯示；沒有圖片的用預設圖
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/AD_data.json');
        if (!res.ok) throw new Error('無法讀取 AD_data.json');
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setItems(list);
      } catch (e) {
        if (alive) setError(e.message || '讀取廣告資料失敗');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <div
        id='ad-container'
        className='ads-container'
        ref={ref}
        onWheel={onWheel}
        role='list'
        aria-label='廣告走馬燈'
      >
        {loading && <div style={{ padding: '0 8px', color: '#666', fontSize: 12 }}>載入中…</div>}
        {error && <div style={{ padding: '0 8px', color: '#b11' }}>{error}</div>}
        {!loading && !error && items.map(ad => (
          <AdCard key={ad.id} src={ad.img} alt={ad.title} title={ad.title} onClick={() => setSelectedAd(ad)} />
        ))}
      </div>
      {selectedAd && (
        <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </>
  );
}

export default Ads;
