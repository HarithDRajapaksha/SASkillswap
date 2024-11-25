import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddReview = () => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [editReviewId, setEditReviewId] = useState(null); // Track the review being edited
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track visible dropdown

  // Fetch reviews from the server
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !rating || !comment) {
      alert('Please provide your name, a rating, and a comment.');
      return;
    }

    const newReview = {
      name,
      icon: `https://picsum.photos/200?random=${Math.floor(Math.random() * 1000)}`,
      rating,
      comment,
      date: new Date().toLocaleDateString(), // Add the current date
    };

    try {
      if (editReviewId) {
        // Update an existing review
        await axios.put(`http://localhost:5000/api/reviews/${editReviewId}`, newReview);
        setReviews(reviews.map(review =>
          review.id === editReviewId ? { ...review, ...newReview } : review
        ));
      } else {
        // Add a new review
        const response = await axios.post('http://localhost:5000/api/reviews', newReview);
        setReviews([response.data, ...reviews]); // Add new review to the top
      }
      resetForm();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setEditReviewId(null);
    setName('');
    setRating(0);
    setComment('');
  };

  // Handle deleting a review
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${id}`);
        setReviews(reviews.filter(review => review.id !== id));
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  // Handle editing a review
  const handleEdit = (review) => {
    setEditReviewId(review.id);
    setName(review.name);
    setRating(review.rating);
    setComment(review.comment);
    setDropdownVisible(null); // Close the dropdown
  };

  // Toggle dropdown menu visibility
  const toggleDropdown = (id) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Add Review Form */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            width: '300px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#C30010', marginBottom: '15px' }}>{editReviewId ? 'Edit Review' : 'Add a Review'}</h2>

 <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '18px' }}>Rating:</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: star <= rating ? '#C30010' : '#ccc',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#C30010',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {editReviewId ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews Section */}
      <div className="container" style={{ padding: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>Reviews</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                backgroundColor: '#fff',
                textAlign: 'center',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative',
              }}
            >
              {/* Three-dots menu */}
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span
                  onClick={() => toggleDropdown(review.id)}
                  style={{ cursor: 'pointer', fontSize: '18px' }}
                >
                  ⋮
                </span>
                {dropdownVisible === review.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '0',
                      backgroundColor: '#fff',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: '5px',
                      zIndex: 10,
                    }}
                  >
                    <button onClick={() => handleEdit(review)} style={{ display: 'block', padding: '10px', width: '100%' }}>Edit</button>
                    <button onClick={() => handleDelete(review.id)} style={{ display: 'block', padding: '10px', width: '100%' }}>Delete</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img
                  src={review.icon}
                  alt={`${review.name}'s icon`}
                  style={{
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                  }}
                />
              </div>
              <div style={{ color: '#C30010', fontSize: '1.5rem' }}>
                {'★'.repeat(review.rating)}{' '}
                {'☆'.repeat(5 - review.rating)} {/* Empty stars */}
              </div>
              <p style={{ marginTop: '10px', color: '#333' }}>{review.comment}</ p>
              <p style={{ fontWeight: '600', marginTop: '5px' }}>{review.name}</p>
              <small style={{ color: '#777' }}>{review.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddReview;


