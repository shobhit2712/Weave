import { useState } from 'react';
import { MoreVertical, Reply, Trash2, Edit2, Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../utils/dateUtils';
import { messageAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

function Message({ message, isOwn }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleReact = async (emoji) => {
    try {
      await messageAPI.addReaction(message._id, emoji);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleDelete = async () => {
    try {
      await messageAPI.deleteMessage(message._id);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="message-bubble bg-base-300 text-base-content/50 italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className="flex flex-col max-w-[70%]">
        {/* Sender Name (for group chats) */}
        {!isOwn && (
          <span className="text-xs text-base-content/60 mb-1 px-2">
            {message.sender.fullName}
          </span>
        )}

        {/* Message Content */}
        <div className={`message-bubble ${isOwn ? 'sent' : 'received'} relative`}>
          {/* Reply to message */}
          {message.replyTo && (
            <div className="border-l-4 border-primary pl-2 mb-2 text-sm opacity-70">
              <p className="font-semibold">{message.replyTo.sender.fullName}</p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Text Content */}
          {message.messageType === 'text' && (
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Image */}
          {message.messageType === 'image' && (
            <div>
              <img 
                src={`http://localhost:5000${message.fileUrl}`}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto cursor-pointer"
                onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
              />
              {message.content && <p className="mt-2">{message.content}</p>}
            </div>
          )}

          {/* File */}
          {message.messageType === 'file' && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="font-medium">{message.fileName}</p>
                <p className="text-xs opacity-70">{(message.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              <a 
                href={`http://localhost:5000${message.fileUrl}`}
                download
                className="btn btn-sm btn-circle"
              >
                📥
              </a>
            </div>
          )}

          {/* Message Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute -right-8 top-0 btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-base-100 shadow-lg rounded-lg p-2 z-10">
              <button className="btn btn-ghost btn-sm w-full justify-start">
                <Reply size={16} /> Reply
              </button>
              {isOwn && (
                <>
                  <button className="btn btn-ghost btn-sm w-full justify-start">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="btn btn-ghost btn-sm w-full justify-start text-error"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 px-2">
            {message.reactions.map((reaction, idx) => (
              <div key={idx} className="badge badge-sm">
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 text-xs text-base-content/60 mt-1 px-2 ${isOwn ? 'justify-end' : ''}`}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {message.isEdited && <span>(edited)</span>}
          {isOwn && (
            message.readBy?.length > 0 ? <CheckCheck size={14} className="text-primary" /> : <Check size={14} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
