import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";

function DonatePost({ post }) {
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState("");

    const handleImgClick = (url) => {
        setModalImg(url);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setModalImg("");
    };

    // 檢查是否有贊助商資訊，如果沒有，可以選擇不顯示贊助商區塊或顯示預設資訊
    const isSponsored = post.donate_name && post.donate_url && post.donate_engname;

    return (
        <div className="post-item">
            <div className="post-avatar">
                <FontAwesomeIcon icon={faUserTie} style={{fontSize: "2.5rem", color: "red"}}/>
            </div>
            <div className="post-content">
                <div className="post-header">
                    {/* 根據是否有贊助商資訊來顯示 */}
                    <div className="post-name">
                         {isSponsored ? (
                            // 如果有贊助商資訊，顯示可點擊的名稱
                            <a
                                href={post.donate_url}
                                target="_blank" // 在新分頁開啟
                                rel="noopener noreferrer" // 安全性建議
                                style={{ color: 'red', textDecoration: 'none', fontWeight: 'bold' }} // 樣式可以調整
                            >
                                {post.donate_name}
                            </a>
                         ) : (
                            // 如果沒有贊助商資訊，顯示預設文字 (或直接不顯示此 div)
                            '廠商贊助'
                         )}
                    </div>
                    {/* 顯示贊助商英文名稱或預設文字 */}
                    <div className="post-username">
                         {isSponsored ? `@${post.donate_engname}` : '@LeyaTalks'}
                    </div>
                </div>
                <div
                    className="post-text"
                    style={{ whiteSpace: "pre-line" }}
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/¶/g, "<br/>") }}
                />
                {post.images && post.images.length > 0 &&
                    <div className="post-images" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                        {post.images.map((url, idx) => (
                            <img
                                key={idx}
                                src={encodeURI(url)}
                                alt={`贊助圖片${idx+1}`}
                                style={{ maxHeight: 120, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
                                onClick={() => handleImgClick(url)}
                                crossOrigin="anonymous" // 保持這行
                            />
                        ))}
                    </div>
                }
            </div>
            {/* 彈窗燈箱 */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999
                    }}
                    onClick={handleClose}
                >
                    <img
                        src={encodeURI(modalImg)}
                        alt="放大圖片"
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            borderRadius: 10,
                            boxShadow: "0 0 20px #000"
                        }}
                        onClick={e => e.stopPropagation()} // 防止點擊圖片關閉
                    />
                </div>
            )}
        </div>
    );
}

export default DonatePost;