import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";

function DonatePost() {
    return (
        <>
            <div class="post-item">
                <div class="post-avatar">
                    {/* <img src="./src/AP/app-components/assets/images/pIcon192.png" alt="微熊版" /> */}
                    <FontAwesomeIcon icon={faUserTie} style={{fontSize: "2.5rem", color: "red"}}/>
                </div>
                <div class="post-content">
                    <div class="post-header">
                        <div class="post-name">廠商贊助</div>
                        <div class="post-username">@LeyaTalks</div>
                    </div>
                    <div class="post-text">這邊將會放置廣告內容</div>
                    {/* <div class="post-subtext">這邊將會放置廣告內容</div> */}
                    <div class="post-images">
                        <img src="https://placehold.co/10" alt="圖片1" />
                        <img src="https://placehold.co/10" alt="圖片2" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default DonatePost