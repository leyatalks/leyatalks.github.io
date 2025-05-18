import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function UserPost({ post }) {
    return (
        <div className="post-item">
            <div className="post-avatar">
                <FontAwesomeIcon icon={faUser} style={{ fontSize: "2.5rem", color: "#555" }} />
            </div>
            <div className="post-content">
                <div className="post-header">
                    <div className="post-name">{post.nickname || "一般用戶"}</div>
                    <div className="post-username">@{post.username}</div>
                </div>
                <div className="post-text">{post.content}</div>
                {/* {post.image_url &&
                    <div className="post-images">
                        <img src={post.image_url} alt="用戶圖片" />
                    </div>
                } */}
            </div>
        </div>
    );
}

export default UserPost;