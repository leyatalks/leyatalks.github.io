import React, { useEffect, useState } from 'react';
import DonatePost from './PostExample/DonatePost';
import UserPost from './PostExample/UserPost';

function Post() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch("https://leya-backend-vercel.vercel.app/posts")
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <div className="content-area" id="home-page">
            <div className="post-list">
                {posts.map(post =>
                    post.user_id === 999
                        ? <DonatePost key={post.id} post={post} />
                        : <UserPost key={post.id} post={post} />
                )}
            </div>
        </div>
    );
}

export default Post;