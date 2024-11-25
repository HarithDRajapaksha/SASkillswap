import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [media, setMedia] = useState([]);
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
                setText(data.text);
                setMedia(data.media);
            } catch (error) {
                console.error("Error fetching post details:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetails();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedPost = { text, media };

        try {
            const response = await fetch(`http://localhost:5000/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost),
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            alert('Post updated successfully');
            navigate(`/postDetails/${postId}`); // Redirect back to post details
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post: ' + error.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Edit Post</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Edit your post..."
                    rows="5"
                    required
                />
                {/* Add media upload functionality if needed */}
                <button type="submit">Update Post</button>
            </form>
        </div>
    );
};

export default EditPost;