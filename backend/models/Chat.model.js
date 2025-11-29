import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Chat name cannot exceed 100 characters']
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    groupAvatar: {
      type: String,
      default: ''
    },
    groupDescription: {
      type: String,
      default: '',
      maxlength: [500, 'Group description cannot exceed 500 characters']
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    settings: {
      muteNotifications: {
        type: Boolean,
        default: false
      },
      mutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ isGroupChat: 1, participants: 1 });

// Virtual for messages
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat'
});

// Pre-save validation
chatSchema.pre('save', function (next) {
  // Group chats must have a name
  if (this.isGroupChat && !this.name) {
    next(new Error('Group chats must have a name'));
  }
  
  // Group chats need at least 3 participants
  if (this.isGroupChat && this.participants.length < 3) {
    next(new Error('Group chats must have at least 3 participants'));
  }
  
  // One-on-one chats must have exactly 2 participants
  if (!this.isGroupChat && this.participants.length !== 2) {
    next(new Error('Direct chats must have exactly 2 participants'));
  }
  
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
