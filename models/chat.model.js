import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'owner', 'deliveryBoy', 'bot', 'guest'],
    required: true,
    default: 'guest'
  },
  text: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  target: {
    type: String,
    enum: ['all', 'owner', 'deliveryBoy', 'user', 'individual'],
    required: true,
    default: 'all'
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  recipientName: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

const ChatMessage = mongoose.model('ChatMessage', chatSchema)
export default ChatMessage
