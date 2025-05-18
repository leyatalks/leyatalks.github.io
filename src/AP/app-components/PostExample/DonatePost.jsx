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

    return (
        <div className="post-item">
            <div className="post-avatar">
                <FontAwesomeIcon icon={faUserTie} style={{fontSize: "2.5rem", color: "red"}}/>
            </div>
            <div className="post-content">
                <div className="post-header">
                    <div className="post-name">廠商贊助</div>
                    <div className="post-username">@LeyaTalks</div>
                </div>
                <div className="post-text">{post.content}</div>
                {post.images && post.images.length > 0 &&
                    <div className="post-images" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                        {post.images.map((url, idx) => (
                            <img
                                key={idx}
                                src={encodeURI(url)}
                                alt={`贊助圖片${idx+1}`}
                                style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
                                onClick={() => handleImgClick(url)}
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