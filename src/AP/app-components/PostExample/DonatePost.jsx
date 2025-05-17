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
                {post.image_url &&
                    <div className="post-images">
                        <img src={post.image_url} alt="贊助圖片" />
                    </div>
                }
            </div>
        </div>
    );
}

export default DonatePost;