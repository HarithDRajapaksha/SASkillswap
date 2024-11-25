import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialize the useNavigate hook
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Inside Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
      const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              email: formData.email,
              password: formData.password,
          }),
      });

      const result = await response.json();

      if (response.ok) {
          // Successful login
          alert(result.message);
          // Store the username in localStorage
          localStorage.setItem('username', result.username); // Assuming the server sends back the username
          navigate('/dashboard'); // Navigate to the dashboard
      } else {
          // Login failed
          alert(result.message); // Display error message
      }
  } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
  }
};

  return (
    <div className="login-page">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="login-button">Log In</button>
      </form>
    </div>
  );
};

export default Login;