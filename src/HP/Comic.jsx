import { useEffect } from 'react';

function Comic() {
    useEffect(() => {
        const processEmbeds = () => {
            if (window.instgrm && window.instgrm.Embeds) {
                try {
                    window.instgrm.Embeds.process();
                } catch (e) {
                    // ignore
                }
            }
        };

        const existing = document.getElementById('instagram-embed-js');
        if (!existing) {
            const script = document.createElement('script');
            script.id = 'instagram-embed-js';
            script.async = true;
            script.src = 'https://www.instagram.com/embed.js';
            script.onload = processEmbeds;
            document.body.appendChild(script);
        } else {
            processEmbeds();
        }
    }, []);

    return (
        <>
            <p
                style={{fontSize: '4rem', textAlign: 'center', marginTop: '20px', marginBottom: '20px', fontFamily: 'Dela Gothic One'}}
            >
                樂壓小劇場
            </p>
            <div className="hp-comic-container">
                {/* 最精簡的 Instagram 嵌入用法，交由 embed.js 自行渲染 */}
                <blockquote
                    className="instagram-media comic-content"
                    data-instgrm-permalink="https://www.instagram.com/p/DOTNy-mCcLC/"
                    // data-instgrm-captioned
                    data-instgrm-version="14"
                    style={{
                        margin: '1px auto',
                        maxWidth: 540,
                        minWidth: 326,
                        width: 'calc(100% - 2px)',
                    }}
                >
                    <a href="https://www.instagram.com/p/DOTNy-mCcLC/" target="_blank" rel="noreferrer noopener">
                        查看 Instagram 貼文
                    </a>
                </blockquote>

                <blockquote
                    className="instagram-media comic-content"
                    data-instgrm-permalink="https://www.instagram.com/p/DO8N5ImkZRf/"
                    // data-instgrm-captioned
                    data-instgrm-version="14"
                    style={{
                        margin: '1px auto',
                        maxWidth: 540,
                        minWidth: 326,
                        width: 'calc(100% - 2px)'
                    }}
                >
                    <a href="https://www.instagram.com/p/DO8N5ImkZRf/?img_index=1" target="_blank" rel="noreferrer noopener">
                        查看 Instagram 貼文
                    </a>
                </blockquote>

                <blockquote
                    className="instagram-media comic-content"
                    data-instgrm-permalink="https://www.instagram.com/p/DPwBRf9CRYV/"
                    // data-instgrm-captioned
                    data-instgrm-version="14"
                    style={{
                        margin: '1px auto',
                        maxWidth: 540,
                        minWidth: 326,
                        width: 'calc(100% - 2px)'
                    }}
                >
                    <a href="https://www.instagram.com/p/DPwBRf9CRYV/" target="_blank" rel="noreferrer noopener">
                        查看 Instagram 貼文
                    </a>
                </blockquote>


            </div>
        </>
    );
}

export default Comic;