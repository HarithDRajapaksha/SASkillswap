import React, { useState, useEffect } from 'react';
import './addPost.css';

const AddPost = () => {
    const [postContent, setPostContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
        if (storedUsername) {
            setUsername(storedUsername); // Set the username state
        }
    }, []);

    const handleChange = (e) => {
        setPostContent(e.target.value);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setMediaFiles((prevFiles) => [...prevFiles, ...files]); // Append new files to the existing array
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the data to be sent
        const postData = {
            username: username, // Use the username from state
            media: mediaFiles.map(file => URL.createObjectURL(file)), // Convert files to URLs for storage
            text: postContent,
        };

        try {
            const response = await fetch('http://localhost:5000/addPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Post added successfully');
                setPostContent('');
                setMediaFiles([]);
                e.target.reset(); // Reset the form fields
            } else {
                alert("Failed to add post: " + result.error);
            }
        } catch (error) {
            console.error('Error adding post:', error);
            alert('Failed to add post: ' + error.message);
        }
    };

    const handleRemoveFile = (index) => {
        setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div id="topPanel">
                <div id="leftSection">
                    <img src="1.jpg" alt="profile-image" id='profileImage' />
                    <h1>SkillSwap</h1>
                </div>
                <div id="middleSection">
                    <h4>{username}</h4>
                </div>
            </div>
            <div className="add-post">
                <h2>Add a New Post</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={postContent}
                        onChange={handleChange}
                        placeholder="What's on your mind?"
                        rows="5"
                        required
                    />
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                    />
                    <div className="media-preview">
                        {mediaFiles.length > 0 && (
                            <h4>Media Preview:</h4>
                        )}
                        {mediaFiles.map((file, index) => (
                            <div key={index} className="media-item">
                                {file.type.startsWith('image/') ? (
                                    <div>
                                        <img src={URL.createObjectURL(file)} alt={`media-${index}`} />
                                        <button type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                                    </div>
                                ) : (
                                    <div>
                                        <video controls>
                                            <source src={URL.createObjectURL(file)} type={file.type} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <button type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="submit-button">Post</button>
                </form>
            </div>
        </div>
    );
};

export default AddPost;