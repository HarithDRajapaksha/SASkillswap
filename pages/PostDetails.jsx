import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './postDetails.css';

const PostDetails = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/posts/${postId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post details');
                }
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Error fetching post details:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetails();
    }, [postId]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`http://localhost:5000/posts/${postId}`, {
                    method: 'DELETE',
                });
    
                // Log the response for debugging
                const text = await response.text(); // Get the response as text
                console.log('Response:', text); // Log the response text
    
                if (response.ok) {
                    alert('Post deleted successfully');
                    navigate('/dashboard'); // Redirect to the dashboard or another page after deletion
                } else {
                    const result = JSON.parse(text); // Parse the response as JSON
                    alert('Failed to delete post: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post: ' + error.message);
            }
        }
    };

    if (loading) {
        return <p>Loading post details...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!post) {
        return <p>No post found.</p>;
    }

    const HandleRating = (postId) => {
        navigate('/addreview'); // Navigate to edit post page
    };

    const handleEnroll = () => {
        // Implement the enrollment functionality here
        alert('Enroll button clicked!');
    };

    return (
        <div className="post-details">
            <h2>{post.username}'s Post</h2>
            <p>{post.text}</p>
            {post.media && post.media.length > 0 ? (
                <div className="media-container">
                    {post.media.map((media, index) => (
                        media.startsWith('data:image') ? (
                            <img key={index} src={media} alt={`Media for post by ${post.username}`} style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        ) : media.startsWith('data:video') ? (
                            <video key={index} controls style={{ maxWidth: '100%', maxHeight: '300px' }}>
                                <source src={media} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <p key={index}>Unsupported media type</p>
                        )
                    ))}
                </div>
            ) : (
                <p>No media available for this post.</p>
            )}
            <button onClick={HandleRating} className="rating-button">Rating & Feedbacks</button>
            <button onClick={handleEnroll} className="enroll-button">Enroll to the Course</button>
            <button onClick={handleDelete} className="delete-button">Delete Post</button>
            <button onClick={() => navigate(`/editPost/${postId}`)} className="edit-button">Edit Post</button>
            <button onClick={() => navigate(`/dashboard`)}>Back to Posts</button>
        </div>
    );
};

export default PostDetails;
