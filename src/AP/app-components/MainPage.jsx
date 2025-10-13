import React, { useEffect, useState } from 'react';
import './MainPageComponents/mainPage.css'
import ADs from './MainPageComponents/Ads';
import Role from './MainPageComponents/Role';
import InfoCard from './MainPageComponents/InfoCard';

function MainPage({ setActivePage }) {
    return (
        <>
            <ADs />

                <div className="mainpage-container">
                    <Role/>
                    <InfoCard setActivatePage={setActivePage}/>
                </div>

        </>
    );


}

export default MainPage;