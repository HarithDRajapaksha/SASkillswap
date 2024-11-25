import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import TopPanel from '../components/TopPanel';

export default function Dashboard() {
    const [username, setUsername] = useState('');
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }

        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:5000/posts');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    const handleViewDetails = (postId) => {
        navigate(`/postDetails/${postId}`); // Navigate to post details page
    };

    return (
        <div>
            <TopPanel username={username} showAddPostButton={true} showSearchArea={true}/>
            
            <div id="sidePanel-postArea">
                <div id="leftPanel">
                    <button id='leftPanel-buttons' onClick={() => navigate('/profile')}>PROFILE</button>
                    <button id='leftPanel-buttons' onClick={() => navigate('/notification')}>NOTIFICATIONS</button>
                    <button id='leftPanel-buttons' onClick={() => navigate('/chat')}>CHAT</button>
                    <button id='leftPanel-buttons' onClick={() => navigate('/games')}>GAME</button>
                </div>

                <div id="postingArea">
                    {posts.length > 0 ? (
                        posts.map((post) => {
                            let mediaFiles = [];
                            try {
                                mediaFiles = JSON.parse(post.media); // Parse the media JSON string
                            } catch (error) {
                                console.error('Error parsing media:', error);
                                mediaFiles = []; // If parsing fails, set to empty array
                            }
                            return (
                                <div className="post" key={post.id}>
                                    <h3 id='postAreaUser Name'>{post.username}</h3>
                                    <p id='postAreaText'>{post.text}</p>
                                    {mediaFiles && mediaFiles.length > 0 ? (
                                        mediaFiles.map((media, index) => (
                                            media.startsWith('data:image') ? (
                                                <img 
                                                    key={index}
                                                    src={media} 
                                                    alt={`Media for post by ${post.username}`} 
                                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '5px' }} 
                                                />
                                            ) : media.startsWith('data:video') ? (
                                                <video key={index} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '5px' }}>
                                                    <source src={media} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <p key={index}>Unsupported media type</p>
                                            )
                                        ))
                                    ) : (
                                        <p>No media available</p>
                                    )}
                                    
                                    <button onClick={() => handleViewDetails(post.id)}>Details</button>
                                </div>
                            );
                        })
                    ) : (
                        <p>No posts available</p>
                    )}
                </div>
            </div>
        </div>
    );
}