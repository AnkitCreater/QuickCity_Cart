import ChatMessage from '../models/chat.model.js'
import User from '../models/user.model.js'

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    const messages = await ChatMessage.find({
      $or: [
        { target: 'all' },
        { target: user.role },
        { senderId: userId },
        { recipientId: userId }
      ]
    }).sort({ createdAt: 1 })

    return res.status(200).json(messages)
  } catch (error) {
    return res.status(500).json({ message: `get chat history error ${error}` })
  }
}

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query
    if (!role || !['owner', 'deliveryBoy', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const users = await User.find({ role }).select('_id fullName email mobile')
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: `get users by role error ${error}` })
  }
}
