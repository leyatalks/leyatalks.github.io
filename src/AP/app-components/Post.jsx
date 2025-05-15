import React from 'react';
import DonatePost from './PostExample/DonatePost';
import UserPost from './PostExample/UserPost';

function Post(){
    return (
      <>
        <div class="content-area" id="home-page">
                <div class="post-list">
                    <DonatePost />
                    <UserPost />
                    <UserPost />
                    <DonatePost />
                    <UserPost />
                    <UserPost />
                    <UserPost />
                    <UserPost />
                    <UserPost />
                    <UserPost />
                    <DonatePost />
                </div>
            </div>      
      </>  
    );
}

export default Post;