import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import CreateChannel from './CreateChannel';
import MessageList from '../Messages/MessageList';
import ThreadView from '../Thread/ThreadView';
import logo from '../../logo.png'

export default function ChannelList() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(fetchChannels, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchChannels = async () => {
    const { data } = await api.get('/channels');
    setChannels(data);
  };

  const updateLastReadMessage = async (channelId) => {
    try {
      await api.get(`/channels/${channelId}`);
      console.log(`Last read message updated for channel ${channelId}`);
    } catch (error) {
      console.error('Failed to update last read message:', error);
    }
  };

  const handleChannelClick = async (channelId) => {
    setSelectedChannel(channelId);
    setSelectedThread(null);
    try {
      await updateLastReadMessage(channelId);
      await api.get(`/channels/${channelId}`);
    } catch (error) {
      console.error('Failed to fetch channel details:', error);
    }
  };

  return (
    <div className="channel-list-container">
      <div className="channel-list">
      <div className="channel-list-header">
      <img 
        src={logo} 
        alt="Logo" 
        className="channel-logo" 
        />
      <button onClick={() => navigate('/profile')} className="profile-button">
          Profile
        </button>
      </div>
        <h2>Channels</h2>
        <CreateChannel onCreate={fetchChannels} />
        
        {channels.map(channel => (
          <div
            key={channel.id}
            className={`channel-item ${selectedChannel === channel.id ? 'active' : ''}`}
            onClick={() => handleChannelClick(channel.id)}
          >
            <span># {channel.name}</span>
            {channel.unread > 0 && <span className="unread-count">{channel.unread}</span>}
          </div>
        ))}
        <button onClick={() => navigate('/logout')} className="logout-btn">
          Log Out
        </button>
        
      </div>

      <div className={`channel-content ${selectedThread ? 'with-thread' : ''}`}>
    {selectedChannel ? (
      <>
        <MessageList 
          onThreadSelect={setSelectedThread}
          channelId={selectedChannel}
        />
        {selectedThread && (
          <ThreadView 
            threadId={selectedThread}
            onClose={() => setSelectedThread(null)}
          />
        )}
      </>
    ) : (
          <div className="placeholder">
            <h3>Select a channel to view its content</h3>
            <p>Click on a channel from the list on the left to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}