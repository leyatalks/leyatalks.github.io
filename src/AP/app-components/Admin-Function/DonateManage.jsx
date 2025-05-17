import React, { useEffect, useState } from "react";

function DonateManage({ userInfo }) {
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null);
    const [content, setContent] = useState("");
    const [images, setImages] = useState([""]);
    const [error, setError] = useState("");

    // 只允許管理員進入
    if (!userInfo || userInfo.id !== 'admin') {
        return <div>只有管理員可以進入此頁面</div>;
    }

    // 取得所有贊助貼文
    const fetchPosts = async () => {
        const res = await fetch("https://leya-backend-vercel.vercel.app/posts");
        const data = await res.json();
        setPosts(data.filter(post => post.user_id === 999));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // 新增或編輯貼文
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!content) {
            setError("內容不可空白");
            return;
        }
        const validImages = images.map(url => url.trim()).filter(url => url).slice(0, 5);
        const payload = {
            user_id: 999,
            content,
            images: validImages,
        };
        try {
            let res;
            if (editingPost) {
                res = await fetch(`https://leya-backend-vercel.vercel.app/posts/${editingPost.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch("https://leya-backend-vercel.vercel.app/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "操作失敗");
            } else {
                setContent("");
                setImages([""]);
                setEditingPost(null);
                fetchPosts();
            }
        } catch (err) {
            setError("伺服器錯誤");
        }
    };

    // 編輯
    const handleEdit = (post) => {
        setEditingPost(post);
        setContent(post.content);
        setImages(post.images && post.images.length > 0 ? post.images.concat([""]).slice(0, 5) : [""]);
    };

    // 刪除
    const handleDelete = async (id) => {
        if (!window.confirm("確定要刪除嗎？")) return;
        const res = await fetch(`https://leya-backend-vercel.vercel.app/posts/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 999 }),
        });
        if (res.ok) {
            fetchPosts();
        } else {
            const err = await res.json();
            setError(err.message || "刪除失敗");
        }
    };

    // 取消編輯
    const handleCancel = () => {
        setEditingPost(null);
        setContent("");
        setImages([""]);
        setError("");
    };

    // 動態圖片網址欄位
    const handleImageChange = (idx, value) => {
        const newImages = [...images];
        newImages[idx] = value;
        // 自動補一個空欄位（最多5個）
        if (idx === images.length - 1 && value && images.length < 5) {
            newImages.push("");
        }
        // 移除多餘的空欄位
        if (value === "" && idx < images.length - 1) {
            newImages.splice(idx, 1);
        }
        setImages(newImages);
    };

    return (
        <div>
            <h2 style={{fontSize: '2rem', fontWeight: '800', margin: '1em'}}>贊助貼文管理</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="貼文內容"
                        rows={3}
                        style={{ width: "100%", border: 'solid 1px rgba(0,0,0,0.5)', padding: '1em', borderRadius: '6px' }}
                    />
                </div>
                <div>
                    <label style={{fontWeight:'bold'}}>圖片網址（最多5張）：</label>
                    {images.map((url, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={url}
                            onChange={e => handleImageChange(idx, e.target.value)}
                            placeholder={`圖片網址${idx+1}`}
                            style={{ width: "100%", border: 'solid 1px rgba(0,0,0,0.5)', padding: '0.5em', borderRadius: '6px', marginBottom: 4 }}
                        />
                    ))}
                </div>
                {error && <div style={{ color: "red" }}>{error}</div>}
                <button type="submit" style={{margin:'1em 1em 1em auto',padding: '1em', backgroundColor: '#D7BFB0', borderRadius:'6px', cursor:'pointer'}}>{editingPost ? "儲存修改" : "新增貼文"}</button>
                {editingPost && <button type="button" onClick={handleCancel} style={{margin:'1em 1em 1em auto',padding: '1em 1.5em 1em 1.5em', backgroundColor: 'lightgray', borderRadius:'6px', cursor:'pointer'}}>取消</button>}
            </form>
            <hr style={{margin:'1em auto 1em auto'}}/>
            <h3 style={{fontSize:'1.8em'}}>所有贊助貼文</h3>
            <ul>
                {posts.map(post => (
                    <li key={post.id} style={{ marginBottom: 16 }}>
                        <div>內容：{post.content}</div>
                        {post.images && post.images.length > 0 && (
                            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                                {post.images.map((url, idx) => (
                                    <img key={idx} src={url} alt="贊助圖片" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6, border: '1px solid #ccc' }} />
                                ))}
                            </div>
                        )}
                        <div>
                            <button onClick={() => handleEdit(post)} style={{margin:'1em 1em 1em auto',padding: '1em 1.5em 1em 1.5em', backgroundColor: '#D7BFB0', borderRadius:'6px', cursor:'pointer'}}>編輯</button>
                            <button onClick={() => handleDelete(post.id)} style={{margin:'1em 1em 1em auto',padding: '1em 1.5em 1em 1.5em', backgroundColor: 'red', color: '#fff', borderRadius:'6px', cursor:'pointer'}}>刪除</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div style={{height: 50, width: 100}}></div>
        </div>
    );
}

export default DonateManage;
