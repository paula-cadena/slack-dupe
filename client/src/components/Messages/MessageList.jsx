import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Message from './Message';

export default function MessageList({ onThreadSelect, channelId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await api.post(`/messages/${channelId}`, {
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages for channel:', channelId);
      if (!channelId) return;
      
      try {
        const { data } = await api.get(`/messages/${channelId}?page=1`);
        console.log('Received messages:', data.messages);
        setMessages(data.messages.reverse());
      } catch (error) {
        console.error('Failed to fetch messages:', error.response?.data || error.message);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [channelId]);

  return (
    <div className="message-container">
      <div className="messages-list">
        {messages.map(message => (
          <Message 
            key={message.id}
            message={message}
            onReplyClick={() => onThreadSelect(message.id)}
          />
        ))}
      </div>
      
      {/* Add message form */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}