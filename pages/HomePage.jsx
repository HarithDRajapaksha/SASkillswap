import React from 'react';
import './homepage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <h1>Welcome to SkillSwap</h1>
      <p>Connect with others and swap your skills!</p>
      <div className="button-container">
        <button className="homepage-button" onClick={() => window.location.href='/login'}>
          Log In
        </button>
        <button className="homepage-button" onClick={() => window.location.href='/register'}>
          Register
        </button>
      </div>
    </div>
  );
};

export default HomePage;