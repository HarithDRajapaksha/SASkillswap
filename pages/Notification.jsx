import React, { useState, useEffect } from 'react';
import TopPanel from '../components/TopPanel'; 
import './notification.css'; // Assuming you have some styles for the notification page

const Notification = () => {
    const [username, setUsername] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }

        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:5000/notifications'); // Replace with your notifications endpoint
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div>
            <TopPanel username={username} showSearchArea={true}/>
            <h2 id="NotificationTitle">Notifications</h2>
            {loading ? (
                <p>Loading notifications...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : notifications.length > 0 ? (
                <ul className="notification-list">
                    {notifications.map((notification) => (
                        <li key={notification.id} className="notification-item">
                            <p><strong>{notification.title}</strong></p>
                            <p>{notification.message}</p>
                            <p><small>{new Date(notification.date).toLocaleString()}</small></p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notifications available.</p>
            )}
        </div>
    );
};

export default Notification;