const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io

const app = express();
const PORT = 5001;

// Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original filename
    }
});

const upload = multer({ storage }); // Define the upload variable

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'skillswap',
});

// Check DB connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Chat functionality
let messages = []; // Store messages in memory

io.on('connection', (socket) => {
    console.log('New user connected');

    // Send existing messages to the newly connected user
    socket.emit('chat history', messages);

    // Listen for new messages
    socket.on('send message', (message) => {
        messages.push(message);
        io.emit('new message', message); // Broadcast the new message to all clients
    });

    socket.on('disconnect', () => {
        console.log('User  disconnected');
    });
});

// Register a user
app.post('/register', upload.single('profileimage'), (req, res) => {
    const { username, email, password } = req.body;
    const profileimage = req.file ? req.file.path : null; // Get the file path from multer

    console.log('Received data:', { username, email, password, profileimage });

    db.query('INSERT INTO register (username, `e-male`, password, profileimage) VALUES (?, ?, ?, ?)', 
        [username, email, password, profileimage], (err, results) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ error: 'Failed to register user: ' + err.message });
            }
            res.status(201).json({ id: results.insertId, username, email, profileimage });
        });
});

// Login a user
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM register WHERE `e-male` = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error logging in user:', err);
            return res.status(500).json({ error: 'Error logging in user: ' + err.message });
        } else if (results.length > 0) {
            console.log('Login successful:', results);
            res.json({
                status: 'success',
                message: 'Login successful',
                username: results[0].username, // Send back the username
                email: results[0].email,
                id: results[0].id // Send back user ID for reference
            });
        } else {
            console.warn('Invalid email or password');
            return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        }
    });
});

// Add a new post
app.post('/addPost', (req, res) => {
    const { username, media, text } = req.body; // Extract data from request body

    // Prepare SQL query to insert post
    const query = 'INSERT INTO post (username, media, text) VALUES (?, ?, ?)';
    db.query(query, [username, media, text], (err, results) => {
        if (err) {
            console.error('Error inserting post:', err);
            return res.status(500).json({ error: 'Failed to add post: ' + err .message });
        }
        res.status(201).json({ id: results.insertId, username, media, text });
    });
});

// Get all posts
app.get('/posts', (req, res) => {
    db.query('SELECT * FROM post', (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Failed to fetch posts: ' + err.message });
        }
        res.json(results); // Send the posts as a response
    });
});

app.get('/users', (req, res) => {
    const username = req.query.username; // Get the username from query parameters
    console.log('Received request for username:', username); // Log the received username

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query('SELECT * FROM register WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ error: 'Failed to fetch user data' });
        }

        console.log('Query results:', results); // Log the results from the database

        if (results.length === 0) {
            return res.status(404).json({ error: 'User  not found' });
        }

        res.json(results[0]); // Send the first user data as a response
    });
});

// Add a new route to get post details by ID
app.get('/posts/:id', (req, res) => {
    const postId = req.params.id; // Get the post ID from the request parameters

    // Prepare SQL query to fetch the post by ID
    const query = 'SELECT * FROM post WHERE id = ?';
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post details:', err);
            return res.status(500).json({ error: 'Failed to fetch post details: ' + err.message });
        }

        // Check if any results were returned
        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Assuming the post data structure includes fields like id, username, text, and media
        const post = results[0];

        // Handle media parsing
        let mediaArray;
        try {
            // Check if media is a blob URL or a JSON string
            if (post.media && post.media.startsWith('blob:')) {
                // If it's a blob URL, just return it as is
                mediaArray = [post.media];
            } else {
                // Otherwise, parse it as JSON
                mediaArray = post.media ? JSON.parse(post.media) : [];
            }
        } catch (parseError) {
            console.error('Error parsing media:', parseError);
            mediaArray = []; // Fallback to empty array on error
        }

        // Format the response to include only the necessary fields
        const responseData = {
            id: post.id,
            username: post.username,
            text: post.text,
            media: mediaArray, // Use the processed media array
        };

        res.json(responseData); // Send the formatted post data as a response
    });
});

const bcrypt = require('bcrypt');

app.post('/updateProfile', async (req, res) => {
    const { username, email, password } = req.body;

    // Ensure all required fields are provided
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
    }

    try {
        // Prepare the SQL query
        let query = 'UPDATE register SET `e-male` = ?';
        const params = [email]; // Start with the email parameter

        // If a new password is provided, hash it and add to the query
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            query += ', password = ?'; // Add password to the query
            params.push(hashedPassword); // Add hashed password to params
        }

        query += ' WHERE username = ?'; // Complete the query
        params.push(username); // Add the username to the parameters

        // Execute the query
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error updating user:', err);
                return res.status(500).json({ error: 'Failed to update profile: ' + err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: ' User  not found' });
            }

            res.json({ message: 'Profile updated successfully', email });
        });
    } catch (error) {
        console.error('Error during password hashing:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
    }
});

// Delete a post by ID
app.delete('/posts/:id', (req, res) => {
    const postId = req.params.id; // Get the post ID from the request parameters

    // Prepare SQL query to delete the post
    const query = 'DELETE FROM post WHERE id = ?';
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).json({ error: 'Failed to delete post: ' + err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    });
});

// Update a post by ID
app.put('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const { text, media } = req.body; // Extract text and media from the request body

    // Prepare SQL query to update the post
    const query = 'UPDATE post SET text = ?, media = ? WHERE id = ?';
    db.query(query, [text, media, postId], (err, results) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ error: 'Failed to update post: ' + err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post updated successfully' });
    });
});


// Server-side code (server.js)
io.on('connection', (socket) => {
    console.log('New user connected');

    // Send existing messages to the newly connected user
    socket.emit('chat history', messages);

    // Listen for new messages
    socket.on('send message', (message) => {
        messages.push(message); // Store the message object
        io.emit('new message', message); // Broadcast the new message to all clients
    });

    // Listen for requesting chat history
    socket.on('get chat history', () => {
        socket.emit('chat history', messages); // Send the chat history to the requesting client
    });

    socket.on('disconnect', () => {
        console.log('User  disconnected');
    });
});


// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});