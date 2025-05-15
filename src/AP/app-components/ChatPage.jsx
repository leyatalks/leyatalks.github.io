import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faHandHoldingHeart, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";

function ChatPage() {
    return (
        <>
            <div class="content-area" id="chat-page">
                <div className="golden-sentence-container">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="golden-sentence-icon" />
                    <div className="golden-sentence">
                        <h4>今天最適合你的一句話</h4>
                        {/* 下面之後連接資料庫，替換成變數 */}
                        <p>明天一定會更好的！</p> 
                    </div>
                    <div className="share-icon">
                        <FontAwesomeIcon icon={faShareFromSquare}/>
                    </div>
                </div>
                <div class="chat-container">
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" placeholder="試著說些什麼吧~" />
                        <button class="send-btn">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatPage;