// // src/pages/ChatArea.jsx
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import './chat.css'; // Create a CSS file for styling
// import TopPanel from '../components/TopPanel'; // Import the TopPanel component

// const socket = io('http://localhost:5001'); // Connect to the chat server

// const Chat = () => {
//     const [messages, setMessages] = useState([]);
//     const [message, setMessage] = useState('');
//     const [username, setUsername] = useState(''); // State to hold the username

//     useEffect(() => {
//         const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
//         if (storedUsername) {
//             setUsername(storedUsername); // Set the username state
//         }

//         // Listen for incoming messages
//         socket.on('new message', (newMessage) => {
//             setMessages((prevMessages) => [...prevMessages, newMessage]);
//         });

//         // Load chat history
//         socket.on('chat history', (history) => {
//             setMessages(history);
//         });

//         return () => {
//             socket.off('new message');
//             socket.off('chat history');
//         };
//     }, []);

//     const handleSendMessage = () => {
//         if (message.trim()) {
//             socket.emit('send message', message);
//             setMessage('');
//         }
//     };

//     return (
//         <div>
//             <TopPanel username={username} showSearchArea={false} /> {/* Add TopPanel here */}
//             <div className="chat-container">
//                 <div className="messages">
//                     {messages.map((msg, index) => (
//                         <div key={index} className="message">{msg}</div>
//                     ))}
//                 </div>
//                 <input
//                     type="text"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     placeholder="Type a message..."
//                 />
//                 <button onClick={handleSendMessage}>Send</button>
//             </div>
//         </div>
//     );
// };

// export default Chat;


// src/pages/Chat.jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './chat.css'; // Create a CSS file for styling
import TopPanel from '../components/TopPanel'; // Import the TopPanel component

const socket = io('http://localhost:5001'); // Connect to the chat server

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState(''); // State to hold the username

    useEffect(() => {
        const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
        if (storedUsername) {
            setUsername(storedUsername); // Set the username state
        }

        // Listen for incoming messages
        socket.on('new message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Load chat history when the component mounts
        socket.emit('get chat history');

        // Cleanup the event listeners when the component unmounts
        return () => {
            socket.off('new message');
        };
    }, []);

    useEffect(() => {
        // Listen for chat history
        socket.on('chat history', (history) => {
            setMessages(history); // Set the chat history
        });

        // Cleanup the event listener when the component unmounts
        return () => {
            socket.off('chat history');
        };
    }, []);

    const handleSendMessage = () => {
        if (message.trim()) {
            // Emit the message along with the username
            const msgToSend = { text: message, user: username };
            socket.emit('send message', msgToSend);
            setMessage('');
        }
    };

    return (
        <div>
            <TopPanel username={username} showSearchArea={false} /> {/* Add TopPanel here */}
            <div className="chat-container">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <strong>{msg.user}:</strong> {msg.text} {/* Display username and message */}
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;