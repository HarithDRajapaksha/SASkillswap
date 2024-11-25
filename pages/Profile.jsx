// import React, { useState, useEffect } from 'react';
// import TopPanel from '../components/TopPanel'; // Adjust the path as necessary
// import './profile.css'; // Import your CSS

// const Profile = () => {
//     const [username, setUsername] = useState('');
//     const [userData, setUserData] = useState(null); // State to hold the logged-in user's data
//     const [loading, setLoading] = useState(true); // State for loading status
//     const [error, setError] = useState(null); // State for error handling

//     useEffect(() => {
//         const storedUsername = localStorage.getItem('username');
//         if (storedUsername) {
//             setUsername(storedUsername);
//             fetchUserData(storedUsername); // Fetch user data if username exists
//         } else {
//             setLoading(false); // No username found, stop loading
//         }
//     }, []);

//     const fetchUserData = async (storedUsername) => {
//         try {
//             const response = await fetch(`http://localhost:5000/users?username=${storedUsername}`);
//             console.log('Fetching user data from:', `http://localhost:5000/users?username=${storedUsername}`); // Log the URL
    
//             if (!response.ok) {
//                 throw new Error('Failed to fetch user data');
//             }
    
//             const data = await response.json();
//             console.log('Fetched user data:', data); // Log the fetched data for debugging
    
//             if (data) {
//                 setUserData(data); // Assuming the response is a single user object
//             } else {
//                 setError('No user data found');
//             }
//         } catch (error) {
//             console.error('Error fetching user data:', error);
//             setError(error.message); // Set error message
//         } finally {
//             setLoading(false); // Stop loading
//         }
//     };

//     return (
//         <div>
//             <TopPanel username={username} showSearchArea={false}/>
//             <h2 id='userprofileTitle'>User Profile</h2>
//             {loading ? (
//                 <p>Loading user data...</p>
//             ) : error ? (
//                 <p>Error: {error}</p>
//             ) : userData ? (
//                 <div className="profile-card">
//                     <div className="profile-image">
//                         {userData.profileimage ? (
//                             <img src={`http://localhost:5000/${userData.profileimage}`} alt="Profile" />
//                         ) : (
//                             <div className="no-image">No Image</div>
//                         )}
//                     </div>
//                     <div className="profile-details">
//                         <h3>{userData.username}</h3>
//                         <p><strong>Email:</strong> {userData['e-male'] || 'Email not available'}</p>
//                         <p><strong>Password:</strong> {userData.password || 'Password not available'}</p>
//                         {/* Display only relevant details */}
//                         {/* Add any other relevant user details here */}
//                     </div>
//                 </div>
//             ) : (
//                 <p>No user data available</p>
//             )}
//         </div>
//     );
// };

// export default Profile;



import React, { useState, useEffect } from 'react';
import TopPanel from '../components/TopPanel'; // Adjust the path as necessary
import './profile.css'; // Import your CSS

const Profile = () => {
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null); // State to hold the logged-in user's data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for error handling
    const [isEditing, setIsEditing] = useState(false); // State to toggle editing mode
    const [newEmail, setNewEmail] = useState(''); // State for new email
    const [newPassword, setNewPassword] = useState(''); // State for new password

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
            fetchUserData(storedUsername); // Fetch user data if username exists
        } else {
            setLoading(false); // No username found, stop loading
        }
    }, []);

    const fetchUserData = async (storedUsername) => {
        try {
            const response = await fetch(`http://localhost:5000/users?username=${storedUsername}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            if (data) {
                setUserData(data); // Assuming the response is a single user object
                setNewEmail(data['e-male']); // Set initial email for editing
            } else {
                setError('No user data found');
            }
        } catch (error) {
            setError(error.message); // Set error message
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Toggle editing mode
    };

    const handleSaveChanges = async () => {
        const payload = {
            username,
            email: newEmail,
            password: newPassword,
        };
        console.log('Sending payload:', payload); // Log the payload
    
        try {
            const response = await fetch('http://localhost:5000/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorResponse = await response.json(); // Get the error response
                throw new Error(errorResponse.error || 'Failed to update profile');
            }
    
            const result = await response.json();
            alert('Profile updated successfully');
            setUserData({ ...userData, 'e-male': result.email }); // Update the user data state
            setNewPassword(''); // Clear the password field after successful update
            setIsEditing(false); // Exit editing mode
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:5000/deleteAccount`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete account');
                }

                alert('Account deleted successfully');
                localStorage.removeItem('username'); // Clear username from local storage
                window.location.href = '/'; // Redirect to home page
            } catch (error) {
                setError(error.message);
            }
        }
    };

    return (
        <div>
            <TopPanel username={username} showSearchArea={false}/>
            <h2 id='userprofileTitle'>User  Profile</h2>
            {loading ? (
                <p>Loading user data...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : userData ? (
                <div className="profile-card">
                    <div className="profile-image">
                        {userData.profileimage ? (
                            <img src={`http://localhost:5000/${userData.profileimage}`} alt="Profile" />
                        ) : (
                            <div className="no-image">No Image</div>
                        )}
                    </div>
                    <div className="profile-details">
                        <h3>{userData.username}</h3>
                        {isEditing ? (
                            <>
                                <label>
                                    <strong>Email:</strong>
                                    <input 
                                        type="email" 
                                        value={newEmail} 
                                        onChange={(e) => setNewEmail(e.target.value)} 
                                    />
                                </label>
                                <label>
                                    <strong>Password:</strong>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                    />
                                </label>
                            </>
                        ) : (
                            <>
                                <p><strong>Email:</strong> {userData['e-male'] || 'Email not available'}</p>
                                <p><strong>Password:</strong> {userData.password ? '********' : 'Password not available'}</p>
                            </>
                        )}
                    </div>
                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveChanges}>Save Changes</button>
                                <button onClick={handleEditToggle}>Cancel</button>
                            </>
                        ) : (
                            <button onClick={handleEditToggle}>Edit</button>
                        )}
                        <button onClick={handleDeleteAccount} style={{ color: 'red' }}>Delete Account</button>
                    </div>
                </div>
            ) : (
                <p>No user data available</p>
            )}
        </div>
    );
};

export default Profile;