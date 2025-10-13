const toDriveThumb = (id) => `https://lh3.googleusercontent.com/d/${id}=h400`;

const roleImgList = [
    { id: 1, fileId: '1LerwCs1SGfjNq783zpbPzCg_vwnQu7QK', alt: '貓咪' },
    { id: 2, fileId: '18lsodYbRodyA61HC3CWqkt6U5yrcaIIb', alt: '熊貓' },
    { id: 3, fileId: '1lxXMUuH1ZiPtFPpvQNHtKrMLhXaVvria', alt: '兔子' },
    { id: 4, fileId: '1yq_KQYKDOo0r249whyr1kXTI4nQ_x_2H', alt: '狐狸' },
    { id: 5, fileId: '1FpqTgg73Oo-bNyGe8clPL5kYkEvZ_yvz', alt: '企鵝' },
]

import React, { useEffect, useMemo, useState } from 'react';

let role = roleImgList[Math.floor(Math.random() * roleImgList.length)];

function Role(){
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    // 產生最多 10 個字的暖心小語（前端再保險截斷）
    const safeText = useMemo(() => {
        const t = (text || '').trim().replace(/["'`]/g, '');
        return t.length > 10 ? t.slice(0, 10) : (t || '世界與你，都溫柔。');
    }, [text]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch('https://leya-backend-vercel.vercel.app/warm-words');
                if (!res.ok) throw new Error('network');
                const data = await res.json();
                if (!cancelled) setText(data?.text || '世界與你，都溫柔。');
            } catch (e) {
                if (!cancelled) setText('世界與你，都溫柔。');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return(
        <div className="mainrole-container">
            <div className="encourageTitle">
                {loading ? '世界與你，都溫柔...' : safeText}
            </div>
            <div className="roleImg">
                <img key={role.id} src={toDriveThumb(role.fileId)} alt={role.alt} />
            </div>
        </div>
    )
}

export default Role;