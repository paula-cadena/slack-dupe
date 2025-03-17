import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ChannelList from './components/Channels/ChannelList';
import MessageList from './components/Messages/MessageList';
import ThreadView from './components/Thread/ThreadView';
import ProfileSettings from './components/Profile/ProfileSettings';
import Login from './components/Auth/Login';
import Logout from './components/Auth/Logout';
import Signup from './components/Auth/Signup';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProfileSettings />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChannelList />} />
          <Route path="/channels/:channelId" element={<MessageList />} />
          <Route path="/thread/:messageId" element={<ThreadView />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  
  return <Outlet />;
}

export default App;