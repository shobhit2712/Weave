import useChatStore from '../../store/chatStore';

function TypingIndicator({ chatId }) {
  const { typingUsers } = useChatStore();
  const typing = typingUsers[chatId] || [];

  if (typing.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex gap-1">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-sm text-base-content/60">
        {typing.length === 1 ? 'Someone is' : `${typing.length} people are`} typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
