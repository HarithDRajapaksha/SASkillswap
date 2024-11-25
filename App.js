import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Game from './pages/Game';
import HomePage from './pages/HomePage';
import Notification from './pages/Notification';
import AddPost from './pages/AddPost';
import PostDetails from './pages/PostDetails';
import AddReview from './pages/AddReview';
import EditPost from './pages/EditPost';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/addpost' element={<AddPost/>}/>
        <Route path="/profile" element={<Profile/>} />
        <Route path='/notification' element={<Notification/>}/>
        <Route path="/chat" element={<Chat/>} />
        <Route path="/games" element={<Game />} />
        <Route path='/postDetails' element={<PostDetails/>}/>
        <Route path="/postDetails/:postId" element={<PostDetails />} />
        <Route path='/addreview' element={<AddReview/>}/>
        <Route path='/editPost/:postId' element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;