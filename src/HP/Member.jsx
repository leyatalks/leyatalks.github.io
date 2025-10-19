import { useState } from 'react';

function Member() {
    const members = [
        {
            role: '指導老師',
            name: '吳林展',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member1.webp',
            crole: '吐司',
            cimage: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/leyalogo.png',
            back: '如果覺得情緒不佳、壓力快把你壓垮，讓可愛的吐司，給你的心一個抱抱！'
        },
        {
            role: '專案經理',
            name: '張騰利',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member2.webp',
            crole: 'CEO',
            cimage: 'https://lh3.googleusercontent.com/d/1FpqTgg73Oo-bNyGe8clPL5kYkEvZ_yvz',
            back: '沒自信的腦補王，最喜歡在開會的時候說：「還是我們先休息」。'
        },
        {
            role: '美術設計',
            name: '黎穎霖',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member3.webp',
            crole: '倦倦',
            cimage: 'https://lh3.googleusercontent.com/d/1lxXMUuH1ZiPtFPpvQNHtKrMLhXaVvria',
            back: '每天都累到像被生活按了省電模式，夢想就是不被生活追著每天睡到自然醒'
        },
        {
            role: '行銷宣傳',
            name: '詹采璇',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member4.webp',
            crole: '卯咪',
            cimage: 'https://lh3.googleusercontent.com/d/1LerwCs1SGfjNq783zpbPzCg_vwnQu7QK',
            back: '超級社恐，覺得最完美的社交距離就是「隔著網路+靜音麥克風」。'
        },
        {
            role: '後端工程師',
            name: '黃芊瑜',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member5.webp',
            crole: '狐妮',
            cimage: 'https://lh3.googleusercontent.com/d/1yq_KQYKDOo0r249whyr1kXTI4nQ_x_2H',
            back: '超級大E人，走到哪裡都像在開社交派對，覺得人生的意義就是「朋友++」'
        },
        {
            role: '全端工程師',
            name: '林辰禧',
            photo: 'https://raw.githubusercontent.com/leyatalks/leyatalks.github.io/refs/heads/main/public/member/member6.webp',
            crole: '竹間',
            cimage: 'https://lh3.googleusercontent.com/d/18lsodYbRodyA61HC3CWqkt6U5yrcaIIb',
            back: '徹底的工作狂，在想要休息和壓力太大的時候會選擇瘋狂工作，有一個愛好是用程式編碼來聊天。'
        }
    ];

    const [flipped, setFlipped] = useState(Array(members.length).fill(false));
    const toggleFlip = (idx) => {
        setFlipped((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    return (
        <>
            <p
                style={{ fontSize: '4rem', textAlign: 'center', marginTop: '20px', marginBottom: '20px', fontFamily: 'Dela Gothic One' }}
            >
                成員介紹
            </p>
            <div className="hp-member-container">
                {members.map((m, idx) => (
                    <div
                        key={m.name}
                        className={`member-card ${flipped[idx] ? 'is-flipped' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={flipped[idx] ? 'true' : 'false'}
                        onMouseEnter={() => toggleFlip(idx)}
                        onMouseLeave={() => toggleFlip(idx)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFlip(idx);
                            }
                        }}
                        aria-label={`${m.role} ${m.name} 卡片，按一下翻面`}
                    >
                        <div className="member-card-inner">
                            <div className="member-face member-front">
                                <h3 className="member-role">{m.role}</h3>
                                <img src={m.photo} alt={`成員 ${m.name} - ${m.role}`} className="member-photo" loading="lazy" />
                                <p className="member-name">{m.name}</p>
                            </div>
                            <div className="member-face member-back">
                                <h3 className="member-role">{m.crole}</h3>
                                <img src={m.cimage} alt={`成員 ${m.name} - ${m.cimage}`} className="member-photo" loading="lazy" style={{maxHeight: '175px'}} />
                                <p className="member-desc" style={{ textAlign: 'center', lineHeight: 1.6 }}>{m.back}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
export default Member;