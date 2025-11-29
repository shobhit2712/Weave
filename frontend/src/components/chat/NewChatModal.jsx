import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { userAPI, chatAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function NewChatModal({ onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.users);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChat = async (userId) => {
    try {
      const response = await chatAPI.createChat({
        participantId: userId,
        isGroupChat: false
      });
      navigate(`/chat/${response.chat._id}`);
      onClose();
      toast.success('Chat created');
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">New Chat</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X size={20} />
          </button>
        </div>

        <label className="input input-bordered flex items-center gap-2 mb-4">
          <Search size={20} className="opacity-70" />
          <input
            type="text"
            placeholder="Search users..."
            className="grow"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </label>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner"></span>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-base-content/60 py-8">
              {searchQuery ? 'No users found' : 'Search for users to chat with'}
            </p>
          ) : (
            searchResults.map(user => (
              <div
                key={user._id}
                onClick={() => handleCreateChat(user._id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer"
              >
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} />
                    ) : (
                      <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-bold">
                        {user.fullName[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-base-content/60">@{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default NewChatModal;
