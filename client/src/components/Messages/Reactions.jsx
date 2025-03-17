import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Reactions({ messageId }) {
  const [reactions, setReactions] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const { data } = await api.get(`/messages/${messageId}/reactions`);
        setReactions(data.reactions || []);
        setIsHovered(false);
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
        setReactions([]);
      }
    };
    fetchReactions();
  }, [messageId]);

  const handleAddReaction = async (emoji) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji});
      setReactions([...reactions, { emoji, user }]);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  return (
    <div 
      className="reactions-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="reactions-list">
        {reactions.length === 0 ? (
          <span 
            className="reaction-bubble reaction-cta"
            title="Add reaction"
          >
            <span className="reaction-plus">+</span>👍
          </span>
        ) : (
          reactions.map((reaction, index) => (
            <span 
              key={index} 
              className="reaction-bubble"
              title={`${reaction.username} reacted with ${reaction.emoji}`}
            >
              {reaction.emoji}
            </span>
          ))
        )}
      </div>

      {isHovered && (
        <div className="reaction-picker">
          {['👍', '❤️', '🚀', '👏', '😄'].map(emoji => (
            <button
              key={emoji}
              className="reaction-option"
              onClick={() => handleAddReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}