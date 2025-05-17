import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";

function DonatePost({ post }) {
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
                                style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6, border: '1px solid #ccc' }}
                            />
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}

export default DonatePost;