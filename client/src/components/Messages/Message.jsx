import Reactions from './Reactions';

function formatMessageTimestamp(createdAt) {
  const messageDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  const isToday = messageDate.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === messageDate.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) {
    return `Yesterday ${messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function Message({ message, onReplyClick }) {
  return (
    <div className="message-container">
      <div className="message-header">
        <strong className="author">
          {message.author}
        </strong>
        <span className="timestamp">
          {formatMessageTimestamp(message.created_at)}
        </span>
      </div>
      
      <div className="message-content">
        <p>{message.content}</p>
      </div>

      <div className="message-footer">
        <Reactions messageId={message.id} />
        {/* Only show reply button if message is not a reply itself */}
        {!message.parent_id && (
          <button 
            className="reply-btn"
            onClick={() => onReplyClick(message.id)}
          >
            Reply
          </button>
        )}
      </div>

      {/* Display nested replies */}
      {message.replies?.length > 0 && (
        <div className="replies-container">
          {message.replies.map(reply => (
            <Message 
              key={reply.id}
              message={reply}
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}