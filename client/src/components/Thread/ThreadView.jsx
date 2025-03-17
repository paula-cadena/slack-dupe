import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Message from '../Messages/Message';

export default function ThreadView({ threadId, onClose }) {
  const [thread, setThread] = useState({
    parentMessage: null,
    replies: []
  });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const { data } = await api.get(`/messages/${threadId}/thread`);
        setThread({
          parentMessage: data.parentMessage,
          replies: data.replies || []
        });
      } catch (error) {
        console.error('Failed to fetch thread:', error);
        setThread({
          parentMessage: null,
          replies: []
        });
      }
    };
    
    if (threadId) fetchThread();
  }, [threadId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !threadId) return;
    
    try {
      await api.post(`/messages/${threadId}/replies`, {
        content: newReply
      });
      setNewReply('');
      // Refresh thread data
      const { data } = await api.get(`/messages/${threadId}/thread`);
      setThread({
        parentMessage: data.parentMessage,
        replies: data.replies || []
      });
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  return (
    <div className="thread-view-container">
      <div className="main-thread">
        {thread.parentMessage && <Message message={thread.parentMessage} />}
      </div>

      <div className="replies-section">
        <h3 className="replies-header">Reply</h3>

        <form onSubmit={handleReply} className="reply-form">
          <input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            className="reply-input"
          />
          <button type="submit" className="reply-submit">
            Post Reply
          </button>
        </form>

        <div className="replies-list">
          {(thread.replies || []).map(reply => (
            <Message 
              key={reply.id} 
              message={reply}
              isReply={true}
            />
          ))}
        </div>
      </div>
      <button className="close-panel-btn" onClick={onClose}>
        × Close
      </button>
    </div>
  );
}