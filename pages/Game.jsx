import React, { useState, useEffect } from 'react';
import TopPanel from '../components/TopPanel';

const Game = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <div>
            <TopPanel username={username} showSearchArea={true}/>
            {/* Game content goes here */}
        </div>
    );
};

export default Game;